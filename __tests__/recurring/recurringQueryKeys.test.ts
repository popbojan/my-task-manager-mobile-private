jest.mock('@/config/api', () => ({
  getApiBaseUrl: () => 'http://test.local',
}));

import { QueryClient } from '@tanstack/react-query';
import { RecurringTaskStatus } from '@/api/generated';
import type { RecurringTask } from '@/api/generated/models/RecurringTask';
import {
  recurringTaskQueryKey,
  recurringTasksQueryKey,
  writeRecurringTaskToCaches,
} from '@/recurring/recurringQueryKeys';

function task(overrides: Partial<RecurringTask> = {}): RecurringTask {
  return {
    id: 'task-1',
    title: 'vier',
    description: null,
    status: RecurringTaskStatus.Todo,
    streakCount: 0,
    lastCompletedAt: null,
    lastResetAt: new Date('2026-11-07T00:00:00.000Z'),
    nextResetAt: new Date('2026-11-08T00:00:00.000Z'),
    notificationEnabled: false,
    notificationTime: '09:00',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-11-07T10:00:00.000Z'),
    ...overrides,
  };
}

describe('writeRecurringTaskToCaches', () => {
  it('replaces the cached GET and board task after save', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const token = 'token';
    const previous = task();
    const saved = task({
      notificationTime: '08:00',
      updatedAt: new Date('2026-11-07T10:01:00.000Z'),
    });

    queryClient.setQueryData(recurringTaskQueryKey(previous.id), previous);
    queryClient.setQueryData(recurringTasksQueryKey(token), [previous]);

    writeRecurringTaskToCaches(queryClient, token, saved);

    expect(
      queryClient.getQueryData<RecurringTask>(recurringTaskQueryKey(saved.id))
        ?.notificationTime,
    ).toBe('08:00');
    expect(
      queryClient.getQueryData<RecurringTask[]>(recurringTasksQueryKey(token))?.[0]
        .notificationTime,
    ).toBe('08:00');

    queryClient.clear();
  });
});
