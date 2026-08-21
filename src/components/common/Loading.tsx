import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface LoadingProps {
  label?: string;
  className?: string;
}

export function Loading({ label = "Loading…", className }: LoadingProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground",
        className
      )}
    >
      <Loader2 className="size-5 animate-spin text-primary" />
      <span>{label}</span>
    </div>
  );
}
