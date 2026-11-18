import { WarehouseIcon, type LucideIcon } from "lucide-react";

export type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navigationItems: readonly NavigationItem[] = [
  { href: "/warehouses", label: "Мои склады", icon: WarehouseIcon },
];
