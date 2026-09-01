jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    PURCHASES_ERROR_CODE: {
      PURCHASE_CANCELLED_ERROR: 'PURCHASE_CANCELLED_ERROR',
    },
  },
}));

jest.mock('@/revenuecat/revenueCatService', () => ({
  ensureRevenueCatLinkedToUser: jest.fn().mockResolvedValue(true),
  purchaseRevenueCatPackage: jest.fn(),
  restoreRevenueCatPurchases: jest.fn(),
}));

jest.mock('@/api/authClient', () => ({
  authApi: {
    getCurrentUser: jest.fn().mockResolvedValue({ id: 'user-123', email: 'test@example.com' }),
  },
}));

jest.mock('@/subscription/subscriptionQuery', () => ({
  refreshSubscriptionFromBackend: jest.fn(),
}));

import { QueryClient } from '@tanstack/react-query';
import Purchases from 'react-native-purchases';
import {
  ensureRevenueCatLinkedToUser,
  purchaseRevenueCatPackage,
  restoreRevenueCatPurchases,
} from '@/revenuecat/revenueCatService';
import { refreshSubscriptionFromBackend } from '@/subscription/subscriptionQuery';
import {
  recheckSubscriptionStatus,
  resetSubscriptionPurchaseFlowForTests,
  runSubscriptionPurchase,
  runSubscriptionRestore,
} from '@/subscription/subscriptionPurchaseFlow';

const mockedEnsureLinked = ensureRevenueCatLinkedToUser as jest.MockedFunction<
  typeof ensureRevenueCatLinkedToUser
>;
const mockedRefresh = refreshSubscriptionFromBackend as jest.MockedFunction<
  typeof refreshSubscriptionFromBackend
>;
const mockedPurchase = purchaseRevenueCatPackage as jest.MockedFunction<
  typeof purchaseRevenueCatPackage
>;
const mockedRestore = restoreRevenueCatPurchases as jest.MockedFunction<
  typeof restoreRevenueCatPurchases
>;

describe('subscriptionPurchaseFlow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    jest.clearAllMocks();
    resetSubscriptionPurchaseFlowForTests();
  });

  it('blocks purchase when stripe premium is already active', async () => {
    mockedRefresh.mockResolvedValueOnce({
      hasPremiumAccess: true,
      subscription: {
        provider: 'stripe',
        type: 'monthly',
        status: 'active',
      },
    } as never);

    const outcome = await runSubscriptionPurchase(queryClient, {
      identifier: 'monthly',
    } as never);

    expect(outcome.kind).toBe('premium_already_active');
    expect(mockedPurchase).not.toHaveBeenCalled();
    expect(mockedRefresh).toHaveBeenCalledTimes(1);
  });

  it('blocks purchase when RevenueCat is not linked to /users/me id', async () => {
    mockedRefresh.mockResolvedValueOnce({
      hasPremiumAccess: false,
      subscription: null,
    } as never);
    mockedEnsureLinked.mockResolvedValueOnce(false);

    const outcome = await runSubscriptionPurchase(queryClient, {
      identifier: 'monthly',
    } as never);

    expect(outcome.kind).toBe('error');
    expect(outcome).toEqual({ kind: 'error', message: 'revenuecat_identity_mismatch' });
    expect(mockedPurchase).not.toHaveBeenCalled();
  });

  it('checks /subscriptions/me immediately before purchase', async () => {
    mockedRefresh
      .mockResolvedValueOnce({
        hasPremiumAccess: false,
        subscription: null,
      } as never)
      .mockResolvedValueOnce({
        hasPremiumAccess: true,
        subscription: {
          provider: 'google_play',
          type: 'monthly',
          status: 'active',
        },
      } as never);
    mockedPurchase.mockResolvedValue({ entitlements: { active: {} } } as never);

    const outcome = await runSubscriptionPurchase(queryClient, {
      identifier: 'monthly',
    } as never);

    expect(outcome.kind).toBe('purchase_completed');
    expect(mockedRefresh).toHaveBeenCalledTimes(2);
    expect(mockedPurchase).toHaveBeenCalledTimes(1);
  });

  it('prevents parallel purchases from double tap', async () => {
    mockedRefresh.mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(
            () =>
              resolve({
                hasPremiumAccess: false,
                subscription: null,
              } as never),
            20,
          );
        }),
    );
    mockedPurchase.mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => resolve({ entitlements: { active: {} } } as never), 20);
        }),
    );

    const first = runSubscriptionPurchase(queryClient, { identifier: 'monthly' } as never);
    const second = runSubscriptionPurchase(queryClient, { identifier: 'monthly' } as never);

    const [firstOutcome, secondOutcome] = await Promise.all([first, second]);

    expect([firstOutcome.kind, secondOutcome.kind]).toContain('error');
    expect(mockedPurchase).toHaveBeenCalledTimes(1);
  });

  it('treats user cancellation as non-error outcome', async () => {
    mockedRefresh.mockResolvedValueOnce({
      hasPremiumAccess: false,
      subscription: null,
    } as never);
    mockedPurchase.mockRejectedValue({
      code: Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR,
      userCancelled: true,
    });

    const outcome = await runSubscriptionPurchase(queryClient, {
      identifier: 'monthly',
    } as never);

    expect(outcome.kind).toBe('user_cancelled');
  });

  it('shows activation pending when webhook has not arrived yet', async () => {
    mockedRefresh
      .mockResolvedValueOnce({
        hasPremiumAccess: false,
        subscription: null,
      } as never)
      .mockResolvedValueOnce({
        hasPremiumAccess: false,
        subscription: null,
      } as never);
    mockedPurchase.mockResolvedValue({ entitlements: { active: { pro: {} } } } as never);

    const outcome = await runSubscriptionPurchase(queryClient, {
      identifier: 'monthly',
    } as never);

    expect(outcome.kind).toBe('activation_pending');
    expect(mockedRefresh).toHaveBeenCalledTimes(2);
  });

  it('manual status refresh performs exactly one /subscriptions/me request', async () => {
    mockedRefresh.mockResolvedValueOnce({
      hasPremiumAccess: false,
      subscription: null,
    } as never);

    await recheckSubscriptionStatus(queryClient);

    expect(mockedRefresh).toHaveBeenCalledTimes(1);
  });

  it('restore performs exactly one /subscriptions/me request after restorePurchases', async () => {
    mockedRestore.mockResolvedValue({ entitlements: { active: {} } } as never);
    mockedRefresh.mockResolvedValueOnce({
      hasPremiumAccess: true,
      subscription: {
        provider: 'google_play',
        type: 'monthly',
        status: 'active',
      },
    } as never);

    const outcome = await runSubscriptionRestore(queryClient);

    expect(outcome.kind).toBe('restored');
    expect(mockedRestore).toHaveBeenCalledTimes(1);
    expect(mockedRefresh).toHaveBeenCalledTimes(1);
  });

  it('does not grant premium from customer info alone when backend has no access', async () => {
    mockedRestore.mockResolvedValue({ entitlements: { active: { pro: {} } } } as never);
    mockedRefresh.mockResolvedValueOnce({
      hasPremiumAccess: false,
      subscription: null,
    } as never);

    const outcome = await runSubscriptionRestore(queryClient);

    expect(outcome.kind).toBe('activation_pending');
  });
});
