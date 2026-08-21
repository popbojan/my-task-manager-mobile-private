export function shouldUpdateDeviceTimezone(
  persistedTimezone: string | null | undefined,
  deviceTimezone: string,
): boolean {
  if (!deviceTimezone) {
    return false;
  }

  const normalizedPersistedTimezone = persistedTimezone?.trim();

  if (!normalizedPersistedTimezone) {
    return true;
  }

  return normalizedPersistedTimezone !== deviceTimezone;
}
