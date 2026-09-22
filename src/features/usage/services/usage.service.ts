import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

import type { UsageDailyPoint, UsageSummaryByAgentRow, UsageSummaryRow } from "../types/usage.types";

export async function getUsageSummary(since?: string) {
  const { data } = await apiClient.get<UsageSummaryRow[]>(endpoints.usage.summary, {
    params: since ? { since } : undefined,
  });
  return data;
}

export async function getUsageSummaryByAgent(since?: string) {
  const { data } = await apiClient.get<UsageSummaryByAgentRow[]>(endpoints.usage.byAgent, {
    params: since ? { since } : undefined,
  });
  return data;
}

export async function getUsageDaily(since?: string) {
  const { data } = await apiClient.get<UsageDailyPoint[]>(endpoints.usage.daily, {
    params: since ? { since } : undefined,
  });
  return data;
}
