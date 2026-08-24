import { Code2, Database, Globe } from "lucide-react";

import type { ToolType } from "@/features/tools/types/tool.types";
import { cn } from "@/lib/utils";

interface ToolTypeIconProps {
  type: ToolType;
  className?: string;
}

export function ToolTypeIcon({ type, className }: ToolTypeIconProps) {
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
        className
      )}
    >
      {type === "http" && <Globe className="size-4" />}
      {type === "database" && <Database className="size-4" />}
      {type === "custom_js" && <Code2 className="size-4" />}
    </div>
  );
}
