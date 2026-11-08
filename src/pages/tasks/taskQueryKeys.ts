import type { QueryClient } from '@tanstack/react-query';
import type { Task } from '@/api/generated/models/Task';

export function tasksQueryKey(accessToken: string | null) {
  return ['tasks', accessToken] as const;
}

export function taskQueryKey(taskId: string) {
  return ['task', taskId] as const;
}

export function writeTaskToCaches(
  queryClient: QueryClient,
  accessToken: string | null,
  task: Task,
): void {
  queryClient.setQueryData(taskQueryKey(task.id), task);
  queryClient.setQueryData<Task[]>(tasksQueryKey(accessToken), (old = []) => {
    const exists = old.some(item => item.id === task.id);
    if (!exists) {
      return [...old, task];
    }

    return old.map(item => (item.id === task.id ? task : item));
  });
}

export function selectTaskForForm(
  fetched: Task | undefined,
  listed: Task | undefined,
): Task | undefined {
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
