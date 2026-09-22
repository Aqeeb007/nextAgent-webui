// Mirrors webapp-api's workflow DTOs/schema field-for-field — keep in sync if
// the backend changes (see workflows.controller.ts, dto/*.dto.ts,
// database/schema/workflow*.ts). The engine is a real DAG: a workflow has an
// `entryStepId` where execution starts, and `workflow_step_edges` connect
// steps — a non-condition step has exactly one outgoing edge (branch
// "default"), a condition step can fan out one edge per `cases[].branch`
// plus one "default" edge as its catch-all/else path.
export type WorkflowStepType = "agent" | "tool" | "condition";

export interface AgentStepConfig {
  agentId: string;
  // Literal {{input}} resolves to the current pipeline input at execution
  // time. Omit to send the raw stringified input verbatim.
  promptTemplate?: string;
}

export interface ToolStepConfig {
  toolId: string;
  // Any arg value equal to the literal string "{{input}}" resolves to the
  // current pipeline input at execution time.
  args?: Record<string, unknown>;
}

export type ConditionOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "truthy"
  | "falsy";

// The literal branch name reserved for a condition step's catch-all edge —
// used both when no case matches, and as a fallback when the matched case's
// own branch has no outgoing edge yet (see WorkflowExecutionService
// .resolveNextStepId on the backend). Never a valid name for a *case's own*
// branch — reserved so it always means exactly one thing on a node.
export const DEFAULT_BRANCH = "default";

export interface ConditionCase {
  // Matched against an outgoing edge's `branch` at execution time — the
  // first case whose operator matches wins, and its branch decides which
  // edge is followed next.
  branch: string;
  operator: ConditionOperator;
  // Ignored by the backend for "truthy"/"falsy". Not deeply validated on
  // the backend — comparison value can be any JSON-serializable shape.
  value?: unknown;
}

export interface ConditionStepConfig {
  // Dot-notation path into the current pipeline input (e.g. "body.status"),
  // shared by every case below. Omit to evaluate the whole input value.
  path?: string;
  // Evaluated in order; the first matching case's branch is the step's
  // output. No match -> branch: null, and execution falls back to a
  // "default"-branched edge if one exists, else the path ends there.
  cases: ConditionCase[];
}

interface WorkflowStepBase {
  id: string;
  workflowId: string;
  // Display/creation-order hint only (e.g. for a plain steps listing) — NOT
  // execution order. Actual execution follows workflow_step_edges from the
  // workflow's entryStepId.
  stepOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type WorkflowStep =
  | (WorkflowStepBase & { type: "agent"; config: AgentStepConfig })
  | (WorkflowStepBase & { type: "tool"; config: ToolStepConfig })
  | (WorkflowStepBase & { type: "condition"; config: ConditionStepConfig });

export type WorkflowStepPayload =
  | { type: "agent"; config: AgentStepConfig; stepOrder?: number }
  | { type: "tool"; config: ToolStepConfig; stepOrder?: number }
  | { type: "condition"; config: ConditionStepConfig; stepOrder?: number };

// Partial<WorkflowStepPayload> would collapse to only the keys shared by
// every variant (TS doesn't distribute Partial over a union on its own) —
// this distributes it manually, same trick as UpdateToolPayload in
// tool.types.ts.
export type UpdateWorkflowStepPayload = WorkflowStepPayload extends infer T
  ? T extends WorkflowStepPayload
    ? Partial<T>
    : never
  : never;

export interface WorkflowEdge {
  id: string;
  workflowId: string;
  fromStepId: string;
  toStepId: string;
  branch: string;
  createdAt: string;
}

export interface WorkflowEdgePayload {
  fromStepId: string;
  toStepId: string;
  branch?: string;
}

export interface Workflow {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  // Null until a first step is added (backend sets it automatically), or if
  // explicitly cleared. Where graph execution starts.
  entryStepId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowPayload {
  name: string;
  description?: string;
}

export type UpdateWorkflowPayload = Partial<WorkflowPayload> & {
  entryStepId?: string;
};

export interface WorkflowWithSteps extends Workflow {
  steps: WorkflowStep[];
  edges: WorkflowEdge[];
}

export type WorkflowRunStatus = "running" | "completed" | "failed";

export interface WorkflowRun {
  id: string;
  workflowId: string;
  triggeredByUserId: string;
  status: WorkflowRunStatus;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt: string;
  completedAt?: string;
  updatedAt: string;
}

export type WorkflowStepRunStatus = "success" | "failed" | "skipped";

export interface WorkflowStepRun {
  id: string;
  workflowRunId: string;
  workflowStepId: string;
  sequence: number;
  status: WorkflowStepRunStatus;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  createdAt: string;
}

export interface WorkflowRunWithStepRuns extends WorkflowRun {
  stepRuns: WorkflowStepRun[];
}

export interface ExecuteWorkflowPayload {
  input?: Record<string, unknown>;
}

// --- Phase-1-only, builder-local types (not part of the backend contract) ---

// Same discriminated union as WorkflowStep, but usable before a step is
// persisted: `id` is absent until saved, `clientId` is a stable React/React
// Flow node key generated client-side, and `position` is pure canvas view
// state — the backend has no coordinate field for a step at all, so this is
// never sent anywhere; Phase 2 maps WorkflowStepDraft[] -> WorkflowStepPayload[]
// by dropping both `clientId` and `position`.
export type WorkflowStepDraft = {
  clientId: string;
  id?: string;
  position: { x: number; y: number };
} & (
  | { type: "agent"; config: AgentStepConfig }
  | { type: "tool"; config: ToolStepConfig }
  | { type: "condition"; config: ConditionStepConfig }
);

// Mirrors WorkflowEdge the same way WorkflowStepDraft mirrors WorkflowStep —
// `from`/`toClientId` reference draft steps by clientId since neither side
// necessarily has a real id yet. Phase 2 resolves these to real step ids
// (from each addStep response) before POSTing edges.
export interface WorkflowEdgeDraft {
  clientId: string;
  id?: string;
  fromClientId: string;
  toClientId: string;
  branch: string;
}
