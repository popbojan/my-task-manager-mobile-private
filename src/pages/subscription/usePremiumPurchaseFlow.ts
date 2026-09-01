import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { PurchasesPackage } from 'react-native-purchases';
import { isRevenueCatConfiguredForPlatform } from '@/config/revenueCat';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useRevenueCatOfferings } from '@/revenuecat/useRevenueCatOfferings';
import {
  recheckSubscriptionStatus,
  runSubscriptionPurchase,
  runSubscriptionRestore,
} from '@/subscription/subscriptionPurchaseFlow';
import { useSubscriptionAccess } from '@/subscription/useSubscriptionAccess';
import { useSubscriptionSession } from '@/subscription/SubscriptionSessionProvider';

export function usePremiumPurchaseFlow() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const subscriptionQuery = useSubscriptionAccess();
  const { rcIdentityReady } = useSubscriptionSession();

  const hasPremiumAccess = subscriptionQuery.data?.hasPremiumAccess ?? false;

  const offeringsQuery = useRevenueCatOfferings(
    subscriptionQuery.isSuccess && !hasPremiumAccess && rcIdentityReady,
  );

  const [purchaseLoading, setPurchaseLoading] = useState<
    'monthly' | 'lifetime' | 'restore' | 'recheck' | null
  >(null);
  const [activationPending, setActivationPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [alreadyPremiumNotice, setAlreadyPremiumNotice] = useState(false);

  const monthlyPackage = offeringsQuery.data?.packages.monthly ?? null;
  const lifetimePackage = offeringsQuery.data?.packages.lifetime ?? null;
  const purchasesDisabled =
    purchaseLoading !== null || activationPending || hasPremiumAccess;

  const handleRecheckStatus = useCallback(async () => {
    setActionError(null);
    setPurchaseLoading('recheck');

    try {
      const access = await recheckSubscriptionStatus(queryClient);
      setActivationPending(!access.hasPremiumAccess);
    } catch {
      setActionError(t('subscription.settings.error'));
    } finally {
      setPurchaseLoading(null);
    }
  }, [queryClient, t]);

  const handlePurchase = useCallback(
    async (pkg: PurchasesPackage, plan: 'monthly' | 'lifetime') => {
      if (purchaseLoading !== null || activationPending) {
        return;
      }

      setActionError(null);
      setAlreadyPremiumNotice(false);
      setPurchaseLoading(plan);

      try {
        const outcome = await runSubscriptionPurchase(queryClient, pkg);

        switch (outcome.kind) {
          case 'premium_already_active':
            setAlreadyPremiumNotice(true);
            setActivationPending(false);
            break;
          case 'purchase_completed':
            setActivationPending(false);
            break;
          case 'activation_pending':
            setActivationPending(true);
            break;
          case 'user_cancelled':
            break;
          case 'error':
            setActionError(
              outcome.message === 'purchase_in_flight'
                ? t('subscription.mobile.purchaseInFlight')
                : outcome.message === 'revenuecat_identity_mismatch'
                  ? t('subscription.mobile.identityMismatch')
                  : t('subscription.mobile.purchaseError'),
            );
            break;
        }
      } finally {
        setPurchaseLoading(null);
      }
    },
    [activationPending, purchaseLoading, queryClient, t],
  );

  const handleRestore = useCallback(async () => {
    if (purchaseLoading !== null || activationPending) {
      return;
    }

    setActionError(null);
    setPurchaseLoading('restore');

    try {
      const outcome = await runSubscriptionRestore(queryClient);

      switch (outcome.kind) {
        case 'restored':
          setActivationPending(false);
          break;
        case 'activation_pending':
          setActivationPending(true);
          break;
        case 'nothing_to_restore':
          setActionError(t('subscription.mobile.restoreNothing'));
          break;
        case 'user_cancelled':
          break;
        case 'error':
          setActionError(
            outcome.message === 'revenuecat_identity_mismatch'
              ? t('subscription.mobile.identityMismatch')
              : t('subscription.mobile.restoreError'),
          );
          break;
      }
    } finally {
      setPurchaseLoading(null);
    }
  }, [activationPending, purchaseLoading, queryClient, t]);

  const purchaseMonthly = useCallback(() => {
    if (monthlyPackage) {
      void handlePurchase(monthlyPackage, 'monthly');
    }
  }, [handlePurchase, monthlyPackage]);

  return {
    subscriptionQuery,
    rcIdentityReady,
    hasPremiumAccess,
    offeringsQuery,
    purchaseLoading,
    activationPending,
    actionError,
    alreadyPremiumNotice,
    monthlyPackage,
    lifetimePackage,
    purchasesDisabled,
    isRevenueCatConfigured: isRevenueCatConfiguredForPlatform(),
    handleRecheckStatus,
    handlePurchase,
    handleRestore,
    purchaseMonthly,
  };
}
