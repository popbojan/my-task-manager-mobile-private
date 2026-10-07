import { Platform } from 'react-native';
import type { TranslationKey } from '@/i18n/locales';
import { logRevenueCatIssue } from '@/revenuecat/revenueCatLogger';

export function getOfferingsUnavailableMessageKey(): TranslationKey {
  return Platform.OS === 'ios'
    ? 'subscription.mobile.offeringsUnavailableAppStore'
    : 'subscription.mobile.offeringsUnavailableGooglePlay';
}

function describeOfferingsError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'unknown';
}

export function logRevenueCatOfferingsError(error: unknown): void {
  logRevenueCatIssue(
    `Store offerings unavailable (${describeOfferingsError(error)})`,
    error,
  );
}
