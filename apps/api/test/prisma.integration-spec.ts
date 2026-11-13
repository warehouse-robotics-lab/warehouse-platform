import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { getDatabaseSchema } from '../src/prisma/database-url';
import { PrismaService } from '../src/prisma/prisma.service';

const schema = getDatabaseSchema(process.env.DATABASE_URL ?? '') ?? 'public';

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

  it('uses a non-public schema from DATABASE_URL', () => {
    expect(schema).toBeDefined();
    expect(schema).not.toBe('public');
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

  it('has the User table with the expected columns in the configured schema', async () => {
    const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = ${schema}
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

  it('has a unique index on email in the configured schema', async () => {
    const indexes = await prisma.$queryRaw<Array<{ indexdef: string }>>`
      SELECT indexdef
      FROM pg_indexes
      WHERE schemaname = ${schema}
        AND tablename = 'User'
    `;

    expect(
      indexes.some(({ indexdef }) =>
        /UNIQUE INDEX .*\(email\)/i.test(indexdef),
      ),
    ).toBe(true);
  });

  it('does not create the User table in the public schema', async () => {
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename = 'User'
    `;

    expect(tables).toEqual([]);
  });
});
