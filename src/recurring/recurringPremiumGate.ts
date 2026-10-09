/**
 * Client-side gate for Heute / recurring-task edits.
 * Backend is authoritative; this blocks UI when subscription says no premium
 * or recurring APIs returned premium-required (403).
 */
export function shouldBlockRecurringPremiumInteraction(input: {
  hasPremiumAccess: boolean;
  isPremiumPreview: boolean;
  subscriptionReady: boolean;
}): boolean {
  if (!input.subscriptionReady) {
    return true;
  }

  if (!input.hasPremiumAccess) {
    return true;
  }

  return input.isPremiumPreview;
}
