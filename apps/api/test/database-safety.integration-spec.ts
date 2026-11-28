import { randomBytes } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import globalSetup from './integration.global-setup';

const hostname = process.env.TEST_DATABASE_URL
  ? new URL(process.env.TEST_DATABASE_URL).hostname
  : '';
const localDatabaseTest = ['localhost', '127.0.0.1'].includes(hostname)
  ? it
  : it.skip;

localDatabaseTest(
  'preserves data when two addresses point to the same database',
  async () => {
    const originalDatabaseUrl = process.env.DATABASE_URL;
    const originalTestDatabaseUrl = process.env.TEST_DATABASE_URL;
    if (!originalDatabaseUrl || !originalTestDatabaseUrl) {
      throw new Error('Database URLs are required for the safety test.');
    }
    const testUrl = new URL(originalTestDatabaseUrl);
    testUrl.searchParams.delete('schema');
    const alternateUrl = new URL(testUrl);

    alternateUrl.hostname =
      testUrl.hostname === 'localhost' ? '127.0.0.1' : 'localhost';

    const client = new PrismaClient({
      adapter: new PrismaPg({ connectionString: testUrl.toString() }),
    });
    const alternateClient = new PrismaClient({
      adapter: new PrismaPg({ connectionString: alternateUrl.toString() }),
    });
    const schema = `guard_${randomBytes(8).toString('hex')}`;
    let created = false;

    try {
      await client.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
      created = true;
      await client.$executeRawUnsafe(
        `CREATE TABLE "${schema}"."sentinel" (value text NOT NULL)`,
      );
      await client.$executeRawUnsafe(
        `INSERT INTO "${schema}"."sentinel" (value) VALUES ('keep')`,
      );

      const before = await alternateClient.$queryRawUnsafe<
        Array<{ value: string }>
      >(`SELECT value FROM "${schema}"."sentinel"`);
      expect(before).toEqual([{ value: 'keep' }]);

      process.env.DATABASE_URL = alternateUrl.toString();
      testUrl.searchParams.set('schema', schema);
      process.env.TEST_DATABASE_URL = testUrl.toString();

      await expect(globalSetup()).rejects.toThrow(/same database/i);
      const after = await client.$queryRawUnsafe<Array<{ value: string }>>(
        `SELECT value FROM "${schema}"."sentinel"`,
      );
      expect(after).toEqual([{ value: 'keep' }]);
    } finally {
      process.env.DATABASE_URL = originalDatabaseUrl;
      process.env.TEST_DATABASE_URL = originalTestDatabaseUrl;
      try {
        if (created) {
          await client.$executeRawUnsafe(
            `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
          );
        }
      } finally {
        await Promise.all([
          client.$disconnect(),
          alternateClient.$disconnect(),
        ]);
      }
    }
  },
);
