import { shouldApplyOptimisticStatusSync } from '@/utils/shouldApplyOptimisticStatusSync';

describe('shouldApplyOptimisticStatusSync', () => {
  it('applies when pending matches the in-flight request', () => {
    expect(shouldApplyOptimisticStatusSync('done', 'done')).toBe(true);
  });

  it('skips stale responses when the user toggled ahead', () => {
    expect(shouldApplyOptimisticStatusSync('done', 'in_progress')).toBe(false);
  });
});
