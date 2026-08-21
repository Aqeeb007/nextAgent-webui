"use client";

import { Bot, LayoutDashboard, LogOut, Users, Workflow } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentType } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLogoutMutation } from "@/features/auth/hooks/use-logout";
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
  { label: "Workflows", href: "/workflows", icon: Workflow, badge: "V2" },
  { label: "Team", href: "/team", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();

  function handleLogout() {
    logout(undefined, { onSettled: () => router.push("/auth") });
  }

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Not signed in";
  const initial = user?.firstName?.[0]?.toUpperCase() ?? "?";

  return (
    <aside className="flex h-svh w-64 shrink-0 flex-col gap-6 border-r border-border bg-background px-4 py-5">
      <span className="px-2 text-lg font-semibold tracking-tight">NexAgent</span>

      <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
          AI
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">Workspace</span>
          <span className="text-xs text-muted-foreground">Owner</span>
        </div>
      </div>

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
                isActive && "bg-primary/15 text-foreground hover:bg-primary/15"
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

      <div className="flex flex-col items-center gap-2 border-t border-border pt-4">
        <div className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
          {initial}
        </div>
        <div className="flex flex-col items-center gap-0.5 text-center">
          <span className="text-sm font-medium">{fullName}</span>
          {user?.email && (
            <span className="text-xs text-muted-foreground">{user.email}</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="gap-1.5 text-muted-foreground"
        >
          <LogOut className="size-3.5" />
          {isLoggingOut ? "Logging out…" : "Log out"}
        </Button>
      </div>
    </aside>
  );
}
