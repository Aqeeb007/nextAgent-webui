import {
  DEFAULT_BRANCH,
  type ConditionStepConfig,
  type WorkflowEdgeDraft,
  type WorkflowRunWithStepRuns,
  type WorkflowStepDraft,
  type WorkflowStepRun,
} from "../types/workflow.types";

function getByPath(value: unknown, path?: string): unknown {
  if (!path) return value;

  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, value);
}

// Mirrors the operator semantics of webapp-api's ConditionStepExecutor
// closely enough to demonstrate the real rule client-side: not a general
// evaluator, just the same 5 fixed operators.
function evaluateOperator(operator: string, actual: unknown, expected: unknown): boolean {
  switch (operator) {
    case "truthy":
      return Boolean(actual);
    case "falsy":
      return !actual;
    case "equals":
      return actual === expected;
    case "not_equals":
      return actual !== expected;
    case "contains":
      if (typeof actual === "string" && typeof expected === "string") {
        return actual.includes(expected);
      }
      if (Array.isArray(actual)) {
        return actual.includes(expected);
      }
      return false;
    default:
      return false;
  }
}

function evaluateCondition(config: ConditionStepConfig, input: unknown): { branch: string | null } {
  const actual = getByPath(input, config.path);
  const matched = config.cases.find((c) => evaluateOperator(c.operator, actual, c.value));
  return { branch: matched?.branch ?? null };
}

function toJsonb(value: unknown): Record<string, unknown> | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "object" && value !== null) return value as Record<string, unknown>;
  return { value };
}

// Mirrors WorkflowExecutionService.resolveNextStepId: a condition step
// routes to the outgoing edge whose branch matches its output branch,
// falling back to a DEFAULT_BRANCH edge if present; any other step type
// just follows its one DEFAULT_BRANCH edge.
function resolveNextClientId(
  step: WorkflowStepDraft,
  output: unknown,
  edgesFrom: Map<string, WorkflowEdgeDraft[]>
): string | null {
  const outgoing = edgesFrom.get(step.clientId) ?? [];

  if (step.type !== "condition") {
    return outgoing.find((edge) => edge.branch === DEFAULT_BRANCH)?.toClientId ?? null;
  }

  const branch =
    typeof output === "object" && output !== null
      ? ((output as { branch?: string | null }).branch ?? DEFAULT_BRANCH)
      : DEFAULT_BRANCH;

  const matched = outgoing.find((edge) => edge.branch === branch);
  if (matched) return matched.toClientId;

  if (branch !== DEFAULT_BRANCH) {
    const fallback = outgoing.find((edge) => edge.branch === DEFAULT_BRANCH);
    if (fallback) return fallback.toClientId;
  }

  return null;
}

// Client-side stand-in for `POST /workflows/:id/execute` — Phase 1 has no
// backend, but the graph-walking + branch semantics are simple enough to
// replicate faithfully, so the Execute dialog can demonstrate the real
// engine's behavior (branch routing, unreached steps marked `skipped`, not
// `failed`) without a server. Agent/tool steps can't actually run, so they
// just echo their config as a stand-in result.
export function mockExecuteWorkflow(
  steps: WorkflowStepDraft[],
  edges: WorkflowEdgeDraft[],
  entryClientId: string | null,
  input: Record<string, unknown>
): WorkflowRunWithStepRuns {
  const now = new Date().toISOString();
  const stepsByClientId = new Map(steps.map((step) => [step.clientId, step]));
  const edgesFrom = new Map<string, WorkflowEdgeDraft[]>();
  for (const edge of edges) {
    const outgoing = edgesFrom.get(edge.fromClientId) ?? [];
    outgoing.push(edge);
    edgesFrom.set(edge.fromClientId, outgoing);
  }

  const stepRuns: WorkflowStepRun[] = [];
  let currentInput: unknown = input;
  let status: "completed" | "failed" = "completed";
  let error: string | undefined;
  let currentClientId: string | null = entryClientId;
  const visited = new Set<string>();
  const maxSteps = steps.length + 1;

  if (!entryClientId) {
    error = "Workflow has no start step set";
    status = "failed";
  }

  while (currentClientId && visited.size < maxSteps) {
    if (visited.has(currentClientId)) {
      status = "failed";
      error = `Cycle detected at step ${currentClientId}`;
      break;
    }
    visited.add(currentClientId);

    const step = stepsByClientId.get(currentClientId);
    if (!step) break;

    const workflowStepId = step.id ?? step.clientId;

    if (step.type === "condition") {
      const { branch } = evaluateCondition(step.config, currentInput);
      const output = { branch, matched: branch !== null };

      stepRuns.push({
        id: `mock-${step.clientId}`,
        workflowRunId: "mock-run",
        workflowStepId,
        sequence: stepRuns.length + 1,
        status: "success",
        input: toJsonb(currentInput),
        output,
        createdAt: now,
      });

      currentInput = output;
      currentClientId = resolveNextClientId(step, output, edgesFrom);
      continue;
    }

    const output =
      step.type === "agent"
        ? { content: `Mocked response from agent ${step.config.agentId || "(unconfigured)"}` }
        : { result: `Mocked result from tool ${step.config.toolId || "(unconfigured)"}` };

    stepRuns.push({
      id: `mock-${step.clientId}`,
      workflowRunId: "mock-run",
      workflowStepId,
      sequence: stepRuns.length + 1,
      status: "success",
      input: toJsonb(currentInput),
      output,
      createdAt: now,
    });

    currentInput = output;
    currentClientId = resolveNextClientId(step, output, edgesFrom);
  }

  // Every step in the workflow gets a recorded outcome for this run, not
  // just the ones on the path taken — steps never reached (a different
  // branch, or downstream of a failure) are recorded 'skipped'.
  const skipped = steps.filter((step) => !visited.has(step.clientId));
  for (const step of skipped) {
    stepRuns.push({
      id: `mock-${step.clientId}`,
      workflowRunId: "mock-run",
      workflowStepId: step.id ?? step.clientId,
      sequence: stepRuns.length + 1,
      status: "skipped",
      createdAt: now,
    });
  }

  return {
    id: "mock-run",
    workflowId: "draft",
    triggeredByUserId: "you",
    status,
    input,
    output: toJsonb(currentInput),
    error,
    startedAt: now,
    completedAt: now,
    updatedAt: now,
    stepRuns,
  };
}
