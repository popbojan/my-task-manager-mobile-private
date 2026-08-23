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
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { setApiBasePath } from '@/api/authClient';
import {
  applyApiEnvironment,
  DEFAULT_API_ENVIRONMENT,
  getApiBaseUrl,
  isLocalDevHostPreferred,
  resolveApiBaseUrl,
  resolveDefaultApiEnvironment,
  type ApiEnvironment,
} from '@/config/api';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

const STORAGE_KEY = 'my-task-manager.api-environment';

type ApiEnvironmentContextValue = {
  environment: ApiEnvironment;
  apiBaseUrl: string;
  setEnvironment: (environment: ApiEnvironment) => Promise<void>;
};

const ApiEnvironmentContext = createContext<ApiEnvironmentContextValue | undefined>(
  undefined,
);

function isApiEnvironment(value: string | null): value is ApiEnvironment {
  return value === 'local' || value === 'production';
}

function resolveStoredEnvironment(stored: string | null): ApiEnvironment {
  if (isApiEnvironment(stored)) {
    if (stored === 'local' && !isLocalDevHostPreferred()) {
      return 'production';
    }

    return stored;
  }

  return resolveDefaultApiEnvironment();
}

export function ApiEnvironmentProvider({ children }: { children: ReactNode }) {
  const [environment, setEnvironmentState] =
    useState<ApiEnvironment>(DEFAULT_API_ENVIRONMENT);
  const [apiBaseUrl, setApiBaseUrl] = useState(getApiBaseUrl());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadEnvironment() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const nextEnvironment = resolveStoredEnvironment(stored);
        applyApiEnvironment(nextEnvironment);
        setApiBasePath(resolveApiBaseUrl(nextEnvironment));

        if (stored !== nextEnvironment) {
          await AsyncStorage.setItem(STORAGE_KEY, nextEnvironment);
        }

        if (!cancelled) {
          setEnvironmentState(nextEnvironment);
          setApiBaseUrl(getApiBaseUrl());
        }
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    }

    void loadEnvironment();

    return () => {
      cancelled = true;
    };
  }, []);

  const setEnvironment = useCallback(async (nextEnvironment: ApiEnvironment) => {
    applyApiEnvironment(nextEnvironment);
    const nextBaseUrl = resolveApiBaseUrl(nextEnvironment);
    setApiBasePath(nextBaseUrl);
    setEnvironmentState(nextEnvironment);
    setApiBaseUrl(nextBaseUrl);
    await AsyncStorage.setItem(STORAGE_KEY, nextEnvironment);
  }, []);

  const value = useMemo(
    () => ({
      environment,
      apiBaseUrl,
      setEnvironment,
    }),
    [apiBaseUrl, environment, setEnvironment],
  );

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={recurringTheme.accent} />
      </View>
    );
  }

  return (
    <ApiEnvironmentContext.Provider value={value}>
      {children}
    </ApiEnvironmentContext.Provider>
  );
}

export function useApiEnvironment(): ApiEnvironmentContextValue {
  const context = useContext(ApiEnvironmentContext);
  if (!context) {
    throw new Error('useApiEnvironment must be used within ApiEnvironmentProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: recurringTheme.pageBg,
  },
});
