import type { TranslationKey } from '@/i18n/locales';

export function getOfferingsErrorTranslationKey(
  error: unknown,
): TranslationKey {
  if (error instanceof Error) {
    switch (error.message) {
      case 'offerings_no_play_products':
        return 'subscription.mobile.offeringsErrorPlayProducts';
      case 'offerings_empty':
        return 'subscription.mobile.offeringsErrorEmptyOffering';
      default:
        break;
    }
  }

  return 'subscription.mobile.offeringsError';
}
