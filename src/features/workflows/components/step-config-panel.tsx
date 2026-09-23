"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { getErrorMessage } from "@/lib/api/error";

import { useRemoveWorkflowEdge } from "../hooks/use-remove-workflow-edge";
import { useUpdateWorkflowStep } from "../hooks/use-update-workflow-step";
import { DEFAULT_BRANCH, type WorkflowEdge, type WorkflowStepDraft } from "../types/workflow.types";
import { stepDraftToPayload } from "../utils/create-step-draft";
import { STEP_TYPE_ICONS, STEP_TYPE_LABELS } from "../utils/step-display";
import { AgentStepForm } from "./agent-step-form";
import { ConditionStepForm } from "./condition-step-form";
import { ToolStepForm } from "./tool-step-form";

interface StepConfigPanelProps {
  workflowId: string;
  step: WorkflowStepDraft | null;
  edges: WorkflowEdge[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readOnly: boolean;
}

// A condition step's valid outgoing branches are its cases' branch names
// plus the fixed DEFAULT_BRANCH ("Else") — used after a successful save to
// remove edges left dangling by a renamed/removed case.
function validBranchesFor(draft: WorkflowStepDraft): Set<string> {
  if (draft.type !== "condition") return new Set([DEFAULT_BRANCH]);
  return new Set([...draft.config.cases.map((c) => c.branch), DEFAULT_BRANCH]);
}

// Right-docked (not a Dialog) so the canvas stays visible while editing.
// Local edit buffer + explicit Save (matches ToolFormDialog's convention)
// rather than persisting every keystroke — closing without saving discards
// the buffer. The caller keys this component by `step?.clientId` (see
// workflow-builder.tsx), so switching the selected step remounts it with a
// fresh buffer instead of needing an effect to re-seed one.
export function StepConfigPanel({
  workflowId,
  step,
  edges,
  open,
  onOpenChange,
  readOnly,
}: StepConfigPanelProps) {
  const [draft, setDraft] = useState<WorkflowStepDraft | null>(step);
  const { mutate: updateStep, isPending, error } = useUpdateWorkflowStep();
  const { mutate: removeEdge } = useRemoveWorkflowEdge();

  if (!step || !draft) return null;

  const Icon = STEP_TYPE_ICONS[draft.type];
  const isDirty = JSON.stringify(draft.config) !== JSON.stringify(step.config);

  function handleSave() {
    if (!draft || !draft.id) return;
    const stepId = draft.id;

    updateStep(
      { workflowId, stepId, payload: stepDraftToPayload(draft) },
      {
        onSuccess: () => {
          const validBranches = validBranchesFor(draft);
          edges
            .filter((edge) => edge.fromStepId === stepId && !validBranches.has(edge.branch))
            .forEach((edge) => removeEdge({ workflowId, edgeId: edge.id }));
        },
      }
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-96 flex-col gap-5 overflow-y-auto">
        <div className="flex flex-col gap-1 pr-6">
          <div className="flex items-center gap-2 text-base font-medium">
            <Icon className="size-4 text-muted-foreground" />
            {STEP_TYPE_LABELS[draft.type]} step
          </div>
          <p className="text-sm text-muted-foreground">
            {readOnly
              ? "You don't have permission to edit this step."
              : "Configure what this step does when the workflow runs."}
          </p>
        </div>

        {draft.type === "agent" && (
          <AgentStepForm
            key={draft.clientId}
            config={draft.config}
            disabled={readOnly}
            onChange={(config) => setDraft({ ...draft, type: "agent", config })}
          />
        )}
        {draft.type === "tool" && (
          <ToolStepForm
            key={draft.clientId}
            config={draft.config}
            disabled={readOnly}
            onChange={(config) => setDraft({ ...draft, type: "tool", config })}
          />
        )}
        {draft.type === "condition" && (
          <ConditionStepForm
            key={draft.clientId}
            config={draft.config}
            disabled={readOnly}
            onChange={(config) => setDraft({ ...draft, type: "condition", config })}
          />
        )}

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
