"use client";

import { Loader2, Play } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type {
  WorkflowEdgeDraft,
  WorkflowRunWithStepRuns,
  WorkflowStepDraft,
} from "../types/workflow.types";
import { mockExecuteWorkflow } from "../utils/mock-execution";
import { WorkflowRunStatusBadge, WorkflowStepRunStatusBadge } from "./workflow-run-status-badge";

interface ExecuteWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  steps: WorkflowStepDraft[];
  edges: WorkflowEdgeDraft[];
  entryClientId: string | null;
}

// Modeled directly on TestToolDialog. Phase 1 has no backend to call, so
// this runs mockExecuteWorkflow client-side instead of POST
// /workflows/:id/execute — the setTimeout only exists to make the loading
// state visible, same as a real request would.
export function ExecuteWorkflowDialog({
  open,
  onOpenChange,
  steps,
  edges,
  entryClientId,
}: ExecuteWorkflowDialogProps) {
  const [inputText, setInputText] = useState("{}");
  const [inputError, setInputError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<WorkflowRunWithStepRuns | null>(null);

  function handleRun() {
    let input: Record<string, unknown>;

    try {
      const parsed: unknown = inputText.trim() ? JSON.parse(inputText) : {};
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("Input must be a JSON object");
      }
      input = parsed as Record<string, unknown>;
    } catch (err) {
      setInputError(err instanceof Error ? err.message : "Input must be valid JSON");
      return;
    }

    setInputError(null);
    setIsRunning(true);
    setResult(null);

    window.setTimeout(() => {
      setResult(mockExecuteWorkflow(steps, edges, entryClientId, input));
      setIsRunning(false);
    }, 400);
  }

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setInputText("{}");
      setInputError(null);
      setResult(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Execute workflow</DialogTitle>
          <DialogDescription>
            Starts at this workflow&apos;s start step and follows its connections, branching on
            any condition steps along the way.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="execute-input">Input (JSON)</Label>
            <Textarea
              id="execute-input"
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              className="min-h-24 font-mono text-xs"
            />
            {inputError && (
              <p role="alert" className="text-sm text-destructive">
                {inputError}
              </p>
            )}
            {!entryClientId && (
              <p className="text-sm text-muted-foreground">
                Set a start step on the canvas before running this workflow.
              </p>
            )}
          </div>

          {result && (
            <div className="flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <WorkflowRunStatusBadge status={result.status} />
                <span className="text-xs text-muted-foreground">
                  {result.stepRuns.length} step{result.stepRuns.length === 1 ? "" : "s"} run
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {result.stepRuns.map((stepRun) => (
                  <div key={stepRun.id} className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-muted-foreground">#{stepRun.sequence}</span>
                    <WorkflowStepRunStatusBadge status={stepRun.status} />
                  </div>
                ))}
              </div>
              <pre className="max-h-48 w-full min-w-0 overflow-auto rounded-md bg-background p-2 font-mono text-xs text-foreground">
                {JSON.stringify(result.output, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleRun} disabled={isRunning || !entryClientId}>
            {isRunning ? <Loader2 className="animate-spin" /> : <Play />}
            {isRunning ? "Running…" : "Run"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
