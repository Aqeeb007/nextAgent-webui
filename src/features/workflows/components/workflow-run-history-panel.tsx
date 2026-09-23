"use client";

import { ChevronDown, ChevronRight, History, Loader2 } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { getErrorMessage } from "@/lib/api/error";

import { useWorkflowRun } from "../hooks/use-workflow-run";
import type { WorkflowRun } from "../types/workflow.types";
import { WorkflowRunStatusBadge, WorkflowStepRunStatusBadge } from "./workflow-run-status-badge";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

interface WorkflowRunRowProps {
  workflowId: string;
  run: WorkflowRun;
  expanded: boolean;
  onToggle: () => void;
}

// Per-step detail only exists on GET /workflows/:id/runs/:runId — the list
// endpoint this panel's `runs` prop comes from has no stepRuns — so each row
// fetches its own detail, and only once expanded.
function WorkflowRunRow({ workflowId, run, expanded, onToggle }: WorkflowRunRowProps) {
  const { data: detail, isPending, isError, error } = useWorkflowRun(
    workflowId,
    expanded ? run.id : null
  );

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
          {detail?.stepRuns.map((stepRun) => (
            <div
              key={stepRun.id}
              className="flex items-center gap-2.5 rounded-lg bg-muted/30 px-2.5 py-2 text-sm"
            >
              <span className="font-mono text-xs text-muted-foreground">
                #{stepRun.sequence}
              </span>
              <WorkflowStepRunStatusBadge status={stepRun.status} />
              {stepRun.error && (
                <span className="truncate text-xs text-destructive" title={stepRun.error}>
                  {stepRun.error}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface WorkflowRunHistoryPanelProps {
  workflowId: string;
  runs: WorkflowRun[];
}

export function WorkflowRunHistoryPanel({ workflowId, runs }: WorkflowRunHistoryPanelProps) {
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
          expanded={expandedRunId === run.id}
          onToggle={() => setExpandedRunId((prev) => (prev === run.id ? null : run.id))}
        />
      ))}
    </div>
  );
}
