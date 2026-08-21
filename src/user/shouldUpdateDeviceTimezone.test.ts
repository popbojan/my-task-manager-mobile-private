import { shouldUpdateDeviceTimezone } from '@/user/shouldUpdateDeviceTimezone';

describe('shouldUpdateDeviceTimezone', () => {
  it('returns true when persisted timezone is missing', () => {
    expect(shouldUpdateDeviceTimezone(null, 'Europe/Berlin')).toBe(true);
    expect(shouldUpdateDeviceTimezone(undefined, 'Europe/Berlin')).toBe(true);
    expect(shouldUpdateDeviceTimezone('', 'Europe/Berlin')).toBe(true);
    expect(shouldUpdateDeviceTimezone('   ', 'Europe/Berlin')).toBe(true);
  });

  it('returns false when persisted timezone matches device timezone', () => {
    expect(shouldUpdateDeviceTimezone('Europe/Berlin', 'Europe/Berlin')).toBe(false);
  });

  it('returns true when persisted timezone differs from device timezone', () => {
    expect(shouldUpdateDeviceTimezone('Europe/Berlin', 'America/New_York')).toBe(true);
  });

  it('returns false when device timezone is empty', () => {
    expect(shouldUpdateDeviceTimezone(null, '')).toBe(false);
    expect(shouldUpdateDeviceTimezone('Europe/Berlin', '')).toBe(false);
  });
});
