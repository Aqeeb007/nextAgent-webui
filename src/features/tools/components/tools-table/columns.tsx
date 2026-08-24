"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/ui/data-table";
import { ToolConfigSummary } from "@/features/tools/components/tool-config-summary";
import { ToolRowActions } from "@/features/tools/components/tool-row-actions";
import { ToolTypeIcon } from "@/features/tools/components/tool-type-icon";
import { getToolTypeLabel } from "@/features/tools/utils/tool-display";
import type { Tool } from "@/features/tools/types/tool.types";

interface ToolColumnActions {
  onEdit: (tool: Tool) => void;
  onTest: (tool: Tool) => void;
  onDelete: (tool: Tool) => void;
}

export function createToolColumns({
  onEdit,
  onTest,
  onDelete,
}: ToolColumnActions): ColumnDef<Tool>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <ToolTypeIcon type={row.original.type} className="size-6 rounded-md" />
          <span className="text-muted-foreground">
            {getToolTypeLabel(row.original.type)}
          </span>
        </div>
      ),
    },
    {
      id: "config",
      accessorFn: (tool) =>
        tool.type === "http"
          ? tool.config.url
          : tool.type === "database"
            ? tool.config.query
            : tool.config.code,
      header: "Config",
      cell: ({ row }) => (
        <div className="max-w-xs">
          <ToolConfigSummary tool={row.original} />
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span
          className="block max-w-xs truncate text-muted-foreground"
          title={row.original.description}
        >
          {row.original.description}
        </span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {new Date(row.original.updatedAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <ToolRowActions
            tool={row.original}
            onEdit={onEdit}
            onTest={onTest}
            onDelete={onDelete}
          />
        </div>
      ),
    },
  ];
}
