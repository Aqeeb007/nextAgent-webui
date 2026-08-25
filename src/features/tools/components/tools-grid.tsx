import { ToolCard } from "@/features/tools/components/tool-card";
import type { Tool } from "@/features/tools/types/tool.types";

interface ToolsGridProps {
  tools: Tool[];
  onEdit: (tool: Tool) => void;
  onTest: (tool: Tool) => void;
  onDelete: (tool: Tool) => void;
}

export function ToolsGrid({ tools, onEdit, onTest, onDelete }: ToolsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {tools.map((tool, index) => (
        <ToolCard
          key={tool.id}
          tool={tool}
          onEdit={onEdit}
          onTest={onTest}
          onDelete={onDelete}
          style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
        />
      ))}
    </div>
  );
}
