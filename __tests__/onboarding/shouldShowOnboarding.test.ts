import { shouldShowOnboarding } from '@/onboarding/shouldShowOnboarding';

describe('shouldShowOnboarding', () => {
  it('returns false when onboarding was already seen', () => {
    expect(
      shouldShowOnboarding({
        mobileOnboardingSeenAt: new Date('2026-10-19T09:15:00.000Z'),
      }),
    ).toBe(false);
  });

  it('returns true when onboarding was not seen yet', () => {
    expect(
      shouldShowOnboarding({
        mobileOnboardingSeenAt: null,
      }),
    ).toBe(true);
  });
});
