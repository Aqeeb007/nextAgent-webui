"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/api/error";

import { useUpdateWorkflow } from "../hooks/use-update-workflow";
import type { Workflow } from "../types/workflow.types";

interface WorkflowSettingsSheetProps {
  workflow: Workflow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readOnly: boolean;
}

// Right-docked, same shell as StepConfigPanel — keeps the canvas mounted
// underneath instead of a Dialog covering it. Local edit buffer + explicit
// Save, re-synced from `workflow` each time the sheet opens (see
// handleOpenChange) so a stale edit from a previous open never lingers.
export function WorkflowSettingsSheet({
  workflow,
  open,
  onOpenChange,
  readOnly,
}: WorkflowSettingsSheetProps) {
  const [name, setName] = useState(workflow.name);
  const [description, setDescription] = useState(workflow.description ?? "");
  const { mutate, isPending, error } = useUpdateWorkflow();

  const isDirty = name !== workflow.name || description !== (workflow.description ?? "");

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (nextOpen) {
      setName(workflow.name);
      setDescription(workflow.description ?? "");
    }
  }

  function handleSave() {
    mutate(
      {
        id: workflow.id,
        payload: { name: name.trim(), description: description.trim() || undefined },
      },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex w-96 flex-col gap-5 overflow-y-auto">
        <div className="flex flex-col gap-1 pr-6">
          <div className="text-base font-medium">Workflow settings</div>
          <p className="text-sm text-muted-foreground">
            {readOnly
              ? "You don't have permission to edit this workflow."
              : "Update this workflow's name and description."}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="workflow-name">Name</Label>
          <Input
            id="workflow-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={readOnly}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="workflow-description">Description</Label>
          <Textarea
            id="workflow-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={readOnly}
            placeholder="What does this workflow do?"
            className="min-h-24"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {getErrorMessage(error)}
          </p>
        )}

        {!readOnly && (
          <Button onClick={handleSave} disabled={!isDirty || isPending} className="mt-auto gap-1.5">
            {isPending && <Loader2 className="animate-spin" />}
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        )}
      </SheetContent>
    </Sheet>
  );
}
