import { Workflow } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { Workflow as WorkflowEntity } from "../types/workflow.types";

interface WorkflowCardProps {
  workflow: WorkflowEntity;
  style?: CSSProperties;
}

// Icon box is deliberately neutral, not primary-tinted like AgentCard's —
// DESIGN.md flags primary-over-application on icon avatars as a known
// issue, so new cards follow the stated rule rather than the existing
// pattern. No per-card action menu: clicking opens the builder, which is
// the edit surface. `workflow` is the plain list-endpoint shape (no
// steps/edges — GET /workflows doesn't join them), hence "Updated {date}"
// instead of a step-count badge.
export function WorkflowCard({ workflow, style }: WorkflowCardProps) {
  return (
    <Link href={`/workflows/${workflow.id}`} className="fade-up-item block" style={style}>
      <Card className="group h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:ring-primary/25">
        <CardHeader className="grid-cols-[auto_1fr] items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Workflow className="size-4" />
          </div>
          <CardTitle className="truncate" title={workflow.name}>
            {workflow.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
            {workflow.description || "No description."}
          </p>
          <p className="text-xs text-muted-foreground">
            Updated{" "}
            {new Date(workflow.updatedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
