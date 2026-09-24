"use client";

import Link from "next/link";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAgents } from "@/features/agents/hooks/use-agents";
import { useTools } from "@/features/tools/hooks/use-tools";

import type { WorkflowStepType } from "../types/workflow.types";

interface AddStepPickerDialogProps {
  type: Extract<WorkflowStepType, "agent" | "tool">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => void;
}

// Agent/tool steps need a real agentId/toolId the moment they're created —
// the backend validates config as a uuid on the first POST — so picking the
// specific one happens here, reusing the same Select combobox the step
// forms already use (proven, scrollable) rather than a dropdown submenu
// cramming a potentially long agent/tool list into a flyout.
export function AddStepPickerDialog({
  type,
  open,
  onOpenChange,
  onConfirm,
}: AddStepPickerDialogProps) {
  const { data: agents, isPending: agentsPending } = useAgents();
  const { data: tools, isPending: toolsPending } = useTools();
  // Base UI's Select treats `value === undefined` as "uncontrolled" and any
  // other value (including null) as "controlled" — the decision is locked
  // in on first render. `null` (not `""`) is its documented sentinel for
  // "nothing selected yet", so the value stays controlled the whole time
  // instead of flipping from uncontrolled to controlled once something is
  // picked.
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const items = type === "agent" ? agents : tools;
  const itemsPending = type === "agent" ? agentsPending : toolsPending;
  const noun = type === "agent" ? "agent" : "tool";

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) setSelectedId(null);
  }

  function handleConfirm() {
    if (!selectedId) return;
    onConfirm(selectedId);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {noun} step</DialogTitle>
          <DialogDescription>Choose which {noun} this step runs.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="add-step-picker">{noun === "agent" ? "Agent" : "Tool"}</Label>
          {items && items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You haven&apos;t created any {noun}s yet.{" "}
              <Link href={noun === "agent" ? "/agents" : "/tools"} className="text-primary hover:underline">
                Create {noun === "agent" ? "an agent" : "a tool"}
              </Link>
            </p>
          ) : (
            <Select
              items={items?.map((item) => ({ value: item.id, label: item.name })) ?? []}
              value={selectedId}
              onValueChange={setSelectedId}
              disabled={itemsPending}
            >
              <SelectTrigger id="add-step-picker" className="w-full">
                <SelectValue
                  placeholder={
                    itemsPending
                      ? `Loading ${noun}s…`
                      : noun === "agent"
                        ? "Select an agent"
                        : "Select a tool"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {items?.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedId}>
            Add step
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
