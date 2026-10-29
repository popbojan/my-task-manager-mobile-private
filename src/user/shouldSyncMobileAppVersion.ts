export function shouldSyncMobileAppVersion(
  persistedVersion: string | null | undefined,
  installedVersion: string,
): boolean {
  if (!installedVersion) {
    return false;
  }

  const normalizedPersistedVersion = persistedVersion?.trim();

  if (!normalizedPersistedVersion) {
    return true;
  }

  return normalizedPersistedVersion !== installedVersion;
}
