export type OnboardingSlideId = 'twoWorlds' | 'getStarted' | 'progress';

export type OnboardingSlide = {
  id: OnboardingSlideId;
  titleKey:
    | 'onboarding.slide1.title'
    | 'onboarding.slide2.title'
    | 'onboarding.slide3.title';
  bodyKey:
    | 'onboarding.slide1.body'
    | 'onboarding.slide2.body'
    | 'onboarding.slide2.bodyPremium'
    | 'onboarding.slide3.body';
  usesPremiumBody?: boolean;
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'twoWorlds',
    titleKey: 'onboarding.slide1.title',
    bodyKey: 'onboarding.slide1.body',
  },
  {
    id: 'getStarted',
    titleKey: 'onboarding.slide2.title',
    bodyKey: 'onboarding.slide2.body',
    usesPremiumBody: true,
  },
  {
    id: 'progress',
    titleKey: 'onboarding.slide3.title',
    bodyKey: 'onboarding.slide3.body',
  },
];
