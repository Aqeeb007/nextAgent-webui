"use client";

import { useAgents } from "@/features/agents/hooks/use-agents";
import { useTools } from "@/features/tools/hooks/use-tools";

import type { WorkflowStepDraft } from "../types/workflow.types";

function truncateId(id: string): string {
  if (id.length <= 12) return id;
  return `${id.slice(0, 4)}…${id.slice(-4)}`;
}

// Type-aware "at a glance" preview of a step's config, shown on the canvas
// node body — parallels ToolConfigSummary. Falls back to a truncated raw id
// when the agent/tool isn't found in the loaded org data: covers both the
// Phase 1 mock seed's placeholder ids and the general not-yet-loaded case.
export function WorkflowStepConfigSummary({ step }: { step: WorkflowStepDraft }) {
  const { data: agents } = useAgents();
  const { data: tools } = useTools();

  if (step.type === "agent") {
    if (!step.config.agentId) {
      return <span className="text-muted-foreground">No agent selected</span>;
    }
    const agent = agents?.find((item) => item.id === step.config.agentId);
    return (
      <span>
        Agent · {agent?.name ?? truncateId(step.config.agentId)}
      </span>
    );
  }

  if (step.type === "tool") {
    if (!step.config.toolId) {
      return <span className="text-muted-foreground">No tool selected</span>;
    }
    const tool = tools?.find((item) => item.id === step.config.toolId);
    return (
      <span>
        Tool · {tool?.name ?? truncateId(step.config.toolId)}
      </span>
    );
  }

  const count = step.config.cases.length;
  return (
    <span>
      {count} case{count === 1 ? "" : "s"} on {step.config.path || "input"}
    </span>
  );
}
