/** Skip stale API responses when the user already toggled ahead in the UI. */
export function shouldApplyOptimisticStatusSync<T>(
  pendingTarget: T | undefined,
  requestStatus: T,
): boolean {
  return pendingTarget === requestStatus;
}
