import { Test } from '@nestjs/testing';

import { LoggerService } from '../../logger/logger.service';
import { CacheRedis } from './clients/cache.client';
import { ThrottlerRedis } from './clients/throttler.client';
import { RedisManagerService } from './redis-manager.service';

const makeRedisMock = (): Record<string, jest.Mock> => ({
  disconnect: jest.fn(),
  quit: jest.fn().mockResolvedValue('OK'),
  removeAllListeners: jest.fn(),
});

describe('RedisManagerService', () => {
  let service: RedisManagerService;
  let cacheMock: ReturnType<typeof makeRedisMock>;
  let throttlerMock: ReturnType<typeof makeRedisMock>;
  let logger: { error: jest.Mock };

  beforeEach(async () => {
    cacheMock = makeRedisMock();
    throttlerMock = makeRedisMock();
    logger = { error: jest.fn() };

    const cacheRedis = { getClient: jest.fn().mockReturnValue(cacheMock) };
    const throttlerRedis = { getClient: jest.fn().mockReturnValue(throttlerMock) };

    const module = await Test.createTestingModule({
      providers: [
        RedisManagerService,
        { provide: CacheRedis, useValue: cacheRedis },
        { provide: ThrottlerRedis, useValue: throttlerRedis },
        { provide: LoggerService, useValue: logger },
      ],
    }).compile();

    service = module.get(RedisManagerService);
  });

  describe('positive cases', () => {
    it('getCacheRedis returns cache redis client', () => {
      expect(service.getCacheRedis()).toBe(cacheMock);
    });

    it('getThrottlerRedis returns throttler redis client', () => {
      expect(service.getThrottlerRedis()).toBe(throttlerMock);
    });

    it('getClients returns both clients', () => {
      const clients = service.getClients();

      expect(clients).toHaveLength(2);
      expect(clients).toContain(cacheMock);
      expect(clients).toContain(throttlerMock);
    });

    it('destroy quits and disconnects all clients', async () => {
      await service.destroy();

      expect(cacheMock.quit).toHaveBeenCalled();
      expect(cacheMock.disconnect).toHaveBeenCalled();
      expect(throttlerMock.quit).toHaveBeenCalled();
      expect(throttlerMock.disconnect).toHaveBeenCalled();
    });

    it('destroy logs error when quit fails', async () => {
      cacheMock.quit.mockRejectedValue(new Error('quit failed'));

      await service.destroy();

      expect(logger.error).toHaveBeenCalled();
    });
  });
});
