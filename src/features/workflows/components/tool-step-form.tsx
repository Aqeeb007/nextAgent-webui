"use client";

import Link from "next/link";
import { useState } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTools } from "@/features/tools/hooks/use-tools";

import type { ToolStepConfig } from "../types/workflow.types";

interface ToolStepFormProps {
  config: ToolStepConfig;
  disabled: boolean;
  onChange: (config: ToolStepConfig) => void;
}

export function ToolStepForm({ config, disabled, onChange }: ToolStepFormProps) {
  const { data: tools, isPending } = useTools();

  const [argsText, setArgsText] = useState(() =>
    config.args ? JSON.stringify(config.args, null, 2) : ""
  );
  const [argsError, setArgsError] = useState<string | null>(null);

  function handleArgsChange(text: string) {
    setArgsText(text);

    if (!text.trim()) {
      setArgsError(null);
      onChange({ ...config, args: undefined });
      return;
    }

    try {
      const parsed: unknown = JSON.parse(text);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("Arguments must be a JSON object");
      }
      setArgsError(null);
      onChange({ ...config, args: parsed as Record<string, unknown> });
    } catch (err) {
      setArgsError(err instanceof Error ? err.message : "Arguments must be valid JSON");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="step-tool">Tool</Label>
        {tools && tools.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You haven&apos;t created any tools yet.{" "}
            <Link href="/tools" className="text-primary hover:underline">
              Create a tool
            </Link>
          </p>
        ) : (
          <Select
            value={config.toolId || undefined}
            onValueChange={(value) => value && onChange({ ...config, toolId: value })}
            disabled={disabled || isPending}
          >
            <SelectTrigger id="step-tool" className="w-full">
              <SelectValue placeholder={isPending ? "Loading tools…" : "Select a tool"} />
            </SelectTrigger>
            <SelectContent>
              {tools?.map((tool) => (
                <SelectItem key={tool.id} value={tool.id}>
                  {tool.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="step-args">Arguments (JSON)</Label>
        <Textarea
          id="step-args"
          value={argsText}
          onChange={(event) => handleArgsChange(event.target.value)}
          disabled={disabled}
          placeholder={'{ "key": "{{input}}" }'}
          className="min-h-32 font-mono text-xs"
        />
        {argsError && (
          <p role="alert" className="text-sm text-destructive">
            {argsError}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Any value equal to <code className="rounded bg-muted px-1 py-0.5">{"{{input}}"}</code>{" "}
          resolves to the current pipeline input.
        </p>
      </div>
    </div>
  );
}
