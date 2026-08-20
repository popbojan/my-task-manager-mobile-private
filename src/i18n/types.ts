import { Language } from '@/api/generated';

export type AppLanguage = 'de' | 'en' | 'sr' | 'fr';

export const APP_LANGUAGES: {
  code: AppLanguage;
  apiLanguage: Language;
  flag: string;
  labelKey: 'language.de' | 'language.en' | 'language.sr' | 'language.fr';
}[] = [
  { code: 'sr', apiLanguage: Language.Sr, flag: '🇷🇸', labelKey: 'language.sr' },
  { code: 'de', apiLanguage: Language.De, flag: '🇩🇪', labelKey: 'language.de' },
  { code: 'fr', apiLanguage: Language.Fr, flag: '🇫🇷', labelKey: 'language.fr' },
  { code: 'en', apiLanguage: Language.En, flag: '🇬🇧', labelKey: 'language.en' },
];

export const DEFAULT_APP_LANGUAGE: AppLanguage = 'de';

export function apiLanguageFromApp(language: AppLanguage): Language {
  const match = APP_LANGUAGES.find(item => item.code === language);
  return match?.apiLanguage ?? Language.De;
}
