"use client";

import { Play, Save } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentMembership } from "@/features/organizations/hooks/use-current-membership";
import {
  canExecuteWorkflows,
  canManageWorkflows,
} from "@/features/organizations/utils/permissions";

import {
  DEFAULT_BRANCH,
  type WorkflowEdgeDraft,
  type WorkflowStep,
  type WorkflowStepDraft,
  type WorkflowStepType,
  type WorkflowWithSteps,
} from "../types/workflow.types";
import { createStepDraft } from "../utils/create-step-draft";
import { mockRunsByWorkflowId } from "../utils/mock-data";
import { layoutFromEntry, nextStepPosition } from "../utils/workflow-graph";
import { ExecuteWorkflowDialog } from "./execute-workflow-dialog";
import { StepConfigPanel } from "./step-config-panel";
import { WorkflowCanvas } from "./workflow-canvas";
import { WorkflowRunHistoryPanel } from "./workflow-run-history-panel";

function stepToDraft(step: WorkflowStep, position: { x: number; y: number }): WorkflowStepDraft {
  if (step.type === "agent") {
    return { clientId: step.id, id: step.id, type: "agent", config: step.config, position };
  }
  if (step.type === "tool") {
    return { clientId: step.id, id: step.id, type: "tool", config: step.config, position };
  }
  return { clientId: step.id, id: step.id, type: "condition", config: step.config, position };
}

// A loaded workflow's steps have no client-side position at all (the
// backend has no coordinate field) — this runs once, on initial state, to
// give them a sensible starting layout. After that, position lives on each
// draft and free dragging is the only thing that changes it.
function initialStepsAndEdges(
  workflow: WorkflowWithSteps
): { steps: WorkflowStepDraft[]; edges: WorkflowEdgeDraft[] } {
  const positions = layoutFromEntry(workflow.steps, workflow.edges, workflow.entryStepId);
  const steps = workflow.steps.map((step) =>
    stepToDraft(step, positions.get(step.id) ?? { x: 0, y: 0 })
  );
  // clientId === id for a loaded step (see stepToDraft), so edges need no
  // id translation.
  const edges: WorkflowEdgeDraft[] = workflow.edges.map((edge) => ({
    clientId: edge.id,
    id: edge.id,
    fromClientId: edge.fromStepId,
    toClientId: edge.toStepId,
    branch: edge.branch,
  }));

  return { steps, edges };
}

// A condition step's valid outgoing branches are its cases' branch names
// plus the fixed DEFAULT_BRANCH ("Else") — used to prune edges left
// dangling when a case is renamed or removed in the config panel.
function validBranchesFor(step: WorkflowStepDraft): Set<string> {
  if (step.type !== "condition") return new Set([DEFAULT_BRANCH]);
  return new Set([...step.config.cases.map((c) => c.branch), DEFAULT_BRANCH]);
}

interface WorkflowBuilderProps {
  initialWorkflow: WorkflowWithSteps | null;
}

// Renders both /workflows/new (initialWorkflow: null, empty draft) and
// /workflows/[id] (pre-seeded from mock-data.ts) — same idiom as
// ToolFormDialog taking `tool: Tool | null`. Phase 1 has no backend: `steps`
// and `edges` are local component state, nothing here persists. Phase 2
// swaps this for useCreateWorkflow/useWorkflow+useUpdateWorkflow (plus
// step/edge mutations) without changing the surrounding structure.
export function WorkflowBuilder({ initialWorkflow }: WorkflowBuilderProps) {
  const { membership } = useCurrentMembership();
  const role = membership?.role.slug;
  const canManage = canManageWorkflows(role);
  const canExecute = canExecuteWorkflows(role);

  const [name, setName] = useState(initialWorkflow?.name ?? "");
  const [description, setDescription] = useState(initialWorkflow?.description ?? "");
  const [{ steps, edges }, setGraph] = useState<{
    steps: WorkflowStepDraft[];
    edges: WorkflowEdgeDraft[];
  }>(() => (initialWorkflow ? initialStepsAndEdges(initialWorkflow) : { steps: [], edges: [] }));
  const [entryClientId, setEntryClientId] = useState<string | null>(
    initialWorkflow?.entryStepId ?? null
  );
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [executeOpen, setExecuteOpen] = useState(false);
  const [runs] = useState(() =>
    initialWorkflow ? (mockRunsByWorkflowId[initialWorkflow.id] ?? []) : []
  );

  const selectedStep = steps.find((step) => step.clientId === selectedClientId) ?? null;

  function handleAddStep(type: WorkflowStepType) {
    const draft = createStepDraft(type, nextStepPosition(steps.length));
    setGraph((prev) => ({ ...prev, steps: [...prev.steps, draft] }));
    setSelectedClientId(draft.clientId);
    // A workflow with no start step yet gets one automatically from its
    // first added step — mirrors WorkflowsService.addStep on the backend.
    setEntryClientId((prev) => prev ?? draft.clientId);
  }

  function handleRemoveStep(clientId: string) {
    setGraph((prev) => ({
      steps: prev.steps.filter((step) => step.clientId !== clientId),
      edges: prev.edges.filter(
        (edge) => edge.fromClientId !== clientId && edge.toClientId !== clientId
      ),
    }));
    setSelectedClientId((prev) => (prev === clientId ? null : prev));
    setEntryClientId((prev) => (prev === clientId ? null : prev));
  }

  function handleSetEntry(clientId: string) {
    setEntryClientId(clientId);
  }

  function handleUnsetEntry() {
    setEntryClientId(null);
  }

  function handleAddEdge(fromClientId: string, branch: string, toClientId: string) {
    setGraph((prev) => ({
      ...prev,
      edges: [
        ...prev.edges,
        { clientId: crypto.randomUUID(), fromClientId, branch, toClientId },
      ],
    }));
  }

  function handleRemoveEdge(clientId: string) {
    setGraph((prev) => ({ ...prev, edges: prev.edges.filter((edge) => edge.clientId !== clientId) }));
  }

  function handlePositionChange(clientId: string, position: { x: number; y: number }) {
    setGraph((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => (step.clientId === clientId ? { ...step, position } : step)),
    }));
  }

  function handleStepChange(next: WorkflowStepDraft) {
    setGraph((prev) => {
      const validBranches = validBranchesFor(next);
      return {
        steps: prev.steps.map((step) => (step.clientId === next.clientId ? next : step)),
        // Prune edges left dangling by a renamed/removed condition case —
        // an edge from this step whose branch no longer exists has nothing
        // valid to represent.
        edges: prev.edges.filter(
          (edge) => edge.fromClientId !== next.clientId || validBranches.has(edge.branch)
        ),
      };
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[{ label: "Workflows", href: "/workflows" }, { label: name || "Untitled workflow" }]}
        title={name || "Untitled workflow"}
        description={initialWorkflow ? undefined : "Draft — nothing is saved yet."}
        actions={
          membership && (
            <>
              {canExecute && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => setExecuteOpen(true)}
                  disabled={steps.length === 0}
                >
                  <Play className="size-4" />
                  Execute
                </Button>
              )}
              {canManage ? (
                <Button
                  size="sm"
                  className="gap-1.5"
                  disabled
                  title="Workflow persistence isn't wired up yet"
                >
                  <Save className="size-4" />
                  Save
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">View only</p>
              )}
            </>
          )
        }
      />

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="workflow-name">Name</Label>
          <Input
            id="workflow-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={!canManage}
            placeholder="Untitled workflow"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="workflow-description">Description</Label>
          <Textarea
            id="workflow-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={!canManage}
            placeholder="What does this workflow do?"
            className="min-h-16"
          />
        </div>
      </div>

      <Tabs defaultValue="builder">
        <TabsList variant="line">
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="runs">Runs</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="pt-4">
          {canManage && !entryClientId && steps.length > 0 && (
            <p className="mb-3 text-sm text-muted-foreground">
              No start step set — drag a connection from the <span className="font-medium">Start</span>{" "}
              marker to a step, or click its flag icon.
            </p>
          )}
          <WorkflowCanvas
            steps={steps}
            edges={edges}
            entryClientId={entryClientId}
            selectedClientId={selectedClientId}
            canManage={canManage}
            onSelect={setSelectedClientId}
            onRemoveStep={handleRemoveStep}
            onSetEntry={handleSetEntry}
            onUnsetEntry={handleUnsetEntry}
            onAddStep={handleAddStep}
            onAddEdge={handleAddEdge}
            onRemoveEdge={handleRemoveEdge}
            onPositionChange={handlePositionChange}
          />
        </TabsContent>

        <TabsContent value="runs" className="pt-4">
          <WorkflowRunHistoryPanel runs={runs} />
        </TabsContent>
      </Tabs>

      <StepConfigPanel
        step={selectedStep}
        open={selectedStep !== null}
        onOpenChange={(open) => !open && setSelectedClientId(null)}
        onChange={handleStepChange}
        readOnly={!canManage}
      />

      <ExecuteWorkflowDialog
        open={executeOpen}
        onOpenChange={setExecuteOpen}
        steps={steps}
        edges={edges}
        entryClientId={entryClientId}
      />
    </div>
  );
}
