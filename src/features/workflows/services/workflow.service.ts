import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

import type {
  ExecuteWorkflowPayload,
  UpdateWorkflowPayload,
  UpdateWorkflowStepPayload,
  Workflow,
  WorkflowEdge,
  WorkflowEdgePayload,
  WorkflowPayload,
  WorkflowRun,
  WorkflowRunWithStepRuns,
  WorkflowStep,
  WorkflowStepPayload,
  WorkflowWithSteps,
} from "../types/workflow.types";

export async function listWorkflows() {
  const { data } = await apiClient.get<Workflow[]>(endpoints.workflows.list);
  return data;
}

export async function createWorkflow(payload: WorkflowPayload) {
  const { data } = await apiClient.post<Workflow>(endpoints.workflows.list, payload);
  return data;
}

export async function getWorkflow(id: string) {
  const { data } = await apiClient.get<WorkflowWithSteps>(endpoints.workflows.detail(id));
  return data;
}

export async function updateWorkflow(id: string, payload: UpdateWorkflowPayload) {
  const { data } = await apiClient.patch<Workflow>(endpoints.workflows.detail(id), payload);
  return data;
}

export async function deleteWorkflow(id: string) {
  await apiClient.delete(endpoints.workflows.detail(id));
}

export async function addWorkflowStep(workflowId: string, payload: WorkflowStepPayload) {
  const { data } = await apiClient.post<WorkflowStep>(
    endpoints.workflows.steps.list(workflowId),
    payload
  );
  return data;
}

export async function updateWorkflowStep(
  workflowId: string,
  stepId: string,
  payload: UpdateWorkflowStepPayload
) {
  const { data } = await apiClient.patch<WorkflowStep>(
    endpoints.workflows.steps.detail(workflowId, stepId),
    payload
  );
  return data;
}

export async function removeWorkflowStep(workflowId: string, stepId: string) {
  await apiClient.delete(endpoints.workflows.steps.detail(workflowId, stepId));
}

export async function addWorkflowEdge(workflowId: string, payload: WorkflowEdgePayload) {
  const { data } = await apiClient.post<WorkflowEdge>(
    endpoints.workflows.edges.list(workflowId),
    payload
  );
  return data;
}

export async function removeWorkflowEdge(workflowId: string, edgeId: string) {
  await apiClient.delete(endpoints.workflows.edges.detail(workflowId, edgeId));
}

export async function executeWorkflow(workflowId: string, payload: ExecuteWorkflowPayload) {
  const { data } = await apiClient.post<WorkflowRun>(
    endpoints.workflows.execute(workflowId),
    payload
  );
  return data;
}

export async function listWorkflowRuns(workflowId: string) {
  const { data } = await apiClient.get<WorkflowRun[]>(endpoints.workflows.runs.list(workflowId));
  return data;
}

export async function getWorkflowRun(workflowId: string, runId: string) {
  const { data } = await apiClient.get<WorkflowRunWithStepRuns>(
    endpoints.workflows.runs.detail(workflowId, runId)
  );
  return data;
}
