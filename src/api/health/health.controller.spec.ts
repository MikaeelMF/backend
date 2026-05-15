import { Test } from '@nestjs/testing';

import { HealthChecks } from '../../modules/health/health.checks';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let healthChecks: { runAll: jest.Mock; runCritical: jest.Mock };

  beforeEach(async () => {
    healthChecks = {
      runAll: jest.fn().mockResolvedValue({ details: {}, status: 'ok' }),
      runCritical: jest.fn().mockResolvedValue({ details: {}, status: 'ok' }),
    };

    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthChecks, useValue: healthChecks }],
    }).compile();

    controller = module.get(HealthController);
  });

  describe('positive cases', () => {
    it('deps calls healthChecks.runAll', async () => {
      const result = await controller.deps();

      expect(healthChecks.runAll).toHaveBeenCalled();
      expect(result).toEqual({ details: {}, status: 'ok' });
    });

    it('ready calls healthChecks.runCritical', async () => {
      const result = await controller.ready();

      expect(healthChecks.runCritical).toHaveBeenCalled();
      expect(result).toEqual({ details: {}, status: 'ok' });
    });
  });
});
