export type OnboardingSlideId = 'twoWorlds' | 'getStarted' | 'progress';

export type OnboardingSlide = {
  id: OnboardingSlideId;
  titleKey:
    | 'onboarding.slide1.title'
    | 'onboarding.slide2.title'
    | 'onboarding.slide3.title';
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'twoWorlds',
    titleKey: 'onboarding.slide1.title',
  },
  {
    id: 'getStarted',
    titleKey: 'onboarding.slide2.title',
  },
  {
    id: 'progress',
    titleKey: 'onboarding.slide3.title',
  },
];
