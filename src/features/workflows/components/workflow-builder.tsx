"use client";

import { Play, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ErrorState } from "@/components/common/ErrorState";
import { Loading } from "@/components/common/Loading";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentMembership } from "@/features/organizations/hooks/use-current-membership";
import {
  canDeleteWorkflows,
  canExecuteWorkflows,
  canManageWorkflows,
} from "@/features/organizations/utils/permissions";
import { getErrorMessage } from "@/lib/api/error";

import { useAddWorkflowEdge } from "../hooks/use-add-workflow-edge";
import { useAddWorkflowStep } from "../hooks/use-add-workflow-step";
import { useCreateWorkflow } from "../hooks/use-create-workflow";
import { useRemoveWorkflowEdge } from "../hooks/use-remove-workflow-edge";
import { useRemoveWorkflowStep } from "../hooks/use-remove-workflow-step";
import { useUpdateWorkflow } from "../hooks/use-update-workflow";
import { useWorkflow } from "../hooks/use-workflow";
import { useWorkflowRuns } from "../hooks/use-workflow-runs";
import type {
  WorkflowEdgeDraft,
  WorkflowStep,
  WorkflowStepDraft,
  WorkflowStepPayload,
} from "../types/workflow.types";
import { createStepDraft, stepDraftToPayload } from "../utils/create-step-draft";
import { layoutFromEntry } from "../utils/workflow-graph";
import { DeleteWorkflowDialog } from "./delete-workflow-dialog";
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

interface WorkflowBuilderProps {
  // null -> /workflows/new (create-gate form, nothing persisted yet).
  // A real id -> /workflows/:id (full builder, backed by useWorkflow(id)).
  workflowId: string | null;
}

export function WorkflowBuilder({ workflowId }: WorkflowBuilderProps) {
  if (workflowId === null) {
    return <CreateWorkflowForm />;
  }
  return <WorkflowEditor workflowId={workflowId} />;
}

// Explicit create gate: nothing is POSTed until the user submits this form,
// avoiding orphaned "Untitled workflow" rows from someone bouncing off
// /workflows/new. On success, moves to the real builder at /workflows/:id.
function CreateWorkflowForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { mutate, isPending, error } = useCreateWorkflow();

  function handleCreate() {
    if (!name.trim()) return;
    mutate(
      { name: name.trim(), description: description.trim() || undefined },
      { onSuccess: (workflow) => router.replace(`/workflows/${workflow.id}`) }
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[{ label: "Workflows", href: "/workflows" }]}
        title="New workflow"
        description="Name your workflow to start building it."
      />

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="workflow-name">Name</Label>
          <Input
            id="workflow-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Untitled workflow"
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="workflow-description">Description</Label>
          <Textarea
            id="workflow-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What does this workflow do?"
            className="min-h-16"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {getErrorMessage(error)}
          </p>
        )}

        <Button
          onClick={handleCreate}
          disabled={!name.trim() || isPending}
          className="w-fit gap-1.5"
        >
          {isPending ? "Creating…" : "Create workflow"}
        </Button>
      </div>
    </div>
  );
}

interface WorkflowEditorProps {
  workflowId: string;
}

// The real builder for an existing workflow. Every structural graph action
// (add/remove step, add/remove edge, set entry) persists immediately via its
// own mutation — there's no bulk save endpoint on the backend, and no local
// draft state to reconcile. Name/description and step config keep an
// explicit "Save" affordance instead (see StepConfigPanel).
function WorkflowEditor({ workflowId }: WorkflowEditorProps) {
  const router = useRouter();
  const { data: workflow, isPending, isError, refetch } = useWorkflow(workflowId);
  const { membership } = useCurrentMembership();
  const role = membership?.role.slug;
  const canManage = canManageWorkflows(role);
  const canExecute = canExecuteWorkflows(role);
  const canDelete = canDeleteWorkflows(role);

  // Backend has no coordinate column — position is pure client view state.
  // Dragging writes a per-step override here; anything not (yet) dragged
  // falls back to a fresh layoutFromEntry computation below, so the graph
  // re-flows sensibly as steps/edges change without needing an effect to
  // "sync" a snapshot from the query result.
  const [positionOverrides, setPositionOverrides] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [executeOpen, setExecuteOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  // null = "not locally edited" -> falls back to the loaded workflow's
  // value; set once the user types, cleared again after a successful save.
  const [nameOverride, setNameOverride] = useState<string | null>(null);
  const [descriptionOverride, setDescriptionOverride] = useState<string | null>(null);

  const defaultPositions = useMemo(() => {
    if (!workflow) return new Map<string, { x: number; y: number }>();
    return layoutFromEntry(workflow.steps, workflow.edges, workflow.entryStepId);
  }, [workflow]);

  const steps: WorkflowStepDraft[] = useMemo(() => {
    if (!workflow) return [];
    return workflow.steps.map((step) =>
      stepToDraft(
        step,
        positionOverrides[step.id] ?? defaultPositions.get(step.id) ?? { x: 0, y: 0 }
      )
    );
  }, [workflow, positionOverrides, defaultPositions]);

  const edgeDrafts: WorkflowEdgeDraft[] = useMemo(() => {
    if (!workflow) return [];
    return workflow.edges.map((edge) => ({
      clientId: edge.id,
      id: edge.id,
      fromClientId: edge.fromStepId,
      toClientId: edge.toStepId,
      branch: edge.branch,
    }));
  }, [workflow]);

  const selectedStep = steps.find((step) => step.clientId === selectedClientId) ?? null;

  const addStepMutation = useAddWorkflowStep();
  const removeStepMutation = useRemoveWorkflowStep();
  const addEdgeMutation = useAddWorkflowEdge();
  const removeEdgeMutation = useRemoveWorkflowEdge();
  const updateWorkflowMutation = useUpdateWorkflow();
  const { data: runs } = useWorkflowRuns(workflowId);

  // Agent/tool steps need a real agentId/toolId from the moment they're
  // created (the backend validates config as a uuid on the first POST), so
  // AddStepMenu already resolved a specific agent/tool before calling this —
  // there's no "blank step, fill in later" state to create. Condition steps
  // have no such requirement and use createStepDraft's default cases.
  function handleAddStep(payload: WorkflowStepPayload) {
    setActionError(null);
    addStepMutation.mutate(
      { workflowId, payload },
      {
        // No manual position seeding needed — defaultPositions recomputes
        // from layoutFromEntry once the refetch lands, placing the new step
        // via its (still-unplaced, since it has no edges yet) fallback slot.
        onSuccess: (created) => setSelectedClientId(created.id),
        onError: (err) => setActionError(getErrorMessage(err)),
      }
    );
  }

  function handleRemoveStep(clientId: string) {
    setActionError(null);
    removeStepMutation.mutate(
      { workflowId, stepId: clientId },
      {
        onSuccess: () => {
          setPositionOverrides((prev) => {
            if (!(clientId in prev)) return prev;
            const next = { ...prev };
            delete next[clientId];
            return next;
          });
          setSelectedClientId((prev) => (prev === clientId ? null : prev));
        },
        onError: (err) => setActionError(getErrorMessage(err)),
      }
    );
  }

  function handleSetEntry(clientId: string) {
    setActionError(null);
    updateWorkflowMutation.mutate(
      { id: workflowId, payload: { entryStepId: clientId } },
      { onError: (err) => setActionError(getErrorMessage(err)) }
    );
  }

  function handleAddEdge(fromClientId: string, branch: string, toClientId: string) {
    setActionError(null);
    addEdgeMutation.mutate(
      { workflowId, payload: { fromStepId: fromClientId, toStepId: toClientId, branch } },
      { onError: (err) => setActionError(getErrorMessage(err)) }
    );
  }

  function handleRemoveEdge(clientId: string) {
    setActionError(null);
    removeEdgeMutation.mutate(
      { workflowId, edgeId: clientId },
      { onError: (err) => setActionError(getErrorMessage(err)) }
    );
  }

  function handlePositionChange(clientId: string, position: { x: number; y: number }) {
    setPositionOverrides((prev) => ({ ...prev, [clientId]: position }));
  }

  function handleSaveDetails() {
    if (!workflow) return;
    setActionError(null);
    const trimmedName = (nameOverride ?? workflow.name).trim();
    const trimmedDescription = (descriptionOverride ?? workflow.description ?? "").trim();
    updateWorkflowMutation.mutate(
      { id: workflowId, payload: { name: trimmedName, description: trimmedDescription || undefined } },
      {
        onSuccess: () => {
          setNameOverride(null);
          setDescriptionOverride(null);
        },
        onError: (err) => setActionError(getErrorMessage(err)),
      }
    );
  }

  if (isPending) {
    return <Loading label="Loading workflow…" />;
  }

  if (isError || !workflow) {
    return <ErrorState title="Couldn't load workflow" onRetry={() => refetch()} />;
  }

  const name = nameOverride ?? workflow.name;
  const description = descriptionOverride ?? workflow.description ?? "";
  const detailsDirty = name !== workflow.name || description !== (workflow.description ?? "");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[{ label: "Workflows", href: "/workflows" }, { label: workflow.name }]}
        title={workflow.name}
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
              {canDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-1.5"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
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
            onChange={(event) => setNameOverride(event.target.value)}
            disabled={!canManage}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="workflow-description">Description</Label>
          <Textarea
            id="workflow-description"
            value={description}
            onChange={(event) => setDescriptionOverride(event.target.value)}
            disabled={!canManage}
            placeholder="What does this workflow do?"
            className="min-h-16"
          />
        </div>
        {canManage && (
          <Button
            size="sm"
            variant="outline"
            className="w-fit gap-1.5"
            onClick={handleSaveDetails}
            disabled={!detailsDirty || updateWorkflowMutation.isPending}
          >
            {updateWorkflowMutation.isPending ? "Saving…" : "Save details"}
          </Button>
        )}
      </div>

      {actionError && (
        <p role="alert" className="text-sm text-destructive">
          {actionError}
        </p>
      )}

      <Tabs defaultValue="builder">
        <TabsList variant="line">
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="runs">Runs</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="pt-4">
          {canManage && !workflow.entryStepId && steps.length > 0 && (
            <p className="mb-3 text-sm text-muted-foreground">
              No start step set — drag a connection from the <span className="font-medium">Start</span>{" "}
              marker to a step.
            </p>
          )}
          <WorkflowCanvas
            steps={steps}
            edges={edgeDrafts}
            entryClientId={workflow.entryStepId ?? null}
            selectedClientId={selectedClientId}
            canManage={canManage}
            onSelect={setSelectedClientId}
            onRemoveStep={handleRemoveStep}
            onSetEntry={handleSetEntry}
            onAddAgentStep={(agentId) => handleAddStep({ type: "agent", config: { agentId } })}
            onAddToolStep={(toolId) => handleAddStep({ type: "tool", config: { toolId } })}
            onAddConditionStep={() =>
              handleAddStep(stepDraftToPayload(createStepDraft("condition", { x: 0, y: 0 })))
            }
            onAddEdge={handleAddEdge}
            onRemoveEdge={handleRemoveEdge}
            onPositionChange={handlePositionChange}
          />
        </TabsContent>

        <TabsContent value="runs" className="pt-4">
          <WorkflowRunHistoryPanel workflowId={workflowId} runs={runs ?? []} />
        </TabsContent>
      </Tabs>

      <StepConfigPanel
        key={selectedStep?.clientId ?? "none"}
        workflowId={workflowId}
        step={selectedStep}
        edges={workflow.edges}
        open={selectedStep !== null}
        onOpenChange={(open) => !open && setSelectedClientId(null)}
        readOnly={!canManage}
      />

      <ExecuteWorkflowDialog
        open={executeOpen}
        onOpenChange={setExecuteOpen}
        workflowId={workflowId}
        hasEntryStep={Boolean(workflow.entryStepId)}
      />

      <DeleteWorkflowDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        workflow={workflow}
        onDeleted={() => router.push("/workflows")}
      />
    </div>
  );
}
