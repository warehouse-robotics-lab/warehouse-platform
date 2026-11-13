import { getDatabaseSchema } from './database-url';

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
