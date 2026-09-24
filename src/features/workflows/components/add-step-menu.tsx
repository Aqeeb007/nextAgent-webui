"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import type { WorkflowStepType } from "../types/workflow.types";
import { STEP_TYPE_ICONS, STEP_TYPES } from "../utils/step-display";
import { AddStepPickerDialog } from "./add-step-picker-dialog";

interface AddStepMenuProps {
  onAddAgentStep: (agentId: string) => void;
  onAddToolStep: (toolId: string) => void;
  onAddConditionStep: () => void;
  className?: string;
  label?: string;
}

type PickerType = Extract<WorkflowStepType, "agent" | "tool">;

// Agent/tool steps need a real agentId/toolId the moment they're created —
// the backend validates config.agentId/config.toolId as a uuid on the very
// first POST, so there's no "blank step, fill in later" state. Picking
// "Agent" or "Tool" here opens AddStepPickerDialog to choose the specific
// one; Condition's default config has no such requirement and creates
// immediately.
export function AddStepMenu({
  onAddAgentStep,
  onAddToolStep,
  onAddConditionStep,
  className,
  label,
}: AddStepMenuProps) {
  const [pickerType, setPickerType] = useState<PickerType | null>(null);

  function handleSelect(type: WorkflowStepType) {
    if (type === "condition") {
      onAddConditionStep();
      return;
    }
    setPickerType(type);
  }

  function handlePickerConfirm(id: string) {
    if (pickerType === "agent") onAddAgentStep(id);
    if (pickerType === "tool") onAddToolStep(id);
    setPickerType(null);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size={label ? "sm" : "icon-sm"}
              className={cn("nodrag rounded-full border-dashed", className)}
            />
          }
        >
          <Plus className="size-3.5" />
          {label}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          {STEP_TYPES.map((item) => {
            const Icon = STEP_TYPE_ICONS[item.value];
            return (
              <DropdownMenuItem key={item.value} onClick={() => handleSelect(item.value)}>
                <Icon className="size-4" />
                {item.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {pickerType && (
        <AddStepPickerDialog
          type={pickerType}
          open={pickerType !== null}
          onOpenChange={(open) => !open && setPickerType(null)}
          onConfirm={handlePickerConfirm}
        />
      )}
    </>
  );
}
