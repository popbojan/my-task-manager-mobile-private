import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthContext';
import { useLanguage } from '@/i18n/LanguageProvider';
import { flushRecurringReminderSchedule } from '@/notifications/flushRecurringReminderSchedule';
import { subscribeRecurringReminderReschedule } from '@/notifications/recurringReminderQueue';
import { invalidateRecurringReminderSyncFingerprint } from '@/notifications/recurringReminderScheduler';
import { useCurrentUser } from '@/user/useCurrentUser';
import { getDeviceTimezone } from '@/user/deviceTimezone';

/** Keep save/tap path free; schedule after a short quiet period. */
const DEBOUNCE_MS = 500;

/**
 * Idle scheduler: rebuilds local Notifee triggers after a quiet period.
 * Save/status paths only call requestRecurringReminderReschedule() — never await sync.
 */
export default function RecurringReminderSync() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const { t } = useLanguage();
  const currentUserQuery = useCurrentUser();
  const timeZone =
    currentUserQuery.data?.timezone?.trim() || getDeviceTimezone();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const pendingRef = useRef(false);
  const flushArgsRef = useRef({ queryClient, accessToken, t, timeZone });
  flushArgsRef.current = { queryClient, accessToken, t, timeZone };

  const scheduleSoonRef = useRef<() => void>(() => {});

  const runFlush = useCallback(async () => {
    if (runningRef.current) {
      pendingRef.current = true;
      return;
    }

    runningRef.current = true;
    try {
      await flushRecurringReminderSchedule(flushArgsRef.current);
    } catch {
      // Native/permission failures must not affect UI.
    } finally {
      runningRef.current = false;
      if (pendingRef.current) {
        pendingRef.current = false;
        scheduleSoonRef.current();
      }
    }
  }, []);

  const scheduleSoon = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      // Yield one frame so modal close / list paint finish first.
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        void runFlush();
      });
    }, DEBOUNCE_MS);
  }, [runFlush]);

  scheduleSoonRef.current = scheduleSoon;

  useEffect(() => {
    scheduleSoon();
  }, [scheduleSoon, accessToken, timeZone]);

  useEffect(() => {
    return subscribeRecurringReminderReschedule(() => {
      scheduleSoon();
    });
  }, [scheduleSoon]);

  useEffect(() => {
    const onAppState = (next: AppStateStatus) => {
      if (next === 'active') {
        // Permission may have changed in system settings while backgrounded.
        invalidateRecurringReminderSyncFingerprint();
        scheduleSoon();
      }
    };
    const sub = AppState.addEventListener('change', onAppState);
    return () => sub.remove();
  }, [scheduleSoon]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return null;
}
