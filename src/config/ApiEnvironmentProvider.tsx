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
  resolveApiBaseUrl,
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

export function ApiEnvironmentProvider({ children }: { children: ReactNode }) {
  const [environment, setEnvironmentState] =
    useState<ApiEnvironment>(DEFAULT_API_ENVIRONMENT);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadEnvironment() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const nextEnvironment = isApiEnvironment(stored)
          ? stored
          : DEFAULT_API_ENVIRONMENT;
        applyApiEnvironment(nextEnvironment);
        setApiBasePath(resolveApiBaseUrl(nextEnvironment));

        if (!cancelled) {
          setEnvironmentState(nextEnvironment);
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
    setApiBasePath(resolveApiBaseUrl(nextEnvironment));
    await AsyncStorage.setItem(STORAGE_KEY, nextEnvironment);
    setEnvironmentState(nextEnvironment);
  }, []);

  const value = useMemo(
    () => ({
      environment,
      apiBaseUrl: getApiBaseUrl(),
      setEnvironment,
    }),
    [environment, setEnvironment],
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
