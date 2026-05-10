import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/pages/global/app-sidebar";
import { AppTopbar } from "@/pages/global/app-topbar";
import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import React from "react";
import { CommandBar } from "@/components/kbar/command-bar";
import { Toaster } from "@/components/ui/sonner";
import { KBarProvider } from "kbar";

interface RouterContext {
  queryClient: QueryClient;
}

const RootLayout = () => (
  <KBarProvider options={{ disableScrollbarManagement: true }}>
    <CommandBar />
    <SidebarProvider
      style={{ "--header-height": "calc(var(--spacing) * 16)" } as React.CSSProperties}
      className="h-screen flex"
    >
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <AppTopbar />
        <div className="overflow-y-auto p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
    <Toaster />
  </KBarProvider>
);

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});
