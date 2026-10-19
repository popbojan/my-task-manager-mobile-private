export function shouldShowOnboarding(input: {
  mobileOnboardingSeenAt: Date | null | undefined;
}): boolean {
  return input.mobileOnboardingSeenAt == null;
}
