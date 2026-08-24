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
import { useDeleteAgent } from "@/features/agents/hooks/use-delete-agent";
import type { Agent } from "@/features/agents/types/agent.types";
import { getErrorMessage } from "@/lib/api/error";

interface DeleteAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Agent | null;
  onDeleted?: () => void;
}

export function DeleteAgentDialog({
  open,
  onOpenChange,
  agent,
  onDeleted,
}: DeleteAgentDialogProps) {
  const { mutate, isPending, error } = useDeleteAgent();

  function handleDelete() {
    if (!agent) return;
    mutate(agent.id, {
      onSuccess: () => {
        onOpenChange(false);
        onDeleted?.();
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete agent</DialogTitle>
          <DialogDescription>
            {agent && (
              <>
                This permanently deletes <strong className="text-foreground">{agent.name}</strong>,
                including its attached tools and conversation history. This can&apos;t be undone.
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
