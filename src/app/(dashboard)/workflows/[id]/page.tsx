"use client";

import { useParams } from "next/navigation";

import { WorkflowBuilder } from "@/features/workflows/components/workflow-builder";

export default function WorkflowDetailPage() {
  const { id } = useParams<{ id: string }>();

  return <WorkflowBuilder workflowId={id} />;
}
