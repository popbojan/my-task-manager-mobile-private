import { Platform } from 'react-native';
import { revenueCatLocalOverrides } from '@/config/revenueCat.local';

/** Must match backend `REVENUECAT_PRO_ENTITLEMENT_ID` (default). */
export const REVENUECAT_ENTITLEMENT_ID = 'my_task_manager_pro';

/** Must match backend product mapping defaults. */
export const REVENUECAT_MONTHLY_PRODUCT_ID = 'monthly';
export const REVENUECAT_LIFETIME_PRODUCT_ID = 'lifetime';

function pickPlatformSdkKey(productionKey: string, testStoreKey: string): string | null {
  const playOrAppStoreKey = productionKey.trim();
  const testKey = testStoreKey.trim();

  // RevenueCat closes release builds that use test_ keys — never in production.
  if (__DEV__ && testKey.length > 0) {
    return testKey;
  }

  if (playOrAppStoreKey.length > 0) {
    return playOrAppStoreKey;
  }

  return null;
}

export function getRevenueCatPublicSdkKey(): string | null {
  if (Platform.OS === 'android') {
    return pickPlatformSdkKey(
      revenueCatLocalOverrides.androidPublicSdkKey,
      revenueCatLocalOverrides.androidTestStoreSdkKey ?? '',
    );
  }

  if (Platform.OS === 'ios') {
    return pickPlatformSdkKey(
      revenueCatLocalOverrides.iosPublicSdkKey,
      revenueCatLocalOverrides.iosTestStoreSdkKey ?? '',
    );
  }

  return null;
}

export function isRevenueCatConfiguredForPlatform(): boolean {
  return getRevenueCatPublicSdkKey() !== null;
}
