import { DEFAULT_BRANCH } from "../types/workflow.types";
import type {
  WorkflowRunWithStepRuns,
  WorkflowWithSteps,
} from "../types/workflow.types";

// Phase 1 has no backend wiring yet — this is the builder's entire data
// source (list page + `/workflows/[id]` lookup + the Runs tab's default
// seed). Phase 2 replaces every read of this module with the real
// `useWorkflows()`/`useWorkflow()`/`useWorkflowRuns()` hooks; nothing else
// should change shape when that happens.
//
// agentId/toolId below are placeholder uuids that won't resolve against any
// real org's agents/tools — WorkflowStepConfigSummary falls back to a
// truncated id when a lookup misses, so this is expected, not a bug.
export const mockWorkflows: WorkflowWithSteps[] = [
  {
    id: "wf-support-triage",
    organizationId: "org-demo",
    name: "Support ticket triage",
    description:
      "Classifies an incoming support message, then branches: high-urgency messages file a ticket, everything else gets an automated reply.",
    entryStepId: "wf-support-triage-step-1",
    createdAt: "2026-08-01T09:00:00.000Z",
    updatedAt: "2026-09-10T14:30:00.000Z",
    steps: [
      {
        id: "wf-support-triage-step-1",
        workflowId: "wf-support-triage",
        stepOrder: 0,
        type: "agent",
        config: {
          agentId: "a3f9c1d2-4e5b-4a6f-8c7d-9e0f1a2b3c4d",
          promptTemplate:
            "Classify this support message and return JSON with `urgency` (high|low) and `summary`:\n\n{{input}}",
        },
        createdAt: "2026-08-01T09:00:00.000Z",
        updatedAt: "2026-08-01T09:00:00.000Z",
      },
      {
        id: "wf-support-triage-step-2",
        workflowId: "wf-support-triage",
        stepOrder: 1,
        type: "condition",
        config: {
          path: "urgency",
          cases: [{ branch: "high", operator: "equals", value: "high" }],
        },
        createdAt: "2026-08-01T09:00:00.000Z",
        updatedAt: "2026-08-01T09:00:00.000Z",
      },
      {
        id: "wf-support-triage-step-3",
        workflowId: "wf-support-triage",
        stepOrder: 2,
        type: "tool",
        config: {
          toolId: "b7e2f4a1-6c3d-4f8e-9a1b-2c3d4e5f6a7b",
          args: { title: "{{input}}", priority: "high" },
        },
        createdAt: "2026-08-01T09:00:00.000Z",
        updatedAt: "2026-08-01T09:00:00.000Z",
      },
      {
        id: "wf-support-triage-step-4",
        workflowId: "wf-support-triage",
        stepOrder: 3,
        type: "agent",
        config: {
          agentId: "a3f9c1d2-4e5b-4a6f-8c7d-9e0f1a2b3c4d",
          promptTemplate: "Write a short, friendly auto-reply acknowledging this message:\n\n{{input}}",
        },
        createdAt: "2026-08-01T09:00:00.000Z",
        updatedAt: "2026-08-01T09:00:00.000Z",
      },
    ],
    edges: [
      {
        id: "wf-support-triage-edge-1",
        workflowId: "wf-support-triage",
        fromStepId: "wf-support-triage-step-1",
        toStepId: "wf-support-triage-step-2",
        branch: DEFAULT_BRANCH,
        createdAt: "2026-08-01T09:00:00.000Z",
      },
      {
        id: "wf-support-triage-edge-2",
        workflowId: "wf-support-triage",
        fromStepId: "wf-support-triage-step-2",
        toStepId: "wf-support-triage-step-3",
        branch: "high",
        createdAt: "2026-08-01T09:00:00.000Z",
      },
      {
        id: "wf-support-triage-edge-3",
        workflowId: "wf-support-triage",
        fromStepId: "wf-support-triage-step-2",
        toStepId: "wf-support-triage-step-4",
        branch: DEFAULT_BRANCH,
        createdAt: "2026-08-01T09:00:00.000Z",
      },
    ],
  },
  {
    id: "wf-content-summarizer",
    organizationId: "org-demo",
    name: "Content summarizer",
    description: "Summarizes a document into a short paragraph.",
    entryStepId: "wf-content-summarizer-step-1",
    createdAt: "2026-09-05T11:15:00.000Z",
    updatedAt: "2026-09-05T11:15:00.000Z",
    steps: [
      {
        id: "wf-content-summarizer-step-1",
        workflowId: "wf-content-summarizer",
        stepOrder: 0,
        type: "agent",
        config: {
          agentId: "a3f9c1d2-4e5b-4a6f-8c7d-9e0f1a2b3c4d",
          promptTemplate: "Summarize this in two sentences:\n\n{{input}}",
        },
        createdAt: "2026-09-05T11:15:00.000Z",
        updatedAt: "2026-09-05T11:15:00.000Z",
      },
    ],
    edges: [],
  },
];

export function findMockWorkflow(id: string): WorkflowWithSteps | undefined {
  return mockWorkflows.find((workflow) => workflow.id === id);
}

// Only the support-triage workflow has run history — content-summarizer
// demonstrates the Runs tab's empty state.
export const mockRunsByWorkflowId: Record<string, WorkflowRunWithStepRuns[]> = {
  "wf-support-triage": [
    {
      id: "run-1",
      workflowId: "wf-support-triage",
      triggeredByUserId: "user-demo",
      status: "completed",
      input: { message: "My account was charged twice this month." },
      output: { title: "Billing: charged twice", priority: "high" },
      startedAt: "2026-09-18T10:00:00.000Z",
      completedAt: "2026-09-18T10:00:04.000Z",
      updatedAt: "2026-09-18T10:00:04.000Z",
      stepRuns: [
        {
          id: "run-1-step-1",
          workflowRunId: "run-1",
          workflowStepId: "wf-support-triage-step-1",
          sequence: 1,
          status: "success",
          input: { message: "My account was charged twice this month." },
          output: { urgency: "high", summary: "Billing: charged twice" },
          createdAt: "2026-09-18T10:00:01.000Z",
        },
        {
          id: "run-1-step-2",
          workflowRunId: "run-1",
          workflowStepId: "wf-support-triage-step-2",
          sequence: 2,
          status: "success",
          input: { urgency: "high", summary: "Billing: charged twice" },
          output: { branch: "high", matched: true },
          createdAt: "2026-09-18T10:00:02.000Z",
        },
        {
          id: "run-1-step-3",
          workflowRunId: "run-1",
          workflowStepId: "wf-support-triage-step-3",
          sequence: 3,
          status: "success",
          input: { branch: "high", matched: true },
          output: { title: "Billing: charged twice", priority: "high" },
          createdAt: "2026-09-18T10:00:04.000Z",
        },
        {
          id: "run-1-step-4",
          workflowRunId: "run-1",
          workflowStepId: "wf-support-triage-step-4",
          sequence: 4,
          status: "skipped",
          createdAt: "2026-09-18T10:00:04.000Z",
        },
      ],
    },
    {
      id: "run-2",
      workflowId: "wf-support-triage",
      triggeredByUserId: "user-demo",
      status: "completed",
      input: { message: "What are your support hours?" },
      output: { content: "Mocked response from agent a3f9c1d2…" },
      startedAt: "2026-09-19T08:12:00.000Z",
      completedAt: "2026-09-19T08:12:02.000Z",
      updatedAt: "2026-09-19T08:12:02.000Z",
      stepRuns: [
        {
          id: "run-2-step-1",
          workflowRunId: "run-2",
          workflowStepId: "wf-support-triage-step-1",
          sequence: 1,
          status: "success",
          input: { message: "What are your support hours?" },
          output: { urgency: "low", summary: "Asking about support hours" },
          createdAt: "2026-09-19T08:12:01.000Z",
        },
        {
          id: "run-2-step-2",
          workflowRunId: "run-2",
          workflowStepId: "wf-support-triage-step-2",
          sequence: 2,
          status: "success",
          input: { urgency: "low", summary: "Asking about support hours" },
          output: { branch: null, matched: false },
          createdAt: "2026-09-19T08:12:02.000Z",
        },
        {
          id: "run-2-step-4",
          workflowRunId: "run-2",
          workflowStepId: "wf-support-triage-step-4",
          sequence: 3,
          status: "success",
          input: { branch: null, matched: false },
          output: { content: "Thanks for reaching out — our team will follow up shortly!" },
          createdAt: "2026-09-19T08:12:02.000Z",
        },
        {
          id: "run-2-step-3",
          workflowRunId: "run-2",
          workflowStepId: "wf-support-triage-step-3",
          sequence: 4,
          status: "skipped",
          createdAt: "2026-09-19T08:12:02.000Z",
        },
      ],
    },
  ],
  "wf-content-summarizer": [],
};
