import type { Edge, Node } from "@xyflow/react";

import {
  DEFAULT_BRANCH,
  type ConditionStepConfig,
  type WorkflowEdgeDraft,
  type WorkflowStepDraft,
  type WorkflowStepType,
} from "../types/workflow.types";

export const START_NODE_ID = "__start__";
export const FINISH_NODE_ID = "__finish__";

export interface StepNodeData extends Record<string, unknown> {
  step: WorkflowStepDraft;
  selected: boolean;
  isEntry: boolean;
  canManage: boolean;
  // Branches that already have an outgoing edge from this step — used to
  // disable a source handle once it's connected (backend enforces at most
  // one edge per (fromStepId, branch) via a unique constraint; the UI
  // mirrors that by refusing to start a second connection from the same
  // handle instead of letting the user hit a 409 later).
  usedBranches: Set<string>;
  onSelect: (clientId: string) => void;
  onRemove: (clientId: string) => void;
  onSetEntry: (clientId: string) => void;
}

export type StepNode = Node<StepNodeData, WorkflowStepType>;
export type MarkerNode = Node<Record<string, unknown>, "start-marker" | "finish-marker">;
export type WorkflowNode = StepNode | MarkerNode;

export interface SourceHandleSpec {
  id: string;
  label: string;
  connectable: boolean;
}

export function buildSourceHandles(data: StepNodeData): SourceHandleSpec[] {
  const { step, usedBranches } = data;
  const branches = resolveOutgoingBranches(
    step.type,
    step.type === "condition" ? step.config : undefined
  );

  return branches.map(({ branch, label }) => ({
    id: branch,
    label,
    connectable: !usedBranches.has(branch),
  }));
}

export interface WorkflowEdgeData extends Record<string, unknown> {
  branch: string;
  // "start" marks the one edge from the Start marker to the entry step.
  sourceType: WorkflowStepType | "start";
  canManage: boolean;
  // Absent for the start edge: the backend has no way to explicitly clear
  // `entryStepId` back to null once set (PATCH only accepts a valid step
  // uuid, never null) — only re-pointing it at a different step by dragging
  // a new connection from Start is supported, so no remove control renders.
  onRemove?: (clientId: string) => void;
}

export type WorkflowRFEdge = Edge<WorkflowEdgeData, "workflow-edge">;

// Dashed, non-interactive lines from every currently-unconnected source
// handle to the Finish marker — purely a visual "this is where a run could
// end" cue. Not real data: the backend has no "finish step" entity at all,
// a path just ends when resolveNextStepId finds no matching outgoing edge.
export type TerminalRFEdge = Edge<Record<string, unknown>, "terminal-edge">;

// A condition step fans out one source handle per case, plus one fixed
// "Else" handle (branch DEFAULT_BRANCH) as its catch-all — mirrors
// WorkflowExecutionService.resolveNextStepId's fallback semantics on the
// backend exactly. Non-condition steps get a single handle, always branch
// DEFAULT_BRANCH.
export function resolveOutgoingBranches(
  type: WorkflowStepType,
  config: ConditionStepConfig | undefined
): { branch: string; label: string }[] {
  if (type !== "condition" || !config) {
    return [{ branch: DEFAULT_BRANCH, label: "Out" }];
  }

  return [
    ...config.cases.map((c) => ({ branch: c.branch, label: c.branch })),
    { branch: DEFAULT_BRANCH, label: "Else" },
  ];
}

interface BuildGraphOptions {
  selectedClientId: string | null;
  entryClientId: string | null;
  canManage: boolean;
  onSelect: (clientId: string) => void;
  onRemove: (clientId: string) => void;
  onSetEntry: (clientId: string) => void;
  onRemoveEdge: (clientId: string) => void;
}

const MARKER_GAP = 160;

// `steps`/`edges` (including each step's own `position`) are the single
// source of truth — nodes/edges are derived from them on every render.
// Position genuinely lives on each step draft (the backend has no
// coordinate field either way, so there was never anything to lose by
// making it real, draggable view state instead of a recomputed grid). The
// Start/Finish markers are the one exception: their position is always
// recomputed from the current steps' bounding box, since they aren't steps
// themselves and have nothing to drag-persist.
export function buildWorkflowGraph(
  steps: WorkflowStepDraft[],
  edges: WorkflowEdgeDraft[],
  options: BuildGraphOptions
): { nodes: WorkflowNode[]; edges: (WorkflowRFEdge | TerminalRFEdge)[] } {
  const {
    selectedClientId,
    entryClientId,
    canManage,
    onSelect,
    onRemove,
    onSetEntry,
    onRemoveEdge,
  } = options;

  const stepsByClientId = new Map(steps.map((step) => [step.clientId, step]));

  const xs = steps.map((step) => step.position.x);
  const ys = steps.map((step) => step.position.y);
  const centerX = xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
  const minY = ys.length ? Math.min(...ys) : 0;
  const maxY = ys.length ? Math.max(...ys) : 0;

  const startNode: MarkerNode = {
    id: START_NODE_ID,
    type: "start-marker",
    position: { x: centerX, y: minY - MARKER_GAP },
    data: {},
    draggable: false,
    selectable: false,
  };

  const finishNode: MarkerNode = {
    id: FINISH_NODE_ID,
    type: "finish-marker",
    position: { x: centerX, y: maxY + MARKER_GAP },
    data: {},
    draggable: false,
    selectable: false,
  };

  const stepNodes: StepNode[] = steps.map((step) => {
    const usedBranches = new Set(
      edges.filter((edge) => edge.fromClientId === step.clientId).map((edge) => edge.branch)
    );

    return {
      id: step.clientId,
      type: step.type,
      position: step.position,
      data: {
        step,
        selected: step.clientId === selectedClientId,
        isEntry: step.clientId === entryClientId,
        canManage,
        usedBranches,
        onSelect,
        onRemove,
        onSetEntry,
      },
    };
  });

  const rfEdges: WorkflowRFEdge[] = edges
    .filter((edge) => stepsByClientId.has(edge.fromClientId) && stepsByClientId.has(edge.toClientId))
    .map((edge) => ({
      id: edge.clientId,
      source: edge.fromClientId,
      sourceHandle: edge.branch,
      target: edge.toClientId,
      type: "workflow-edge",
      data: {
        branch: edge.branch,
        sourceType: stepsByClientId.get(edge.fromClientId)!.type,
        canManage,
        onRemove: onRemoveEdge,
      },
    }));

  if (entryClientId && stepsByClientId.has(entryClientId)) {
    rfEdges.push({
      id: "__start_edge__",
      source: START_NODE_ID,
      target: entryClientId,
      type: "workflow-edge",
      data: {
        branch: DEFAULT_BRANCH,
        sourceType: "start",
        canManage,
      },
    });
  }

  const terminalEdges: TerminalRFEdge[] = [];
  for (const step of steps) {
    const branches = resolveOutgoingBranches(
      step.type,
      step.type === "condition" ? step.config : undefined
    );
    const usedBranches = new Set(
      edges.filter((edge) => edge.fromClientId === step.clientId).map((edge) => edge.branch)
    );

    for (const branch of branches) {
      if (usedBranches.has(branch.branch)) continue;
      terminalEdges.push({
        id: `__finish_${step.clientId}_${branch.branch}__`,
        source: step.clientId,
        sourceHandle: branch.branch,
        target: FINISH_NODE_ID,
        type: "terminal-edge",
        data: {},
      });
    }
  }

  return { nodes: [startNode, finishNode, ...stepNodes], edges: [...rfEdges, ...terminalEdges] };
}

// Mirrors WorkflowsService.canReach on the backend: would adding an edge
// fromClientId -> toClientId close a cycle? True if toClientId can already
// reach fromClientId by walking forward through the existing edges.
export function wouldCreateCycle(
  edges: WorkflowEdgeDraft[],
  fromClientId: string,
  toClientId: string
): boolean {
  if (fromClientId === toClientId) return true;

  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    const next = adjacency.get(edge.fromClientId) ?? [];
    next.push(edge.toClientId);
    adjacency.set(edge.fromClientId, next);
  }

  const stack = [toClientId];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === fromClientId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const next of adjacency.get(current) ?? []) {
      stack.push(next);
    }
  }

  return false;
}

// Simple staggered grid for a freshly added, not-yet-connected step — just
// needs to not land exactly on top of existing nodes. Free dragging (the
// position each step actually keeps) does the rest.
export function nextStepPosition(existingCount: number): { x: number; y: number } {
  const COLUMN_WIDTH = 300;
  const ROW_HEIGHT = 160;
  const COLUMNS = 3;

  return {
    x: (existingCount % COLUMNS) * COLUMN_WIDTH,
    y: Math.floor(existingCount / COLUMNS) * ROW_HEIGHT,
  };
}

// One-time initial layout for a workflow loaded with steps that have no
// client-side position yet (GET /workflows/:id returns no coordinates at
// all). Layers steps by
// BFS distance from the entry step so the graph reads top-to-bottom with
// siblings spread horizontally; anything unreachable from the entry (or
// there's no entry yet) falls back to the staggered grid above. This runs
// once per workflow load, never on every render — after that, position is
// whatever the user dragged it to.
export function layoutFromEntry<T extends { id: string }>(
  steps: T[],
  edgesFromTo: { fromStepId: string; toStepId: string }[],
  entryStepId: string | null | undefined
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const COLUMN_WIDTH = 300;
  const ROW_HEIGHT = 160;

  const adjacency = new Map<string, string[]>();
  for (const edge of edgesFromTo) {
    const next = adjacency.get(edge.fromStepId) ?? [];
    next.push(edge.toStepId);
    adjacency.set(edge.fromStepId, next);
  }

  const levels: string[][] = [];
  const placed = new Set<string>();

  if (entryStepId) {
    let frontier = [entryStepId];
    while (frontier.length > 0) {
      const level = frontier.filter((id) => !placed.has(id));
      level.forEach((id) => placed.add(id));
      if (level.length === 0) break;
      levels.push(level);

      const nextFrontierSet = new Set<string>();
      for (const id of level) {
        for (const next of adjacency.get(id) ?? []) {
          if (!placed.has(next)) nextFrontierSet.add(next);
        }
      }
      frontier = [...nextFrontierSet];
    }
  }

  levels.forEach((level, levelIndex) => {
    const offset = (level.length - 1) / 2;
    level.forEach((id, i) => {
      positions.set(id, { x: (i - offset) * COLUMN_WIDTH, y: levelIndex * ROW_HEIGHT });
    });
  });

  const unplaced = steps.filter((step) => !placed.has(step.id));
  unplaced.forEach((step, i) => {
    positions.set(step.id, {
      x: i * COLUMN_WIDTH,
      y: (levels.length + 1) * ROW_HEIGHT,
    });
  });

  return positions;
}
