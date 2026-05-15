import type { CallHandler, ExecutionContext } from '@nestjs/common';

import { HttpStatus } from '@nestjs/common';
import { of } from 'rxjs';

import { UnifiedResponseInterceptor } from './unified-response.interceptor';

const makeContext = (path: string): { ctx: ExecutionContext; res: { status: jest.Mock } } => {
  const res = { status: jest.fn().mockReturnThis() };

  return {
    ctx: {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ path }),
        getResponse: jest.fn().mockReturnValue(res),
      }),
    } as unknown as ExecutionContext,
    res,
  };
};

const makeHandler = (data: unknown): CallHandler => ({
  handle: jest.fn().mockReturnValue(of(data)),
});

describe('UnifiedResponseInterceptor', () => {
  let interceptor: UnifiedResponseInterceptor<unknown>;

  beforeEach(() => {
    interceptor = new UnifiedResponseInterceptor({ excludeEndpoints: ['/health', '/metrics'] });
  });

  describe('negative cases', () => {
    it('returns raw data for excluded endpoints', (done) => {
      const { ctx } = makeContext('/health');
      const data = { status: 'ok' };

      interceptor.intercept(ctx, makeHandler(data)).subscribe((result) => {
        expect(result).toBe(data);
        done();
      });
    });

    it('sets NO_CONTENT status and returns void for empty object', (done) => {
      const { ctx, res } = makeContext('/api/todos');

      interceptor.intercept(ctx, makeHandler({})).subscribe((result) => {
        expect(res.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
        expect(result).toBeUndefined();
        done();
      });
    });

    it('returns void for null data', (done) => {
      const { ctx, res } = makeContext('/api/todos');

      interceptor.intercept(ctx, makeHandler(null)).subscribe((result) => {
        expect(res.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
        expect(result).toBeUndefined();
        done();
      });
    });
  });

  describe('positive cases', () => {
    it('wraps response in data property', (done) => {
      const { ctx } = makeContext('/api/todos');
      const data = { id: '1', title: 'Test' };

      interceptor.intercept(ctx, makeHandler(data)).subscribe((result) => {
        expect(result).toEqual({ data });
        done();
      });
    });

    it('extracts meta and data when meta present', (done) => {
      const { ctx } = makeContext('/api/todos');
      const responseData = { data: [{ id: '1' }], meta: { total: 1 } };

      interceptor.intercept(ctx, makeHandler(responseData)).subscribe((result) => {
        expect(result).toEqual({ data: [{ id: '1' }], meta: { total: 1 } });
        done();
      });
    });

    it('wraps non-data-keyed objects in data', (done) => {
      const { ctx } = makeContext('/api/todos');
      const payload = { name: 'test', value: 42 };

      interceptor.intercept(ctx, makeHandler(payload)).subscribe((result) => {
        expect(result).toEqual({ data: payload });
        done();
      });
    });

    it('passes through raw data for second excluded endpoint', (done) => {
      const { ctx } = makeContext('/metrics');
      const data = { metric: 'value' };

      interceptor.intercept(ctx, makeHandler(data)).subscribe((result) => {
        expect(result).toBe(data);
        done();
      });
    });
  });
});
