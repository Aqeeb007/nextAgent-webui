"use client";

import { Plus, Workflow } from "lucide-react";
import Link from "next/link";

import { CardGridSkeleton } from "@/components/common/CardGridSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/layout/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { useCurrentMembership } from "@/features/organizations/hooks/use-current-membership";
import { WorkflowsGrid } from "@/features/workflows/components/workflows-grid";
import { useWorkflows } from "@/features/workflows/hooks/use-workflows";
import { cn } from "@/lib/utils";

export default function WorkflowsPage() {
  const { membership } = useCurrentMembership();
  const { data: workflows, isPending, isError, refetch } = useWorkflows();

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

      {isPending ? (
        <CardGridSkeleton />
      ) : isError ? (
        <ErrorState title="Couldn't load workflows" onRetry={() => refetch()} />
      ) : workflows.length === 0 ? (
        <EmptyState
          icon={Workflow}
          title="No workflows yet"
          description="Create a workflow to chain agents, tools, and conditions into a repeatable pipeline."
          actionLabel="Create workflow"
          actionHref="/workflows/new"
        />
      ) : (
        <WorkflowsGrid workflows={workflows} />
      )}
    </div>
  );
}
