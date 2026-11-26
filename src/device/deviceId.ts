import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@mtm/device-id';

let cachedDeviceId: string | null = null;
let loadInFlight: Promise<string> | null = null;

function createDeviceId(): string {
  const cryptoObj = globalThis.crypto as
    | { randomUUID?: () => string }
    | undefined;
  if (typeof cryptoObj?.randomUUID === 'function') {
    return cryptoObj.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

/**
 * Stable per-installation id. Survives logout and app updates; cleared only
 * with app data / reinstall.
 */
export async function getOrCreateDeviceId(): Promise<string> {
  if (cachedDeviceId) {
    return cachedDeviceId;
  }

  if (loadInFlight) {
    return loadInFlight;
  }

  loadInFlight = (async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored && stored.trim().length > 0) {
        cachedDeviceId = stored.trim();
        return cachedDeviceId;
      }
    } catch {
      // Fall through and create a new id.
    }

    const next = createDeviceId();
    cachedDeviceId = next;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Keep in-memory id for this session if persistence fails.
    }
    return next;
  })().finally(() => {
    loadInFlight = null;
  });

  return loadInFlight;
}
