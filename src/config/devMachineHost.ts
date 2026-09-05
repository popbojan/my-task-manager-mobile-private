import AsyncStorage from '@react-native-async-storage/async-storage';

/** Fallback when nothing is stored — update via `ipconfig getifaddr en0`. */
export const DEFAULT_DEV_MACHINE_HOST = '192.168.178.29';

const STORAGE_KEY = 'my-task-manager.dev-machine-host';

let activeDevMachineHost = DEFAULT_DEV_MACHINE_HOST;

function isValidDevMachineHost(host: string): boolean {
  const trimmed = host.trim();
  if (!trimmed) {
    return false;
  }

  return /^[\d.a-zA-Z-]+$/.test(trimmed);
}

export function getDevMachineHost(): string {
  return activeDevMachineHost;
}

export async function loadDevMachineHost(): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored && isValidDevMachineHost(stored)) {
      activeDevMachineHost = stored.trim();
    }
  } catch {
    // Keep in-memory default.
  }

  return activeDevMachineHost;
}

export async function persistDevMachineHost(host: string): Promise<string> {
  const trimmed = host.trim();
  if (!isValidDevMachineHost(trimmed)) {
    throw new Error('invalid_dev_machine_host');
  }

  activeDevMachineHost = trimmed;
  await AsyncStorage.setItem(STORAGE_KEY, trimmed);
  return activeDevMachineHost;
}
