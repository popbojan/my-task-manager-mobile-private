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
import {
  getDevMachineHost,
  loadDevMachineHost,
  persistDevMachineHost,
} from '@/config/devMachineHost';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

const STORAGE_KEY = 'my-task-manager.api-environment';

function refreshApiBasePath(environment: ApiEnvironment): string {
  const nextBaseUrl = resolveApiBaseUrl(environment);
  applyApiEnvironment(environment);
  setApiBasePath(nextBaseUrl);
  return nextBaseUrl;
}

type ApiEnvironmentContextValue = {
  environment: ApiEnvironment;
  apiBaseUrl: string;
  devMachineHost: string;
  setEnvironment: (environment: ApiEnvironment) => Promise<void>;
  setDevMachineHost: (host: string) => Promise<void>;
};

const ApiEnvironmentContext = createContext<ApiEnvironmentContextValue | undefined>(
  undefined,
);

function isApiEnvironment(value: string | null): value is ApiEnvironment {
  return value === 'local' || value === 'production';
}

function resolveStoredEnvironment(stored: string | null): ApiEnvironment {
  if (isApiEnvironment(stored)) {
    if (stored === 'local' && !isLocalDevHostPreferred() && !__DEV__) {
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
  const [devMachineHost, setDevMachineHostState] = useState(getDevMachineHost());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadEnvironment() {
      try {
        await loadDevMachineHost();
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const nextEnvironment = resolveStoredEnvironment(stored);
        const nextBaseUrl = refreshApiBasePath(nextEnvironment);

        if (stored !== nextEnvironment) {
          await AsyncStorage.setItem(STORAGE_KEY, nextEnvironment);
        }

        if (!cancelled) {
          setEnvironmentState(nextEnvironment);
          setApiBaseUrl(nextBaseUrl);
          setDevMachineHostState(getDevMachineHost());

          if (__DEV__) {
            console.log(
              '[API] environment:',
              nextEnvironment,
              'url:',
              nextBaseUrl,
              'devHost:',
              getDevMachineHost(),
            );
          }
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
    const nextBaseUrl = refreshApiBasePath(nextEnvironment);
    setEnvironmentState(nextEnvironment);
    setApiBaseUrl(nextBaseUrl);
    await AsyncStorage.setItem(STORAGE_KEY, nextEnvironment);
  }, []);

  const setDevMachineHost = useCallback(async (host: string) => {
    const nextHost = await persistDevMachineHost(host);
    setDevMachineHostState(nextHost);

    if (environment === 'local') {
      const nextBaseUrl = refreshApiBasePath('local');
      setApiBaseUrl(nextBaseUrl);
    }
  }, [environment]);

  const value = useMemo(
    () => ({
      environment,
      apiBaseUrl,
      devMachineHost,
      setEnvironment,
      setDevMachineHost,
    }),
    [apiBaseUrl, devMachineHost, environment, setDevMachineHost, setEnvironment],
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
