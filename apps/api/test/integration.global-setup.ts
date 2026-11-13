import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { config as loadEnv } from 'dotenv';
import { PrismaClient } from '../src/generated/prisma/client';

const appRoot = path.resolve(__dirname, '..');
const schemaNamePattern = /^[A-Za-z_][A-Za-z0-9_]*$/;

function readTestDatabase(): { databaseUrl: string; schema: string } {
  loadEnv({ path: path.join(appRoot, '.env'), quiet: true });

  const databaseUrl = process.env.TEST_DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'TEST_DATABASE_URL is not set. Add it to apps/api/.env and try again.',
    );
  }

  const url = new URL(databaseUrl);
  const databaseName = url.pathname.replace(/^\/+/, '');
  const schema = url.searchParams.get('schema');

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

  if (schema === 'public' || !schemaNamePattern.test(schema)) {
    throw new Error(
      'TEST_DATABASE_URL must use a valid, non-public schema name.',
    );
  }

  return { databaseUrl, schema };
}

export default async function globalSetup(): Promise<void> {
  const { databaseUrl, schema } = readTestDatabase();
  const adminUrl = new URL(databaseUrl);
  adminUrl.searchParams.delete('schema');

  const admin = new PrismaClient({
    adapter: new PrismaPg({ connectionString: adminUrl.toString() }),
  });

  try {
    await admin.$executeRawUnsafe(
      'DROP TABLE IF EXISTS "public"."User" CASCADE',
    );
    await admin.$executeRawUnsafe(
      'DROP TABLE IF EXISTS "public"."_prisma_migrations" CASCADE',
    );
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
