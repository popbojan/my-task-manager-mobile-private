import { useCurrentUser } from '@/user/useCurrentUser';

/**
 * Loads GET /users/me after authentication, reports mobileAppVersion, and
 * synchronizes device timezone via PATCH /users/me/preferences when needed.
 */
export default function CurrentUserBootstrap() {
  useCurrentUser();
  return null;
}
