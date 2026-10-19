export function shouldShowPersonalIntro(input: {
  personalIntroSeenAt: Date | null | undefined;
}): boolean {
  return input.personalIntroSeenAt == null;
}
