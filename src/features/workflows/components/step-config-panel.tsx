"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";

import type { WorkflowStepDraft } from "../types/workflow.types";
import { STEP_TYPE_ICONS, STEP_TYPE_LABELS } from "../utils/step-display";
import { AgentStepForm } from "./agent-step-form";
import { ConditionStepForm } from "./condition-step-form";
import { ToolStepForm } from "./tool-step-form";

interface StepConfigPanelProps {
  step: WorkflowStepDraft | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (next: WorkflowStepDraft) => void;
  readOnly: boolean;
}

// Right-docked (not a Dialog) so the canvas stays visible while editing —
// clicking a node opens this instead of cramming the full form onto the
// node itself.
export function StepConfigPanel({
  step,
  open,
  onOpenChange,
  onChange,
  readOnly,
}: StepConfigPanelProps) {
  if (!step) return null;

  const Icon = STEP_TYPE_ICONS[step.type];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-96 gap-5 overflow-y-auto">
        <div className="flex flex-col gap-1 pr-6">
          <div className="flex items-center gap-2 text-base font-medium">
            <Icon className="size-4 text-muted-foreground" />
            {STEP_TYPE_LABELS[step.type]} step
          </div>
          <p className="text-sm text-muted-foreground">
            {readOnly
              ? "You don't have permission to edit this step."
              : "Configure what this step does when the workflow runs."}
          </p>
        </div>

        {step.type === "agent" && (
          <AgentStepForm
            key={step.clientId}
            config={step.config}
            disabled={readOnly}
            onChange={(config) => onChange({ ...step, config })}
          />
        )}
        {step.type === "tool" && (
          <ToolStepForm
            key={step.clientId}
            config={step.config}
            disabled={readOnly}
            onChange={(config) => onChange({ ...step, config })}
          />
        )}
        {step.type === "condition" && (
          <ConditionStepForm
            key={step.clientId}
            config={step.config}
            disabled={readOnly}
            onChange={(config) => onChange({ ...step, config })}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
