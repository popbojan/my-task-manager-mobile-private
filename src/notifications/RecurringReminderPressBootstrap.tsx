import { useEffect } from 'react';
import { loadNotifeePackage } from '@/notifications/notifeeBridge';
import {
  isRecurringReminderNotification,
  requestOpenTodayFromReminder,
} from '@/notifications/recurringReminderNavigation';

/**
 * Routes notification taps to the Heute tab (foreground + cold start).
 * Background presses are handled in index.js via onBackgroundEvent.
 */
export default function RecurringReminderPressBootstrap() {
  useEffect(() => {
    const notifeePkg = loadNotifeePackage();
    if (!notifeePkg) {
      return;
    }

    const { default: notifee, EventType } = notifeePkg;

    function openTodayIfReminder(notification: {
      id?: string;
      data?: Record<string, unknown> | null;
    } | null | undefined) {
      if (isRecurringReminderNotification(notification)) {
        requestOpenTodayFromReminder();
      }
    }

    void notifee.getInitialNotification().then(initial => {
      openTodayIfReminder(initial?.notification);
    });

    return notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        openTodayIfReminder(detail.notification);
      }
    });
  }, []);

  return null;
}
