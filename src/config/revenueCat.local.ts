/**
 * Local RevenueCat public SDK keys. Override in development builds.
 * See `revenueCat.local.example.ts` and docs/mobile-revenuecat-setup.md.
 */
export const revenueCatLocalOverrides = {
  /** Google Play public SDK key (`goog_…`) — required for release / Play sandbox builds. */
  androidPublicSdkKey: '',
  /** Test Store key (`test_…`) — DEBUG builds only; crashes release if used there. */
  androidTestStoreSdkKey: 'test_ZnngtRpsQhLKsYQgzrQytpSLPHT',
  iosPublicSdkKey: '',
  iosTestStoreSdkKey: '',
};
