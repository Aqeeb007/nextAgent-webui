"use client";

import { Plus, Workflow } from "lucide-react";
import { useState } from "react";

import { CardGridSkeleton } from "@/components/common/CardGridSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useCurrentMembership } from "@/features/organizations/hooks/use-current-membership";
import { CreateWorkflowDialog } from "@/features/workflows/components/create-workflow-dialog";
import { WorkflowsGrid } from "@/features/workflows/components/workflows-grid";
import { useWorkflows } from "@/features/workflows/hooks/use-workflows";

export default function WorkflowsPage() {
  const { membership } = useCurrentMembership();
  const { data: workflows, isPending, isError, refetch } = useWorkflows();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Workflows"
        description="Chain agents, tools, and conditions into a repeatable pipeline."
        actions={
          membership && (
            <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Create workflow
            </Button>
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
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <WorkflowsGrid workflows={workflows} />
      )}

      <CreateWorkflowDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
