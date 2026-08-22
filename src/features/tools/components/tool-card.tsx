import { Globe } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MethodBadge } from "@/features/tools/components/method-badge";
import { ToolRowActions } from "@/features/tools/components/tool-row-actions";
import type { Tool } from "@/features/tools/types/tool.types";

interface ToolCardProps {
  tool: Tool;
  onEdit: (tool: Tool) => void;
  onTest: (tool: Tool) => void;
  onDelete: (tool: Tool) => void;
}

export function ToolCard({ tool, onEdit, onTest, onDelete }: ToolCardProps) {
  return (
    <Card>
      <CardHeader className="grid-cols-[auto_1fr_auto] items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Globe className="size-4" />
        </div>
        <CardTitle className="truncate" title={tool.name}>
          {tool.name}
        </CardTitle>
        <ToolRowActions
          tool={tool}
          onEdit={onEdit}
          onTest={onTest}
          onDelete={onDelete}
        />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {tool.description}
        </p>
        <div className="flex items-center gap-1.5 overflow-hidden rounded-lg bg-muted/40 px-2 py-1.5">
          <MethodBadge method={tool.config.method} />
          <span
            className="truncate font-mono text-xs text-muted-foreground"
            title={tool.config.url}
          >
            {tool.config.url}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
