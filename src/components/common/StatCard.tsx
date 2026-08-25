import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  accent?: "primary" | "live" | "warning" | "success";
  className?: string;
}

const ACCENT_CLASSES: Record<NonNullable<StatCardProps["accent"]>, string> = {
  primary: "bg-primary/10 text-primary",
  live: "bg-live/10 text-live",
  warning: "bg-warning/10 text-warning",
  success: "bg-success/10 text-success",
};

const ACCENT_GLOW: Record<NonNullable<StatCardProps["accent"]>, string> = {
  primary: "bg-primary",
  live: "bg-live",
  warning: "bg-warning",
  success: "bg-success",
};

export function StatCard({ icon: Icon, label, value, accent = "primary", className }: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -top-10 -right-10 size-28 rounded-full opacity-20 blur-2xl",
          ACCENT_GLOW[accent]
        )}
      />
      <CardContent className="relative flex items-center gap-4">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            ACCENT_CLASSES[accent]
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
            {value}
          </span>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
      </CardContent>
    </Card>
  );
}
