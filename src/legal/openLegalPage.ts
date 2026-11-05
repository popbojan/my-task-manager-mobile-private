import { getAssetsBaseUrl, PRODUCTION_ASSETS_BASE_URL } from '@/config/api';
import type { AppLanguage } from '@/i18n/types';

export type LegalPage = 'privacy' | 'impressum';

export function isUsableAssetsBaseUrl(base: string): boolean {
  try {
    const url = new URL(base);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }

    const host = url.hostname.trim();
    return host.length > 0 && host !== 'undefined' && host !== 'null';
  } catch {
    return false;
  }
}

function buildLegalPageUrl(
  base: string,
  page: LegalPage,
  language: AppLanguage,
): string {
  const params = new URLSearchParams({
    lang: language,
    from: 'app',
    embed: '1',
  });
  return `${base.replace(/\/$/, '')}/${page}?${params.toString()}`;
}

export function getProductionLegalPageUrl(
  page: LegalPage,
  language: AppLanguage,
): string {
  return buildLegalPageUrl(PRODUCTION_ASSETS_BASE_URL, page, language);
}

export function getLegalPageUrl(
  page: LegalPage,
  language: AppLanguage,
): string {
  const configuredBase = getAssetsBaseUrl();
  const base = isUsableAssetsBaseUrl(configuredBase)
    ? configuredBase
    : PRODUCTION_ASSETS_BASE_URL;
  return buildLegalPageUrl(base, page, language);
}
