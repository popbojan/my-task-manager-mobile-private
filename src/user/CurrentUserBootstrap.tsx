import { useCurrentUser } from '@/user/useCurrentUser';

/**
 * Loads GET /users/me after authentication and synchronizes device timezone
 * via PATCH /users/me/preferences when needed.
 */
export default function CurrentUserBootstrap() {
  useCurrentUser();
  return null;
}
