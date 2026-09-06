import type { CSSProperties } from "react";
import { FileText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentRowActions } from "@/features/documents/components/document-row-actions";
import { DocumentStatusBadge } from "@/features/documents/components/document-status-badge";
import type { Document } from "@/features/documents/types/document.types";

interface DocumentCardProps {
  document: Document;
  canDelete: boolean;
  onDelete: (document: Document) => void;
  style?: CSSProperties;
}

export function DocumentCard({ document, canDelete, onDelete, style }: DocumentCardProps) {
  return (
    <Card
      style={style}
      className="fade-up-item transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:ring-primary/25"
    >
      <CardHeader className="grid-cols-[auto_1fr_auto] items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <FileText className="size-4" />
        </div>
        <CardTitle className="truncate" title={document.name}>
          {document.name}
        </CardTitle>
        <DocumentRowActions document={document} canDelete={canDelete} onDelete={onDelete} />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <DocumentStatusBadge status={document.status} />
        {document.status === "failed" && document.error && (
          <p className="line-clamp-2 text-sm text-destructive">{document.error}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {document.chunkCount} {document.chunkCount === 1 ? "chunk" : "chunks"} · Uploaded{" "}
          {new Date(document.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </CardContent>
    </Card>
  );
}
