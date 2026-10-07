import { getAssetsBaseUrl } from '@/config/api';
import type { AppLanguage } from '@/i18n/types';

/** Web app subscription settings (Stripe checkout), same base as legal pages. */
export function getWebSubscriptionUrl(language: AppLanguage): string {
  const base = getAssetsBaseUrl().replace(/\/$/, '');
  const params = new URLSearchParams({ lang: language });
  return `${base}/settings/subscription?${params.toString()}`;
}
