import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthContext';
import { useLanguage } from '@/i18n/LanguageProvider';
import { flushDailyOpenTasksReminderSchedule } from '@/notifications/flushDailyOpenTasksReminderSchedule';
import { flushRecurringReminderSchedule } from '@/notifications/flushRecurringReminderSchedule';
import {
  isRecurringReminderSyncSuspended,
  subscribeRecurringReminderReschedule,
} from '@/notifications/recurringReminderQueue';
import { useSubscriptionAccess } from '@/subscription/useSubscriptionAccess';
import { useCurrentUser } from '@/user/useCurrentUser';
import { getDeviceTimezone } from '@/user/deviceTimezone';

/**
 * Form Save already force-flushes under the button loader.
 * This component only catches board/status/reset dirties when the app backgrounds,
 * so the foreground UI stays free after the modal closes.
 */
export default function RecurringReminderSync() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const { t } = useLanguage();
  const currentUserQuery = useCurrentUser();
  const subscriptionQuery = useSubscriptionAccess();
  const hasPremiumAccess = subscriptionQuery.data?.hasPremiumAccess ?? false;
  const timeZone =
    currentUserQuery.data?.timezone?.trim() || getDeviceTimezone();

  const dirtyRef = useRef(false);
  const runningRef = useRef(false);
  const flushArgsRef = useRef({
    queryClient,
    accessToken,
    t,
    timeZone,
    hasPremiumAccess,
  });
  flushArgsRef.current = {
    queryClient,
    accessToken,
    t,
    timeZone,
    hasPremiumAccess,
  };

  const runFlush = useCallback(async () => {
    if (isRecurringReminderSyncSuspended()) {
      return;
    }
    if (runningRef.current || !dirtyRef.current) {
      return;
    }

    runningRef.current = true;
    try {
      const args = flushArgsRef.current;
      await flushRecurringReminderSchedule(args);
      await flushDailyOpenTasksReminderSchedule({
        t: args.t,
        timeZone: args.timeZone,
        hasPremiumAccess: args.hasPremiumAccess,
      });
      dirtyRef.current = false;
    } catch {
      dirtyRef.current = true;
    } finally {
      runningRef.current = false;
    }
  }, []);

  useEffect(() => {
    return subscribeRecurringReminderReschedule(() => {
      dirtyRef.current = true;
    });
  }, []);

  useEffect(() => {
    dirtyRef.current = true;
  }, [accessToken, timeZone, hasPremiumAccess]);

  useEffect(() => {
    const onAppState = (next: AppStateStatus) => {
      // Never flush on resume — AlarmManager sync can freeze the JS bridge.
      // Only catch dirties when the app actually leaves (background).
      if (next === 'active') {
        return;
      }

      if (next === 'background') {
        if (isRecurringReminderSyncSuspended()) {
          return;
        }
        void runFlush();
      }
    };
    const sub = AppState.addEventListener('change', onAppState);
    return () => sub.remove();
  }, [runFlush]);

  return null;
}
