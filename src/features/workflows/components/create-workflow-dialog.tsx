"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/api/error";

import { useCreateWorkflow } from "../hooks/use-create-workflow";

interface CreateWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Modeled on ToolFormDialog/AgentFormDialog: a lightweight modal for the two
// fields a workflow needs up front. Everything else (steps, connections)
// only makes sense on the full canvas, so a successful create navigates to
// the real builder at /workflows/:id rather than rendering it inline here.
export function CreateWorkflowDialog({ open, onOpenChange }: CreateWorkflowDialogProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { mutate, isPending, error } = useCreateWorkflow();

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setName("");
      setDescription("");
    }
  }

  function handleCreate() {
    if (!name.trim()) return;
    mutate(
      { name: name.trim(), description: description.trim() || undefined },
      { onSuccess: (workflow) => router.push(`/workflows/${workflow.id}`) }
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create workflow</DialogTitle>
          <DialogDescription>
            Name your workflow — you&apos;ll add steps and connections on the next screen.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-workflow-name">Name</Label>
            <Input
              id="new-workflow-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Untitled workflow"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-workflow-description">Description</Label>
            <Textarea
              id="new-workflow-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What does this workflow do?"
              className="min-h-16"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {getErrorMessage(error)}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim() || isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {isPending ? "Creating…" : "Create workflow"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
