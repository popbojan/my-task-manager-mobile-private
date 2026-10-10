import { useCallback, useEffect, useState } from 'react';
import {
  isOnboardingDismissed,
  markOnboardingDismissed,
} from '@/onboarding/onboardingStorage';
import { shouldShowOnboarding } from '@/onboarding/shouldShowOnboarding';

type UseOnboardingVisibilityInput = {
  userId: string | undefined;
  isNewUser: boolean | undefined;
};

export function useOnboardingVisibility({
  userId,
  isNewUser,
}: UseOnboardingVisibilityInput) {
  const [dismissed, setDismissed] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!userId) {
      setDismissed(null);
      setVisible(false);
      return;
    }

    let cancelled = false;

    void isOnboardingDismissed(userId).then(storedDismissed => {
      if (cancelled) {
        return;
      }

      setDismissed(storedDismissed);
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || isNewUser === undefined || dismissed === null) {
      setVisible(false);
      return;
    }

    setVisible(
      shouldShowOnboarding({
        isNewUser,
        dismissed,
      }),
    );
  }, [dismissed, isNewUser, userId]);

  const dismiss = useCallback(async () => {
    if (!userId) {
      return;
    }

    await markOnboardingDismissed(userId);
    setDismissed(true);
    setVisible(false);
  }, [userId]);

  const isReady =
    !userId || (isNewUser !== undefined && dismissed !== null);

  return {
    visible,
    dismiss,
    isReady,
  };
}
