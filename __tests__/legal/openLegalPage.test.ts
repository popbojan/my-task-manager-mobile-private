jest.mock('@/config/api', () => ({
  getAssetsBaseUrl: () => 'http://192.168.178.28:5173',
}));

import { getLegalPageUrl } from '@/legal/openLegalPage';

describe('getLegalPageUrl', () => {
  it('uses the configured assets base URL with language and app source', () => {
    expect(getLegalPageUrl('privacy', 'fr')).toBe(
      'http://192.168.178.28:5173/privacy?lang=fr&from=app&embed=1',
    );
    expect(getLegalPageUrl('impressum', 'de')).toBe(
      'http://192.168.178.28:5173/impressum?lang=de&from=app&embed=1',
    );
  });
});
