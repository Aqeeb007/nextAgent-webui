"use client";

import {
  Bot,
  Check,
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  Settings2,
  ToolCase,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentType } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogoutMutation } from "@/features/auth/hooks/use-logout";
import { useOrganizations } from "@/features/organizations/hooks/use-organizations";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Agents", href: "/agents", icon: Bot },
  { label: "Tools", href: "/tools", icon: ToolCase },
  { label: "Workflows", href: "/workflows", icon: Workflow, badge: "V2" },
  { label: "Settings", href: "/settings", icon: Settings2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();
  const {
    data: organizations,
    isLoading: isLoadingOrgs,
    selectedOrgId,
    setSelectedOrgId,
  } = useOrganizations();

  function handleLogout() {
    logout(undefined, { onSettled: () => router.push("/auth") });
  }

  const fullName = user
    ? `${user.firstName} ${user.lastName}`
    : "Not signed in";
  const initial = user?.firstName?.[0]?.toUpperCase() ?? "?";

  const selectedOrg = organizations?.find((org) => org.id === selectedOrgId);
  const orgInitial = selectedOrg?.name?.[0]?.toUpperCase() ?? "?";
  const orgPlaceholder = isLoadingOrgs
    ? "Loading…"
    : organizations?.length
      ? "Select workspace"
      : "No workspaces";

  return (
    <aside className="flex h-svh w-64 shrink-0 flex-col gap-6 border-r border-border bg-background px-4 py-5">
      <span className="px-2 text-lg font-semibold tracking-tight">
        NexAgent
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isLoadingOrgs || !organizations?.length}
          className="flex w-full items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
            {orgInitial}
          </div>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {selectedOrg?.name ?? orgPlaceholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {organizations?.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => setSelectedOrgId(org.id)}
              className="gap-2.5 py-1.5"
            >
              <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/15 text-[11px] font-semibold text-primary">
                {org.name[0]?.toUpperCase()}
              </div>
              <span className="flex-1 truncate">{org.name}</span>
              {org.id === selectedOrgId && (
                <Check className="size-4 shrink-0 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isActive && "bg-primary/15 text-foreground hover:bg-primary/15",
              )}
            >
              <Icon className="size-4" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="h-5">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <div className="flex items-center gap-2.5 px-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {initial}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{fullName}</span>
            {user?.email && (
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="justify-start gap-2.5 px-3 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="size-4" />
          {isLoggingOut ? "Logging out…" : "Log out"}
        </Button>
      </div>
    </aside>
  );
}
