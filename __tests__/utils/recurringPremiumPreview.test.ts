import {
  createPremiumPreviewTasks,
  getPremiumPreviewSubscribeTaskTitle,
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

  it('uses the personal intro task name when provided', () => {
    const title = getPremiumPreviewSubscribeTaskTitle(
      (key, params) =>
        key === 'recurring.preview.subscribeTaskTitlePersonal'
          ? `Subscribe to practice ${params?.taskName}`
          : 'Subscribe to practice discipline',
      'Morning run',
    );

    expect(title).toBe('Subscribe to practice Morning run');

    const tasks = createPremiumPreviewTasks(
      (key, params) =>
        key === 'recurring.preview.subscribeTaskTitlePersonal'
          ? `Subscribe to practice ${params?.taskName}`
          : 'Subscribe to practice discipline',
      'UTC',
      'Morning run',
    );

    expect(tasks[0]?.title).toBe('Subscribe to practice Morning run');
  });

  it('falls back to the default title without a personal task', () => {
    expect(
      getPremiumPreviewSubscribeTaskTitle(
        () => 'Subscribe to practice discipline',
        '   ',
      ),
    ).toBe('Subscribe to practice discipline');
  });

  it('detects preview task ids', () => {
    expect(isPremiumPreviewTask(PREVIEW_SUBSCRIBE_TASK_ID)).toBe(true);
    expect(isPremiumPreviewTask('real-task-id')).toBe(false);
  });
});
