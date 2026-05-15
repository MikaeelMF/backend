import { RequestTrackingService } from './request-tracking.service';

describe('RequestTrackingService', () => {
  let service: RequestTrackingService;

  beforeEach(() => {
    service = new RequestTrackingService();
  });

  describe('negative cases', () => {
    it('decrement below zero', () => {
      service.decrement();

      expect(service.getActiveRequests()).toBe(-1);
    });

    it('waitForRequestsToFinish resolves immediately when no active requests', async () => {
      await expect(service.waitForRequestsToFinish(1000)).resolves.toBeUndefined();
    });

    it('waitForRequestsToFinish times out when requests remain', async () => {
      service.increment();

      const start = Date.now();
      await service.waitForRequestsToFinish(150);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(150);
    });
  });

  describe('positive cases', () => {
    it('starts at zero', () => {
      expect(service.getActiveRequests()).toBe(0);
    });

    it('increment increases count', () => {
      service.increment();

      expect(service.getActiveRequests()).toBe(1);
    });

    it('decrement decreases count', () => {
      service.increment();
      service.increment();
      service.decrement();

      expect(service.getActiveRequests()).toBe(1);
    });

    it('multiple increments accumulate', () => {
      service.increment();
      service.increment();
      service.increment();

      expect(service.getActiveRequests()).toBe(3);
    });

    it('waitForRequestsToFinish resolves when requests finish', async () => {
      service.increment();

      setTimeout(() => service.decrement(), 50);

      await expect(service.waitForRequestsToFinish(1000)).resolves.toBeUndefined();
    });
  });
});
