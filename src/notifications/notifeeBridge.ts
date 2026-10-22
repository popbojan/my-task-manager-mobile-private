import { NativeModules } from 'react-native';

type NotifeePackage = typeof import('@notifee/react-native');

let cachedModule: NotifeePackage | null | undefined;

export function isNotifeeNativeLinked(): boolean {
  return NativeModules.Notifee != null;
}

export function loadNotifeePackage(): NotifeePackage | null {
  if (!isNotifeeNativeLinked()) {
    return null;
  }

  if (cachedModule !== undefined) {
    return cachedModule;
  }

  try {
    // Load only after the native module is present (requires a native rebuild).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedModule = require('@notifee/react-native') as NotifeePackage;
    return cachedModule;
  } catch {
    cachedModule = null;
    return null;
  }
}

export function warnNotifeeUnavailable(action: string): void {
  if (__DEV__) {
    console.warn(
      `[notifications] ${action} skipped — Notifee native module missing. Rebuild with npm run android.`,
    );
  }
}
