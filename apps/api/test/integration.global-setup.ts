import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { config as loadEnv } from 'dotenv';
import { PrismaClient } from '../src/generated/prisma/client';
import {
  getDatabaseLocation,
  isSameDatabase,
} from '../src/prisma/database-url';

const appRoot = path.resolve(__dirname, '..');
const schemaNamePattern = /^[A-Za-z_][A-Za-z0-9_]*$/;
const systemSchemaPattern = /^pg_/i;

function readTestDatabase(): {
  databaseUrl: string;
  databaseName: string;
  schema: string;
} {
  loadEnv({ path: path.join(appRoot, '.env'), quiet: true });

  const databaseUrl = process.env.TEST_DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'TEST_DATABASE_URL is not set. Add it to apps/api/.env and try again.',
    );
  }

  const { database: databaseName } = getDatabaseLocation(databaseUrl);
  const schema = new URL(databaseUrl).searchParams.get('schema');

  if (!databaseName.endsWith('_test')) {
    throw new Error(
      'TEST_DATABASE_URL must point to a database whose name ends with _test.',
    );
  }

  if (!schema) {
    throw new Error(
      'TEST_DATABASE_URL must include a non-public ?schema= parameter.',
    );
  }

  if (
    schema.toLowerCase() === 'public' ||
    schema.toLowerCase() === 'information_schema' ||
    systemSchemaPattern.test(schema) ||
    !schemaNamePattern.test(schema)
  ) {
    throw new Error(
      'TEST_DATABASE_URL must use a valid, non-public, non-system schema name.',
    );
  }

  const applicationDatabaseUrl = process.env.DATABASE_URL;

  if (
    applicationDatabaseUrl &&
    isSameDatabase(applicationDatabaseUrl, databaseUrl)
  ) {
    throw new Error(
      'DATABASE_URL and TEST_DATABASE_URL point to the same database. Integration tests delete and recreate the test schema, so TEST_DATABASE_URL must use a separate database.',
    );
  }

  return { databaseUrl, databaseName, schema };
}

async function assertNoPublicTables(
  admin: PrismaClient,
  databaseName: string,
  schema: string,
): Promise<void> {
  for (const table of ['User', 'Warehouse']) {
    const [{ exists }] = await admin.$queryRaw<Array<{ exists: boolean }>>`
      SELECT to_regclass(${`public."${table}"`}) IS NOT NULL AS "exists"
    `;

    if (exists) {
      throw new Error(
        `Found table "public"."${table}" in test database "${databaseName}". Test setup only resets the dedicated schema "${schema}" and does not delete objects in the "public" schema. Verify that the table belongs to another test suite, or remove it manually if it is a leftover from this suite.`,
      );
    }
  }
}

export default async function globalSetup(): Promise<void> {
  const { databaseUrl, databaseName, schema } = readTestDatabase();
  const adminUrl = new URL(databaseUrl);
  adminUrl.searchParams.delete('schema');

  const admin = new PrismaClient({
    adapter: new PrismaPg({ connectionString: adminUrl.toString() }),
  });

  try {
    await assertNoPublicTables(admin, databaseName, schema);
    await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
  } finally {
    await admin.$disconnect();
  }

  execFileSync(
    process.execPath,
    [
      path.join(appRoot, 'node_modules/prisma/build/index.js'),
      'migrate',
      'deploy',
    ],
    {
      cwd: appRoot,
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'inherit',
    },
  );
}
