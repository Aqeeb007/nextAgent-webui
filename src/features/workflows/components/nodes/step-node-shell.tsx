"use client";

import { Handle, Position } from "@xyflow/react";
import { Flag, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SourceHandleSpec {
  id: string;
  label: string;
  connectable: boolean;
}

interface StepNodeShellProps {
  icon: LucideIcon;
  typeLabel: string;
  summary: ReactNode;
  selected: boolean;
  isEntry: boolean;
  canManage: boolean;
  sourceHandles: SourceHandleSpec[];
  onSelect: () => void;
  onRemove: () => void;
  onSetEntry: () => void;
}

// Shared chrome for the three step node types (agent/tool/condition) —
// extracted once, same "3+ repeats" threshold as PageHeader/StatCard. A
// single target handle on top always accepts connections (multiple incoming
// edges are fine — that's how branches converge); one or more source
// handles along the bottom, each individually disable-able once it already
// has an outgoing edge (mirrors the backend's one-edge-per-branch
// constraint instead of letting the user hit a 409 later).
export function StepNodeShell({
  icon: Icon,
  typeLabel,
  summary,
  selected,
  isEntry,
  canManage,
  sourceHandles,
  onSelect,
  onRemove,
  onSetEntry,
}: StepNodeShellProps) {
  return (
    <div className="w-72">
      <Handle
        type="target"
        position={Position.Top}
        className="size-2.5! border-2! border-card! bg-muted-foreground!"
      />

      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect();
          }
        }}
        className={cn(
          "group relative flex cursor-pointer flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm ring-1 ring-foreground/10 transition-all duration-150 hover:shadow-md",
          selected && "border-primary/40 ring-primary/30"
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 left-0 h-8 w-[3px] -translate-y-1/2 rounded-full bg-primary opacity-0 transition-opacity",
            selected && "opacity-100"
          )}
        />

        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </div>
          <span className="flex-1 truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {typeLabel}
          </span>
          {isEntry && (
            <Badge variant="outline" className="gap-1 text-[10px]">
              <Flag className="size-3" />
              Start
            </Badge>
          )}
          {canManage && (
            <div className="nodrag flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              {!isEntry && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSetEntry();
                  }}
                  aria-label="Set as start step"
                  title="Set as start step"
                >
                  <Flag />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove();
                }}
                aria-label="Remove step"
                className="hover:text-destructive"
              >
                <Trash2 />
              </Button>
            </div>
          )}
        </div>

        <div className="truncate text-sm text-foreground">{summary}</div>

        {sourceHandles.length > 1 && (
          <div className="nodrag flex justify-between gap-1 border-t border-border pt-1.5">
            {sourceHandles.map((handle) => (
              <span
                key={handle.id}
                className={cn(
                  "truncate rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground",
                  !handle.connectable && "text-primary/70"
                )}
                title={handle.label}
              >
                {handle.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {sourceHandles.map((handle, index) => (
        <Handle
          key={handle.id}
          id={handle.id}
          type="source"
          position={Position.Bottom}
          isConnectable={handle.connectable}
          style={{ left: `${((index + 1) / (sourceHandles.length + 1)) * 100}%` }}
          className={cn(
            "size-2.5! border-2! border-card! bg-muted-foreground!",
            !handle.connectable && "bg-primary!"
          )}
        />
      ))}
    </div>
  );
}
