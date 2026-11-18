import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { getDatabaseSchema } from '../src/prisma/database-url';
import { PrismaService } from '../src/prisma/prisma.service';

const schema = getDatabaseSchema(process.env.DATABASE_URL ?? '') ?? 'public';

describe('Prisma integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const validUser = {
    email: 'user@example.com',
    password: 'hashed-password',
    name: 'Test User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
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

  it('rejects a duplicate email', async () => {
    await prisma.user.create({ data: validUser });

    await expect(prisma.user.create({ data: validUser })).rejects.toMatchObject(
      { code: 'P2002' },
    );
    await expect(prisma.user.count()).resolves.toBe(1);
  });

  it('rejects a duplicate email in another case', async () => {
    await prisma.user.create({ data: validUser });

    await expect(
      prisma.user.create({
        data: { ...validUser, email: 'USER@EXAMPLE.COM' },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });
    await expect(prisma.user.count()).resolves.toBe(1);
  });

  it.each([
    ['empty email', { email: '' }],
    ['whitespace email', { email: '   ' }],
    ['empty password', { password: '' }],
    ['whitespace password', { password: '   ' }],
    ['empty name', { name: '' }],
    ['whitespace name', { name: '   ' }],
  ])('rejects %s', async (_case, overrides) => {
    await expect(
      prisma.user.create({ data: { ...validUser, ...overrides } }),
    ).rejects.toThrow();
    await expect(prisma.user.count()).resolves.toBe(0);
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

  it('has a case-insensitive unique index on email in the configured schema', async () => {
    const indexes = await prisma.$queryRaw<Array<{ indexdef: string }>>`
      SELECT indexdef
      FROM pg_indexes
      WHERE schemaname = ${schema}
        AND tablename = 'User'
    `;

    expect(
      indexes.some(({ indexdef }) =>
        /UNIQUE INDEX .*lower\(btrim\("?email"?\)\)/i.test(indexdef),
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
