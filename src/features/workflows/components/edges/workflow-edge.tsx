"use client";

import type { EdgeProps } from "@xyflow/react";
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from "@xyflow/react";
import { X } from "lucide-react";

import type { WorkflowRFEdge } from "../../utils/workflow-graph";
import { DEFAULT_BRANCH } from "../../types/workflow.types";

// A real, user-drawn connection between two steps — not derived from
// anything. Shows a branch label only when it's actually informative (a
// condition step's case/else edges); a plain agent/tool step's one
// "default" edge is purely structural, so no label there. Hover reveals a
// delete button — edges are removable independently of the steps they
// connect.
export function WorkflowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<WorkflowRFEdge>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 8,
  });

  if (!data) {
    return <BaseEdge id={id} path={edgePath} />;
  }

  const { branch, sourceType, canManage, onRemove } = data;
  const showBranchLabel = sourceType === "condition";
  const branchLabel = branch === DEFAULT_BRANCH ? "Else" : branch;

  return (
    <>
      <BaseEdge id={id} path={edgePath} className="stroke-border" />
      <EdgeLabelRenderer>
        <div
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          className="nodrag nopan pointer-events-auto absolute flex items-center gap-1"
        >
          {showBranchLabel && (
            <span className="rounded-full border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-xs">
              {branchLabel}
            </span>
          )}
          {canManage && onRemove && (
            <button
              type="button"
              onClick={() => onRemove(id)}
              aria-label="Remove connection"
              className="flex size-4 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-xs transition-colors hover:text-destructive"
            >
              <X className="size-2.5" />
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
