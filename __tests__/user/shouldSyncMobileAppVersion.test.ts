import { shouldSyncMobileAppVersion } from '@/user/shouldSyncMobileAppVersion';

describe('shouldSyncMobileAppVersion', () => {
  it('syncs when the server has no version yet', () => {
    expect(shouldSyncMobileAppVersion(null, '1.2.3')).toBe(true);
  });

  it('syncs when the installed version changed', () => {
    expect(shouldSyncMobileAppVersion('1.2.2', '1.2.3')).toBe(true);
  });

  it('skips when the server already has the installed version', () => {
    expect(shouldSyncMobileAppVersion('1.2.3', '1.2.3')).toBe(false);
  });
});
