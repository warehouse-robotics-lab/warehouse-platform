import {
  getDatabaseLocation,
  getDatabaseSchema,
  mayBeSameDatabase,
} from './database-url';

describe('getDatabaseSchema', () => {
  it('returns undefined when schema is not specified', () => {
    expect(
      getDatabaseSchema(
        'postgresql://warehouse:warehouse@localhost:5432/warehouse',
      ),
    ).toBeUndefined();
  });

  it('returns the schema from the connection URL', () => {
    expect(
      getDatabaseSchema(
        'postgresql://warehouse:warehouse@localhost:5432/warehouse?schema=warehouse_api',
      ),
    ).toBe('warehouse_api');
  });

  it('returns undefined for an empty schema value', () => {
    expect(
      getDatabaseSchema(
        'postgresql://warehouse:warehouse@localhost:5432/warehouse?schema=',
      ),
    ).toBeUndefined();
  });

  it('decodes a percent-encoded schema value', () => {
    expect(
      getDatabaseSchema(
        'postgresql://warehouse:warehouse@localhost:5432/warehouse?schema=warehouse%5Fapi',
      ),
    ).toBe('warehouse_api');
  });
});

describe('getDatabaseLocation', () => {
  it('returns the normalized physical database location', () => {
    expect(
      getDatabaseLocation(
        'postgresql://warehouse:warehouse@LOCALHOST/warehouse%5Ftest?schema=warehouse_api',
      ),
    ).toEqual({
      host: 'localhost',
      port: '5432',
      database: 'warehouse_test',
    });
  });
});

describe('mayBeSameDatabase', () => {
  const testDatabase =
    'postgresql://warehouse:warehouse@localhost:5432/warehouse_test?schema=warehouse_api';

  it('ignores credentials, schema and other query parameters', () => {
    expect(
      mayBeSameDatabase(
        'postgres://another:secret@localhost:5432/warehouse_test?schema=public&sslmode=disable',
        testDatabase,
      ),
    ).toBe(true);
  });

  it('treats a missing port as the default PostgreSQL port', () => {
    expect(
      mayBeSameDatabase(
        'postgresql://warehouse:warehouse@localhost/warehouse_test',
        testDatabase,
      ),
    ).toBe(true);
  });

  it('compares host names case-insensitively', () => {
    expect(
      mayBeSameDatabase(
        'postgresql://warehouse:warehouse@LOCALHOST:5432/warehouse_test',
        testDatabase,
      ),
    ).toBe(true);
  });

  it('distinguishes databases on the same server', () => {
    expect(
      mayBeSameDatabase(
        'postgresql://warehouse:warehouse@localhost:5432/warehouse',
        testDatabase,
      ),
    ).toBe(false);
  });

  it('treats the same name on different ports as potentially the same database', () => {
    expect(
      mayBeSameDatabase(
        'postgresql://warehouse:warehouse@localhost:5433/warehouse_test',
        testDatabase,
      ),
    ).toBe(true);
  });

  it('treats the same name on different hosts as potentially the same database', () => {
    expect(
      mayBeSameDatabase(
        'postgresql://warehouse:warehouse@127.0.0.1:5432/warehouse_test',
        testDatabase,
      ),
    ).toBe(true);
  });

  it('treats ambiguous encoded names as potentially the same database', () => {
    expect(
      mayBeSameDatabase(
        'postgresql://warehouse:warehouse@localhost:5432/warehouse%2Ftest',
        'postgresql://warehouse:warehouse@127.0.0.1:5432/warehouse%252Ftest',
      ),
    ).toBe(true);
  });
});
