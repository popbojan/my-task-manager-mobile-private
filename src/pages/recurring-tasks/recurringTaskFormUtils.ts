import type { RecurringTask } from '@/api/generated/models/RecurringTask';

export function recurringTaskToFormState(task: RecurringTask) {
  return {
    title: task.title,
    description: task.description ?? '',
    status: task.status,
  };
}
