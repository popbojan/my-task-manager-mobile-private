import type { QueryClient } from '@tanstack/react-query';
import type { PurchasesPackage } from 'react-native-purchases';
import { authApi } from '@/api/authClient';
import { SubscriptionProvider } from '@/api/generated/models/SubscriptionProvider';
import {
  ensureRevenueCatLinkedToUser,
  purchaseRevenueCatPackage,
  restoreRevenueCatPurchases,
} from '@/revenuecat/revenueCatService';
import {
  isRevenueCatUserCancelledError,
  getRevenueCatErrorMessage,
} from '@/revenuecat/revenueCatErrors';
import { refreshSubscriptionFromBackend } from '@/subscription/subscriptionQuery';
import type { SubscriptionAccessResponse } from '@/subscription/subscriptionAccessResponse';

export type SubscriptionPurchaseOutcome =
  | { kind: 'premium_already_active'; access: SubscriptionAccessResponse }
  | { kind: 'purchase_completed'; access: SubscriptionAccessResponse }
  | { kind: 'activation_pending'; access: SubscriptionAccessResponse }
  | { kind: 'user_cancelled' }
  | { kind: 'error'; message: string };

export type SubscriptionRestoreOutcome =
  | { kind: 'restored'; access: SubscriptionAccessResponse }
  | { kind: 'activation_pending'; access: SubscriptionAccessResponse }
  | { kind: 'nothing_to_restore' }
  | { kind: 'user_cancelled' }
  | { kind: 'error'; message: string };

let purchaseInFlight = false;

export function isSubscriptionPurchaseInFlight(): boolean {
  return purchaseInFlight;
}

function readPremiumProviderNotice(
  access: SubscriptionAccessResponse,
): SubscriptionPurchaseOutcome | null {
  if (!access.hasPremiumAccess) {
    return null;
  }

  return { kind: 'premium_already_active', access };
}

function resolvePostPurchaseOutcome(
  access: SubscriptionAccessResponse,
): SubscriptionPurchaseOutcome {
  if (access.hasPremiumAccess) {
    return { kind: 'purchase_completed', access };
  }

  return { kind: 'activation_pending', access };
}

export async function runSubscriptionPurchase(
  queryClient: QueryClient,
  revenueCatPackage: PurchasesPackage,
): Promise<SubscriptionPurchaseOutcome> {
  if (purchaseInFlight) {
    return { kind: 'error', message: 'purchase_in_flight' };
  }

  purchaseInFlight = true;

  try {
    const preCheck = await refreshSubscriptionFromBackend(queryClient);
    const alreadyActive = readPremiumProviderNotice(preCheck);
    if (alreadyActive) {
      return alreadyActive;
    }

    const currentUser = await authApi.getCurrentUser();
    const revenueCatLinked = await ensureRevenueCatLinkedToUser(currentUser.id);
    if (!revenueCatLinked) {
      return { kind: 'error', message: 'revenuecat_identity_mismatch' };
    }

    await purchaseRevenueCatPackage(revenueCatPackage);

    const access = await refreshSubscriptionFromBackend(queryClient);
    return resolvePostPurchaseOutcome(access);
  } catch (error) {
    if (isRevenueCatUserCancelledError(error)) {
      return { kind: 'user_cancelled' };
    }

    return {
      kind: 'error',
      message: getRevenueCatErrorMessage(error) ?? 'purchase_failed',
    };
  } finally {
    purchaseInFlight = false;
  }
}

export async function runSubscriptionRestore(
  queryClient: QueryClient,
): Promise<SubscriptionRestoreOutcome> {
  if (purchaseInFlight) {
    return { kind: 'error', message: 'purchase_in_flight' };
  }

  purchaseInFlight = true;

  try {
    const currentUser = await authApi.getCurrentUser();
    const revenueCatLinked = await ensureRevenueCatLinkedToUser(currentUser.id);
    if (!revenueCatLinked) {
      return { kind: 'error', message: 'revenuecat_identity_mismatch' };
    }

    const restoreResult = await restoreRevenueCatPurchases();
    const hasEntitlement = Object.keys(restoreResult.entitlements.active).length > 0;

    const access = await refreshSubscriptionFromBackend(queryClient);

    if (access.hasPremiumAccess) {
      return { kind: 'restored', access };
    }

    if (hasEntitlement) {
      return { kind: 'activation_pending', access };
    }

    return { kind: 'nothing_to_restore' };
  } catch (error) {
    if (isRevenueCatUserCancelledError(error)) {
      return { kind: 'user_cancelled' };
    }

    return {
      kind: 'error',
      message: getRevenueCatErrorMessage(error) ?? 'restore_failed',
    };
  } finally {
    purchaseInFlight = false;
  }
}

export async function recheckSubscriptionStatus(
  queryClient: QueryClient,
): Promise<SubscriptionAccessResponse> {
  return refreshSubscriptionFromBackend(queryClient);
}

export function getActivePremiumProviderLabelKey(
  provider: SubscriptionProvider | undefined,
): 'subscription.mobile.provider.stripe' | 'subscription.mobile.provider.apple' | 'subscription.mobile.provider.googlePlay' | null {
  switch (provider) {
    case SubscriptionProvider.Stripe:
      return 'subscription.mobile.provider.stripe';
    case SubscriptionProvider.Apple:
      return 'subscription.mobile.provider.apple';
    case SubscriptionProvider.GooglePlay:
      return 'subscription.mobile.provider.googlePlay';
    default:
      return null;
  }
}

/** Test-only reset — do not use in production code paths. */
export function resetSubscriptionPurchaseFlowForTests(): void {
  purchaseInFlight = false;
}
