import type { CSSProperties, ReactNode } from "react";

import { Sidebar, SidebarProvider } from "@/shared/ui/sidebar";

import { CabinetNavigation } from "./cabinet-navigation";

const NAVIGATION_LABEL = "Основная навигация";

type CabinetLayoutProps = {
  header: ReactNode;
  children: ReactNode;
};

export function CabinetLayout({ header, children }: CabinetLayoutProps) {
  return (
    <div className="flex flex-1 flex-col">
      {header}
      <SidebarProvider
        style={{ "--sidebar-width": "15rem" } as CSSProperties}
        className="min-h-0 flex-1 flex-col md:flex-row"
      >
        <Sidebar
          collapsible="none"
          className="hidden h-auto border-r border-sidebar-border md:flex"
        >
          <nav aria-label={NAVIGATION_LABEL} className="px-3 py-4">
            <CabinetNavigation orientation="vertical" />
          </nav>
        </Sidebar>
        <nav
          aria-label={NAVIGATION_LABEL}
          className="border-b border-sidebar-border bg-sidebar px-4 py-2 text-sidebar-foreground md:hidden"
        >
          <CabinetNavigation orientation="horizontal" />
        </nav>
        <main className="flex min-w-0 flex-1 flex-col px-4 py-6 md:p-8">
          <div className="mx-auto flex w-full max-w-300 flex-1 flex-col">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}
