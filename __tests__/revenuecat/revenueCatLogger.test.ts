import { logRevenueCatIssue } from '@/revenuecat/revenueCatLogger';

describe('logRevenueCatIssue', () => {
  it('writes RevenueCat context to the console', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    logRevenueCatIssue('Offerings load failed', new Error('network'));

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[RevenueCat] Offerings load failed'),
      expect.any(Error),
    );

    warnSpy.mockRestore();
  });
});
