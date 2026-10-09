import { shouldBlockRecurringPremiumInteraction } from '@/recurring/recurringPremiumGate';

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
