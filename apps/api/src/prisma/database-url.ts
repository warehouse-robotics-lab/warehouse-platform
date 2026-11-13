export function getDatabaseSchema(databaseUrl: string): string | undefined {
  const schema = new URL(databaseUrl).searchParams.get('schema');

  return schema || undefined;
}
