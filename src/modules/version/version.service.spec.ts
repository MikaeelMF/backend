import { Test } from '@nestjs/testing';

import { appConfig } from '../../config/app.config';
import { VersionService } from './version.service';

describe('VersionService', () => {
  let service: VersionService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [VersionService, { provide: appConfig.KEY, useValue: { appVersion: '1.2.3' } }],
    }).compile();

    service = module.get(VersionService);
  });

  describe('positive cases', () => {
    it('returns the app version from config', () => {
      expect(service.getVersion()).toBe('1.2.3');
    });
  });
});
