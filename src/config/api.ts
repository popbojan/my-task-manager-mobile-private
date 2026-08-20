import { Platform } from 'react-native';

/**
 * LAN IP of your dev machine (Mac/PC running backend + frontend).
 * Update when your network changes: `ipconfig getifaddr en0`
 */
export const DEV_MACHINE_HOST = '192.168.178.28';

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

function devHost(localhostPort: number): string {
  if (Platform.OS === 'android') {
    const host = isAndroidEmulator() ? '10.0.2.2' : DEV_MACHINE_HOST;
    return `http://${host}:${localhostPort}`;
  }

  return `http://localhost:${localhostPort}`;
}

export const API_BASE_URL = __DEV__
  ? devHost(3001)
  : 'https://api.example.com';

/** Static assets (mastery avatars, logo) are served by the web frontend. */
export const ASSETS_BASE_URL = __DEV__
  ? devHost(5173)
  : 'https://app.example.com';
