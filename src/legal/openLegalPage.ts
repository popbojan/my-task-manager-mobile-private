import { Linking } from 'react-native';
import { getAssetsBaseUrl } from '@/config/api';

export type LegalPage = 'privacy' | 'impressum';

export function getLegalPageUrl(page: LegalPage): string {
  const base = getAssetsBaseUrl().replace(/\/$/, '');
  return `${base}/${page}`;
}

export async function openLegalPage(page: LegalPage): Promise<void> {
  await Linking.openURL(getLegalPageUrl(page));
}
