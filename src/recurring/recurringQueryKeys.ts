import type { QueryClient } from '@tanstack/react-query';
import { getApiBaseUrl } from '@/config/api';

export function recurringTasksQueryKey(accessToken: string | null) {
  return ['recurring-tasks', getApiBaseUrl(), accessToken] as const;
}

export function recurringTaskProgressQueryKey(accessToken: string | null) {
  return ['recurring-task-progress', getApiBaseUrl(), accessToken] as const;
}

export function clearRecurringSessionQueries(queryClient: QueryClient) {
  queryClient.removeQueries({ queryKey: ['recurring-tasks'] });
  queryClient.removeQueries({ queryKey: ['recurring-task-progress'] });
  queryClient.removeQueries({ queryKey: ['current-user'] });
}
