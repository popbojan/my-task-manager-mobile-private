/**
 * Copy to `revenueCat.local.ts` and set your RevenueCat **public** SDK keys.
 * Never commit secret API keys or webhook secrets here.
 *
 * Test Store (dev): Dashboard → API keys → Test Store key (`test_…`) — requires react-native-purchases ≥ 9.5.4
 * Google Play: Dashboard → API keys → Public SDK key (`goog_…`) for Play sandbox / production
 * iOS (future): Public SDK key (`appl_…`) — not configured yet in this app.
 */
export const revenueCatLocalOverrides = {
  androidPublicSdkKey: '',
  androidTestStoreSdkKey: '',
  iosPublicSdkKey: '',
  iosTestStoreSdkKey: '',
};
