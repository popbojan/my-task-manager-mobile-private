import { useQuery } from '@tanstack/react-query';
import { isRevenueCatConfiguredForPlatform } from '@/config/revenueCat';
import { getRevenueCatOfferings } from '@/revenuecat/revenueCatService';
import {
  hasAnyStorePackage,
  resolveStorePackagesFromOffering,
} from '@/revenuecat/revenueCatOfferings';
import { isRevenueCatConfigurationError } from '@/revenuecat/revenueCatErrors';
import { TEMP_FORCE_REVENUECAT_OFFERINGS_FAILURE } from '@/revenuecat/revenueCatOfferingsDebug';
import { logRevenueCatOfferingsError } from '@/revenuecat/revenueCatOfferingsErrors';

export const revenueCatOfferingsQueryKey = ['revenuecat-offerings'] as const;

export function useRevenueCatOfferings(enabled: boolean) {
  return useQuery({
    queryKey: revenueCatOfferingsQueryKey,
    queryFn: async () => {
      if (TEMP_FORCE_REVENUECAT_OFFERINGS_FAILURE) {
        const forcedError = new Error('offerings_empty');
        logRevenueCatOfferingsError(forcedError);
        throw forcedError;
      }

      try {
        const offerings = await getRevenueCatOfferings();
        const current = offerings.current ?? null;
        const packages = resolveStorePackagesFromOffering(current);

        if (!current || !hasAnyStorePackage(packages)) {
          const emptyError = new Error('offerings_empty');
          logRevenueCatOfferingsError(emptyError);
          throw emptyError;
        }

        return {
          offering: current,
          packages,
        };
      } catch (error) {
        if (isRevenueCatConfigurationError(error)) {
          const configurationError = new Error('offerings_no_play_products');
          logRevenueCatOfferingsError(configurationError);
          throw configurationError;
        }

        logRevenueCatOfferingsError(error);
        throw error;
      }
    },
    enabled: enabled && isRevenueCatConfiguredForPlatform(),
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
}
