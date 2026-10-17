import { shouldShowPersonalIntro } from '@/onboarding/shouldShowPersonalIntro';

describe('shouldShowPersonalIntro', () => {
  it('returns false when personal intro was dismissed locally', () => {
    expect(
      shouldShowPersonalIntro({
        isNewUser: true,
        dismissed: true,
      }),
    ).toBe(false);
  });

  it('returns true for new users who have not dismissed personal intro', () => {
    expect(
      shouldShowPersonalIntro({
        isNewUser: true,
        dismissed: false,
      }),
    ).toBe(true);
  });

  it('returns false for returning users in production', () => {
    const originalDev = (global as { __DEV__?: boolean }).__DEV__;
    (global as { __DEV__?: boolean }).__DEV__ = false;

    expect(
      shouldShowPersonalIntro({
        isNewUser: false,
        dismissed: false,
      }),
    ).toBe(false);

    (global as { __DEV__?: boolean }).__DEV__ = originalDev;
  });
});
