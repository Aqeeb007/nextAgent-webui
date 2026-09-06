import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Document } from "@/features/documents/types/document.types";

interface DocumentRowActionsProps {
  document: Document;
  canDelete: boolean;
  onDelete: (document: Document) => void;
}

// Documents only ever have one destructive action (no edit/test like
// tools), so a single icon button is enough — no dropdown menu needed.
export function DocumentRowActions({ document, canDelete, onDelete }: DocumentRowActionsProps) {
  if (!canDelete) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={`Delete ${document.name}`}
      onClick={() => onDelete(document)}
      className="text-muted-foreground hover:text-destructive"
    >
      <Trash2 />
    </Button>
  );
}
