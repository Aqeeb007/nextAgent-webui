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
import { getErrorMessage } from "@/lib/api/error";

import { useExecuteWorkflow } from "../hooks/use-execute-workflow";
import type { WorkflowRun } from "../types/workflow.types";
import { WorkflowRunStatusBadge } from "./workflow-run-status-badge";

interface ExecuteWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: string;
  hasEntryStep: boolean;
}

// Modeled directly on TestToolDialog. POST /workflows/:id/execute is
// synchronous (blocks until the run finishes) and returns only the run row —
// no stepRuns — so the result panel here shows status + output/error only;
// step-by-step detail lives in the Runs tab (see workflow-run-history-panel).
export function ExecuteWorkflowDialog({
  open,
  onOpenChange,
  workflowId,
  hasEntryStep,
}: ExecuteWorkflowDialogProps) {
  const [inputText, setInputText] = useState("{}");
  const [inputError, setInputError] = useState<string | null>(null);
  const [result, setResult] = useState<WorkflowRun | null>(null);
  const { mutate, isPending, error, reset } = useExecuteWorkflow();

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
    setResult(null);
    reset();
    mutate({ workflowId, payload: { input } }, { onSuccess: setResult });
  }

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setInputText("{}");
      setInputError(null);
      setResult(null);
      reset();
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
            {!hasEntryStep && (
              <p className="text-sm text-muted-foreground">
                Set a start step on the canvas before running this workflow.
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {getErrorMessage(error)}
            </p>
          )}

          {result && (
            <div className="flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <WorkflowRunStatusBadge status={result.status} />
                {result.error && (
                  <span className="truncate text-xs text-destructive">{result.error}</span>
                )}
              </div>
              <pre className="max-h-48 w-full min-w-0 overflow-auto rounded-md bg-background p-2 font-mono text-xs text-foreground">
                {JSON.stringify(result.output, null, 2)}
              </pre>
              <p className="text-xs text-muted-foreground">
                See the Runs tab for step-by-step detail.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleRun} disabled={isPending || !hasEntryStep}>
            {isPending ? <Loader2 className="animate-spin" /> : <Play />}
            {isPending ? "Running…" : "Run"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
