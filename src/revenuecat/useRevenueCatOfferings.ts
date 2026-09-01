import { useQuery } from '@tanstack/react-query';
import { getRevenueCatOfferings } from '@/revenuecat/revenueCatService';
import {
  hasAnyStorePackage,
  resolveStorePackagesFromOffering,
} from '@/revenuecat/revenueCatOfferings';
import { isRevenueCatConfiguredForPlatform } from '@/config/revenueCat';

export const revenueCatOfferingsQueryKey = ['revenuecat-offerings'] as const;

export function useRevenueCatOfferings(enabled: boolean) {
  return useQuery({
    queryKey: revenueCatOfferingsQueryKey,
    queryFn: async () => {
      const offerings = await getRevenueCatOfferings();
      const current = offerings.current ?? null;
      const packages = resolveStorePackagesFromOffering(current);

      if (!current || !hasAnyStorePackage(packages)) {
        throw new Error('offerings_unavailable');
      }

      return {
        offering: current,
        packages,
      };
    },
    enabled: enabled && isRevenueCatConfiguredForPlatform(),
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
}
