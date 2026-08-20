import { Configuration } from '@/api/generated/runtime';
import { DefaultApi } from '@/api/generated/apis/DefaultApi';

let accessTokenGetter: () => string | null = () => null;

export function setAccessTokenGetter(getter: () => string | null) {
  accessTokenGetter = getter;
}

const config = new Configuration({
  basePath: 'http://localhost:3001',
  credentials: 'include',
  accessToken: async () => accessTokenGetter() ?? '',
});

export const authApi = new DefaultApi(config);
