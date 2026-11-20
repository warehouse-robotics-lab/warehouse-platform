"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/lib/utils";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar";

import { navigationItems } from "../config/navigation";
import { isActivePath } from "../lib/is-active-path";

type CabinetNavigationProps = {
  orientation: "vertical" | "horizontal";
};

export function CabinetNavigation({ orientation }: CabinetNavigationProps) {
  const pathname = usePathname();
  const isHorizontal = orientation === "horizontal";

  return (
    <SidebarMenu className={cn("gap-1", isHorizontal && "flex-row")}>
      {navigationItems.map(({ href, label, icon: Icon }) => {
        const isActive = isActivePath(pathname, href);

        return (
          <SidebarMenuItem key={href}>
            <SidebarMenuButton
              isActive={isActive}
              aria-current={isActive ? "page" : undefined}
              render={<Link href={href} />}
              className={cn(
                "h-9 px-3 py-2 focus-visible:ring-offset-2 data-active:[&_svg]:text-sidebar-primary",
                isHorizontal && "h-11 w-auto p-3",
              )}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
