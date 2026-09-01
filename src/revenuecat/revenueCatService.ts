import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesOfferings,
  type PurchasesPackage,
} from 'react-native-purchases';
import {
  getRevenueCatPublicSdkKey,
  isRevenueCatConfiguredForPlatform,
} from '@/config/revenueCat';

let configurePromise: Promise<void> | null = null;
let configuredApiKey: string | null = null;
let logHandlerInstalled = false;

function logRevenueCatWarning(message: string, error?: unknown) {
  if (__DEV__) {
    console.warn(`[RevenueCat] ${message}`, error);
  }
}

/** Route SDK errors through warn in dev so LogBox does not cover the whole app. */
function installRevenueCatLogHandler(): void {
  if (logHandlerInstalled) {
    return;
  }

  logHandlerInstalled = true;

  Purchases.setLogHandler((level, message) => {
    const formatted = `[RevenueCat] ${message}`;

    switch (level) {
      case LOG_LEVEL.DEBUG:
        console.debug(formatted);
        break;
      case LOG_LEVEL.INFO:
        console.info(formatted);
        break;
      case LOG_LEVEL.WARN:
      case LOG_LEVEL.ERROR:
        console.warn(formatted);
        break;
      default:
        console.log(formatted);
    }
  });
}

export async function configureRevenueCatOnce(): Promise<void> {
  if (configurePromise) {
    return configurePromise;
  }

  configurePromise = (async () => {
    installRevenueCatLogHandler();

    const apiKey = getRevenueCatPublicSdkKey();
    if (!apiKey) {
      logRevenueCatWarning(
        `No public SDK key configured for ${Platform.OS}. Purchases are disabled.`,
      );
      return;
    }

    if (configuredApiKey === apiKey) {
      return;
    }

    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.WARN : LOG_LEVEL.ERROR);
    await Purchases.configure({ apiKey });
    configuredApiKey = apiKey;
  })().catch(error => {
    configurePromise = null;
    logRevenueCatWarning('Configure failed', error);
    throw error;
  });

  return configurePromise;
}

export function isRevenueCatReady(): boolean {
  return isRevenueCatConfiguredForPlatform() && configuredApiKey !== null;
}

export async function logInRevenueCat(userId: string): Promise<void> {
  const linked = await ensureRevenueCatLinkedToUser(userId);
  if (!linked) {
    throw new Error('RevenueCat logIn did not link the expected backend user id.');
  }
}

/**
 * Links RevenueCat to backend user.id and verifies appUserID matches.
 * Must run after GET /users/me — never purchase with a stale/anonymous RC identity.
 */
export async function ensureRevenueCatLinkedToUser(userId: string): Promise<boolean> {
  const trimmedUserId = userId.trim();
  if (!trimmedUserId) {
    return false;
  }

  await configureRevenueCatOnce();

  if (!isRevenueCatReady()) {
    return false;
  }

  try {
    const currentAppUserId = await Purchases.getAppUserID();
    if (currentAppUserId === trimmedUserId) {
      return true;
    }

    await Purchases.logIn(trimmedUserId);
    const linkedAppUserId = await Purchases.getAppUserID();

    if (__DEV__) {
      console.log('[RevenueCat] logIn user.id:', trimmedUserId, 'appUserID:', linkedAppUserId);
    }

    return linkedAppUserId === trimmedUserId;
  } catch (error) {
    logRevenueCatWarning('ensureRevenueCatLinkedToUser failed', error);
    return false;
  }
}

export async function getRevenueCatAppUserId(): Promise<string | null> {
  await configureRevenueCatOnce();

  if (!isRevenueCatReady()) {
    return null;
  }

  try {
    return await Purchases.getAppUserID();
  } catch (error) {
    logRevenueCatWarning('getAppUserID failed', error);
    return null;
  }
}

export async function logOutRevenueCat(): Promise<void> {
  if (!isRevenueCatReady()) {
    return;
  }

  try {
    await Purchases.logOut();
  } catch (error) {
    logRevenueCatWarning('logOut failed', error);
  }
}

export async function getRevenueCatOfferings(): Promise<PurchasesOfferings> {
  await configureRevenueCatOnce();

  if (!isRevenueCatReady()) {
    throw new Error('RevenueCat is not configured for this platform.');
  }

  return Purchases.getOfferings();
}

export async function purchaseRevenueCatPackage(
  revenueCatPackage: PurchasesPackage,
): Promise<CustomerInfo> {
  await configureRevenueCatOnce();

  if (!isRevenueCatReady()) {
    throw new Error('RevenueCat is not configured for this platform.');
  }

  const result = await Purchases.purchasePackage(revenueCatPackage);
  return result.customerInfo;
}

export async function restoreRevenueCatPurchases(): Promise<CustomerInfo> {
  await configureRevenueCatOnce();

  if (!isRevenueCatReady()) {
    throw new Error('RevenueCat is not configured for this platform.');
  }

  return Purchases.restorePurchases();
}

export async function showRevenueCatManageSubscriptions(): Promise<void> {
  await configureRevenueCatOnce();

  if (!isRevenueCatReady()) {
    throw new Error('RevenueCat is not configured for this platform.');
  }

  await Purchases.showManageSubscriptions();
}

/** Test-only reset — do not use in production code paths. */
export function resetRevenueCatServiceForTests(): void {
  configurePromise = null;
  configuredApiKey = null;
  logHandlerInstalled = false;
}
