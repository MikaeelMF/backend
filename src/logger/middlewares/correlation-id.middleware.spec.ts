import type { NextFunction, Request, Response } from 'express';

import { correlationIdMiddleware } from './correlation-id.middleware';

const makeRes = (): { setHeader: jest.Mock } => ({ setHeader: jest.fn() });

const makeReq = (correlationId?: string): Request =>
  ({
    headers: correlationId ? { 'x-correlation-id': correlationId } : {},
  }) as unknown as Request;

describe('correlationIdMiddleware', () => {
  describe('positive cases', () => {
    it('uses existing correlationId from header', (done) => {
      const req = makeReq('existing-id');
      const res = makeRes();
      const next: NextFunction = () => {
        expect(req.headers['x-correlation-id']).toBe('existing-id');
        done();
      };

      correlationIdMiddleware(req, res as unknown as Response, next);
    });

    it('generates a UUID when header is absent', (done) => {
      const req = makeReq();
      const res = makeRes();
      const next: NextFunction = () => {
        expect(req.headers['x-correlation-id']).toMatch(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/);
        done();
      };

      correlationIdMiddleware(req, res as unknown as Response, next);
    });

    it('sets the correlationId as response header', (done) => {
      const req = makeReq('test-id');
      const res = makeRes();
      const next: NextFunction = () => {
        expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-Id', 'test-id');
        done();
      };

      correlationIdMiddleware(req, res as unknown as Response, next);
    });

    it('calls next', () => {
      const req = makeReq('id');
      const res = makeRes();
      const next = jest.fn() as NextFunction;

      correlationIdMiddleware(req, res as unknown as Response, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
