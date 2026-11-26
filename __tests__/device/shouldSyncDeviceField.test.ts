import { shouldSyncDeviceField } from '@/device/shouldSyncDeviceField';

describe('shouldSyncDeviceField', () => {
  it('syncs when persisted is null or blank', () => {
    expect(shouldSyncDeviceField(null, '14')).toBe(true);
    expect(shouldSyncDeviceField('  ', '14')).toBe(true);
  });

  it('syncs on any mismatch including downgrade', () => {
    expect(shouldSyncDeviceField('1.3.0', '1.2.7')).toBe(true);
    expect(shouldSyncDeviceField('14', '13')).toBe(true);
  });

  it('skips when values match', () => {
    expect(shouldSyncDeviceField('1.2.7', '1.2.7')).toBe(false);
    expect(shouldSyncDeviceField('14', '14')).toBe(false);
  });

  it('skips when local value is empty', () => {
    expect(shouldSyncDeviceField('14', '')).toBe(false);
  });
});
