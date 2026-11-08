import { QueryClient } from '@tanstack/react-query';
import { TaskPriority, TaskStatus } from '@/api/generated';
import type { Task } from '@/api/generated/models/Task';
import {
  selectTaskForForm,
  taskQueryKey,
  tasksQueryKey,
  writeTaskToCaches,
} from '@/pages/tasks/taskQueryKeys';

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Einkaufen',
    description: null,
    status: TaskStatus.Todo,
    priority: TaskPriority.None,
    deadline: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-11-08T10:00:00.000Z'),
    ...overrides,
  };
}

describe('writeTaskToCaches', () => {
  it('replaces the cached GET and board task after save', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const token = 'token';
    const previous = task();
    const saved = task({
      description: 'Milch',
      updatedAt: new Date('2026-11-08T10:01:00.000Z'),
    });

    queryClient.setQueryData(taskQueryKey(previous.id), previous);
    queryClient.setQueryData(tasksQueryKey(token), [previous]);

    writeTaskToCaches(queryClient, token, saved);

    expect(
      queryClient.getQueryData<Task>(taskQueryKey(saved.id))?.description,
    ).toBe('Milch');
    expect(
      queryClient.getQueryData<Task[]>(tasksQueryKey(token))?.[0].description,
    ).toBe('Milch');

    queryClient.clear();
  });
});

describe('selectTaskForForm', () => {
  it('prefers the list task when it was updated later than the cached GET', () => {
    const fetched = task({
      description: null,
      updatedAt: new Date('2026-11-08T10:00:00.000Z'),
    });
    const listed = task({
      description: 'Milch',
      updatedAt: new Date('2026-11-08T10:01:00.000Z'),
    });

    expect(selectTaskForForm(fetched, listed)?.description).toBe('Milch');
  });
});
