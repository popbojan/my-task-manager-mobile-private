import { Alert } from 'react-native';
import type { QueryClient } from '@tanstack/react-query';
import type { TranslationKey } from '@/i18n/locales';
import { invalidateRecurringQueries } from '@/recurring/recurringQueryKeys';
import { isApiDailyResetRequiredError } from '@/utils/apiError';

export { isApiDailyResetRequiredError };

/** Reload Heute + Mein Weg after a rejected mutation (GET runs the pending reset). */
export function reloadAfterDailyResetRequired(
  queryClient: QueryClient,
): void {
  invalidateRecurringQueries(queryClient);
}

type Translate = (
  key: TranslationKey,
  params?: Record<string, string>,
) => string;

/**
 * Tell the user the change was not saved because the day rolled over,
 * reload board/history, then optionally run a follow-up (e.g. close modal).
 */
export async function handleDailyResetRequired(options: {
  error: unknown;
  queryClient: QueryClient;
  t: Translate;
  onAfterReload?: () => void;
}): Promise<boolean> {
  const { error, queryClient, t, onAfterReload } = options;
  if (!(await isApiDailyResetRequiredError(error))) {
    return false;
  }

  reloadAfterDailyResetRequired(queryClient);

  Alert.alert(
    t('recurring.dailyResetRequired.title'),
    t('recurring.dailyResetRequired.body'),
    [
      {
        text: t('recurring.dailyResetRequired.action'),
        onPress: () => {
          onAfterReload?.();
        },
      },
    ],
  );

  return true;
}
