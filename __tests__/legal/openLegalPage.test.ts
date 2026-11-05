jest.mock('@/config/api', () => ({
  getAssetsBaseUrl: jest.fn(() => 'http://192.168.178.28:5173'),
  PRODUCTION_ASSETS_BASE_URL: 'https://mytaskmanager.app',
}));

import { getAssetsBaseUrl } from '@/config/api';
import { getLegalPageUrl, getProductionLegalPageUrl } from '@/legal/openLegalPage';

const mockGetAssetsBaseUrl = getAssetsBaseUrl as jest.MockedFunction<
  typeof getAssetsBaseUrl
>;

describe('getLegalPageUrl', () => {
  beforeEach(() => {
    mockGetAssetsBaseUrl.mockReturnValue('http://192.168.178.28:5173');
  });

  it('uses the configured assets base URL with language and app source', () => {
    expect(getLegalPageUrl('privacy', 'fr')).toBe(
      'http://192.168.178.28:5173/privacy?lang=fr&from=app&embed=1',
    );
    expect(getLegalPageUrl('impressum', 'de')).toBe(
      'http://192.168.178.28:5173/impressum?lang=de&from=app&embed=1',
    );
  });

  it('falls back to production when the assets host is missing', () => {
    mockGetAssetsBaseUrl.mockReturnValue('http://undefined:5173');

    expect(getLegalPageUrl('privacy', 'de')).toBe(
      'https://mytaskmanager.app/privacy?lang=de&from=app&embed=1',
    );
  });
});

describe('getProductionLegalPageUrl', () => {
  it('always uses the production assets host', () => {
    expect(getProductionLegalPageUrl('impressum', 'en')).toBe(
      'https://mytaskmanager.app/impressum?lang=en&from=app&embed=1',
    );
  });
});
