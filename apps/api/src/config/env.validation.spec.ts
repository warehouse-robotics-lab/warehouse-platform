import { validateEnvironment } from './env.validation';

describe('validateEnvironment', () => {
  it('uses port 3000 when PORT is not specified', () => {
    expect(validateEnvironment({})).toEqual({ PORT: 3000 });
  });

  it('coerces a valid PORT value to a number', () => {
    expect(validateEnvironment({ PORT: '4000' })).toEqual({ PORT: 4000 });
  });

  it.each(['0', '65536', 'not-a-number'])(
    'rejects invalid PORT value %s',
    (PORT) => {
      expect(() => validateEnvironment({ PORT })).toThrow();
    },
  );
});
