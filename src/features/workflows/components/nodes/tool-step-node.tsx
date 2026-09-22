"use client";

import type { NodeProps } from "@xyflow/react";
import { ToolCase } from "lucide-react";

import { buildSourceHandles, type StepNode } from "../../utils/workflow-graph";
import { WorkflowStepConfigSummary } from "../workflow-step-config-summary";
import { StepNodeShell } from "./step-node-shell";

export function ToolStepNode({ data }: NodeProps<StepNode>) {
  const { step, selected, isEntry, canManage, onSelect, onRemove, onSetEntry } = data;

  return (
    <StepNodeShell
      icon={ToolCase}
      typeLabel="Tool"
      selected={selected}
      isEntry={isEntry}
      canManage={canManage}
      sourceHandles={buildSourceHandles(data)}
      onSelect={() => onSelect(step.clientId)}
      onRemove={() => onRemove(step.clientId)}
      onSetEntry={() => onSetEntry(step.clientId)}
      summary={<WorkflowStepConfigSummary step={step} />}
    />
  );
}
