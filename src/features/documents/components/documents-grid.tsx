import { DocumentCard } from "@/features/documents/components/document-card";
import type { Document } from "@/features/documents/types/document.types";

interface DocumentsGridProps {
  documents: Document[];
  canDelete: boolean;
  onDelete: (document: Document) => void;
}

export function DocumentsGrid({ documents, canDelete, onDelete }: DocumentsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {documents.map((document, index) => (
        <DocumentCard
          key={document.id}
          document={document}
          canDelete={canDelete}
          onDelete={onDelete}
          style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
        />
      ))}
    </div>
  );
}
