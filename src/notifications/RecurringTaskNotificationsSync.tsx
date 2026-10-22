import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/api/authClient';
import { useAuth } from '@/auth/AuthContext';
import { useLanguage } from '@/i18n/LanguageProvider';
import {
  cancelAllRecurringTaskNotifications,
  syncRecurringTaskNotifications,
} from '@/notifications/recurringTaskNotifications';
import { recurringTasksQueryKey } from '@/recurring/recurringQueryKeys';
import {
  isApiPremiumRequiredError,
  shouldRetryApiQuery,
} from '@/utils/apiError';
import { isPremiumPreviewTask } from '@/utils/recurringPremiumPreview';

export default function RecurringTaskNotificationsSync() {
  const { accessToken } = useAuth();
  const { t } = useLanguage();

  const tasksQuery = useQuery({
    queryKey: recurringTasksQueryKey(accessToken),
    queryFn: () => authApi.getRecurringTasks(),
    enabled: !!accessToken,
    retry: shouldRetryApiQuery,
  });

  const syncFromQuery = () => {
    if (!accessToken || !tasksQuery.data) {
      return;
    }

    if (tasksQuery.isError && isApiPremiumRequiredError(tasksQuery.error)) {
      return;
    }

    const tasks = tasksQuery.data.filter(task => !isPremiumPreviewTask(task.id));

    void syncRecurringTaskNotifications(tasks, {
      channelName: t('recurring.notification.channelName'),
      channelDescription: t('recurring.notification.channelDescription'),
      body: taskTitle =>
        t('recurring.notification.body', { title: taskTitle }),
    });
  };

  useEffect(() => {
    if (!accessToken) {
      void cancelAllRecurringTaskNotifications();
      return;
    }

    syncFromQuery();
  }, [accessToken, tasksQuery.data, tasksQuery.isError, tasksQuery.error, t]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        syncFromQuery();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);
    return () => subscription.remove();
  }, [accessToken, tasksQuery.data, tasksQuery.isError, tasksQuery.error, t]);

  return null;
}
