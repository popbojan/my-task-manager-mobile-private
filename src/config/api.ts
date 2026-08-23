import { Platform } from 'react-native';

/**
 * LAN IP of your dev machine (Mac/PC running backend + frontend).
 * Update when your network changes: `ipconfig getifaddr en0`
 */
export const DEV_MACHINE_HOST = '192.168.178.28';

export const PRODUCTION_API_BASE_URL =
  'https://my-task-manager-server.up.railway.app';

export const PRODUCTION_ASSETS_BASE_URL = 'https://mytaskmanager.app';

export type ApiEnvironment = 'local' | 'production';

function isAndroidEmulator(): boolean {
  if (Platform.OS !== 'android') {
    return false;
  }

  const model = Platform.constants.Model ?? '';
  const brand = Platform.constants.Brand ?? '';
  const fingerprint = Platform.constants.Fingerprint ?? '';

  return (
    model.includes('sdk_gphone') ||
    model.includes('Emulator') ||
    model.includes('Android SDK built for') ||
    brand.includes('generic') ||
    fingerprint.includes('generic') ||
    fingerprint.includes('sdk')
  );
}

function isIosSimulator(): boolean {
  if (Platform.OS !== 'ios') {
    return false;
  }

  return Platform.constants.systemName === 'iOS Simulator';
}

export function isLocalDevHostPreferred(): boolean {
  if (Platform.OS === 'web') {
    return true;
  }

  if (Platform.OS === 'android') {
    return isAndroidEmulator();
  }

  if (Platform.OS === 'ios') {
    return isIosSimulator();
  }

  return false;
}

export function resolveDefaultApiEnvironment(): ApiEnvironment {
  return isLocalDevHostPreferred() ? 'local' : 'production';
}

function devHost(localhostPort: number): string {
  if (Platform.OS === 'android') {
    const host = isAndroidEmulator() ? '10.0.2.2' : DEV_MACHINE_HOST;
    return `http://${host}:${localhostPort}`;
  }

  return `http://localhost:${localhostPort}`;
}

export function resolveApiBaseUrl(environment: ApiEnvironment): string {
  if (!__DEV__ && environment === 'local') {
    return PRODUCTION_API_BASE_URL;
  }

  return environment === 'production'
    ? PRODUCTION_API_BASE_URL
    : devHost(3001);
}

export function resolveAssetsBaseUrl(environment: ApiEnvironment): string {
  if (!__DEV__ && environment === 'local') {
    return PRODUCTION_ASSETS_BASE_URL;
  }

  return environment === 'production'
    ? PRODUCTION_ASSETS_BASE_URL
    : devHost(5173);
}

/** Default: local on emulator/simulator, production on physical devices. */
export const DEFAULT_API_ENVIRONMENT: ApiEnvironment = resolveDefaultApiEnvironment();

let activeApiEnvironment: ApiEnvironment = DEFAULT_API_ENVIRONMENT;
let activeApiBaseUrl = resolveApiBaseUrl(DEFAULT_API_ENVIRONMENT);
let activeAssetsBaseUrl = resolveAssetsBaseUrl(DEFAULT_API_ENVIRONMENT);

export function getApiEnvironment(): ApiEnvironment {
  return activeApiEnvironment;
}

export function getApiBaseUrl(): string {
  return activeApiBaseUrl;
}

export function getAssetsBaseUrl(): string {
  return activeAssetsBaseUrl;
}

export function applyApiEnvironment(environment: ApiEnvironment): void {
  activeApiEnvironment = environment;
  activeApiBaseUrl = resolveApiBaseUrl(environment);
  activeAssetsBaseUrl = resolveAssetsBaseUrl(environment);
}

/** @deprecated Use getApiBaseUrl() — kept for modules that read a constant at import time. */
export const API_BASE_URL = activeApiBaseUrl;

/** @deprecated Use getAssetsBaseUrl() */
export const ASSETS_BASE_URL = activeAssetsBaseUrl;
