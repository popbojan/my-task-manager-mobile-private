import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '@/api/authClient';
import { useAuth } from '@/auth/AuthContext';
import { useLanguage } from '@/i18n/LanguageProvider';
import LanguagePicker from '@/pages/login/LanguagePicker';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type TabPlaceholderScreenProps = {
  tab: 'tasks' | 'progress' | 'profile';
  onGoToday: () => void;
};

export default function TabPlaceholderScreen({
  tab,
  onGoToday,
}: TabPlaceholderScreenProps) {
  const { setAccessToken } = useAuth();
  const { t } = useLanguage();

  const titleKey =
    tab === 'tasks'
      ? 'nav.tasks'
      : tab === 'progress'
        ? 'nav.progress'
        : 'nav.profile';

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // Session may already be invalid.
    } finally {
      setAccessToken(null);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t(titleKey)}</Text>
        {tab === 'profile' ? <LanguagePicker /> : null}
      </View>
      <View style={styles.content}>
        <Text style={styles.subtitle}>{t('home.placeholder')}</Text>
        <Pressable style={styles.button} onPress={onGoToday}>
          <Text style={styles.buttonText}>{t('nav.backToToday')}</Text>
        </Pressable>
        {tab === 'profile' ? (
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
