import { registerAs } from '@nestjs/config';
import { ConfigFactory } from '@nestjs/config/dist/interfaces';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

import { validateConfig } from '../common/utils/validate-config.util';
import { ThrottlerConfigInterface } from './interfaces/throttler-config.interface';

class ThrottlerConfig {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  THROTTLE_LIMIT = 2;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  THROTTLE_TTL = 20000;
}

export const throttlerConfig = registerAs<ThrottlerConfig, ConfigFactory<ThrottlerConfigInterface>>(
  'throttlerConfig',
  (): ThrottlerConfigInterface => {
    const config = validateConfig(ThrottlerConfig);

    return {
      throttlerLimit: process.env.NODE_ENV === 'test' ? 10000 : config.THROTTLE_LIMIT,
      throttlerTtl: process.env.NODE_ENV === 'test' ? 20000000 : config.THROTTLE_TTL,
    };
  },
);
