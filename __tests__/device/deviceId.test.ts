jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(async () => undefined),
}));

describe('getOrCreateDeviceId', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('returns a stored id without creating a new one', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage') as {
      getItem: jest.Mock;
      setItem: jest.Mock;
    };
    AsyncStorage.getItem.mockResolvedValue('stored-device-id');

    const { getOrCreateDeviceId } = require('@/device/deviceId') as {
      getOrCreateDeviceId: () => Promise<string>;
    };

    await expect(getOrCreateDeviceId()).resolves.toBe('stored-device-id');
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('creates and persists a new id when none is stored', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage') as {
      getItem: jest.Mock;
      setItem: jest.Mock;
    };
    AsyncStorage.getItem.mockResolvedValue(null);

    const { getOrCreateDeviceId } = require('@/device/deviceId') as {
      getOrCreateDeviceId: () => Promise<string>;
    };

    const first = await getOrCreateDeviceId();
    const second = await getOrCreateDeviceId();

    expect(first).toEqual(expect.any(String));
    expect(first.length).toBeGreaterThan(8);
    expect(second).toBe(first);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@mtm/device-id', first);
  });
});
