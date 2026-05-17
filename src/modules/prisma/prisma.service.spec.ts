jest.mock('../../../database-manager/generated/client', () => {
  class MockPrismaClient {
    $connect = jest.fn().mockResolvedValue(undefined);
    $queryRaw = jest.fn().mockResolvedValue([]);
  }

  return { PrismaClient: MockPrismaClient };
});

jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn().mockImplementation(() => ({})),
}));

import type { LoggerService } from '../../logger/logger.service';

import { PrismaService } from './prisma.service';

const makeService = (failFast = false): [PrismaService, { error: jest.Mock }] => {
  const logger = { error: jest.fn() };
  const config = {
    databaseFailFast: failFast,
    databaseLogLevels: [],
    databaseUrl: 'postgresql://test:test@localhost:5432/test',
  };

  const service = new PrismaService(config as never, logger as unknown as LoggerService);

  return [service, logger];
};

describe('PrismaService', () => {
  describe('positive cases', () => {
    it('onModuleInit connects without error', async () => {
      const [service] = makeService();

      await expect(service.onModuleInit()).resolves.toBeUndefined();
    });
  });

  describe('negative cases', () => {
    it('logs error when connect fails and databaseFailFast is false', async () => {
      const [service, logger] = makeService(false);
      jest.spyOn(service, '$connect').mockRejectedValue(new Error('connection refused'));

      await service.onModuleInit();

      expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Prisma failed' }));
    });

    it('calls process.exit(1) when connect fails and databaseFailFast is true', async () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      const [service] = makeService(true);
      jest.spyOn(service, '$connect').mockRejectedValue(new Error('connection refused'));

      await service.onModuleInit();

      expect(exitSpy).toHaveBeenCalledWith(1);
      exitSpy.mockRestore();
    });
  });
});
