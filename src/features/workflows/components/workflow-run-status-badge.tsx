import { Badge } from "@/components/ui/badge";

import type { WorkflowRunStatus, WorkflowStepRunStatus } from "../types/workflow.types";

const RUN_STATUS_VARIANT: Record<WorkflowRunStatus, "live" | "success" | "destructive"> = {
  running: "live",
  completed: "success",
  failed: "destructive",
};

const RUN_STATUS_LABEL: Record<WorkflowRunStatus, string> = {
  running: "Running",
  completed: "Completed",
  failed: "Failed",
};

const STEP_RUN_STATUS_VARIANT: Record<
  WorkflowStepRunStatus,
  "success" | "destructive" | "secondary"
> = {
  success: "success",
  failed: "destructive",
  skipped: "secondary",
};

const STEP_RUN_STATUS_LABEL: Record<WorkflowStepRunStatus, string> = {
  success: "Success",
  failed: "Failed",
  skipped: "Skipped",
};

export function WorkflowRunStatusBadge({ status }: { status: WorkflowRunStatus }) {
  return <Badge variant={RUN_STATUS_VARIANT[status]}>{RUN_STATUS_LABEL[status]}</Badge>;
}

export function WorkflowStepRunStatusBadge({ status }: { status: WorkflowStepRunStatus }) {
  return <Badge variant={STEP_RUN_STATUS_VARIANT[status]}>{STEP_RUN_STATUS_LABEL[status]}</Badge>;
}
