export type OnboardingSlideId =
  | 'dailyTasks'
  | 'completeStreak'
  | 'journeyVisible'
  | 'captureNotes';

export type OnboardingSlide = {
  id: OnboardingSlideId;
  titleKey:
    | 'onboarding.slide1.title'
    | 'onboarding.slide2.title'
    | 'onboarding.slide3.title'
    | 'onboarding.slide4.title';
  bodyKey:
    | 'onboarding.slide1.body'
    | 'onboarding.slide2.body'
    | 'onboarding.slide3.body'
    | 'onboarding.slide4.body';
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'dailyTasks',
    titleKey: 'onboarding.slide1.title',
    bodyKey: 'onboarding.slide1.body',
  },
  {
    id: 'completeStreak',
    titleKey: 'onboarding.slide2.title',
    bodyKey: 'onboarding.slide2.body',
  },
  {
    id: 'journeyVisible',
    titleKey: 'onboarding.slide3.title',
    bodyKey: 'onboarding.slide3.body',
  },
  {
    id: 'captureNotes',
    titleKey: 'onboarding.slide4.title',
    bodyKey: 'onboarding.slide4.body',
  },
];
