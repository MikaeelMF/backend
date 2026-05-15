import { Test } from '@nestjs/testing';

import { LoggerService } from '../../logger/logger.service';
import { RequestTrackingService } from '../in-flight-requests/request-tracking.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisManagerService } from '../redis-manager/redis-manager.service';
import { ShutdownService } from './shutdown.servie';

describe('ShutdownService', () => {
  let service: ShutdownService;
  let logger: { error: jest.Mock; log: jest.Mock };
  let prisma: { $disconnect: jest.Mock };
  let redisManager: { destroy: jest.Mock };
  let requestTracking: { getActiveRequests: jest.Mock; waitForRequestsToFinish: jest.Mock };

  beforeEach(async () => {
    logger = { error: jest.fn(), log: jest.fn() };
    prisma = { $disconnect: jest.fn().mockResolvedValue(undefined) };
    redisManager = { destroy: jest.fn().mockResolvedValue([]) };
    requestTracking = {
      getActiveRequests: jest.fn().mockReturnValue(0),
      waitForRequestsToFinish: jest.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      providers: [
        ShutdownService,
        { provide: LoggerService, useValue: logger },
        { provide: PrismaService, useValue: prisma },
        { provide: RedisManagerService, useValue: redisManager },
        { provide: RequestTrackingService, useValue: requestTracking },
      ],
    }).compile();

    service = module.get(ShutdownService);
  });

  describe('positive cases', () => {
    it('isShuttingDown returns false initially', () => {
      expect(service.isShuttingDown()).toBe(false);
    });

    it('isShuttingDown returns true after shutdown starts', async () => {
      await service.onApplicationShutdown('SIGTERM');

      expect(service.isShuttingDown()).toBe(true);
    });

    it('disconnects prisma and redis on shutdown', async () => {
      await service.onApplicationShutdown('SIGTERM');

      expect(prisma.$disconnect).toHaveBeenCalled();
      expect(redisManager.destroy).toHaveBeenCalled();
    });

    it('logs shutdown started and completed', async () => {
      await service.onApplicationShutdown('SIGTERM');

      expect(logger.log).toHaveBeenCalledWith(
        expect.objectContaining({ msg: expect.stringContaining('Shutdown started') as string }),
      );
      expect(logger.log).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Shutdown completed' }));
    });

    it('waits for in-flight requests when active', async () => {
      requestTracking.getActiveRequests.mockReturnValue(2);

      await service.onApplicationShutdown();

      expect(requestTracking.waitForRequestsToFinish).toHaveBeenCalledWith(30000);
    });

    it('does not wait when no active requests', async () => {
      requestTracking.getActiveRequests.mockReturnValue(0);

      await service.onApplicationShutdown();

      expect(requestTracking.waitForRequestsToFinish).not.toHaveBeenCalled();
    });

    it('logs error when prisma disconnect fails', async () => {
      prisma.$disconnect.mockRejectedValue(new Error('disconnect failed'));

      await service.onApplicationShutdown();

      expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Shutdown failed' }));
    });

    it('works without signal parameter', async () => {
      await expect(service.onApplicationShutdown()).resolves.toBeUndefined();
    });
  });
});
