import type { WorkflowStepDraft, WorkflowStepType } from "../types/workflow.types";

export function createStepDraft(
  type: WorkflowStepType,
  position: { x: number; y: number }
): WorkflowStepDraft {
  const clientId = crypto.randomUUID();

  if (type === "agent") {
    return { clientId, type: "agent", config: { agentId: "" }, position };
  }

  if (type === "tool") {
    return { clientId, type: "tool", config: { toolId: "" }, position };
  }

  return {
    clientId,
    type: "condition",
    config: { cases: [{ branch: "case-1", operator: "truthy" }] },
    position,
  };
}
