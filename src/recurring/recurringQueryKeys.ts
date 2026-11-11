import type { QueryClient } from '@tanstack/react-query';
import type { RecurringTask } from '@/api/generated/models/RecurringTask';
import { getApiBaseUrl } from '@/config/api';

export function recurringTasksQueryKey(accessToken: string | null) {
  return ['recurring-tasks', getApiBaseUrl(), accessToken] as const;
}

export function recurringTaskProgressQueryKey(accessToken: string | null) {
  return ['recurring-task-progress', getApiBaseUrl(), accessToken] as const;
}

export function recurringTaskQueryKey(taskId: string) {
  return ['recurring-task', taskId] as const;
}

export function writeRecurringTaskToCaches(
  queryClient: QueryClient,
  accessToken: string | null,
  task: RecurringTask,
): void {
  queryClient.setQueryData(recurringTaskQueryKey(task.id), task);
  queryClient.setQueryData<RecurringTask[]>(
    recurringTasksQueryKey(accessToken),
    (old = []) => {
      const exists = old.some(item => item.id === task.id);
      if (!exists) {
        return [...old, task];
      }

      return old.map(item => (item.id === task.id ? task : item));
    },
  );
}

/** Prefer the newer of list-cache vs detail-cache when opening the edit form. */
export function selectRecurringTaskForForm(
  fetched: RecurringTask | undefined,
  listed: RecurringTask | undefined,
): RecurringTask | undefined {
  if (!fetched) {
    return listed;
  }

  if (!listed) {
    return fetched;
  }

  const fetchedAt = new Date(fetched.updatedAt).getTime();
  const listedAt = new Date(listed.updatedAt).getTime();
  return listedAt >= fetchedAt ? listed : fetched;
}

export function clearRecurringSessionQueries(queryClient: QueryClient) {
  queryClient.removeQueries({ queryKey: ['recurring-tasks'] });
  queryClient.removeQueries({ queryKey: ['recurring-task'] });
  queryClient.removeQueries({ queryKey: ['recurring-task-progress'] });
  queryClient.removeQueries({ queryKey: ['current-user'] });
}

function hasSuccessfulRecurringQueries(queryClient: QueryClient): boolean {
  const tasksSucceeded = queryClient
    .getQueryCache()
    .findAll({ queryKey: ['recurring-tasks'] })
    .some(
      query =>
        query.state.status === 'success' &&
        query.state.data !== undefined,
    );
  const progressSucceeded = queryClient
    .getQueryCache()
    .findAll({ queryKey: ['recurring-task-progress'] })
    .some(
      query =>
        query.state.status === 'success' &&
        query.state.data !== undefined,
    );

  return tasksSucceeded || progressSucceeded;
}

/** Drop stale recurring successes after premium ends — skip when nothing was cached. */
export function clearRecurringSessionQueriesIfCached(
  queryClient: QueryClient,
): void {
  if (!hasSuccessfulRecurringQueries(queryClient)) {
    return;
  }

  clearRecurringSessionQueries(queryClient);
}

function invalidateQueriesQuietly(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
): void {
  void queryClient.invalidateQueries({ queryKey }).catch(() => undefined);
}

/** Refetch premium-gated recurring data after subscription unlocks. */
export function invalidateRecurringQueries(queryClient: QueryClient): void {
  invalidateQueriesQuietly(queryClient, ['recurring-tasks']);
  invalidateQueriesQuietly(queryClient, ['recurring-task-progress']);
  invalidateQueriesQuietly(queryClient, ['recurring-task']);
  invalidateQueriesQuietly(queryClient, ['history']);
}
