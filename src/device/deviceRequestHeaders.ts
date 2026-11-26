import { DevicePlatform } from '@/api/generated';
import { getOrCreateDeviceId } from '@/device/deviceId';
import {
  getDeviceManufacturer,
  getDeviceModel,
  getDeviceOsVersion,
} from '@/device/deviceSystemInfo';
import { getMobileAppVersion } from '@/user/mobileAppVersion';

/** Auth OTP — full device registration headers. */
export async function getAuthDeviceHeaders(): Promise<{
  xDeviceId: string;
  xDevicePlatform: DevicePlatform;
  xAppVersion: string;
  xDeviceManufacturer?: string;
  xDeviceModel?: string;
  xDeviceOSVersion: string;
}> {
  const xDeviceId = await getOrCreateDeviceId();
  const manufacturer = getDeviceManufacturer();
  const model = getDeviceModel();

  return {
    xDeviceId,
    xDevicePlatform: DevicePlatform.Android,
    xAppVersion: getMobileAppVersion(),
    ...(manufacturer ? { xDeviceManufacturer: manufacturer } : {}),
    ...(model ? { xDeviceModel: model } : {}),
    xDeviceOSVersion: getDeviceOsVersion(),
  };
}

/**
 * GET /users/me lookup — id + platform required together by contract.
 * Does not create/update the device.
 */
export async function getCurrentUserDeviceHeaders(): Promise<{
  xDeviceId: string;
  xDevicePlatform: DevicePlatform;
}> {
  const xDeviceId = await getOrCreateDeviceId();
  return {
    xDeviceId,
    xDevicePlatform: DevicePlatform.Android,
  };
}

export type PreferencesDeviceHeaderOptions = {
  syncAppVersion?: boolean;
  syncOsVersion?: boolean;
};

/** PATCH preferences — never send platform / manufacturer / model. */
export async function getPreferencesDeviceHeaders(
  options: PreferencesDeviceHeaderOptions = {},
): Promise<{
  xDeviceId: string;
  xAppVersion?: string;
  xDeviceOSVersion?: string;
}> {
  const xDeviceId = await getOrCreateDeviceId();
  return {
    xDeviceId,
    ...(options.syncAppVersion
      ? { xAppVersion: getMobileAppVersion() }
      : {}),
    ...(options.syncOsVersion
      ? { xDeviceOSVersion: getDeviceOsVersion() }
      : {}),
  };
}
