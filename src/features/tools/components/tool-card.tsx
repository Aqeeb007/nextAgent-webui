import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToolConfigSummary } from "@/features/tools/components/tool-config-summary";
import { ToolRowActions } from "@/features/tools/components/tool-row-actions";
import { ToolTypeIcon } from "@/features/tools/components/tool-type-icon";
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
        <ToolTypeIcon type={tool.type} />
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
        <ToolConfigSummary tool={tool} />
      </CardContent>
    </Card>
  );
}
