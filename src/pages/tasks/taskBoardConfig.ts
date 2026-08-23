import { TaskPriority, TaskStatus, type Task } from '@/api/generated';
import type { TranslationKey } from '@/i18n/locales/de';

export const TASK_STATUS_FLOW: {
  status: TaskStatus;
  labelKey: TranslationKey;
}[] = [
  { status: TaskStatus.Todo, labelKey: 'tasks.status.todo' },
  { status: TaskStatus.InProgress, labelKey: 'tasks.status.inProgress' },
  { status: TaskStatus.Review, labelKey: 'tasks.status.review' },
  { status: TaskStatus.Done, labelKey: 'tasks.status.done' },
];

export type TaskFilterId = 'all' | TaskPriority;

export const TASK_FILTERS: {
  id: TaskFilterId;
  labelKey: TranslationKey;
  icon: 'shield' | 'star' | 'bolt' | 'doc' | null;
}[] = [
  { id: 'all', labelKey: 'tasks.filter.all', icon: null },
  {
    id: TaskPriority.ImportantUrgent,
    labelKey: 'tasks.filter.importantUrgent',
    icon: 'shield',
  },
  { id: TaskPriority.Important, labelKey: 'tasks.filter.important', icon: 'star' },
  { id: TaskPriority.Urgent, labelKey: 'tasks.filter.urgent', icon: 'bolt' },
  { id: TaskPriority.None, labelKey: 'tasks.filter.other', icon: 'doc' },
];

const STATUS_ORDER = TASK_STATUS_FLOW.map(column => column.status);

export function getNextTaskStatus(current: TaskStatus): TaskStatus {
  const index = STATUS_ORDER.indexOf(current);
  const nextIndex = index < 0 ? 0 : (index + 1) % STATUS_ORDER.length;
  return STATUS_ORDER[nextIndex];
}

export function filterTasksByPriority(
  tasks: Task[],
  filter: TaskFilterId,
): Task[] {
  if (filter === 'all') {
    return tasks;
  }

  return tasks.filter(task => task.priority === filter);
}

export function sortTasksForBoard(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const statusDiff =
      STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);

    if (statusDiff !== 0) {
      return statusDiff;
    }

    const aDeadline = a.deadline?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bDeadline = b.deadline?.getTime() ?? Number.MAX_SAFE_INTEGER;

    if (aDeadline !== bDeadline) {
      return aDeadline - bDeadline;
    }

    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });
}
