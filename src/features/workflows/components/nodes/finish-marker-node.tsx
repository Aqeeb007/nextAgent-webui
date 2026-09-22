"use client";

import { Handle, Position } from "@xyflow/react";
import { Flag } from "lucide-react";

// Pinned, not draggable — a landmark, not a real step. Every currently
// unconnected step output gets a dashed line here (see the "terminal-edge"
// type in workflow-graph.ts) so it's visible at a glance where a run can
// end, even though "finish" isn't an entity the backend stores at all.
export function FinishMarkerNode() {
  return (
    <div className="flex w-40 flex-col items-center gap-1 rounded-2xl border border-dashed border-success/40 bg-success/5 px-4 py-3 text-center">
      <Handle type="target" position={Position.Top} className="size-2.5! border-2! border-card! bg-success!" />
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
          <Flag className="size-3" />
        </div>
        Finish
      </div>
    </div>
  );
}
