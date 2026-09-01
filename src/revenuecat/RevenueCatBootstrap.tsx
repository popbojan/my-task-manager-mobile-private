import { useEffect } from 'react';
import { configureRevenueCatOnce } from '@/revenuecat/revenueCatService';

/** Configures RevenueCat once per app run before login (spec §8 step 1). */
export default function RevenueCatBootstrap() {
  useEffect(() => {
    void configureRevenueCatOnce().catch(() => {
      // Non-blocking — purchases stay disabled until configured.
    });
  }, []);

  return null;
}
