import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { translations, type TranslationKey } from '@/i18n/locales';
import {
  apiLanguageFromApp,
  APP_LANGUAGES,
  DEFAULT_APP_LANGUAGE,
  type AppLanguage,
} from '@/i18n/types';

const STORAGE_KEY = 'app-language';

type LanguageContextType = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

function isAppLanguage(value: string | null): value is AppLanguage {
  return value === 'de' || value === 'en' || value === 'sr' || value === 'fr';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(
    DEFAULT_APP_LANGUAGE,
  );

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(stored => {
      if (isAppLanguage(stored)) {
        setLanguageState(stored);
      }
    });
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string>) => {
      let text =
        translations[language][key] ??
        translations[DEFAULT_APP_LANGUAGE][key] ??
        key;

      if (params) {
        for (const [paramKey, value] of Object.entries(params)) {
          text = text.replaceAll(`{{${paramKey}}}`, value);
        }
      }

      return text;
    },
    [language],
  );

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    AsyncStorage.setItem(STORAGE_KEY, nextLanguage).catch(() => undefined);
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

export function useApiLanguage() {
  const { language } = useLanguage();
  return apiLanguageFromApp(language);
}

export { APP_LANGUAGES };
