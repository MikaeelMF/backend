import { Test } from '@nestjs/testing';

import { EnvironmentType } from '../../config/enums/environment.enum';
import { environmentConfig } from '../../config/environment.config';
import { EnvironmentService } from './environment.service';

const makeService = async (env: EnvironmentType): Promise<EnvironmentService> => {
  const module = await Test.createTestingModule({
    providers: [EnvironmentService, { provide: environmentConfig.KEY, useValue: { env } }],
  }).compile();

  return module.get(EnvironmentService);
};

describe('EnvironmentService', () => {
  describe('negative cases', () => {
    it('isProduction returns false in test env', async () => {
      const service = await makeService(EnvironmentType.test);

      expect(service.isProduction()).toBe(false);
    });

    it('isTest returns false in production env', async () => {
      const service = await makeService(EnvironmentType.production);

      expect(service.isTest()).toBe(false);
    });

    it('isProduction returns false in development env', async () => {
      const service = await makeService(EnvironmentType.development);

      expect(service.isProduction()).toBe(false);
    });

    it('isTest returns false in development env', async () => {
      const service = await makeService(EnvironmentType.development);

      expect(service.isTest()).toBe(false);
    });
  });

  describe('positive cases', () => {
    it('getEnv returns the env value', async () => {
      const service = await makeService(EnvironmentType.test);

      expect(service.getEnv()).toBe(EnvironmentType.test);
    });

    it('isProduction returns true in production env', async () => {
      const service = await makeService(EnvironmentType.production);

      expect(service.isProduction()).toBe(true);
    });

    it('isTest returns true in test env', async () => {
      const service = await makeService(EnvironmentType.test);

      expect(service.isTest()).toBe(true);
    });

    it('getEnv returns development', async () => {
      const service = await makeService(EnvironmentType.development);

      expect(service.getEnv()).toBe(EnvironmentType.development);
    });
  });
});
