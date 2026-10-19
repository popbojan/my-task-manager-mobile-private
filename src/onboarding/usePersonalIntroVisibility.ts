import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { User } from '@/api/generated';
import { useAuth } from '@/auth/AuthContext';
import { shouldShowPersonalIntro } from '@/onboarding/shouldShowPersonalIntro';
import { markPersonalIntroSeen } from '@/user/userPreferences';

type UsePersonalIntroVisibilityInput = {
  user: User | undefined;
  userLoaded: boolean;
};

export function usePersonalIntroVisibility({
  user,
  userLoaded,
}: UsePersonalIntroVisibilityInput) {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const [autoDismissed, setAutoDismissed] = useState(false);

  useEffect(() => {
    setAutoDismissed(false);
  }, [user?.id]);

  const autoVisible = useMemo(() => {
    if (autoDismissed || !user || !userLoaded) {
      return false;
    }

    return shouldShowPersonalIntro({
      personalIntroSeenAt: user.personalIntroSeenAt,
    });
  }, [autoDismissed, user, userLoaded]);

  const dismiss = useCallback(async () => {
    setAutoDismissed(true);

    if (!user || user.personalIntroSeenAt != null) {
      return;
    }

    try {
      await markPersonalIntroSeen(queryClient, accessToken);
    } catch {
      // Keep the intro closed even if persistence fails temporarily.
    }
  }, [accessToken, queryClient, user]);

  const isReady = !user?.id || userLoaded;

  return {
    autoVisible,
    dismiss,
    isReady,
  };
}
