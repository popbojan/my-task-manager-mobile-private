import { useCallback, useEffect, useMemo, useState } from 'react';
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
  const [manualOpen, setManualOpen] = useState(false);

  useEffect(() => {
    if (!userId) {
      setDismissed(null);
      setManualOpen(false);
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

  const autoVisible = useMemo(() => {
    if (!userId || isNewUser === undefined || dismissed === null) {
      return false;
    }

    return shouldShowOnboarding({
      isNewUser,
      dismissed,
    });
  }, [dismissed, isNewUser, userId]);

  const visible = manualOpen || autoVisible;

  const open = useCallback(() => {
    setManualOpen(true);
  }, []);

  const close = useCallback(() => {
    setManualOpen(false);
  }, []);

  const dismiss = useCallback(async () => {
    setManualOpen(false);

    if (!userId) {
      return;
    }

    await markOnboardingDismissed(userId);
    setDismissed(true);
  }, [userId]);

  const isReady =
    !userId || (isNewUser !== undefined && dismissed !== null);

  return {
    visible,
    manualOpen,
    autoVisible,
    open,
    close,
    dismiss,
    isReady,
  };
}
