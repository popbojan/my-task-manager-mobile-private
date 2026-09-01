import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { authApi, authRequestInit } from '@/api/authClient';
import { useAuth } from '@/auth/AuthContext';
import { useApiEnvironment } from '@/config/ApiEnvironmentProvider';
import type { ApiEnvironment } from '@/config/api';
import { useLanguage } from '@/i18n/LanguageProvider';
import LanguagePicker from '@/pages/login/LanguagePicker';
import ProfileScreen from '@/pages/profile/ProfileScreen';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import { clearRecurringSessionQueries } from '@/recurring/recurringQueryKeys';

type TabPlaceholderScreenProps = {
  tab: 'tasks' | 'progress' | 'profile';
  onGoToday: () => void;
};

/**
 * Legacy tab shell — profile now uses the real ProfileScreen (subscription UI).
 * Kept so older App.tsx bundles still show subscription after a JS reload.
 */
export default function TabPlaceholderScreen({
  tab,
  onGoToday,
}: TabPlaceholderScreenProps) {
  if (tab === 'profile') {
    return <ProfileScreen onGoToday={onGoToday} />;
  }

  const { setAccessToken } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { environment, apiBaseUrl, setEnvironment } = useApiEnvironment();

  const titleKey = tab === 'tasks' ? 'nav.tasks' : 'nav.progress';

  async function handleLogout() {
    try {
      await authApi.logout(authRequestInit);
    } catch {
      // Session may already be invalid.
    } finally {
      clearRecurringSessionQueries(queryClient);
      setAccessToken(null);
    }
  }

  async function handleSwitchApiEnvironment(nextEnvironment: ApiEnvironment) {
    if (nextEnvironment === environment) {
      return;
    }

    try {
      await authApi.logout(authRequestInit);
    } catch {
      // Ignore — session may belong to the other backend.
    }

    clearRecurringSessionQueries(queryClient);
    await setEnvironment(nextEnvironment);
    setAccessToken(null);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t(titleKey)}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.subtitle}>{t('home.placeholder')}</Text>
        <Pressable style={styles.button} onPress={onGoToday}>
          <Text style={styles.buttonText}>{t('nav.backToToday')}</Text>
        </Pressable>
        {tab === 'progress' && __DEV__ ? (
          <View style={styles.devPanel}>
            <Text style={styles.devTitle}>{t('dev.api.title')}</Text>
            <Text style={styles.devUrl}>{apiBaseUrl}</Text>
            <Text style={styles.devHint}>
              {environment === 'local'
                ? t('dev.api.hintLocal')
                : t('dev.api.hintProduction')}
            </Text>
            <Pressable
              style={styles.devSwitchButton}
              onPress={() =>
                handleSwitchApiEnvironment(
                  environment === 'local' ? 'production' : 'local',
                )
              }
            >
              <Text style={styles.devSwitchText}>
                {environment === 'local'
                  ? t('dev.api.switchToProduction')
                  : t('dev.api.switchToLocal')}
              </Text>
            </Pressable>
          </View>
        ) : null}
        {tab === 'progress' ? (
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>{t('header.logout')}</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: recurringTheme.pageBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: recurringTheme.cardBorder,
  },
  headerTitle: {
    color: recurringTheme.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  subtitle: {
    color: recurringTheme.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: recurringTheme.accentDark,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
  },
  buttonText: {
    color: recurringTheme.accentBright,
    fontWeight: '800',
  },
  devPanel: {
    width: '100%',
    marginTop: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: recurringTheme.surfaceCard,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    gap: 8,
  },
  devTitle: {
    color: recurringTheme.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  devUrl: {
    color: recurringTheme.accentBright,
    fontSize: 11,
    fontWeight: '600',
  },
  devHint: {
    color: recurringTheme.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  devSwitchButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 168, 67, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.35)',
  },
  devSwitchText: {
    color: recurringTheme.goldBright,
    fontSize: 12,
    fontWeight: '700',
  },
  logoutButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  logoutText: {
    color: recurringTheme.textMuted,
    fontWeight: '600',
  },
});
