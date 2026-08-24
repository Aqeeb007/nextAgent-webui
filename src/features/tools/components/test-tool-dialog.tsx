"use client";

import { Loader2, Play } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
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
import { useTestTool } from "@/features/tools/hooks/use-test-tool";
import type { Tool } from "@/features/tools/types/tool.types";
import { getErrorMessage } from "@/lib/api/error";

interface TestToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tool: Tool | null;
}

function testDescription(tool: Tool | null): string {
  if (!tool) return "";

  if (tool.type === "http") {
    return `Calls ${tool.config.method} ${tool.config.url} with these arguments.`;
  }

  if (tool.type === "database") {
    return `Runs this tool's query against ${tool.config.engine} with these arguments as named parameters.`;
  }

  return "Runs this tool's script with these arguments available as `args`.";
}

export function TestToolDialog({ open, onOpenChange, tool }: TestToolDialogProps) {
  const [argsText, setArgsText] = useState("{}");
  const [argsError, setArgsError] = useState<string | null>(null);
  const { mutate, data: result, isPending, error, reset } = useTestTool();

  function handleRun() {
    if (!tool) return;

    try {
      const parsed: unknown = argsText.trim() ? JSON.parse(argsText) : {};
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("Arguments must be a JSON object");
      }
      setArgsError(null);
      mutate({ id: tool.id, payload: { args: parsed as Record<string, unknown> } });
    } catch (err) {
      setArgsError(err instanceof Error ? err.message : "Arguments must be valid JSON");
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setArgsText("{}");
      setArgsError(null);
      reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Test {tool?.name}</DialogTitle>
          <DialogDescription>{testDescription(tool)}</DialogDescription>
        </DialogHeader>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="test-args">Arguments (JSON)</Label>
            <Textarea
              id="test-args"
              value={argsText}
              onChange={(event) => setArgsText(event.target.value)}
              className="min-h-24 font-mono text-xs"
            />
            {argsError && (
              <p role="alert" className="text-sm text-destructive">
                {argsError}
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
                <Badge variant={result.ok ? "success" : "destructive"}>
                  {result.ok ? "Success" : "Failed"}
                </Badge>
                <span className="font-mono text-xs text-muted-foreground">
                  status {result.status}
                </span>
                {result.truncated && (
                  <Badge variant="warning">Truncated</Badge>
                )}
              </div>
              <pre className="max-h-64 w-full min-w-0 overflow-auto rounded-md bg-background p-2 font-mono text-xs text-foreground">
                {JSON.stringify(result.body, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleRun} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : <Play />}
            {isPending ? "Running…" : "Run"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
