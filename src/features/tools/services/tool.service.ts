import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

import type {
  TestToolPayload,
  Tool,
  ToolExecutionResult,
  ToolPayload,
  UpdateToolPayload,
} from "../types/tool.types";

export async function listTools() {
  const { data } = await apiClient.get<Tool[]>(endpoints.tools.list);
  return data;
}

export async function createTool(payload: ToolPayload) {
  const { data } = await apiClient.post<Tool>(endpoints.tools.list, payload);
  return data;
}

export async function updateTool(id: string, payload: UpdateToolPayload) {
  const { data } = await apiClient.patch<Tool>(
    endpoints.tools.detail(id),
    payload
  );
  return data;
}

export async function deleteTool(id: string) {
  await apiClient.delete(endpoints.tools.detail(id));
}

export async function testTool(id: string, payload: TestToolPayload) {
  const { data } = await apiClient.post<ToolExecutionResult>(
    endpoints.tools.test(id),
    payload
  );
  return data;
}
