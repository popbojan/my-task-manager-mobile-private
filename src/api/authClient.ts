import { DefaultApi } from '@/api/generated/apis/DefaultApi';
import { Configuration, type FetchAPI } from '@/api/generated/runtime';
import {
  DEFAULT_API_ENVIRONMENT,
  getApiBaseUrl,
  resolveApiBaseUrl,
} from '@/config/api';

let accessTokenGetter: () => string | null = () => null;

/** Cookie-based auth endpoints (refresh/logout/login) need credentials on native fetch. */
export const authRequestInit = { credentials: 'include' as RequestCredentials };

/**
 * React Native Android often fails HTTPS requests when credentials is "include".
 * Public endpoints omit cookies; auth endpoints opt in via authRequestInit.
 */
const REQUEST_TIMEOUT_MS = 30_000;

const reactNativeFetch: FetchAPI = (url, init) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const userSignal = init?.signal;
  if (userSignal) {
    if (userSignal.aborted) {
      controller.abort();
    } else {
      userSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  return fetch(url, {
    ...init,
    signal: controller.signal,
    credentials: init?.credentials ?? 'omit',
  }).finally(() => {
    clearTimeout(timeoutId);
  });
};

export function setAccessTokenGetter(getter: () => string | null) {
  accessTokenGetter = getter;
}

export function getAccessToken(): string | null {
  return accessTokenGetter();
}

function createAuthApi(basePath: string): DefaultApi {
  const configuration = new Configuration({
    basePath,
    credentials: 'omit',
    fetchApi: reactNativeFetch,
    accessToken: async () => accessTokenGetter() ?? '',
  });

  return new DefaultApi(configuration);
}

let authApiInstance = createAuthApi(resolveApiBaseUrl(DEFAULT_API_ENVIRONMENT));

export const authApi: DefaultApi = new Proxy({} as DefaultApi, {
  get(_target, prop: string | symbol) {
    const value = Reflect.get(authApiInstance, prop);
    if (typeof value === 'function') {
      return value.bind(authApiInstance);
    }
    return value;
  },
});

export function setApiBasePath(basePath: string) {
  authApiInstance = createAuthApi(basePath.replace(/\/+$/, ''));
}

export function getConfiguredApiBasePath(): string {
  return getApiBaseUrl();
}
