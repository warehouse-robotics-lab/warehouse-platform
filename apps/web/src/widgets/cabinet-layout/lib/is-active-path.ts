/**
 * Раздел активен на своём адресе и на вложенных: `/warehouses` и `/warehouses/123`.
 * Адрес с тем же началом (`/warehouses-other`) вложенным не считается.
 */
export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
