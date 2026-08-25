"use client";

import {
  Bot,
  Check,
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings2,
  Sparkles,
  ToolCase,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentType } from "react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLogoutMutation } from "@/features/auth/hooks/use-logout";
import { CreateOrganizationDialog } from "@/features/organizations/components/create-organization-dialog";
import { useOrganizations } from "@/features/organizations/hooks/use-organizations";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
  // Nothing lives at this route yet (V2 scope) — render it inert instead of
  // a dead link that 404s.
  disabled?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Agents", href: "/agents", icon: Bot },
  { label: "Tools", href: "/tools", icon: ToolCase },
  { label: "Workflows", href: "/workflows", icon: Workflow, badge: "V2", disabled: true },
  { label: "Settings", href: "/settings", icon: Settings2 },
];

export function Logomark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary to-[color-mix(in_oklch,var(--primary),black_25%)] text-primary-foreground shadow-(--shadow-glow-primary-sm)",
        className
      )}
    >
      <Sparkles className="size-4" />
    </div>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
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
  const [createOrgOpen, setCreateOrgOpen] = useState(false);

  function handleLogout() {
    logout(undefined, { onSettled: () => router.push("/auth") });
  }

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Not signed in";
  const initial = user?.firstName?.[0]?.toUpperCase() ?? "?";

  const selectedOrg = organizations?.find((org) => org.id === selectedOrgId);
  const orgInitial = selectedOrg?.name?.[0]?.toUpperCase() ?? "?";
  const orgPlaceholder = isLoadingOrgs
    ? "Loading…"
    : organizations?.length
      ? "Select workspace"
      : "No workspaces";

  return (
    <div className="flex h-full flex-col gap-6">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-2">
        <Logomark />
        <span className="text-[15px] font-semibold tracking-tight">NexAgent</span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isLoadingOrgs || !organizations?.length}
          className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left shadow-xs transition-all hover:border-primary/30 hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-semibold text-primary">
            {orgInitial}
          </div>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {selectedOrg?.name ?? orgPlaceholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-(--anchor-width)">
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
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setCreateOrgOpen(true)}
            className="gap-2.5 py-1.5"
          >
            <div className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground">
              <Plus className="size-4" />
            </div>
            <span className="flex-1 truncate">Create organization</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateOrganizationDialog open={createOrgOpen} onOpenChange={setCreateOrgOpen} />

      <nav className="flex flex-1 flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          if (item.disabled) {
            return (
              <div
                key={item.href}
                title={`${item.label} isn't available yet`}
                aria-disabled="true"
                className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground/50"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md">
                  <Icon className="size-4" />
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="h-5">
                    {item.badge}
                  </Badge>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground",
                isActive && "bg-primary/10 text-foreground"
              )}
            >
              <span
                className={cn(
                  "absolute top-1/2 left-0 h-4 w-[3px] -translate-y-1/2 rounded-full bg-primary opacity-0 transition-opacity",
                  isActive && "opacity-100"
                )}
              />
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-md transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
              </span>
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
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary ring-2 ring-primary/10">
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
          className="justify-start gap-2.5 px-2.5 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="size-4" />
          {isLoggingOut ? "Logging out…" : "Log out"}
        </Button>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col gap-6 border-r border-border bg-sidebar px-4 py-5 lg:flex">
      <SidebarNav />
    </aside>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-sm lg:hidden">
      <Link href="/dashboard" className="flex items-center gap-2.5">
        <Logomark />
        <span className="text-[15px] font-semibold tracking-tight">NexAgent</span>
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="Open navigation" />
          }
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
