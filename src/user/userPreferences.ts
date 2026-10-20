import type { QueryClient } from '@tanstack/react-query';
import type {
  UpdateUserPreferencesRequest,
  User,
  UserPreferencesResponse,
} from '@/api/generated';
import { authApi } from '@/api/authClient';
import {
  buildPersonalIntroPreferencesPatch,
  type PersonalIntroFocusInput,
} from '@/onboarding/personalIntroPreferences';
import { getMobileAppVersion } from '@/user/mobileAppVersion';
import { currentUserQueryKey } from '@/user/currentUserQuery';

export function withMobileAppVersion(
  patch: Omit<UpdateUserPreferencesRequest, 'mobileAppVersion'>,
): UpdateUserPreferencesRequest {
  return {
    ...patch,
    mobileAppVersion: getMobileAppVersion(),
  };
}

export function applyPreferencesToCurrentUser(
  user: User,
  preferences: UserPreferencesResponse,
): User {
  return {
    ...user,
    language: preferences.language,
    timezone: preferences.timezone,
    personalIntroSeenAt: preferences.personalIntroSeenAt,
    mobileOnboardingSeenAt: preferences.mobileOnboardingSeenAt,
    webOnboardingSeenAt: preferences.webOnboardingSeenAt,
    personalFocusTaskName: preferences.personalFocusTaskName,
    personalFocusMotivation: preferences.personalFocusMotivation,
  };
}

export async function patchUserPreferences(
  queryClient: QueryClient,
  accessToken: string | null,
  patch: Omit<UpdateUserPreferencesRequest, 'mobileAppVersion'>,
): Promise<UserPreferencesResponse> {
  const preferences = await authApi.updateUserPreferences({
    updateUserPreferencesRequest: withMobileAppVersion(patch),
  });

  if (accessToken) {
    queryClient.setQueryData<User>(
      currentUserQueryKey(accessToken),
      currentUser => {
        if (!currentUser) {
          return currentUser;
        }

        return applyPreferencesToCurrentUser(currentUser, preferences);
      },
    );
  }

  return preferences;
}

export async function markPersonalIntroSeen(
  queryClient: QueryClient,
  accessToken: string | null,
  focus?: PersonalIntroFocusInput,
): Promise<void> {
  await patchUserPreferences(
    queryClient,
    accessToken,
    buildPersonalIntroPreferencesPatch(focus),
  );
}

export async function markMobileOnboardingSeen(
  queryClient: QueryClient,
  accessToken: string | null,
): Promise<void> {
  await patchUserPreferences(queryClient, accessToken, {
    mobileOnboardingSeenAt: new Date(),
  });
}
