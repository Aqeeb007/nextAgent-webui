"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteDocument } from "@/features/documents/hooks/use-delete-document";
import type { Document } from "@/features/documents/types/document.types";
import { getErrorMessage } from "@/lib/api/error";

interface DeleteDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
}

export function DeleteDocumentDialog({ open, onOpenChange, document }: DeleteDocumentDialogProps) {
  const { mutate, isPending, error } = useDeleteDocument();

  function handleDelete() {
    if (!document) return;
    mutate(document.id, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete document</DialogTitle>
          <DialogDescription>
            {document && (
              <>
                This permanently deletes{" "}
                <strong className="text-foreground">{document.name}</strong> and its indexed
                content. Any agent using it will no longer be able to search it. This can&apos;t be
                undone.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {getErrorMessage(error)}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
