import { Badge } from "@/components/ui/badge";
import { MethodBadge } from "@/features/tools/components/method-badge";
import { getToolTypeLabel } from "@/features/tools/utils/tool-display";
import type { Tool } from "@/features/tools/types/tool.types";

// Compact single-badge summary for space-constrained rows (attach-tool
// picker, table Type column) — the HTTP method carries more information at
// a glance than the word "HTTP" does, so http tools keep MethodBadge.
export function ToolTypeBadge({ tool }: { tool: Tool }) {
  if (tool.type === "http") {
    return <MethodBadge method={tool.config.method} />;
  }

  return <Badge variant="outline">{getToolTypeLabel(tool.type)}</Badge>;
}
