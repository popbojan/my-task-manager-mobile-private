import { Linking, Platform } from 'react-native';
import { authApi } from '@/api/authClient';
import { SubscriptionProvider } from '@/api/generated';
import { getRevenueCatPublicSdkKey } from '@/config/revenueCat';
import { showRevenueCatManageSubscriptions } from '@/revenuecat/revenueCatService';

const GOOGLE_PLAY_SUBSCRIPTIONS_URL =
  'https://play.google.com/store/account/subscriptions';
const APPLE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';

export type OpenSubscriptionManagementResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | 'unsupported'
        | 'no_portal_url'
        | 'api_error'
        | 'open_failed'
        | 'test_store';
    };

/** Maps backend provider + device platform to the store that can manage the subscription. */
export function resolveSubscriptionManagementTarget(
  provider: SubscriptionProvider | undefined,
): 'stripe' | 'google_play' | 'apple' {
  if (provider === SubscriptionProvider.Stripe) {
    return 'stripe';
  }

  if (provider === SubscriptionProvider.GooglePlay) {
    return 'google_play';
  }

  if (provider === SubscriptionProvider.Apple) {
    return Platform.OS === 'android' ? 'google_play' : 'apple';
  }

  if (Platform.OS === 'android') {
    return 'google_play';
  }

  if (Platform.OS === 'ios') {
    return 'apple';
  }

  return 'stripe';
}

/** Corrects mismatched provider labels (e.g. Test Store saved as apple on Android). */
export function resolveSubscriptionDisplayProvider(
  provider: SubscriptionProvider | undefined,
): SubscriptionProvider | undefined {
  if (!provider) {
    return undefined;
  }

  if (provider === SubscriptionProvider.Apple && Platform.OS === 'android') {
    return SubscriptionProvider.GooglePlay;
  }

  if (provider === SubscriptionProvider.GooglePlay && Platform.OS === 'ios') {
    return SubscriptionProvider.Apple;
  }

  return provider;
}

function isRevenueCatTestStoreActive(): boolean {
  const sdkKey = getRevenueCatPublicSdkKey();
  return sdkKey?.startsWith('test_') ?? false;
}

export async function openSubscriptionManagement(
  provider: SubscriptionProvider | undefined,
): Promise<OpenSubscriptionManagementResult> {
  switch (resolveSubscriptionManagementTarget(provider)) {
    case 'google_play':
      return openGooglePlaySubscriptionManagement();
    case 'apple':
      return openAppleSubscriptionManagement();
    case 'stripe':
    default:
      return openStripeCustomerPortal();
  }
}

async function openStripeCustomerPortal(): Promise<OpenSubscriptionManagementResult> {
  try {
    const session = await authApi.createCustomerPortalSession();

    if (!session.portalUrl) {
      return { ok: false, reason: 'no_portal_url' };
    }

    const opened = await Linking.openURL(session.portalUrl);
    return opened ? { ok: true } : { ok: false, reason: 'open_failed' };
  } catch {
    return { ok: false, reason: 'api_error' };
  }
}

async function openAppleSubscriptionManagement(): Promise<OpenSubscriptionManagementResult> {
  if (Platform.OS === 'ios') {
    try {
      await showRevenueCatManageSubscriptions();
      return { ok: true };
    } catch {
      // Fall back to the system subscriptions page when the native sheet is unavailable.
    }
  }

  try {
    const opened = await Linking.openURL(APPLE_SUBSCRIPTIONS_URL);
    return opened ? { ok: true } : { ok: false, reason: 'open_failed' };
  } catch {
    return { ok: false, reason: 'open_failed' };
  }
}

async function openGooglePlaySubscriptionManagement(): Promise<OpenSubscriptionManagementResult> {
  if (__DEV__ && isRevenueCatTestStoreActive()) {
    return { ok: false, reason: 'test_store' };
  }

  try {
    const opened = await Linking.openURL(GOOGLE_PLAY_SUBSCRIPTIONS_URL);
    return opened ? { ok: true } : { ok: false, reason: 'open_failed' };
  } catch {
    return { ok: false, reason: 'open_failed' };
  }
}
