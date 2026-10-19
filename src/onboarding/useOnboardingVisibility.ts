import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { User } from '@/api/generated';
import { useAuth } from '@/auth/AuthContext';
import { shouldShowOnboarding } from '@/onboarding/shouldShowOnboarding';
import { markMobileOnboardingSeen } from '@/user/userPreferences';

type UseOnboardingVisibilityInput = {
  user: User | undefined;
  userLoaded: boolean;
};

export function useOnboardingVisibility({
  user,
  userLoaded,
}: UseOnboardingVisibilityInput) {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const [manualOpen, setManualOpen] = useState(false);
  const [autoDismissed, setAutoDismissed] = useState(false);

  useEffect(() => {
    setAutoDismissed(false);
  }, [user?.id, accessToken]);

  useEffect(() => {
    if (user?.mobileOnboardingSeenAt == null) {
      setAutoDismissed(false);
    }
  }, [user?.mobileOnboardingSeenAt]);

  const autoVisible = useMemo(() => {
    if (autoDismissed || !user || !userLoaded) {
      return false;
    }

    return shouldShowOnboarding({
      mobileOnboardingSeenAt: user.mobileOnboardingSeenAt,
    });
  }, [autoDismissed, user, userLoaded]);

  const visible = manualOpen || autoVisible;

  const open = useCallback(() => {
    setManualOpen(true);
  }, []);

  const close = useCallback(() => {
    setManualOpen(false);
  }, []);

  const dismiss = useCallback(async () => {
    setManualOpen(false);
    setAutoDismissed(true);

    if (!user || user.mobileOnboardingSeenAt != null) {
      return;
    }

    try {
      await markMobileOnboardingSeen(queryClient, accessToken);
    } catch {
      // Keep the onboarding closed even if persistence fails temporarily.
    }
  }, [accessToken, queryClient, user]);

  const isReady = !user?.id || userLoaded;

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
