import { useEffect } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { useLanguage } from '@/i18n/LanguageProvider';
import {
  configureAppMonitoringCollection,
  setMonitoringUserId,
  setMonitoringUserProperty,
} from '@/monitoring/appMonitoring';
import { useCurrentUser } from '@/user/useCurrentUser';

export default function AppMonitoringBootstrap() {
  const { accessToken } = useAuth();
  const { language } = useLanguage();
  const currentUserQuery = useCurrentUser();

  useEffect(() => {
    void configureAppMonitoringCollection();
  }, []);

  useEffect(() => {
    void setMonitoringUserProperty('app_language', language);
  }, [language]);

  useEffect(() => {
    if (!accessToken) {
      void setMonitoringUserId(null);
      return;
    }

    const userId = currentUserQuery.data?.id ?? null;
    if (userId) {
      void setMonitoringUserId(userId);
    }
  }, [accessToken, currentUserQuery.data?.id]);

  return null;
}
