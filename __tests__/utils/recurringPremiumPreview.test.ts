import {
  createPremiumPreviewTasks,
  isPremiumPreviewTask,
  PREVIEW_SUBSCRIBE_TASK_ID,
} from '@/utils/recurringPremiumPreview';

describe('recurringPremiumPreview', () => {
  it('creates a single subscribe preview task', () => {
    const tasks = createPremiumPreviewTasks(() => 'Subscribe to practice discipline', 'UTC');

    expect(tasks).toHaveLength(1);
    expect(tasks[0]?.id).toBe(PREVIEW_SUBSCRIBE_TASK_ID);
    expect(tasks[0]?.title).toBe('Subscribe to practice discipline');
  });

  it('detects preview task ids', () => {
    expect(isPremiumPreviewTask(PREVIEW_SUBSCRIBE_TASK_ID)).toBe(true);
    expect(isPremiumPreviewTask('real-task-id')).toBe(false);
  });
});
