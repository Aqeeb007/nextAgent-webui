"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DEFAULT_BRANCH,
  type ConditionCase,
  type ConditionOperator,
  type ConditionStepConfig,
} from "../types/workflow.types";
import { CONDITION_OPERATORS } from "../utils/step-display";

interface ConditionStepFormProps {
  config: ConditionStepConfig;
  disabled: boolean;
  onChange: (config: ConditionStepConfig) => void;
}

const VALUE_OPERATORS: ConditionOperator[] = ["equals", "not_equals", "contains"];

function isDuplicateOrReserved(branch: string, cases: ConditionCase[], index: number): boolean {
  const trimmed = branch.trim();
  if (!trimmed) return false;
  if (trimmed === DEFAULT_BRANCH) return true;
  return cases.some((c, i) => i !== index && c.branch.trim() === trimmed);
}

// Each case becomes one labeled source handle on the condition node's
// canvas card, connected by dragging — this form only manages the case
// list itself (path/operator/value/branch name), not the connections.
export function ConditionStepForm({ config, disabled, onChange }: ConditionStepFormProps) {
  const [branchDrafts, setBranchDrafts] = useState(() => config.cases.map((c) => c.branch));

  function updateCase(index: number, patch: Partial<ConditionCase>) {
    onChange({
      ...config,
      cases: config.cases.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    });
  }

  function handleBranchChange(index: number, value: string) {
    setBranchDrafts((prev) => prev.map((b, i) => (i === index ? value : b)));
    if (!isDuplicateOrReserved(value, config.cases, index) && value.trim()) {
      updateCase(index, { branch: value.trim() });
    }
  }

  function addCase() {
    const branch = `case-${config.cases.length + 1}`;
    setBranchDrafts((prev) => [...prev, branch]);
    onChange({ ...config, cases: [...config.cases, { branch, operator: "truthy" }] });
  }

  function removeCase(index: number) {
    setBranchDrafts((prev) => prev.filter((_, i) => i !== index));
    onChange({ ...config, cases: config.cases.filter((_, i) => i !== index) });
  }

  function handleValueChange(index: number, text: string) {
    if (!text) {
      updateCase(index, { value: undefined });
      return;
    }
    try {
      updateCase(index, { value: JSON.parse(text) });
    } catch {
      // `value` is `unknown` on the backend, not restricted to JSON — an
      // unquoted bare word like `high` is a legitimate plain-string value,
      // not a parse error to block on. Fall back to the raw text.
      updateCase(index, { value: text });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="step-path">Path (optional)</Label>
        <Input
          id="step-path"
          value={config.path ?? ""}
          onChange={(event) => onChange({ ...config, path: event.target.value || undefined })}
          disabled={disabled}
          placeholder="e.g. body.status"
        />
        <p className="text-xs text-muted-foreground">
          Dot-notation path into the current pipeline input, shared by every case below. Leave
          blank to evaluate the whole input.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label>Cases</Label>
          {!disabled && (
            <Button type="button" variant="ghost" size="icon-xs" onClick={addCase}>
              <Plus />
            </Button>
          )}
        </div>

        {config.cases.map((c, index) => {
          const needsValue = VALUE_OPERATORS.includes(c.operator);
          const branchDraft = branchDrafts[index] ?? c.branch;
          const invalid = isDuplicateOrReserved(branchDraft, config.cases, index);

          return (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 p-2.5"
            >
              <div className="flex items-center gap-1.5">
                <Input
                  value={branchDraft}
                  onChange={(event) => handleBranchChange(index, event.target.value)}
                  disabled={disabled}
                  placeholder="Branch name"
                  aria-invalid={invalid}
                  className="h-7 flex-1 text-xs"
                />
                {!disabled && config.cases.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeCase(index)}
                    aria-label="Remove case"
                    className="hover:text-destructive"
                  >
                    <X />
                  </Button>
                )}
              </div>
              {invalid && (
                <p className="text-xs text-destructive">
                  Branch names must be unique and can&apos;t be &quot;default&quot; — that name is
                  reserved for the Else path.
                </p>
              )}

              <Select
                value={c.operator}
                onValueChange={(value) =>
                  value && updateCase(index, { operator: value as ConditionOperator })
                }
                disabled={disabled}
              >
                <SelectTrigger className="h-7 w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITION_OPERATORS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {needsValue && (
                <Input
                  value={
                    c.value === undefined
                      ? ""
                      : typeof c.value === "string"
                        ? c.value
                        : JSON.stringify(c.value)
                  }
                  onChange={(event) => handleValueChange(index, event.target.value)}
                  disabled={disabled}
                  placeholder="e.g. high or true"
                  className="h-7 text-xs"
                />
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Evaluated in order — the first matching case routes to that case&apos;s connection. No
        match (or a match with nothing connected) falls through to the Else connection.
      </p>
    </div>
  );
}
