const mockAnalyticsInstance = {
  setAnalyticsCollectionEnabled: jest.fn().mockResolvedValue(undefined),
  setUserId: jest.fn().mockResolvedValue(undefined),
  setUserProperty: jest.fn().mockResolvedValue(undefined),
  logEvent: jest.fn().mockResolvedValue(undefined),
  logScreenView: jest.fn().mockResolvedValue(undefined),
};

const mockCrashlyticsInstance = {
  setCrashlyticsCollectionEnabled: jest.fn().mockResolvedValue(undefined),
  setUserId: jest.fn().mockResolvedValue(undefined),
  setAttribute: jest.fn().mockResolvedValue(undefined),
  log: jest.fn().mockResolvedValue(undefined),
  recordError: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@react-native-firebase/analytics', () => ({
  getAnalytics: jest.fn(() => mockAnalyticsInstance),
}));

jest.mock('@react-native-firebase/crashlytics', () => ({
  getCrashlytics: jest.fn(() => mockCrashlyticsInstance),
}));
