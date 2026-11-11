import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthContext';
import { useLanguage } from '@/i18n/LanguageProvider';
import { flushRecurringReminderSchedule } from '@/notifications/flushRecurringReminderSchedule';
import {
  isRecurringReminderSyncSuspended,
  subscribeRecurringReminderReschedule,
} from '@/notifications/recurringReminderQueue';
import {
  hasRecurringReminderPermission,
  invalidateRecurringReminderSyncFingerprint,
} from '@/notifications/recurringReminderScheduler';
import { useCurrentUser } from '@/user/useCurrentUser';
import { getDeviceTimezone } from '@/user/deviceTimezone';

/**
 * Notifee AlarmManager sync can freeze the Android UI for many seconds.
 * Never run it right after save/modal close — only when backgrounded, or after
 * a long idle while the form is closed.
 */
const FOREGROUND_IDLE_SYNC_MS = 12_000;

/**
 * Marks reminder plan dirty on save/status changes; flushes native triggers
 * only when it is safe for the UI thread.
 */
export default function RecurringReminderSync() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const { t } = useLanguage();
  const currentUserQuery = useCurrentUser();
  const timeZone =
    currentUserQuery.data?.timezone?.trim() || getDeviceTimezone();

  const dirtyRef = useRef(true);
  const runningRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flushArgsRef = useRef({ queryClient, accessToken, t, timeZone });
  flushArgsRef.current = { queryClient, accessToken, t, timeZone };

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const runFlush = useCallback(async () => {
    if (isRecurringReminderSyncSuspended()) {
      return;
    }
    if (runningRef.current) {
      return;
    }
    if (!dirtyRef.current) {
      return;
    }

    runningRef.current = true;
    clearIdleTimer();
    try {
      await flushRecurringReminderSchedule(flushArgsRef.current);
      dirtyRef.current = false;
    } catch {
      // Keep dirty so a later background/idle pass can retry.
      dirtyRef.current = true;
    } finally {
      runningRef.current = false;
    }
  }, [clearIdleTimer]);

  const armIdleSync = useCallback(() => {
    clearIdleTimer();
    if (isRecurringReminderSyncSuspended()) {
      return;
    }
    if (!dirtyRef.current) {
      return;
    }
    if (AppState.currentState !== 'active') {
      return;
    }

    idleTimerRef.current = setTimeout(() => {
      idleTimerRef.current = null;
      void runFlush();
    }, FOREGROUND_IDLE_SYNC_MS);
  }, [clearIdleTimer, runFlush]);

  const markDirty = useCallback(() => {
    dirtyRef.current = true;
    // Never flush immediately — that blocked modal reopen for 6–10s.
    armIdleSync();
  }, [armIdleSync]);

  useEffect(() => {
    return subscribeRecurringReminderReschedule(() => {
      markDirty();
    });
  }, [markDirty]);

  useEffect(() => {
    // Session/timezone change: plan may differ; wait for idle/background.
    markDirty();
  }, [markDirty, accessToken, timeZone]);

  useEffect(() => {
    const onAppState = (next: AppStateStatus) => {
      if (next === 'active') {
        // Soft permission refresh only — no native trigger rewrite on foreground.
        void hasRecurringReminderPermission().catch(() => undefined);
        armIdleSync();
        return;
      }

      if (next === 'background' || next === 'inactive') {
        clearIdleTimer();
        if (isRecurringReminderSyncSuspended()) {
          return;
        }
        invalidateRecurringReminderSyncFingerprint();
        dirtyRef.current = true;
        void runFlush();
      }
    };
    const sub = AppState.addEventListener('change', onAppState);
    return () => sub.remove();
  }, [armIdleSync, clearIdleTimer, runFlush]);

  useEffect(() => {
    return () => clearIdleTimer();
  }, [clearIdleTimer]);

  return null;
}
