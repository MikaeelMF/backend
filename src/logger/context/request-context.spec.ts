import { RequestContext } from './request-context';

describe('RequestContext', () => {
  describe('negative cases', () => {
    it('returns empty string when no context is set', () => {
      expect(RequestContext.getCorrelationId()).toBe('');
    });
  });

  describe('positive cases', () => {
    it('returns correlationId set via run', (done) => {
      RequestContext.run('abc-123', () => {
        expect(RequestContext.getCorrelationId()).toBe('abc-123');
        done();
      });
    });

    it('isolates context per run call', (done) => {
      let inner = '';

      RequestContext.run('outer', () => {
        RequestContext.run('inner', () => {
          inner = RequestContext.getCorrelationId();
        });

        expect(RequestContext.getCorrelationId()).toBe('outer');
        expect(inner).toBe('inner');
        done();
      });
    });

    it('returns empty string outside run callback', (done) => {
      RequestContext.run('temp', () => {
        expect(RequestContext.getCorrelationId()).toBe('temp');
        done();
      });

      expect(RequestContext.getCorrelationId()).toBe('');
    });
  });
});
