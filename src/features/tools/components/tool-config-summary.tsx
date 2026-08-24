import { Badge } from "@/components/ui/badge";
import { MethodBadge } from "@/features/tools/components/method-badge";
import type { Tool } from "@/features/tools/types/tool.types";

// Type-aware "at a glance" preview of a tool's config, shown as a single
// truncated row (card body, table column).
export function ToolConfigSummary({ tool }: { tool: Tool }) {
  if (tool.type === "http") {
    return (
      <div className="flex items-center gap-1.5 overflow-hidden rounded-lg bg-muted/40 px-2 py-1.5">
        <MethodBadge method={tool.config.method} />
        <span
          className="truncate font-mono text-xs text-muted-foreground"
          title={tool.config.url}
        >
          {tool.config.url}
        </span>
      </div>
    );
  }

  if (tool.type === "database") {
    return (
      <div className="flex items-center gap-1.5 overflow-hidden rounded-lg bg-muted/40 px-2 py-1.5">
        <Badge variant="outline" className="font-mono uppercase">
          {tool.config.engine}
        </Badge>
        <span
          className="truncate font-mono text-xs text-muted-foreground"
          title={tool.config.query}
        >
          {tool.config.query}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 overflow-hidden rounded-lg bg-muted/40 px-2 py-1.5">
      <Badge variant="outline" className="font-mono uppercase">
        JS
      </Badge>
      <span className="truncate font-mono text-xs text-muted-foreground">
        {tool.config.timeoutMs ? `${tool.config.timeoutMs}ms timeout` : "default timeout"}
      </span>
    </div>
  );
}
