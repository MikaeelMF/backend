import { Test } from '@nestjs/testing';

import { EnvironmentType } from '../config/enums/environment.enum';
import { environmentConfig } from '../config/environment.config';
import { logConfig } from '../config/log.config';
import { EnvironmentService } from '../modules/environment/environment.service';
import { LoggerService } from './logger.service';

const makeModule = async (logPretty = false): Promise<LoggerService> => {
  const module = await Test.createTestingModule({
    providers: [
      LoggerService,
      EnvironmentService,
      { provide: environmentConfig.KEY, useValue: { env: EnvironmentType.test } },
      {
        provide: logConfig.KEY,
        useValue: { logExcludeEndpoints: [], logLevel: 'silent', logPretty },
      },
    ],
  }).compile();

  return module.get(LoggerService);
};

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(async () => {
    service = await makeModule();
  });

  describe('positive cases', () => {
    it('creates service with logPretty enabled', async () => {
      await expect(makeModule(true)).resolves.toBeDefined();
    });

    it('log does not throw', () => {
      expect(() => service.log({ ctx: 'test', msg: 'hello' })).not.toThrow();
    });

    it('error does not throw', () => {
      expect(() => service.error({ ctx: 'test', msg: 'error occurred' })).not.toThrow();
    });

    it('warn does not throw', () => {
      expect(() => service.warn({ ctx: 'test', msg: 'warning' })).not.toThrow();
    });

    it('debug does not throw', () => {
      expect(() => service.debug({ ctx: 'test', msg: 'debug info' })).not.toThrow();
    });

    it('setAppName does not throw', () => {
      expect(() => service.setAppName('MyApp')).not.toThrow();
    });

    it('log accepts optional fields without throwing', () => {
      expect(() =>
        service.log({
          code: 'ERR_CODE',
          ctx: 'test',
          details: { key: 'val' },
          method: 'GET',
          msg: 'test',
          path: '/api',
        }),
      ).not.toThrow();
    });

    it('error accepts stack without throwing', () => {
      expect(() => service.error({ ctx: 'test', msg: 'err', stack: 'Error: msg\n  at ...' })).not.toThrow();
    });
  });
});
