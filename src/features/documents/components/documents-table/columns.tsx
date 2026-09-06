"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/ui/data-table";
import { DocumentRowActions } from "@/features/documents/components/document-row-actions";
import { DocumentStatusBadge } from "@/features/documents/components/document-status-badge";
import type { Document } from "@/features/documents/types/document.types";

interface DocumentColumnActions {
  canDelete: boolean;
  onDelete: (document: Document) => void;
}

export function createDocumentColumns({
  canDelete,
  onDelete,
}: DocumentColumnActions): ColumnDef<Document>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <DocumentStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "chunkCount",
      header: "Chunks",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.chunkCount}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Uploaded" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString(undefined, {
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
          <DocumentRowActions document={row.original} canDelete={canDelete} onDelete={onDelete} />
        </div>
      ),
    },
  ];
}
