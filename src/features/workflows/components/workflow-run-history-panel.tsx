"use client";

import { ChevronDown, ChevronRight, History } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";

import type { WorkflowRunWithStepRuns } from "../types/workflow.types";
import { WorkflowRunStatusBadge, WorkflowStepRunStatusBadge } from "./workflow-run-status-badge";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

interface WorkflowRunHistoryPanelProps {
  runs: WorkflowRunWithStepRuns[];
}

// Phase 1: `runs` is seeded from utils/mock-data.ts via a plain useState in
// the builder. Phase 2 only swaps that initializer for useWorkflowRuns(id) —
// this rendering is unchanged either way.
export function WorkflowRunHistoryPanel({ runs }: WorkflowRunHistoryPanelProps) {
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
      {runs.map((run) => {
        const isExpanded = expandedRunId === run.id;

        return (
          <div
            key={run.id}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          >
            <button
              type="button"
              onClick={() => setExpandedRunId(isExpanded ? null : run.id)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
            >
              {isExpanded ? (
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              )}
              <WorkflowRunStatusBadge status={run.status} />
              <span className="flex-1 truncate text-sm text-muted-foreground">
                {formatDateTime(run.startedAt)}
              </span>
              <Badge variant="outline" className="font-mono">
                {run.stepRuns.length} step{run.stepRuns.length === 1 ? "" : "s"}
              </Badge>
            </button>

            {isExpanded && (
              <div className="flex flex-col gap-2 border-t border-border bg-muted/10 px-4 py-3">
                {run.error && (
                  <p role="alert" className="text-sm text-destructive">
                    {run.error}
                  </p>
                )}
                {run.stepRuns.map((stepRun) => (
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
      })}
    </div>
  );
}
