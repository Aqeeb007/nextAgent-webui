"use client";

import { Plus, Workflow } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { useCurrentMembership } from "@/features/organizations/hooks/use-current-membership";
import { WorkflowsGrid } from "@/features/workflows/components/workflows-grid";
import { mockWorkflows } from "@/features/workflows/utils/mock-data";
import { cn } from "@/lib/utils";

// Phase 1 has no backend — mockWorkflows is the entire data source, so
// there's no isPending/isError branch here (a synchronous seed has nothing
// to be pending or errored about). "Create workflow" always opens a fresh
// draft and never mutates this list; Phase 2 swaps the seed for
// useWorkflows() and reintroduces those two branches.
export default function WorkflowsPage() {
  const { membership } = useCurrentMembership();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Workflows"
        description="Chain agents, tools, and conditions into a repeatable pipeline."
        actions={
          membership && (
            <Link href="/workflows/new" className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
              <Plus className="size-4" />
              Create workflow
            </Link>
          )
        }
      />

      {mockWorkflows.length === 0 ? (
        <EmptyState
          icon={Workflow}
          title="No workflows yet"
          description="Create a workflow to chain agents, tools, and conditions into a repeatable pipeline."
          actionLabel="Create workflow"
          actionHref="/workflows/new"
        />
      ) : (
        <WorkflowsGrid workflows={mockWorkflows} />
      )}
    </div>
  );
}
