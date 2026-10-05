import { parseLegalWebViewMessage } from '@/legal/legalWebViewMessages';

describe('parseLegalWebViewMessage', () => {
  it('parses close messages', () => {
    expect(parseLegalWebViewMessage('legal-close')).toEqual({ type: 'close' });
  });

  it('parses language sync messages', () => {
    expect(parseLegalWebViewMessage('legal-language:fr')).toEqual({
      type: 'language',
      language: 'fr',
    });
  });

  it('ignores unknown messages', () => {
    expect(parseLegalWebViewMessage('legal-language:xx')).toBeNull();
    expect(parseLegalWebViewMessage('other')).toBeNull();
  });
});
