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
import { clearAccountDeletedNotice } from '@/pages/login/accountDeletedNotice';
import LanguagePicker from '@/pages/login/LanguagePicker';
import DeleteAccountModal from '@/pages/profile/DeleteAccountModal';
import SubscriptionSettingsScreen from '@/pages/profile/SubscriptionSettingsScreen';
import { useDeleteAccountFlow } from '@/pages/profile/useDeleteAccountFlow';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import { clearUserSession } from '@/session/clearUserSession';
import { useAppRefresh } from '@/refresh/useAppRefresh';
import { useRefreshControl } from '@/refresh/useRefreshControl';
import LegalWebViewModal from '@/legal/LegalWebViewModal';
import type { LegalPage } from '@/legal/openLegalPage';
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
  const [legalPage, setLegalPage] = useState<LegalPage | null>(null);
  const deleteAccountFlow = useDeleteAccountFlow({ queryClient, setAccessToken });

  useEffect(() => {
    if (!openSubscription) {
      return;
    }

    setShowSubscriptionSettings(true);
    onSubscriptionOpened?.();
  }, [openSubscription, onSubscriptionOpened]);

  async function handleLogout() {
    await clearAccountDeletedNotice();
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
          <Text style={styles.accountMenuHeading}>{t('header.accountMenu.open')}</Text>

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

        <View style={styles.accountMenu}>
          <Text style={styles.accountMenuHeading}>{t('profile.legalMenu.title')}</Text>

          <Pressable
            style={styles.accountMenuItem}
            accessibilityRole="link"
            onPress={() => setLegalPage('privacy')}
          >
            <Text style={styles.accountMenuItemLabel}>
              {t('profile.legalMenu.privacy')}
            </Text>
            <Text style={styles.accountMenuChevron}>›</Text>
          </Pressable>

          <Pressable
            style={styles.accountMenuItem}
            accessibilityRole="link"
            onPress={() => setLegalPage('impressum')}
          >
            <Text style={styles.accountMenuItemLabel}>
              {t('profile.legalMenu.impressum')}
            </Text>
            <Text style={styles.accountMenuChevron}>›</Text>
          </Pressable>
        </View>

        <View style={styles.accountMenu}>
          <Text style={styles.accountMenuHeading}>{t('profile.accountMenu.title')}</Text>

          <Pressable
            style={[styles.footerItem, styles.footerItemBordered]}
            accessibilityRole="button"
            onPress={deleteAccountFlow.openDeleteModal}
          >
            <Text style={styles.deleteAccountLabel}>
              {t('profile.deleteAccount.menuItem')}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.footerItem, styles.footerItemBordered]}
            accessibilityRole="button"
            onPress={() => void handleLogout()}
          >
            <Text style={styles.footerLogoutLabel}>{t('header.logout')}</Text>
          </Pressable>
        </View>

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

      <LegalWebViewModal page={legalPage} onClose={() => setLegalPage(null)} />

      <DeleteAccountModal
        visible={deleteAccountFlow.isDeleteModalOpen}
        step={deleteAccountFlow.deleteModalStep}
        isPending={deleteAccountFlow.isDeletingAccount}
        errorMessage={deleteAccountFlow.deleteAccountError}
        accountEmail={deleteAccountFlow.accountEmail}
        otp={deleteAccountFlow.deleteOtp}
        otpSent={deleteAccountFlow.deleteOtpSent}
        isSendingOtp={deleteAccountFlow.isSendingDeleteOtp}
        onOtpChange={deleteAccountFlow.setDeleteOtp}
        onRequestOtp={() => void deleteAccountFlow.requestDeleteOtp()}
        onClose={deleteAccountFlow.closeDeleteModal}
        onContinueToVerify={deleteAccountFlow.continueDeleteToVerify}
        onBackToInfo={deleteAccountFlow.backDeleteToInfo}
        onConfirm={() => void deleteAccountFlow.confirmDeleteAccount()}
      />
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
  footerItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  footerItemBordered: {
    borderTopWidth: 1,
    borderTopColor: recurringTheme.cardBorder,
  },
  deleteAccountLabel: {
    color: recurringTheme.fireRedBright,
    fontSize: 15,
    fontWeight: '700',
  },
  footerLogoutLabel: {
    color: recurringTheme.textPrimary,
    fontSize: 15,
    fontWeight: '700',
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
