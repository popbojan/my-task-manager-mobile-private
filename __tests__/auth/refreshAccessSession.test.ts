jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/refresh/refreshAppData', () => ({
  refreshAppData: jest.fn(),
}));

jest.mock('@/api/authClient', () => ({
  authApi: {
    refreshAccessToken: jest.fn(),
  },
  authRequestInit: { credentials: 'include' },
  getAccessToken: jest.fn(),
}));

import { QueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/authClient';
import { ResponseError } from '@/api/generated/runtime';
import { refreshAccessSession } from '@/auth/refreshAccessSession';

const refreshAccessToken = authApi.refreshAccessToken as jest.Mock;
const getAccessToken = jest.requireMock('@/api/authClient').getAccessToken as jest.Mock;

describe('refreshAccessSession', () => {
  let queryClient: QueryClient;
  let setAccessToken: jest.Mock;

  beforeEach(() => {
    queryClient = new QueryClient();
    setAccessToken = jest.fn();
    jest.clearAllMocks();
  });

  it('keeps the existing token when refresh fails with a transient error', async () => {
    getAccessToken.mockReturnValue('existing-token');
    refreshAccessToken.mockRejectedValue(new TypeError('Network request failed'));

    const result = await refreshAccessSession({ queryClient, setAccessToken });

    expect(result).toBe('existing-token');
    expect(setAccessToken).not.toHaveBeenCalled();
  });

  it('does not clear the session on transient errors without a token in memory', async () => {
    getAccessToken.mockReturnValue(null);
    refreshAccessToken.mockRejectedValue(new TypeError('Network request failed'));

    const result = await refreshAccessSession({ queryClient, setAccessToken });

    expect(result).toBeNull();
    expect(setAccessToken).not.toHaveBeenCalled();
  });

  it('clears the session when refresh returns 401', async () => {
    getAccessToken.mockReturnValue('existing-token');
    refreshAccessToken.mockRejectedValue(
      new ResponseError(new Response('', { status: 401 }), 'Unauthorized'),
    );

    const result = await refreshAccessSession({ queryClient, setAccessToken });

    expect(result).toBeNull();
    expect(setAccessToken).toHaveBeenCalledWith(null);
  });
});
