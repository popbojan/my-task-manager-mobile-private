import { configureAppMonitoringCollection } from '@/monitoring/appMonitoring';

describe('appMonitoring', () => {
  it('configures collection without throwing', async () => {
    await expect(configureAppMonitoringCollection()).resolves.toBeUndefined();
  });
});
