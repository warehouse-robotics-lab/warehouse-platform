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

export function isSameDatabase(first: string, second: string): boolean {
  const firstLocation = getDatabaseLocation(first);
  const secondLocation = getDatabaseLocation(second);

  return (
    firstLocation.host === secondLocation.host &&
    firstLocation.port === secondLocation.port &&
    firstLocation.database === secondLocation.database
  );
}
