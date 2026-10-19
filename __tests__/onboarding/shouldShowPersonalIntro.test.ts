import { shouldShowPersonalIntro } from '@/onboarding/shouldShowPersonalIntro';

describe('shouldShowPersonalIntro', () => {
  it('returns false when personal intro was already seen', () => {
    expect(
      shouldShowPersonalIntro({
        personalIntroSeenAt: new Date('2026-10-19T08:30:00.000Z'),
      }),
    ).toBe(false);
  });

  it('returns true when personal intro was not seen yet', () => {
    expect(
      shouldShowPersonalIntro({
        personalIntroSeenAt: null,
      }),
    ).toBe(true);
  });
});
