import { Configuration } from '@/api/generated/runtime';
import { DefaultApi } from '@/api/generated/apis/DefaultApi';
import { API_BASE_URL } from '@/config/api';

let accessTokenGetter: () => string | null = () => null;

export function setAccessTokenGetter(getter: () => string | null) {
  accessTokenGetter = getter;
}

/**
 * Refresh tokens are stored as HttpOnly cookies by the backend (path=/auth).
 * React Native's native fetch sends and persists them when credentials is "include".
 */
const config = new Configuration({
  basePath: API_BASE_URL,
  credentials: 'include',
  accessToken: async () => accessTokenGetter() ?? '',
});

export const authApi = new DefaultApi(config);
