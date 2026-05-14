import type { INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { TestingModule } from '@nestjs/testing';
import type { App } from 'supertest/types';

import { Test } from '@nestjs/testing';

import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/app.setup';

let app: INestApplication<App>;
let server: App;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = moduleFixture.createNestApplication<NestExpressApplication>();

  appSetup(app);

  server = app.getHttpServer();
  await app.init();
});

afterAll(async () => {
  await app.close();
});

export { app, server };
