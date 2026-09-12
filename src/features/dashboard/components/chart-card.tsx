import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  icon: LucideIcon;
  isLoading: boolean;
  isEmpty: boolean;
  hasError: boolean;
  emptyMessage?: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  icon: Icon,
  isLoading,
  isEmpty,
  hasError,
  emptyMessage = "Not enough data yet.",
  children,
  className,
}: ChartCardProps) {
  if (hasError) {
    return null;
  }

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Icon className="size-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex h-64 flex-col">
        {isLoading ? (
          <Skeleton className="h-full w-full rounded-lg" />
        ) : isEmpty ? (
          <div className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
