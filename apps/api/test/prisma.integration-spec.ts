import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Prisma integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('connects to PostgreSQL through Prisma', async () => {
    const result = await prisma.$queryRaw<Array<{ value: number }>>`
      SELECT 1 AS value
    `;

    expect(result).toEqual([{ value: 1 }]);
  });

  it('queries the User model through Prisma Client', async () => {
    await expect(prisma.user.count()).resolves.toEqual(expect.any(Number));
  });

  it('has the User table with the expected columns', async () => {
    const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'User'
      ORDER BY ordinal_position
    `;

    expect(columns.map(({ column_name }) => column_name)).toEqual([
      'uuid',
      'email',
      'password',
      'name',
      'createdAt',
      'updatedAt',
    ]);
  });

  it('has a unique index on email', async () => {
    const indexes = await prisma.$queryRaw<Array<{ indexdef: string }>>`
      SELECT indexdef
      FROM pg_indexes
      WHERE schemaname = current_schema()
        AND tablename = 'User'
    `;

    expect(
      indexes.some(({ indexdef }) =>
        /UNIQUE INDEX .*\(email\)/i.test(indexdef),
      ),
    ).toBe(true);
  });
});
