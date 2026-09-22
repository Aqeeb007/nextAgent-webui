"use client";

import { Handle, Position } from "@xyflow/react";
import { Play } from "lucide-react";

// Pinned, not draggable (see buildWorkflowGraph — its position always
// follows the current steps' bounding box). Drag a connection from its one
// handle to any step to mark that step as the start; the resulting edge
// looks like a real connection but removing it unsets the start step
// instead of deleting a WorkflowEdgeDraft (see workflow-edge.tsx).
export function StartMarkerNode() {
  return (
    <div className="flex w-40 flex-col items-center gap-1 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-center">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Play className="size-3 fill-current" />
        </div>
        Start
      </div>
      <Handle id="entry" type="source" position={Position.Bottom} className="size-2.5! border-2! border-card! bg-primary!" />
    </div>
  );
}
