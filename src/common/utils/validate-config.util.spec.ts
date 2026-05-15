import 'reflect-metadata';
import { IsIn, IsString } from 'class-validator';

import { validateConfig } from './validate-config.util';

class StrictConfig {
  @IsIn(['allowed'])
  REQUIRED_VAR = 'not-allowed';
}

class ValidConfig {
  @IsString()
  TEST_VAR = '';
}

describe('validateConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('negative cases', () => {
    it('throws when env var has invalid value', () => {
      process.env.REQUIRED_VAR = 'invalid-value';

      expect(() => validateConfig(StrictConfig)).toThrow('Please provide the valid ENVs');
    });
  });

  describe('positive cases', () => {
    it('returns config instance when env vars are valid', () => {
      process.env.TEST_VAR = 'hello';

      const result = validateConfig(ValidConfig);

      expect(result.TEST_VAR).toBe('hello');
    });

    it('returns an instance of the config class', () => {
      process.env.TEST_VAR = 'test';

      const result = validateConfig(ValidConfig);

      expect(result).toBeInstanceOf(ValidConfig);
    });
  });
});
