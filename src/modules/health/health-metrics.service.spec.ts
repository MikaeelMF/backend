import { Test } from '@nestjs/testing';

import { HealthMetricsService } from './health-metrics.service';
import { HealthChecks } from './health.checks';

const makeGauge = (): { set: jest.Mock } => ({ set: jest.fn() });

describe('HealthMetricsService', () => {
  let service: HealthMetricsService;
  let healthChecks: { runCritical: jest.Mock };
  let gauge: { set: jest.Mock };

  beforeEach(async () => {
    healthChecks = { runCritical: jest.fn() };
    gauge = makeGauge();

    const module = await Test.createTestingModule({
      providers: [
        HealthMetricsService,
        { provide: HealthChecks, useValue: healthChecks },
        { provide: 'PROM_METRIC_SERVICE_HEALTH_STATUS', useValue: gauge },
      ],
    }).compile();

    service = module.get(HealthMetricsService);
  });

  describe('negative cases', () => {
    it('handles exception from runCritical and updates gauge from response', async () => {
      const error = { response: { details: { database: { status: 'down' } } } };
      healthChecks.runCritical.mockRejectedValue(error);

      await service.updateMetrics();

      expect(gauge.set).toHaveBeenCalledWith({ service: 'database' }, 0);
    });

    it('does not throw when runCritical throws non-object', async () => {
      healthChecks.runCritical.mockRejectedValue('string error');

      await expect(service.updateMetrics()).resolves.toBeUndefined();
    });
  });

  describe('positive cases', () => {
    it('sets gauge to 1 for healthy services', async () => {
      healthChecks.runCritical.mockResolvedValue({
        details: { database: { status: 'up' }, redis: { status: 'up' } },
        status: 'ok',
      });

      await service.updateMetrics();

      expect(gauge.set).toHaveBeenCalledWith({ service: 'database' }, 1);
      expect(gauge.set).toHaveBeenCalledWith({ service: 'redis' }, 1);
    });

    it('sets gauge to 0 for unhealthy services', async () => {
      healthChecks.runCritical.mockResolvedValue({
        details: { database: { status: 'down' } },
        status: 'error',
      });

      await service.updateMetrics();

      expect(gauge.set).toHaveBeenCalledWith({ service: 'database' }, 0);
    });

    it('does not throw when result has no details', async () => {
      healthChecks.runCritical.mockResolvedValue({ status: 'ok' });

      await expect(service.updateMetrics()).resolves.toBeUndefined();
    });
  });
});
