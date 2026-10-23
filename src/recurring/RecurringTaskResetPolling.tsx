import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/authClient';
import { useAuth } from '@/auth/AuthContext';
import { getApiBaseUrl } from '@/config/api';
import {
  buildResetPollSchedule,
  hasNextResetAdvanced,
  hasTodaysResetRecorded,
  isInResetPollWindow,
  minNextResetAtMs,
  msUntilNextResetPollCycle,
  readLocalTimeParts,
  resolveRecurringResetTimezone,
} from '@/recurring/recurringResetPollingUtils';
import {
  recurringTaskProgressQueryKey,
  recurringTasksQueryKey,
} from '@/recurring/recurringQueryKeys';
import { isApiPremiumRequiredError } from '@/utils/apiError';
import { isPremiumPreviewTask } from '@/utils/recurringPremiumPreview';
import { useCurrentUser } from '@/user/useCurrentUser';
import { useSubscriptionAccess } from '@/subscription/useSubscriptionAccess';

export default function RecurringTaskResetPolling() {
  const { accessToken } = useAuth();
  const currentUserQuery = useCurrentUser();
  const subscriptionQuery = useSubscriptionAccess();
  const queryClient = useQueryClient();
  const hasPremiumAccess = subscriptionQuery.data?.hasPremiumAccess ?? false;
  const subscriptionReady =
    !subscriptionQuery.isLoading && subscriptionQuery.isFetched;
  const baselineNextResetMsRef = useRef<number | null>(null);
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const sessionGenerationRef = useRef(0);
  const windowCycleFinishedRef = useRef(false);

  useEffect(() => {
    if (!accessToken || !subscriptionReady || !hasPremiumAccess) {
      return;
    }

    const timeZone = resolveRecurringResetTimezone(currentUserQuery.data?.timezone);
    let cancelled = false;
    const sessionGeneration = ++sessionGenerationRef.current;

    function clearScheduledPolls() {
      for (const timeoutId of timeoutIdsRef.current) {
        clearTimeout(timeoutId);
      }
      timeoutIdsRef.current = [];
    }

    function scheduleTimeout(delayMs: number, run: () => void) {
      const timeoutId = setTimeout(() => {
        if (cancelled || sessionGenerationRef.current !== sessionGeneration) {
          return;
        }

        run();
      }, delayMs);

      timeoutIdsRef.current.push(timeoutId);
    }

    async function refetchRecurringTasksAfterReset() {
      await queryClient.invalidateQueries({
        queryKey: recurringTaskProgressQueryKey(accessToken),
      });
      await queryClient.invalidateQueries({ queryKey: ['history'] });
    }

    async function pollOnce(): Promise<boolean> {
      if (cancelled || sessionGenerationRef.current !== sessionGeneration) {
        return true;
      }

      try {
        if (__DEV__) {
          console.info(`[reset-poll] GET ${getApiBaseUrl()}/recurring-tasks`);
        }

        const tasks = await authApi.getRecurringTasks();
        queryClient.setQueryData(recurringTasksQueryKey(accessToken), tasks);

        const realTasks = tasks.filter(task => !isPremiumPreviewTask(task.id));

        if (realTasks.length === 0) {
          return true;
        }

        if (baselineNextResetMsRef.current === null) {
          baselineNextResetMsRef.current = minNextResetAtMs(tasks);
        }

        if (baselineNextResetMsRef.current === null) {
          return true;
        }

        if (
          hasNextResetAdvanced(baselineNextResetMsRef.current, tasks) ||
          hasTodaysResetRecorded(tasks, timeZone)
        ) {
          await refetchRecurringTasksAfterReset();
          return true;
        }
      } catch (error) {
        if (isApiPremiumRequiredError(error)) {
          return true;
        }
        // Keep polling within the window; the next minute may succeed.
      }

      return false;
    }

    function finishPollWindowCycle(from = new Date()) {
      clearScheduledPolls();
      baselineNextResetMsRef.current = null;
      windowCycleFinishedRef.current = true;

      const waitMs = msUntilNextResetPollCycle(timeZone, from);
      scheduleTimeout(waitMs, () => {
        windowCycleFinishedRef.current = false;
        planNextWindow(new Date());
      });
    }

    function armPollDelays(delaysMs: number[]) {
      windowCycleFinishedRef.current = false;
      baselineNextResetMsRef.current = null;

      const cachedTasks = queryClient.getQueryData<Awaited<ReturnType<typeof authApi.getRecurringTasks>>>(
        recurringTasksQueryKey(accessToken),
      );
      if (cachedTasks?.length) {
        baselineNextResetMsRef.current = minNextResetAtMs(cachedTasks);
      }

      delaysMs.forEach((delayMs, index) => {
        scheduleTimeout(delayMs, () => {
          void (async () => {
            const done = await pollOnce();
            if (done) {
              finishPollWindowCycle();
              return;
            }

            if (index === delaysMs.length - 1) {
              finishPollWindowCycle();
            }
          })();
        });
      });
    }

    function planNextWindow(from = new Date()) {
      if (cancelled || sessionGenerationRef.current !== sessionGeneration) {
        return;
      }

      clearScheduledPolls();
      baselineNextResetMsRef.current = null;

      const plan = buildResetPollSchedule(timeZone, from);

      if (plan.mode === 'active') {
        armPollDelays(plan.delaysMs);
        return;
      }

      scheduleTimeout(plan.waitMs, () => {
        armPollDelays(plan.delaysMs);
      });
    }

    function resumeIfInWindow() {
      if (windowCycleFinishedRef.current) {
        return;
      }

      const parts = readLocalTimeParts(new Date(), timeZone);
      if (!isInResetPollWindow(parts)) {
        return;
      }

      if (timeoutIdsRef.current.length > 0) {
        return;
      }

      planNextWindow();
    }

    planNextWindow();

    const appStateSubscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active') {
          resumeIfInWindow();
        }
      },
    );

    return () => {
      cancelled = true;
      clearScheduledPolls();
      appStateSubscription.remove();
    };
  }, [
    accessToken,
    currentUserQuery.data?.timezone,
    hasPremiumAccess,
    queryClient,
    subscriptionReady,
  ]);

  return null;
}
