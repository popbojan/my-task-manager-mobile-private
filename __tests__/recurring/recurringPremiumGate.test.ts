import {
  shouldBlockRecurringPremiumInteraction,
  shouldShowRecurringPremiumPreview,
} from '@/recurring/recurringPremiumGate';

describe('shouldBlockRecurringPremiumInteraction', () => {
  it('blocks while subscription is not ready', () => {
    expect(
      shouldBlockRecurringPremiumInteraction({
        hasPremiumAccess: true,
        isPremiumPreview: false,
        subscriptionReady: false,
      }),
    ).toBe(true);
  });

  it('blocks without premium even when preview flag is false (stale cache)', () => {
    expect(
      shouldBlockRecurringPremiumInteraction({
        hasPremiumAccess: false,
        isPremiumPreview: false,
        subscriptionReady: true,
      }),
    ).toBe(true);
  });

  it('blocks premium preview mode', () => {
    expect(
      shouldBlockRecurringPremiumInteraction({
        hasPremiumAccess: false,
        isPremiumPreview: true,
        subscriptionReady: true,
      }),
    ).toBe(true);
  });

  it('allows subscribed users with live recurring data', () => {
    expect(
      shouldBlockRecurringPremiumInteraction({
        hasPremiumAccess: true,
        isPremiumPreview: false,
        subscriptionReady: true,
      }),
    ).toBe(false);
  });
});

describe('shouldShowRecurringPremiumPreview', () => {
  it('shows preview once subscription is ready and there is no premium', () => {
    expect(
      shouldShowRecurringPremiumPreview({
        subscriptionReady: true,
        hasPremiumAccess: false,
        tasksPremiumLocked: false,
        progressPremiumLocked: false,
      }),
    ).toBe(true);
  });

  it('does not show preview while subscription is still loading', () => {
    expect(
      shouldShowRecurringPremiumPreview({
        subscriptionReady: false,
        hasPremiumAccess: false,
        tasksPremiumLocked: false,
        progressPremiumLocked: false,
      }),
    ).toBe(false);
  });

  it('does not show preview for premium users even if a 403 is cached', () => {
    expect(
      shouldShowRecurringPremiumPreview({
        subscriptionReady: true,
        hasPremiumAccess: true,
        tasksPremiumLocked: true,
        progressPremiumLocked: true,
      }),
    ).toBe(false);
  });
});
