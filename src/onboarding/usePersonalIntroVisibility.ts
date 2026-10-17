import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  isPersonalIntroDismissed,
  markPersonalIntroDismissed,
} from '@/onboarding/personalIntroStorage';
import { shouldShowPersonalIntro } from '@/onboarding/shouldShowPersonalIntro';

type UsePersonalIntroVisibilityInput = {
  userId: string | undefined;
  isNewUser: boolean | undefined;
};

export function usePersonalIntroVisibility({
  userId,
  isNewUser,
}: UsePersonalIntroVisibilityInput) {
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!userId) {
      setDismissed(null);
      return;
    }

    let cancelled = false;

    void isPersonalIntroDismissed(userId).then(storedDismissed => {
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

    return shouldShowPersonalIntro({
      isNewUser,
      dismissed,
    });
  }, [dismissed, isNewUser, userId]);

  const dismiss = useCallback(async () => {
    if (!userId) {
      return;
    }

    await markPersonalIntroDismissed(userId);
    setDismissed(true);
  }, [userId]);

  const isReady = !userId || (isNewUser !== undefined && dismissed !== null);

  return {
    autoVisible,
    dismiss,
    isReady,
  };
}
