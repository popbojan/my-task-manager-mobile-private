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

export const TASK_PRIORITY_SECTIONS: TaskPriority[] = [
  TaskPriority.ImportantUrgent,
  TaskPriority.Important,
  TaskPriority.Urgent,
  TaskPriority.None,
];

export type TaskListItem =
  | { kind: 'section'; priority: TaskPriority; id: string }
  | { kind: 'task'; task: Task; id: string };

const PRIORITY_FILTER_BY_VALUE = new Map(
  TASK_FILTERS.filter(
    (filter): filter is typeof filter & { id: TaskPriority } => filter.id !== 'all',
  ).map(filter => [filter.id, filter]),
);

export function getPrioritySectionMeta(priority: TaskPriority) {
  return PRIORITY_FILTER_BY_VALUE.get(priority)!;
}

export function defaultPriorityForCreateFilter(filter: TaskFilterId): TaskPriority {
  if (filter === 'all') {
    return TaskPriority.ImportantUrgent;
  }

  return filter;
}

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

/** Stable order within a priority filter — cards stay put when status changes. */
export function sortTasksStable(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const timeDiff = a.createdAt.getTime() - b.createdAt.getTime();
    if (timeDiff !== 0) {
      return timeDiff;
    }

    return a.id.localeCompare(b.id);
  });
}

export function orderTasksByIds(tasks: Task[], orderedIds: string[]): Task[] {
  const byId = new Map(tasks.map(task => [task.id, task]));

  return orderedIds
    .map(id => byId.get(id))
    .filter((task): task is Task => task !== undefined);
}

/** Keep existing card positions; append new tasks; drop removed ones. */
export function syncTaskOrderIds(
  previousOrder: string[],
  tasks: Task[],
  filter: TaskFilterId = 'all',
): string[] {
  if (filter === 'all') {
    return buildGroupedTaskOrder(previousOrder, tasks);
  }

  const taskIds = new Set(tasks.map(task => task.id));
  const kept = previousOrder.filter(id => taskIds.has(id));
  const keptSet = new Set(kept);
  const newIds = sortTasksStable(
    tasks.filter(task => !keptSet.has(task.id)),
  ).map(task => task.id);

  if (kept.length === 0) {
    return sortTasksStable(tasks).map(task => task.id);
  }

  return [...kept, ...newIds];
}

function buildGroupedTaskOrder(previousOrder: string[], tasks: Task[]): string[] {
  const taskById = new Map(tasks.map(task => [task.id, task]));

  return TASK_PRIORITY_SECTIONS.flatMap(priority => {
    const sectionIds = new Set(
      tasks.filter(task => task.priority === priority).map(task => task.id),
    );
    const kept = previousOrder.filter(id => {
      const task = taskById.get(id);
      return task?.priority === priority && sectionIds.has(id);
    });
    const keptSet = new Set(kept);
    const newIds = sortTasksStable(
      tasks.filter(task => task.priority === priority && !keptSet.has(task.id)),
    ).map(task => task.id);

    return [...kept, ...newIds];
  });
}

export function buildInitialTaskOrder(
  tasks: Task[],
  filter: TaskFilterId,
): string[] {
  if (filter === 'all') {
    return buildGroupedTaskOrder([], tasks);
  }

  return sortTasksStable(tasks).map(task => task.id);
}

export function buildTaskListItems(
  tasks: Task[],
  orderedIds: string[],
  filter: TaskFilterId,
): TaskListItem[] {
  const orderedTasks = orderTasksByIds(tasks, orderedIds);

  if (filter !== 'all') {
    return orderedTasks.map(task => ({
      kind: 'task',
      task,
      id: task.id,
    }));
  }

  const items: TaskListItem[] = [];

  for (const priority of TASK_PRIORITY_SECTIONS) {
    const sectionTasks = orderedTasks.filter(task => task.priority === priority);
    if (sectionTasks.length === 0) {
      continue;
    }

    items.push({
      kind: 'section',
      priority,
      id: `section-${priority}`,
    });

    for (const task of sectionTasks) {
      items.push({
        kind: 'task',
        task,
        id: task.id,
      });
    }
  }

  return items;
}
