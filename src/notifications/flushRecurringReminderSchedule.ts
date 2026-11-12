import type { QueryClient } from '@tanstack/react-query';
import type { RecurringTask } from '@/api/generated/models/RecurringTask';
import type { TranslationKey } from '@/i18n/locales';
import {
  buildRecurringReminderPlan,
  type RecurringReminderTranslate,
} from '@/notifications/recurringReminderPlan';
import { syncRecurringReminderTriggers } from '@/notifications/recurringReminderScheduler';
import { recurringTasksQueryKey } from '@/recurring/recurringQueryKeys';
import { getDeviceTimezone } from '@/user/deviceTimezone';

type TranslateFn = (
  key: TranslationKey,
  params?: Record<string, string>,
) => string;

/**
 * Rebuild local reminder triggers from the recurring-tasks cache.
 * Use `force: true` under the Save loader so the modal only closes when done.
 */
export async function flushRecurringReminderSchedule(options: {
  queryClient: QueryClient;
  accessToken: string | null;
  t: TranslateFn;
  timeZone?: string;
  force?: boolean;
}): Promise<void> {
  const tasks =
    options.queryClient.getQueryData<RecurringTask[]>(
      recurringTasksQueryKey(options.accessToken),
    ) ?? [];

  const translate: RecurringReminderTranslate = (key, params) =>
    options.t(key, params);

  const plan = buildRecurringReminderPlan(
    tasks,
    options.timeZone ?? getDeviceTimezone(),
    translate,
  );

  await syncRecurringReminderTriggers(
    plan,
    options.t('recurring.reminder.channelName'),
    { force: options.force === true },
  );
}
