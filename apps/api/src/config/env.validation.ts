import { z } from 'zod';

const environmentSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
});

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(
  config: Record<string, unknown>,
): Environment {
  return environmentSchema.parse(config);
}
