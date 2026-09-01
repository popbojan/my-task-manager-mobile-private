import type { Subscription } from '@/api/generated/models/Subscription';

export function isSubscriptionPendingCancellation(
  subscription: Subscription | null | undefined,
): boolean {
  if (!subscription) {
    return false;
  }

  return subscription.cancelAtPeriodEnd || subscription.canceledAt != null;
}

export function getSubscriptionExpiryDate(
  subscription: Subscription | null | undefined,
): Date | null {
  if (!subscription) {
    return null;
  }

  return subscription.currentPeriodEnd ?? subscription.canceledAt ?? null;
}
