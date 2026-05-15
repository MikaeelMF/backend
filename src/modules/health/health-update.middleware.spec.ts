import type { NextFunction, Request, Response } from 'express';

import { Test } from '@nestjs/testing';

import { HealthMetricsService } from '../health/health-metrics.service';
import { HealthUpdateMiddleware } from './middlewares/health-update.middleware';

describe('HealthUpdateMiddleware', () => {
  let middleware: HealthUpdateMiddleware;
  let healthMetricsService: { updateMetrics: jest.Mock };

  beforeEach(async () => {
    healthMetricsService = {
      updateMetrics: jest.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      providers: [HealthUpdateMiddleware, { provide: HealthMetricsService, useValue: healthMetricsService }],
    }).compile();

    middleware = module.get(HealthUpdateMiddleware);
  });

  describe('negative cases', () => {
    it('does not call updateMetrics for non-metrics paths', async () => {
      const req = { path: '/health' } as Request;
      const next = jest.fn() as NextFunction;

      await middleware.use(req, {} as Response, next);

      expect(healthMetricsService.updateMetrics).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('does not call updateMetrics for arbitrary paths', async () => {
      const req = { path: '/api/todos' } as Request;
      const next = jest.fn() as NextFunction;

      await middleware.use(req, {} as Response, next);

      expect(healthMetricsService.updateMetrics).not.toHaveBeenCalled();
    });
  });

  describe('positive cases', () => {
    it('calls updateMetrics when path is /metrics', async () => {
      const req = { path: '/metrics' } as Request;
      const next = jest.fn() as NextFunction;

      await middleware.use(req, {} as Response, next);

      expect(healthMetricsService.updateMetrics).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });
});
