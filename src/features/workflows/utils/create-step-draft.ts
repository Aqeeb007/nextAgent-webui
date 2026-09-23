import type {
  WorkflowStepDraft,
  WorkflowStepPayload,
  WorkflowStepType,
} from "../types/workflow.types";

// Per-branch `if`s (not a destructured object literal) so TS keeps `type`
// and `config` correlated — see workflow-builder.tsx's handleAddStep, the
// only caller.
export function stepDraftToPayload(draft: WorkflowStepDraft): WorkflowStepPayload {
  if (draft.type === "agent") return { type: "agent", config: draft.config };
  if (draft.type === "tool") return { type: "tool", config: draft.config };
  return { type: "condition", config: draft.config };
}

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
