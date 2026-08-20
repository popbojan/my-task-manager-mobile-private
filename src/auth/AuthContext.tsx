import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { setAccessTokenGetter } from '@/api/authClient';

type AuthContextType = {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  isAuthReady: boolean;
  setIsAuthReady: (ready: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const setAccessToken = useCallback((token: string | null) => {
    setAccessTokenState(token);
    setAccessTokenGetter(() => token);
  }, []);

  const value = useMemo(
    () => ({ accessToken, setAccessToken, isAuthReady, setIsAuthReady }),
    [accessToken, setAccessToken, isAuthReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
