"use client";

import { FlaskConical, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Tool } from "@/features/tools/types/tool.types";

interface ToolRowActionsProps {
  tool: Tool;
  onEdit: (tool: Tool) => void;
  onTest: (tool: Tool) => void;
  onDelete: (tool: Tool) => void;
}

export function ToolRowActions({
  tool,
  onEdit,
  onTest,
  onDelete,
}: ToolRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${tool.name}`}
          />
        }
      >
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(tool)}>
          <Pencil />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onTest(tool)}>
          <FlaskConical />
          Test
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => onDelete(tool)}>
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
