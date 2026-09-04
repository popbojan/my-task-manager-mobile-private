import { useQuery } from '@tanstack/react-query';
import { isRevenueCatConfiguredForPlatform } from '@/config/revenueCat';
import { getRevenueCatOfferings } from '@/revenuecat/revenueCatService';
import {
  hasAnyStorePackage,
  resolveStorePackagesFromOffering,
} from '@/revenuecat/revenueCatOfferings';
import { isRevenueCatConfigurationError } from '@/revenuecat/revenueCatErrors';

export const revenueCatOfferingsQueryKey = ['revenuecat-offerings'] as const;

export function useRevenueCatOfferings(enabled: boolean) {
  return useQuery({
    queryKey: revenueCatOfferingsQueryKey,
    queryFn: async () => {
      try {
        const offerings = await getRevenueCatOfferings();
        const current = offerings.current ?? null;
        const packages = resolveStorePackagesFromOffering(current);

        if (!current || !hasAnyStorePackage(packages)) {
          throw new Error('offerings_empty');
        }

        return {
          offering: current,
          packages,
        };
      } catch (error) {
        if (isRevenueCatConfigurationError(error)) {
          throw new Error('offerings_no_play_products');
        }

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
