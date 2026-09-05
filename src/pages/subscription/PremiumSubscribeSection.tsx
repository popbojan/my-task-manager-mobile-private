import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import PremiumFeatureList from '@/pages/subscription/PremiumFeatureList';
import { getOfferingsErrorTranslationKey } from '@/revenuecat/revenueCatOfferingsErrors';
import { usePremiumPurchaseFlow } from '@/pages/subscription/usePremiumPurchaseFlow';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type PremiumSubscribeSectionProps = {
  compact?: boolean;
  flow?: ReturnType<typeof usePremiumPurchaseFlow>;
};

export default function PremiumSubscribeSection({
  compact = false,
  flow: flowProp,
}: PremiumSubscribeSectionProps) {
  const { t } = useLanguage();
  const internalFlow = usePremiumPurchaseFlow();
  const flow = flowProp ?? internalFlow;

  if (flow.hasPremiumAccess) {
    return (
      <View style={styles.root}>
        <Text style={styles.title}>{t('premium.title')}</Text>
        <Text style={styles.notice}>{t('subscription.mobile.alreadyPremium')}</Text>
      </View>
    );
  }

  if (flow.activationPending) {
    return null;
  }

  const monthlyPrice = flow.monthlyPackage?.product.priceString ?? null;

  return (
    <View style={styles.root}>
      {!compact ? (
        <>
          <Text style={styles.title}>{t('premium.title')}</Text>
          <Text style={styles.subtitle}>{t('premium.subtitle')}</Text>
          <PremiumFeatureList />
        </>
      ) : null}

      <Text style={styles.hint}>{t('subscription.settings.subscribeHint')}</Text>

      {!flow.isRevenueCatConfigured ? (
        <Text style={styles.notice}>{t('subscription.mobile.revenueCatUnavailable')}</Text>
      ) : flow.offeringsQuery.isLoading ? (
        <Text style={styles.message}>{t('subscription.mobile.offeringsLoading')}</Text>
      ) : flow.offeringsQuery.isError ? (
        <Text style={styles.error}>
          {t(getOfferingsErrorTranslationKey(flow.offeringsQuery.error))}
        </Text>
      ) : (
        <>
          {flow.monthlyPackage ? (
            <View style={styles.planOption}>
              <Pressable
                style={[
                  styles.primaryButton,
                  flow.purchasesDisabled && styles.buttonDisabled,
                ]}
                disabled={flow.purchasesDisabled}
                onPress={() =>
                  flow.handlePurchase(flow.monthlyPackage!, 'monthly')
                }
              >
                {flow.purchaseLoading === 'monthly' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {monthlyPrice
                      ? t('subscription.mobile.purchaseMonthly', { price: monthlyPrice })
                      : t('subscription.settings.subscribeCta')}
                  </Text>
                )}
              </Pressable>
              <Text style={styles.planHint}>{t('premium.guaranteeMonthly')}</Text>
            </View>
          ) : (
            <Pressable
              style={[styles.primaryButton, styles.buttonDisabled]}
              disabled
            >
              <Text style={styles.primaryButtonText}>
                {t('subscription.settings.subscribeCta')}
              </Text>
            </Pressable>
          )}

          {flow.lifetimePackage ? (
            <View style={styles.planOption}>
              <Pressable
                style={[
                  styles.secondaryButton,
                  flow.purchasesDisabled && styles.buttonDisabled,
                ]}
                disabled={flow.purchasesDisabled}
                onPress={() =>
                  flow.handlePurchase(flow.lifetimePackage!, 'lifetime')
                }
              >
                {flow.purchaseLoading === 'lifetime' ? (
                  <ActivityIndicator color={recurringTheme.accentBright} />
                ) : (
                  <Text style={styles.secondaryButtonText}>
                    {t('subscription.mobile.purchaseLifetime', {
                      price: flow.lifetimePackage.product.priceString,
                    })}
                  </Text>
                )}
              </Pressable>
              <Text style={styles.planHint}>{t('premium.guaranteeLifetime')}</Text>
            </View>
          ) : null}
        </>
      )}

      <Pressable
        style={[
          styles.textButton,
          flow.purchasesDisabled && styles.buttonDisabled,
        ]}
        disabled={flow.purchasesDisabled}
        onPress={flow.handleRestore}
      >
        {flow.purchaseLoading === 'restore' ? (
          <ActivityIndicator color={recurringTheme.accentBright} />
        ) : (
          <Text style={styles.textButtonLabel}>{t('subscription.mobile.restore')}</Text>
        )}
      </Pressable>

      {flow.alreadyPremiumNotice ? (
        <Text style={styles.notice}>{t('subscription.mobile.alreadyPremium')}</Text>
      ) : null}

      {flow.actionError ? <Text style={styles.error}>{flow.actionError}</Text> : null}

      {!compact ? (
        <Text style={styles.footer}>{t('premium.footer')}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginBottom: 14,
  },
  title: {
    color: recurringTheme.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: recurringTheme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  hint: {
    color: recurringTheme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
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
  },
  primaryButtonText: {
    color: recurringTheme.accentBright,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    backgroundColor: recurringTheme.surfaceCard,
  },
  secondaryButtonText: {
    color: recurringTheme.accentBright,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  textButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  textButtonLabel: {
    color: recurringTheme.accentBright,
    fontSize: 14,
    fontWeight: '700',
  },
  planOption: {
    marginBottom: 14,
    gap: 6,
  },
  planHint: {
    color: recurringTheme.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  footer: {
    color: recurringTheme.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 4,
  },
  message: {
    color: recurringTheme.textSecondary,
    fontSize: 14,
    marginBottom: 12,
  },
  notice: {
    color: recurringTheme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  error: {
    color: '#f87171',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
});
