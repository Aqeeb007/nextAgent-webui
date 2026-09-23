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
import { getErrorMessage } from "@/lib/api/error";

import { useDeleteWorkflow } from "../hooks/use-delete-workflow";
import type { Workflow } from "../types/workflow.types";

interface DeleteWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow: Workflow | null;
  onDeleted: () => void;
}

export function DeleteWorkflowDialog({
  open,
  onOpenChange,
  workflow,
  onDeleted,
}: DeleteWorkflowDialogProps) {
  const { mutate, isPending, error } = useDeleteWorkflow();

  function handleDelete() {
    if (!workflow) return;
    mutate(workflow.id, {
      onSuccess: () => {
        onOpenChange(false);
        onDeleted();
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete workflow</DialogTitle>
          <DialogDescription>
            {workflow && (
              <>
                This permanently deletes{" "}
                <strong className="text-foreground">{workflow.name}</strong> and all its steps,
                connections, and run history. This can&apos;t be undone.
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
