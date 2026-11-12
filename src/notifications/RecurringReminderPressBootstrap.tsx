import { useEffect } from 'react';
import { loadNotifeePackage } from '@/notifications/notifeeBridge';
import {
  isRecurringReminderNotification,
  requestOpenTodayFromReminder,
} from '@/notifications/recurringReminderNavigation';

/**
 * Routes notification taps to the Heute tab (foreground + cold start).
 * Background registration lives in index.js (required by Notifee).
 */
export default function RecurringReminderPressBootstrap() {
  useEffect(() => {
    const notifeePkg = loadNotifeePackage();
    if (!notifeePkg) {
      return;
    }

    const { default: notifee, EventType } = notifeePkg;

    void notifee.getInitialNotification().then(initial => {
      if (isRecurringReminderNotification(initial?.notification)) {
        requestOpenTodayFromReminder();
      }
    });

    return notifee.onForegroundEvent(({ type, detail }) => {
      if (
        type === EventType.PRESS &&
        isRecurringReminderNotification(detail.notification)
      ) {
        requestOpenTodayFromReminder();
      }
    });
  }, []);

  return null;
}
