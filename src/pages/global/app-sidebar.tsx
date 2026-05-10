import { LayoutPanelLeftIcon, Moon, Settings } from "lucide-react";
import { getVersion } from "@tauri-apps/api/app";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Logo from "@/assets/icon.svg?react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useTheme } from "@/components/theme-provider";
import { Switch } from "@/components/ui/switch";

export const AppSidebar = () => {
  const [version, setVersion] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  useEffect(() => {
    getVersion().then(setVersion).catch(console.error);
  }, []);

  return (
    <Sidebar collapsible="none" className="h-screen border-r flex flex-col shrink-0">
      <SidebarHeader className="border-b flex-row items-center h-(--header-height) pl-4">
        <Logo className="size-8" />
        <h1 className="text-2xl font-medium tracking-tight text-foreground select-none">
          Stash
        </h1>
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-10">
                  <Link to="/">
                    <LayoutPanelLeftIcon className="size-5! ml-1" />
                    <h2 className="text-base">Dashboard</h2>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarGroupLabel>v{version}</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-10">
                  <Link to="/">
                    <Settings className="size-5! ml-1" />
                    <h2 className="text-base">Settings</h2>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuButton asChild className="h-10">
                  <div
                    role="button"
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    className="h-10 flex items-center w-full cursor-pointer"
                  >
                    <Moon className="size-5! ml-1" />
                    <h2 className="text-base select-none">Dark Mode</h2>
                    <Switch
                      className="ml-auto mr-1 cursor-pointer"
                      checked={isDark}
                      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
