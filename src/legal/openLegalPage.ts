import { getAssetsBaseUrl } from '@/config/api';
import type { AppLanguage } from '@/i18n/types';

export type LegalPage = 'privacy' | 'impressum';

export function getLegalPageUrl(
  page: LegalPage,
  language: AppLanguage,
): string {
  const base = getAssetsBaseUrl().replace(/\/$/, '');
  const params = new URLSearchParams({
    lang: language,
    from: 'app',
    embed: '1',
  });
  return `${base}/${page}?${params.toString()}`;
}
