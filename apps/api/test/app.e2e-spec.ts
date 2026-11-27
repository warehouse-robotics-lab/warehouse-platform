import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { getDatabaseLocation } from './../src/prisma/database-url';
import { PrismaService } from './../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let testDatabaseName: string;

  beforeEach(async () => {
    const testDatabaseUrl = process.env.TEST_DATABASE_URL;
    if (!testDatabaseUrl || process.env.DATABASE_URL !== testDatabaseUrl) {
      throw new Error(
        'E2E tests require DATABASE_URL to match TEST_DATABASE_URL before starting the application.',
      );
    }
    testDatabaseName = getDatabaseLocation(testDatabaseUrl).database;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer()).get('/health').expect(200).expect({
      status: 'ok',
      service: 'api',
    });
  });

  it('connects to the migrated test database', async () => {
    const prisma = app.get(PrismaService);
    const [{ databaseName }] = await prisma.$queryRaw<
      Array<{ databaseName: string }>
    >`SELECT current_database() AS "databaseName"`;

    expect(databaseName).toBe(testDatabaseName);
    await expect(prisma.user.count()).resolves.toEqual(expect.any(Number));
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });
});
