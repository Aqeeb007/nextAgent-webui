"use client";

import type { EdgeProps } from "@xyflow/react";
import { BaseEdge, getSmoothStepPath } from "@xyflow/react";

import type { TerminalRFEdge } from "../../utils/workflow-graph";

// Dashed, non-interactive — purely a visual "a run could end here" cue from
// every currently-unconnected source handle to the Finish marker. Not a
// real WorkflowEdgeDraft: nothing to remove, nothing the backend stores.
export function TerminalEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps<TerminalRFEdge>) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 8,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      className="stroke-border/60"
      style={{ strokeDasharray: "4 4" }}
    />
  );
}
