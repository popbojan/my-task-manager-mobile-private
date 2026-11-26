/** True when local value differs from the persisted device field (incl. null). */
export function shouldSyncDeviceField(
  persisted: string | null | undefined,
  local: string,
): boolean {
  if (!local) {
    return false;
  }

  const normalizedPersisted = persisted?.trim();
  if (!normalizedPersisted) {
    return true;
  }

  return normalizedPersisted !== local;
}
