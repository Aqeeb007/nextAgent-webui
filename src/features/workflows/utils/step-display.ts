import { Bot, Diamond, ToolCase } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ConditionOperator, WorkflowStepType } from "../types/workflow.types";

export const STEP_TYPES: { value: WorkflowStepType; label: string }[] = [
  { value: "agent", label: "Agent" },
  { value: "tool", label: "Tool" },
  { value: "condition", label: "Condition" },
];

export const STEP_TYPE_ICONS: Record<WorkflowStepType, LucideIcon> = {
  agent: Bot,
  tool: ToolCase,
  condition: Diamond,
};

export const STEP_TYPE_LABELS: Record<WorkflowStepType, string> = {
  agent: "Agent",
  tool: "Tool",
  condition: "Condition",
};

export const CONDITION_OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "does not equal" },
  { value: "contains", label: "contains" },
  { value: "truthy", label: "is truthy" },
  { value: "falsy", label: "is falsy" },
];
