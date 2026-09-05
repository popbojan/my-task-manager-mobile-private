import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useApiEnvironment } from '@/config/ApiEnvironmentProvider';
import DevApiPanel from '@/config/DevApiPanel';
import { useAuth } from '@/auth/AuthContext';
import { useLanguage } from '@/i18n/LanguageProvider';
import LanguagePicker from '@/pages/login/LanguagePicker';
import SubscriptionSettingsScreen from '@/pages/profile/SubscriptionSettingsScreen';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import { clearUserSession } from '@/session/clearUserSession';
import { useAppRefresh } from '@/refresh/useAppRefresh';
import { useRefreshControl } from '@/refresh/useRefreshControl';
import { useCurrentUser } from '@/user/useCurrentUser';

type ProfileScreenProps = {
  onGoToday: () => void;
  openSubscription?: boolean;
  onSubscriptionOpened?: () => void;
};

export default function ProfileScreen({
  onGoToday,
  openSubscription = false,
  onSubscriptionOpened,
}: ProfileScreenProps) {
  const { setAccessToken } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { environment } = useApiEnvironment();
  const { refreshing, onRefresh } = useAppRefresh();
  const refreshControl = useRefreshControl({ refreshing, onRefresh });
  const currentUserQuery = useCurrentUser();
  const [showSubscriptionSettings, setShowSubscriptionSettings] = useState(false);

  useEffect(() => {
    if (!openSubscription) {
      return;
    }

    setShowSubscriptionSettings(true);
    onSubscriptionOpened?.();
  }, [openSubscription, onSubscriptionOpened]);

  async function handleLogout() {
    await clearUserSession({ queryClient, setAccessToken });
  }

  if (showSubscriptionSettings) {
    return (
      <SubscriptionSettingsScreen
        onBack={() => setShowSubscriptionSettings(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('nav.profile')}</Text>
        <LanguagePicker />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
      >
        <View style={styles.userCard}>
          <Text style={styles.userLabel}>{t('profile.signedInAs')}</Text>
          {currentUserQuery.isLoading ? (
            <ActivityIndicator color={recurringTheme.accent} />
          ) : (
            <Text style={styles.userEmail}>
              {currentUserQuery.data?.email ?? t('profile.emailUnavailable')}
            </Text>
          )}
        </View>

        <View style={styles.accountMenu}>
          <Text style={styles.accountMenuHeading}>{t('profile.accountMenu.title')}</Text>

          <Pressable
            style={styles.accountMenuItem}
            accessibilityRole="button"
            onPress={() => setShowSubscriptionSettings(true)}
          >
            <View style={styles.accountMenuItemCopy}>
              <Text style={styles.accountMenuItemLabel}>
                {t('profile.accountMenu.subscription')}
              </Text>
              <Text style={styles.accountMenuItemHint}>
                {t('profile.accountMenu.subscriptionHint')}
              </Text>
            </View>
            <Text style={styles.accountMenuChevron}>›</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.logoutCard}
          accessibilityRole="button"
          onPress={handleLogout}
        >
          <Text style={styles.userLabel}>{t('profile.session.title')}</Text>
          <View style={styles.logoutRow}>
            <View style={styles.logoutCopy}>
              <Text style={styles.logoutLabel}>{t('header.logout')}</Text>
              <Text style={styles.logoutHint}>{t('profile.logout.hint')}</Text>
            </View>
            <Text style={styles.logoutChevron}>›</Text>
          </View>
        </Pressable>

        {__DEV__ ? (
          <DevApiPanel
            onEnvironmentSwitch={async nextEnvironment => {
              if (nextEnvironment !== environment) {
                await clearUserSession({
                  queryClient,
                  setAccessToken,
                  callBackendLogout: true,
                });
              }
            }}
          />
        ) : null}

        <Pressable style={styles.linkButton} onPress={onGoToday}>
          <Text style={styles.linkButtonText}>{t('nav.backToToday')}</Text>
        </Pressable>
      </ScrollView>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  userCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: recurringTheme.surfaceCard,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    marginBottom: 16,
  },
  userLabel: {
    color: recurringTheme.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  userEmail: {
    color: recurringTheme.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  accountMenu: {
    borderRadius: 14,
    backgroundColor: recurringTheme.surfaceCard,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    overflow: 'hidden',
    marginBottom: 16,
  },
  accountMenuHeading: {
    color: recurringTheme.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  accountMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: recurringTheme.cardBorder,
  },
  accountMenuItemCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  accountMenuItemLabel: {
    color: recurringTheme.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  accountMenuItemHint: {
    color: recurringTheme.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  accountMenuChevron: {
    color: recurringTheme.textMuted,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 22,
  },
  logoutCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: recurringTheme.surfaceCard,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    marginBottom: 16,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 2,
  },
  logoutCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  logoutLabel: {
    color: recurringTheme.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  logoutHint: {
    color: recurringTheme.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  logoutChevron: {
    color: recurringTheme.textMuted,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 22,
  },
  linkButton: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  linkButtonText: {
    color: recurringTheme.accentBright,
    fontWeight: '700',
  },
});
