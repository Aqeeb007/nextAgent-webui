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
import { useDeleteTool } from "@/features/tools/hooks/use-delete-tool";
import type { Tool } from "@/features/tools/types/tool.types";
import { getErrorMessage } from "@/lib/api/error";

interface DeleteToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tool: Tool | null;
}

export function DeleteToolDialog({ open, onOpenChange, tool }: DeleteToolDialogProps) {
  const { mutate, isPending, error } = useDeleteTool();

  function handleDelete() {
    if (!tool) return;
    mutate(tool.id, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete tool</DialogTitle>
          <DialogDescription>
            {tool && (
              <>
                This permanently deletes <strong className="text-foreground">{tool.name}</strong>.
                Any agent using it will no longer be able to call it. This can&apos;t be undone.
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
