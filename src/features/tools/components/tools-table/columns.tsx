"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/ui/data-table";
import { MethodBadge } from "@/features/tools/components/method-badge";
import { ToolRowActions } from "@/features/tools/components/tool-row-actions";
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
      id: "method",
      accessorFn: (tool) => tool.config.method,
      header: "Method",
      cell: ({ row }) => <MethodBadge method={row.original.config.method} />,
    },
    {
      id: "url",
      accessorFn: (tool) => tool.config.url,
      header: "Endpoint",
      cell: ({ row }) => (
        <span
          className="block max-w-xs truncate font-mono text-xs text-muted-foreground"
          title={row.original.config.url}
        >
          {row.original.config.url}
        </span>
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
