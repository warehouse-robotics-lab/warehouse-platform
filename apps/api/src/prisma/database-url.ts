export interface DatabaseLocation {
  host: string;
  port: string;
  database: string;
}

export function getDatabaseSchema(databaseUrl: string): string | undefined {
  const schema = new URL(databaseUrl).searchParams.get('schema');

  return schema || undefined;
}

export function getDatabaseLocation(databaseUrl: string): DatabaseLocation {
  const url = new URL(databaseUrl);

  return {
    host: url.hostname.toLowerCase(),
    port: url.port || '5432',
    database: decodeURIComponent(url.pathname.replace(/^\/+/, '')),
  };
}

export function mayBeSameDatabase(first: string, second: string): boolean {
  const firstLocation = getDatabaseLocation(first);
  const secondLocation = getDatabaseLocation(second);
  const unambiguousName = /^[A-Za-z0-9_-]+$/;

  return (
    !unambiguousName.test(firstLocation.database) ||
    !unambiguousName.test(secondLocation.database) ||
    firstLocation.database === secondLocation.database
  );
}
