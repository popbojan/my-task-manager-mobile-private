import { QueryClient } from '@tanstack/react-query';
import { RecurringTaskStatus, type RecurringTask } from '@/api/generated';
import {
  recurringTaskQueryKey,
  recurringTasksQueryKey,
  selectRecurringTaskForForm,
  writeRecurringTaskToCaches,
} from '@/recurring/recurringQueryKeys';

jest.mock('@/config/api', () => ({
  getApiBaseUrl: () => 'http://test.local',
}));

function task(
  overrides: Partial<RecurringTask> & Pick<RecurringTask, 'id' | 'title' | 'updatedAt'>,
): RecurringTask {
  return {
    description: null,
    status: RecurringTaskStatus.Todo,
    streakCount: 0,
    lastCompletedAt: null,
    lastResetAt: null,
    nextResetAt: new Date('2026-11-12T00:00:00.000Z'),
    notificationEnabled: false,
    notificationTime: null,
    createdAt: new Date('2026-11-01T00:00:00.000Z'),
    ...overrides,
  };
}

describe('recurring task form cache', () => {
  it('prefers the newer of list vs detail when opening the form', () => {
    const older = task({
      id: 't1',
      title: 'Alt',
      updatedAt: new Date('2026-11-11T10:00:00.000Z'),
    });
    const newer = task({
      id: 't1',
      title: 'Neu',
      updatedAt: new Date('2026-11-11T11:00:00.000Z'),
    });

    expect(selectRecurringTaskForForm(older, newer)?.title).toBe('Neu');
    expect(selectRecurringTaskForForm(newer, older)?.title).toBe('Neu');
    expect(selectRecurringTaskForForm(undefined, newer)?.title).toBe('Neu');
  });

  it('writes saved task into detail and list caches', () => {
    const queryClient = new QueryClient();
    const accessToken = 'token';
    const saved = task({
      id: 't1',
      title: 'Gespeichert',
      updatedAt: new Date('2026-11-11T12:00:00.000Z'),
    });

    queryClient.setQueryData(recurringTasksQueryKey(accessToken), [
      task({
        id: 't1',
        title: 'Alt',
        updatedAt: new Date('2026-11-11T10:00:00.000Z'),
      }),
    ]);

    writeRecurringTaskToCaches(queryClient, accessToken, saved);

    expect(queryClient.getQueryData(recurringTaskQueryKey('t1'))).toEqual(saved);
    expect(
      queryClient.getQueryData<RecurringTask[]>(recurringTasksQueryKey(accessToken))?.[0]
        ?.title,
    ).toBe('Gespeichert');
  });
});
