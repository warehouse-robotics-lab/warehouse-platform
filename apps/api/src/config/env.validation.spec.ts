import { validateEnvironment } from './env.validation';

const databaseUrl = 'postgresql://warehouse:warehouse@localhost:5432/warehouse';

describe('validateEnvironment', () => {
  it('uses port 3001 when PORT is not specified', () => {
    expect(validateEnvironment({ DATABASE_URL: databaseUrl })).toEqual({
      PORT: 3001,
      DATABASE_URL: databaseUrl,
    });
  });

  it('coerces a valid PORT value to a number', () => {
    expect(
      validateEnvironment({ PORT: '4000', DATABASE_URL: databaseUrl }),
    ).toEqual({
      PORT: 4000,
      DATABASE_URL: databaseUrl,
    });
  });

  it.each(['0', '65536', 'not-a-number'])(
    'rejects invalid PORT value %s',
    (PORT) => {
      expect(() =>
        validateEnvironment({ PORT, DATABASE_URL: databaseUrl }),
      ).toThrow();
    },
  );

  it('requires DATABASE_URL', () => {
    expect(() => validateEnvironment({})).toThrow();
  });

  it.each([
    'not-a-url',
    'mysql://warehouse:warehouse@localhost:5432/warehouse',
    'postgres://',
  ])('rejects invalid DATABASE_URL value %s', (DATABASE_URL) => {
    expect(() => validateEnvironment({ DATABASE_URL })).toThrow();
  });
});
