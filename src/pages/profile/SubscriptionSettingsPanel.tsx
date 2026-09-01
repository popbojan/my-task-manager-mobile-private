import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import {
  SubscriptionProvider,
  type SubscriptionStatus,
  type SubscriptionType,
} from '@/api/generated';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { TranslationKey } from '@/i18n/locales';
import PremiumSubscribeSection from '@/pages/subscription/PremiumSubscribeSection';
import { usePremiumPurchaseFlow } from '@/pages/subscription/usePremiumPurchaseFlow';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import {
  getActivePremiumProviderLabelKey,
  recheckSubscriptionStatus,
} from '@/subscription/subscriptionPurchaseFlow';
import {
  openSubscriptionManagement,
  resolveSubscriptionDisplayProvider,
} from '@/subscription/openSubscriptionManagement';
import {
  getSubscriptionExpiryDate,
  isSubscriptionPendingCancellation,
} from '@/subscription/isSubscriptionPendingCancellation';
import {
  readRevenueCatSyncFailed,
  readStripeSyncFailed,
} from '@/subscription/subscriptionAccessResponse';

const STATUS_LABEL_KEYS: Record<SubscriptionStatus, TranslationKey> = {
  pending: 'subscription.settings.status.pending',
  active: 'subscription.settings.status.active',
  trialing: 'subscription.settings.status.trialing',
  grace_period: 'subscription.settings.status.gracePeriod',
  past_due: 'subscription.settings.status.pastDue',
  canceled: 'subscription.settings.status.canceled',
  expired: 'subscription.settings.status.expired',
  revoked: 'subscription.settings.status.revoked',
};

const TYPE_LABEL_KEYS: Record<SubscriptionType, TranslationKey> = {
  monthly: 'subscription.settings.plan.monthly',
  yearly: 'subscription.settings.plan.yearly',
  lifetime: 'subscription.settings.plan.lifetime',
};

function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default function SubscriptionSettingsPanel() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const flow = usePremiumPurchaseFlow();
  const [recheckLoading, setRecheckLoading] = useState(false);
  const [recheckError, setRecheckError] = useState<string | null>(null);
  const [manageLoading, setManageLoading] = useState(false);
  const [manageError, setManageError] = useState<string | null>(null);

  const subscription = flow.subscriptionQuery.data?.subscription ?? null;
  const stripeSyncFailed = readStripeSyncFailed(flow.subscriptionQuery.data);
  const revenueCatSyncFailed = readRevenueCatSyncFailed(flow.subscriptionQuery.data);

  const locale =
    language === 'sr'
      ? 'sr-RS'
      : language === 'de'
        ? 'de-DE'
        : language === 'fr'
          ? 'fr-FR'
          : 'en-US';

  const statusKey = subscription
    ? STATUS_LABEL_KEYS[subscription.status]
    : 'subscription.settings.status.inactive';
  const isPendingCancellation = isSubscriptionPendingCancellation(subscription);
  const nextBillingDate = subscription?.currentPeriodEnd ?? null;
  const expiryDate = getSubscriptionExpiryDate(subscription);
  const providerLabelKey = getActivePremiumProviderLabelKey(
    resolveSubscriptionDisplayProvider(subscription?.provider),
  );
  const canManageSubscription = flow.hasPremiumAccess;
  const showBillingDate =
    subscription &&
    (flow.hasPremiumAccess ||
      subscription.status === 'active' ||
      subscription.status === 'trialing' ||
      subscription.status === 'past_due' ||
      subscription.status === 'grace_period' ||
      isPendingCancellation);

  const handleRecheckStatus = useCallback(async () => {
    setRecheckError(null);
    setRecheckLoading(true);

    try {
      await recheckSubscriptionStatus(queryClient);
      await flow.subscriptionQuery.refetch();
    } catch {
      setRecheckError(t('subscription.settings.error'));
    } finally {
      setRecheckLoading(false);
    }
  }, [flow.subscriptionQuery, queryClient, t]);

  const handleManageSubscription = useCallback(async () => {
    setManageError(null);
    setManageLoading(true);

    try {
      const result = await openSubscriptionManagement(subscription?.provider);

      if (!result.ok) {
        switch (result.reason) {
          case 'test_store':
            setManageError(t('subscription.settings.manageErrorTestStore'));
            break;
          case 'api_error':
          case 'no_portal_url':
            setManageError(t('subscription.settings.manageErrorNoCustomer'));
            break;
          default:
            setManageError(t('subscription.settings.manageErrorOpenFailed'));
        }
      }
    } catch {
      setManageError(t('subscription.settings.manageErrorOpenFailed'));
    } finally {
      setManageLoading(false);
    }
  }, [subscription?.provider, t]);

  return (
    <View style={styles.root}>
      <View style={styles.section}>
        <Text style={styles.eyebrow}>{t('premium.badge')}</Text>
        <Text style={styles.sectionTitle}>{t('subscription.settings.title')}</Text>
        <Text style={styles.sectionSubtitle}>
          {t('subscription.settings.subtitle')}
        </Text>
      </View>

      {flow.subscriptionQuery.isLoading ? (
        <Text style={styles.message}>{t('subscription.settings.loading')}</Text>
      ) : null}

      {flow.subscriptionQuery.isError ? (
        <Text style={styles.error}>{t('subscription.settings.error')}</Text>
      ) : null}

      {flow.subscriptionQuery.isSuccess ? (
        <View style={styles.card}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {t('subscription.settings.statusLabel')}
            </Text>
            <View
              style={[
                styles.badge,
                flow.hasPremiumAccess ? styles.badgeActive : null,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  flow.hasPremiumAccess ? styles.badgeTextActive : null,
                ]}
              >
                {t(statusKey)}
              </Text>
            </View>
          </View>

          {subscription ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {t('subscription.settings.planLabel')}
              </Text>
              <Text style={styles.detailValue}>
                {t(TYPE_LABEL_KEYS[subscription.type])}
              </Text>
            </View>
          ) : null}

          {flow.hasPremiumAccess && providerLabelKey ? (
            <Text style={styles.providerNotice}>{t(providerLabelKey)}</Text>
          ) : null}

          {subscription && showBillingDate ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {isPendingCancellation
                  ? t('subscription.settings.cancellationLabel')
                  : t('subscription.settings.billingDateLabel')}
              </Text>
              <Text style={styles.detailValue}>
                {isPendingCancellation
                  ? expiryDate
                    ? t('subscription.settings.cancellationExpiresWithDate', {
                        date: formatDate(expiryDate, locale),
                      })
                    : t('subscription.settings.cancellationExpires')
                  : nextBillingDate
                    ? formatDate(nextBillingDate, locale)
                    : t('subscription.settings.billingDateUnavailable')}
              </Text>
            </View>
          ) : null}

          {stripeSyncFailed || revenueCatSyncFailed ? (
            <Text style={styles.syncNotice}>
              {stripeSyncFailed && revenueCatSyncFailed
                ? t('subscription.mobile.syncFailedBoth')
                : stripeSyncFailed
                  ? t('subscription.settings.syncFailedNotice')
                  : t('subscription.mobile.syncFailedRevenueCat')}
            </Text>
          ) : null}
        </View>
      ) : null}

      {canManageSubscription ? (
        <Pressable
          style={[
            styles.primaryButton,
            (manageLoading || recheckLoading) && styles.buttonDisabled,
          ]}
          disabled={manageLoading || recheckLoading}
          onPress={handleManageSubscription}
        >
          {manageLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {t('subscription.settings.manageCta')}
            </Text>
          )}
        </Pressable>
      ) : null}

      {manageError ? <Text style={styles.error}>{manageError}</Text> : null}

      {flow.activationPending ? (
        <View style={styles.pendingCard}>
          <Text style={styles.pendingTitle}>
            {t('subscription.mobile.processing.title')}
          </Text>
          <Text style={styles.pendingMessage}>
            {t('subscription.mobile.processing.message')}
          </Text>
          {revenueCatSyncFailed ? (
            <Text style={styles.syncNotice}>{t('subscription.mobile.syncFailedRevenueCat')}</Text>
          ) : (
            <Text style={styles.pendingHint}>{t('subscription.mobile.processing.hint')}</Text>
          )}
          <Pressable
            style={[styles.secondaryButton, recheckLoading && styles.buttonDisabled]}
            disabled={recheckLoading}
            onPress={handleRecheckStatus}
          >
            {recheckLoading ? (
              <ActivityIndicator color={recurringTheme.accentBright} />
            ) : (
              <Text style={styles.secondaryButtonText}>
                {t('subscription.checkStatus.cta')}
              </Text>
            )}
          </Pressable>
        </View>
      ) : null}

      <PremiumSubscribeSection flow={flow} />

      {flow.hasPremiumAccess &&
      subscription?.provider === SubscriptionProvider.Stripe ? (
        <Text style={styles.notice}>{t('subscription.mobile.stripeActive')}</Text>
      ) : null}

      {recheckError ? <Text style={styles.error}>{recheckError}</Text> : null}

      {!flow.activationPending ? (
        <Pressable
          style={[styles.secondaryButton, recheckLoading && styles.buttonDisabled]}
          disabled={recheckLoading}
          onPress={handleRecheckStatus}
        >
          {recheckLoading ? (
            <ActivityIndicator color={recurringTheme.accentBright} />
          ) : (
            <Text style={styles.secondaryButtonText}>
              {t('subscription.checkStatus.cta')}
            </Text>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginTop: 8,
  },
  section: {
    marginBottom: 14,
  },
  eyebrow: {
    color: recurringTheme.goldBright,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sectionTitle: {
    color: recurringTheme.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  sectionSubtitle: {
    color: recurringTheme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: recurringTheme.surfaceCard,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    marginBottom: 14,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    color: recurringTheme.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailValue: {
    color: recurringTheme.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
  },
  badgeActive: {
    backgroundColor: 'rgba(212, 168, 67, 0.16)',
    borderColor: 'rgba(212, 168, 67, 0.45)',
  },
  badgeText: {
    color: recurringTheme.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  badgeTextActive: {
    color: recurringTheme.goldBright,
  },
  providerNotice: {
    color: recurringTheme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  syncNotice: {
    color: recurringTheme.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  message: {
    color: recurringTheme.textSecondary,
    fontSize: 14,
    marginBottom: 14,
  },
  notice: {
    color: recurringTheme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  error: {
    color: '#f87171',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  pendingCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 168, 67, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.28)',
    marginBottom: 14,
  },
  pendingTitle: {
    color: recurringTheme.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  pendingMessage: {
    color: recurringTheme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  pendingHint: {
    color: recurringTheme.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    backgroundColor: recurringTheme.surfaceCard,
    marginBottom: 14,
  },
  secondaryButtonText: {
    color: recurringTheme.accentBright,
    fontSize: 14,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: recurringTheme.accentDark,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
    marginBottom: 14,
  },
  primaryButtonText: {
    color: recurringTheme.accentBright,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
});
