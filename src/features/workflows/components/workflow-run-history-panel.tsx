"use client";

import { ChevronDown, ChevronRight, History, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { getErrorMessage } from "@/lib/api/error";

import { useWorkflowRun } from "../hooks/use-workflow-run";
import type { WorkflowRun, WorkflowStep, WorkflowStepRun } from "../types/workflow.types";
import { WorkflowRunStatusBadge, WorkflowStepRunStatusBadge } from "./workflow-run-status-badge";
import { WorkflowStepConfigSummary } from "./workflow-step-config-summary";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

// Compact pretty-printed JSON block, same pattern as TestToolDialog's result
// preview — reused here so a step's recorded input/output isn't just a
// status badge with nothing behind it.
function JsonBlock({ label, value }: { label: string; value: Record<string, unknown> }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <pre className="max-h-40 w-full min-w-0 overflow-auto rounded-md bg-background p-2 font-mono text-xs text-foreground">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

interface StepRunRowProps {
  stepRun: WorkflowStepRun;
  step?: WorkflowStep;
  // 1-based position of this step within *this* run's already-sorted
  // stepRuns array — not stepRun.sequence, which is a bigserial shared
  // across every run of every workflow (same idiom as messages.sequence,
  // an ordering tiebreaker, not a per-run display counter) and so jumps
  // around (e.g. "#69, #70...") once more than one run exists.
  position: number;
}

function StepRunRow({ stepRun, step, position }: StepRunRowProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-muted/30 px-2.5 py-2 text-sm">
      <div className="flex items-center gap-2.5">
        <span className="font-mono text-xs text-muted-foreground">#{position}</span>
        <WorkflowStepRunStatusBadge status={stepRun.status} />
        {step ? (
          <span className="truncate text-xs text-muted-foreground">
            <WorkflowStepConfigSummary step={step} />
          </span>
        ) : (
          <span className="truncate text-xs text-muted-foreground">Step not found</span>
        )}
        {stepRun.error && (
          <span className="truncate text-xs text-destructive" title={stepRun.error}>
            {stepRun.error}
          </span>
        )}
      </div>
      {(stepRun.input || stepRun.output) && (
        <div className="flex flex-col gap-2 sm:flex-row">
          {stepRun.input && <JsonBlock label="Input" value={stepRun.input} />}
          {stepRun.output && <JsonBlock label="Output" value={stepRun.output} />}
        </div>
      )}
    </div>
  );
}

interface WorkflowRunRowProps {
  workflowId: string;
  run: WorkflowRun;
  steps: WorkflowStep[];
  expanded: boolean;
  onToggle: () => void;
}

// Per-step detail only exists on GET /workflows/:id/runs/:runId — the list
// endpoint this panel's `runs` prop comes from has no stepRuns — so each row
// fetches its own detail, and only once expanded.
function WorkflowRunRow({ workflowId, run, steps, expanded, onToggle }: WorkflowRunRowProps) {
  const { data: detail, isPending, isError, error } = useWorkflowRun(
    workflowId,
    expanded ? run.id : null
  );
  const stepsById = useMemo(() => new Map(steps.map((step) => [step.id, step])), [steps]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
      >
        {expanded ? (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        )}
        <WorkflowRunStatusBadge status={run.status} />
        <span className="flex-1 truncate text-sm text-muted-foreground">
          {formatDateTime(run.startedAt)}
        </span>
      </button>

      {expanded && (
        <div className="flex flex-col gap-2 border-t border-border bg-muted/10 px-4 py-3">
          {isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Loading step detail…
            </div>
          )}
          {isError && (
            <p role="alert" className="text-sm text-destructive">
              {getErrorMessage(error)}
            </p>
          )}
          {detail?.error && (
            <p role="alert" className="text-sm text-destructive">
              {detail.error}
            </p>
          )}
          {detail?.stepRuns.map((stepRun, index) => (
            <StepRunRow
              key={stepRun.id}
              stepRun={stepRun}
              step={stepsById.get(stepRun.workflowStepId)}
              position={index + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface WorkflowRunHistoryPanelProps {
  workflowId: string;
  runs: WorkflowRun[];
  steps: WorkflowStep[];
}

export function WorkflowRunHistoryPanel({ workflowId, runs, steps }: WorkflowRunHistoryPanelProps) {
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  if (runs.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No runs yet"
        description="Execute this workflow to see its run history here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {runs.map((run) => (
        <WorkflowRunRow
          key={run.id}
          workflowId={workflowId}
          run={run}
          steps={steps}
          expanded={expandedRunId === run.id}
          onToggle={() => setExpandedRunId((prev) => (prev === run.id ? null : run.id))}
        />
      ))}
    </div>
  );
}
