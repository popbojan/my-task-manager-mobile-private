import { Configuration } from '@/api/generated/runtime';
import { DefaultApi } from '@/api/generated/apis/DefaultApi';
import { getApiBaseUrl, resolveApiBaseUrl, DEFAULT_API_ENVIRONMENT } from '@/config/api';

let accessTokenGetter: () => string | null = () => null;

export function setAccessTokenGetter(getter: () => string | null) {
  accessTokenGetter = getter;
}

/**
 * Refresh tokens are stored as HttpOnly cookies by the backend (path=/auth).
 * React Native's native fetch sends and persists them when credentials is "include".
 */
const config = new Configuration({
  basePath: resolveApiBaseUrl(DEFAULT_API_ENVIRONMENT),
  credentials: 'include',
  accessToken: async () => accessTokenGetter() ?? '',
});

export function setApiBasePath(basePath: string) {
  config.config = new Configuration({
    basePath,
    credentials: 'include',
    accessToken: async () => accessTokenGetter() ?? '',
  });
}

export function getConfiguredApiBasePath(): string {
  return config.basePath ?? getApiBaseUrl();
}

export const authApi = new DefaultApi(config);
