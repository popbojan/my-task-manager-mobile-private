import { Platform } from 'react-native';

type AndroidPlatformConstants = {
  Brand?: string;
  Manufacturer?: string;
  Model?: string;
  Release?: string;
};

function readAndroidConstants(): AndroidPlatformConstants {
  return (Platform.constants ?? {}) as AndroidPlatformConstants;
}

function nonEmpty(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/** Device manufacturer from the OS (not hardcoded). */
export function getDeviceManufacturer(): string | undefined {
  if (Platform.OS === 'android') {
    const constants = readAndroidConstants();
    return (
      nonEmpty(constants.Manufacturer) ?? nonEmpty(constants.Brand) ?? undefined
    );
  }

  return undefined;
}

/** Device model from the OS (not hardcoded). */
export function getDeviceModel(): string | undefined {
  if (Platform.OS === 'android') {
    return nonEmpty(readAndroidConstants().Model);
  }

  return undefined;
}

/** OS release/version string from the system. */
export function getDeviceOsVersion(): string {
  if (Platform.OS === 'android') {
    const release = nonEmpty(readAndroidConstants().Release);
    if (release) {
      return release;
    }
  }

  return String(Platform.Version);
}
