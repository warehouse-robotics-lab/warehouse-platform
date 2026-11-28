import { execFileSync } from 'node:child_process';
import globalSetup from '../../test/integration.global-setup';

const mockQueryRaw = jest.fn();
const mockExecuteRawUnsafe = jest.fn();
const mockDisconnect = jest.fn();

jest.mock('node:child_process', () => ({ execFileSync: jest.fn() }));
jest.mock('dotenv', () => ({ config: jest.fn() }));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: jest.fn() }));
jest.mock('../generated/prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $queryRaw: mockQueryRaw,
    $executeRawUnsafe: mockExecuteRawUnsafe,
    $disconnect: mockDisconnect,
  })),
}));

describe('test database setup public schema protection', () => {
  const originalEnvironment = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DATABASE_URL =
      'postgresql://warehouse:warehouse@localhost:5433/warehouse';
    process.env.TEST_DATABASE_URL =
      'postgresql://warehouse:warehouse@localhost:5433/warehouse_test?schema=warehouse_api';
    mockQueryRaw.mockResolvedValue([{ exists: false }]);
  });

  afterEach(() => {
    process.env = { ...originalEnvironment };
  });

  it('rejects the same database name even when the hosts differ', async () => {
    process.env.DATABASE_URL =
      'postgresql://warehouse:warehouse@localhost:5433/warehouse_test';
    process.env.TEST_DATABASE_URL =
      'postgresql://warehouse:warehouse@127.0.0.1:5433/warehouse_test?schema=warehouse_api';

    await expect(globalSetup()).rejects.toThrow(/same database/i);
    expect(mockExecuteRawUnsafe).not.toHaveBeenCalled();
    expect(execFileSync).not.toHaveBeenCalled();
  });

  it('requires the application database URL before deleting the test schema', async () => {
    delete process.env.DATABASE_URL;

    await expect(globalSetup()).rejects.toThrow(/DATABASE_URL is not set/i);
    expect(mockExecuteRawUnsafe).not.toHaveBeenCalled();
    expect(execFileSync).not.toHaveBeenCalled();
  });

  it.each(['User', 'Warehouse'])(
    'stops before deleting the test schema when public.%s exists',
    async (table) => {
      mockQueryRaw.mockImplementation(
        (strings: TemplateStringsArray, ...values: string[]) => {
          const sql = strings.join('') + values.join('');
          return Promise.resolve([
            { exists: sql.includes(`public."${table}"`) },
          ]);
        },
      );

      await expect(globalSetup()).rejects.toThrow(`"public"."${table}"`);
      expect(mockExecuteRawUnsafe).not.toHaveBeenCalled();
      expect(execFileSync).not.toHaveBeenCalled();
      expect(mockDisconnect).toHaveBeenCalledTimes(1);
    },
  );

  it('resets only the dedicated schema when neither public table exists', async () => {
    await globalSetup();

    expect(mockExecuteRawUnsafe.mock.calls).toEqual([
      ['DROP SCHEMA IF EXISTS "warehouse_api" CASCADE'],
      ['CREATE SCHEMA "warehouse_api"'],
    ]);
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
    expect(execFileSync).toHaveBeenCalledTimes(1);
    const [executable, args, options] = jest.mocked(execFileSync).mock.calls[0];
    expect(executable).toBe(process.execPath);
    expect(args).toEqual(expect.arrayContaining(['migrate', 'deploy']));
    expect(options).toHaveProperty(
      'env.DATABASE_URL',
      'postgresql://warehouse:warehouse@localhost:5433/warehouse_test?schema=warehouse_api',
    );
  });
});
