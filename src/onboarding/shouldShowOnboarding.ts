export function shouldShowOnboarding(input: {
  isNewUser: boolean;
  dismissed: boolean;
}): boolean {
  if (input.dismissed) {
    return false;
  }

  if (input.isNewUser) {
    return true;
  }

  if (__DEV__) {
    return true;
  }

  return false;
}
