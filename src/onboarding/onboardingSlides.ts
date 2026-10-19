export type OnboardingSlideId =
  | 'dailyTasks'
  | 'completeTasks'
  | 'streakGrowth'
  | 'journeyVisible'
  | 'captureNotes'
  | 'yourChoice';

export type OnboardingSlide = {
  id: OnboardingSlideId;
  titleKey:
    | 'onboarding.slide1.title'
    | 'onboarding.slide2.title'
    | 'onboarding.slide3.title'
    | 'onboarding.slide4.title'
    | 'onboarding.slide5.title'
    | 'onboarding.slide6.title';
  bodyKey:
    | 'onboarding.slide1.body'
    | 'onboarding.slide2.body'
    | 'onboarding.slide3.body'
    | 'onboarding.slide4.body'
    | 'onboarding.slide5.body'
    | 'onboarding.slide6.body';
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'dailyTasks',
    titleKey: 'onboarding.slide1.title',
    bodyKey: 'onboarding.slide1.body',
  },
  {
    id: 'completeTasks',
    titleKey: 'onboarding.slide2.title',
    bodyKey: 'onboarding.slide2.body',
  },
  {
    id: 'streakGrowth',
    titleKey: 'onboarding.slide3.title',
    bodyKey: 'onboarding.slide3.body',
  },
  {
    id: 'journeyVisible',
    titleKey: 'onboarding.slide4.title',
    bodyKey: 'onboarding.slide4.body',
  },
  {
    id: 'captureNotes',
    titleKey: 'onboarding.slide5.title',
    bodyKey: 'onboarding.slide5.body',
  },
  {
    id: 'yourChoice',
    titleKey: 'onboarding.slide6.title',
    bodyKey: 'onboarding.slide6.body',
  },
];
