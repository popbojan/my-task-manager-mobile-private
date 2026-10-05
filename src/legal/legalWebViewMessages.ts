import type { AppLanguage } from '@/i18n/types';

export const LEGAL_EMBED_CLOSE_MESSAGE = 'legal-close';
export const LEGAL_EMBED_LANGUAGE_MESSAGE_PREFIX = 'legal-language:';

export type LegalWebViewMessage =
  | { type: 'close' }
  | { type: 'language'; language: AppLanguage };

function isAppLanguage(value: string): value is AppLanguage {
  return value === 'de' || value === 'en' || value === 'sr' || value === 'fr';
}

export function parseLegalWebViewMessage(data: string): LegalWebViewMessage | null {
  if (data === LEGAL_EMBED_CLOSE_MESSAGE) {
    return { type: 'close' };
  }

  if (!data.startsWith(LEGAL_EMBED_LANGUAGE_MESSAGE_PREFIX)) {
    return null;
  }

  const language = data.slice(LEGAL_EMBED_LANGUAGE_MESSAGE_PREFIX.length);
  if (!isAppLanguage(language)) {
    return null;
  }

  return { type: 'language', language };
}
