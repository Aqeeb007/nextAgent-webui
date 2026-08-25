import { Code2, Database, Globe } from "lucide-react";

import type { ToolType } from "@/features/tools/types/tool.types";
import { cn } from "@/lib/utils";

interface ToolTypeIconProps {
  type: ToolType;
  className?: string;
}

const TYPE_CLASSES: Record<ToolType, string> = {
  http: "bg-linear-to-br from-primary/20 to-primary/5 text-primary",
  database: "bg-linear-to-br from-live/20 to-live/5 text-live",
  custom_js: "bg-linear-to-br from-warning/20 to-warning/5 text-warning",
};

export function ToolTypeIcon({ type, className }: ToolTypeIconProps) {
  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
        TYPE_CLASSES[type],
        className
      )}
    >
      {type === "http" && <Globe className="size-4" />}
      {type === "database" && <Database className="size-4" />}
      {type === "custom_js" && <Code2 className="size-4" />}
    </div>
  );
}
