jest.mock('@/config/api', () => ({
  getApiBaseUrl: () => 'http://test.local',
}));

jest.mock('@/api/authClient', () => ({
  authApi: {
    getRecurringTasks: jest.fn(),
    getRecurringTaskProgress: jest.fn(),
  },
}));

import { QueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/authClient';
import { ResponseError } from '@/api/generated/runtime';
import { refetchRecurringBoardData } from '@/recurring/refetchRecurringBoardData';

const getRecurringTasks = authApi.getRecurringTasks as jest.Mock;
const getRecurringTaskProgress = authApi.getRecurringTaskProgress as jest.Mock;

function premiumRequiredError(): ResponseError {
  return new ResponseError(
    new Response('', { status: 403 }),
    'Response returned an error code',
  );
}

describe('refetchRecurringBoardData', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    getRecurringTasks.mockReset();
    getRecurringTaskProgress.mockReset();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('swallows a 403 instead of throwing ResponseError', async () => {
    getRecurringTasks.mockRejectedValue(premiumRequiredError());
    getRecurringTaskProgress.mockRejectedValue(premiumRequiredError());

    await expect(
      refetchRecurringBoardData(queryClient, 'token'),
    ).resolves.toBeUndefined();
  });

  it('still throws unexpected errors', async () => {
    getRecurringTasks.mockRejectedValue(new Error('offline'));
    getRecurringTaskProgress.mockResolvedValue({
      currentStreak: 0,
      longestStreak: 0,
      currentLevel: 1,
    });

    await expect(
      refetchRecurringBoardData(queryClient, 'token'),
    ).rejects.toThrow('offline');
  });
});
