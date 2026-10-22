import { getAnalytics, logEvent, logScreenView } from '@react-native-firebase/analytics';
import { getCrashlytics } from '@react-native-firebase/crashlytics';
import { Platform } from 'react-native';

let monitoringConfigured = false;

const SCREEN_TITLES: Record<string, string> = {
  login: 'Login',
  tab_today: 'Heute',
  tab_history: 'Geschichte',
  tab_progress: 'Fortschritt',
  tab_tasks: 'Aufgaben',
  tab_profile: 'Profil',
};

function resolveScreenTitle(screenKey: string): string {
  return SCREEN_TITLES[screenKey] ?? screenKey;
}

export async function configureAppMonitoringCollection(): Promise<void> {
  if (monitoringConfigured) {
    return;
  }

  try {
    const analytics = getAnalytics();
    const crashlytics = getCrashlytics();

    await analytics.setAnalyticsCollectionEnabled(true);
    await crashlytics.setCrashlyticsCollectionEnabled(!__DEV__);

    if (!__DEV__) {
      await crashlytics.setAttribute('platform', Platform.OS);
      await analytics.setUserProperty('platform', Platform.OS);
    }

    monitoringConfigured = true;
  } catch (error) {
    if (__DEV__) {
      console.warn('[monitoring] configureAppMonitoringCollection failed', error);
    }
  }
}

export function installJavaScriptCrashHandler(): void {
  const errorUtils = (global as typeof globalThis & {
    ErrorUtils?: {
      getGlobalHandler: () => (error: Error, isFatal?: boolean) => void;
      setGlobalHandler: (handler: (error: Error, isFatal?: boolean) => void) => void;
    };
  }).ErrorUtils;

  if (!errorUtils) {
    return;
  }

  const defaultHandler = errorUtils.getGlobalHandler();

  errorUtils.setGlobalHandler((error, isFatal) => {
    if (!__DEV__) {
      try {
        const crashlytics = getCrashlytics();
        void crashlytics.recordError(error);
        void crashlytics.log(
          isFatal ? 'Fatal JavaScript error' : 'Non-fatal JavaScript error',
        );
      } catch {
        // ignore
      }
    }

    defaultHandler(error, isFatal);
  });
}

export async function setMonitoringUserId(userId: string | null): Promise<void> {
  if (__DEV__) {
    return;
  }

  try {
    const analytics = getAnalytics();
    const crashlytics = getCrashlytics();
    await analytics.setUserId(userId);
    await crashlytics.setUserId(userId ?? '');
  } catch {
    // ignore
  }
}

export async function logMonitoringScreen(screenKey: string): Promise<void> {
  await configureAppMonitoringCollection();

  const screenTitle = resolveScreenTitle(screenKey);
  const tabId = screenKey.startsWith('tab_') ? screenKey.slice(4) : screenKey;

  try {
    const analytics = getAnalytics();

    await logScreenView(analytics, {
      screen_name: screenTitle,
      screen_class: screenKey,
    });

    await logEvent(analytics, 'tab_view', {
      tab: tabId,
    });

    if (__DEV__) {
      console.info('[monitoring] sent tab_view', tabId);
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[monitoring] logMonitoringScreen failed', screenKey, error);
    }
  }
}

export async function logMonitoringEvent(
  name: string,
  params?: Record<string, string | number>,
): Promise<void> {
  try {
    await getAnalytics().logEvent(name, params);
  } catch (error) {
    if (__DEV__) {
      console.warn('[monitoring] logMonitoringEvent failed', name, error);
    }
  }
}

export async function setMonitoringUserProperty(
  name: string,
  value: string | null,
): Promise<void> {
  if (__DEV__) {
    return;
  }

  try {
    await getAnalytics().setUserProperty(name, value);
  } catch {
    // ignore
  }
}
