import { shouldShowOnboarding } from '@/onboarding/shouldShowOnboarding';

describe('shouldShowOnboarding', () => {
  it('returns false when onboarding was dismissed locally', () => {
    expect(
      shouldShowOnboarding({
        isNewUser: true,
        dismissed: true,
      }),
    ).toBe(false);
  });

  it('returns true for new users when not dismissed', () => {
    expect(
      shouldShowOnboarding({
        isNewUser: true,
        dismissed: false,
      }),
    ).toBe(true);
  });

  it('returns false for existing users in production builds', () => {
    const originalDev = (global as { __DEV__?: boolean }).__DEV__;
    (global as { __DEV__?: boolean }).__DEV__ = false;

    expect(
      shouldShowOnboarding({
        isNewUser: false,
        dismissed: false,
      }),
    ).toBe(false);

    (global as { __DEV__?: boolean }).__DEV__ = originalDev;
  });
});
