/**
 * @format
 */

import '@react-native-firebase/app';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { installJavaScriptCrashHandler } from './src/monitoring/appMonitoring';

installJavaScriptCrashHandler();

// Notifee requires a background event handler at startup (notification taps).
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const notifeePkg = require('@notifee/react-native');
  notifeePkg.default.onBackgroundEvent(async ({ type, detail }) => {
    if (type !== notifeePkg.EventType.PRESS) {
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const nav = require('./src/notifications/recurringReminderNavigation');
      if (nav.isRecurringReminderNotification(detail?.notification)) {
        nav.requestOpenTodayFromReminder();
      }
    } catch {
      // Navigation module unavailable in some test environments.
    }
  });
} catch {
  // Native module missing in some test environments.
}

AppRegistry.registerComponent(appName, () => App);
