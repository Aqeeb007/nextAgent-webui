"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import type { WorkflowStepType } from "../types/workflow.types";
import { STEP_TYPE_ICONS, STEP_TYPES } from "../utils/step-display";

interface AddStepMenuProps {
  onSelect: (type: WorkflowStepType) => void;
  className?: string;
  label?: string;
}

// Trigger for adding a new, unconnected step to the canvas — the user wires
// it into the graph afterwards by dragging a connection from/to it.
export function AddStepMenu({ onSelect, className, label }: AddStepMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size={label ? "sm" : "icon-sm"}
            className={cn("nodrag rounded-full border-dashed", className)}
          />
        }
      >
        <Plus className="size-3.5" />
        {label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        {STEP_TYPES.map((item) => {
          const Icon = STEP_TYPE_ICONS[item.value];
          return (
            <DropdownMenuItem key={item.value} onClick={() => onSelect(item.value)}>
              <Icon className="size-4" />
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
