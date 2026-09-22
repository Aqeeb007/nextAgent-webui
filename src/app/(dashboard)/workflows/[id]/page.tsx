"use client";

import { useParams } from "next/navigation";

import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/layout/PageHeader";
import { WorkflowBuilder } from "@/features/workflows/components/workflow-builder";
import { findMockWorkflow } from "@/features/workflows/utils/mock-data";

export default function WorkflowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const workflow = findMockWorkflow(id);

  if (!workflow) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          breadcrumbs={[{ label: "Workflows", href: "/workflows" }]}
          title="Workflow not found"
        />
        <ErrorState
          title="Workflow not found"
          description="It may have been removed, or the link is incorrect."
        />
      </div>
    );
  }

  return <WorkflowBuilder initialWorkflow={workflow} />;
}
