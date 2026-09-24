"use client";

import { Bot, Layers, MessageSquare, ToolCase, Database } from "lucide-react";
import { useMemo, useState } from "react";

import { ErrorState } from "@/components/common/ErrorState";
import { Loading } from "@/components/common/Loading";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAgents } from "@/features/agents/hooks/use-agents";
import { UsageTable } from "@/features/usage/components/usage-table";
import { useUsageByAgent } from "@/features/usage/hooks/use-usage-by-agent";
import { useUsageSummary } from "@/features/usage/hooks/use-usage-summary";
import {
  USAGE_PERIOD_OPTIONS,
  usagePeriodSince,
  type UsagePeriod,
} from "@/features/usage/utils/usage-period";
import { pivotUsageByAgent } from "@/features/usage/utils/usage-by-agent";
import { pivotUsageBySource } from "@/features/usage/utils/usage-by-source";
import { formatUsageQuantity, quantityFor } from "@/features/usage/utils/usage-summary";

export default function UsagePage() {
  const [period, setPeriod] = useState<UsagePeriod>("this-month");
  const since = usagePeriodSince(period);

  const {
    data: summary,
    isPending: summaryPending,
    isError: summaryError,
    refetch: refetchSummary,
  } = useUsageSummary(since);
  const {
    data: byAgent,
    isPending: byAgentPending,
    isError: byAgentError,
    refetch: refetchByAgent,
  } = useUsageByAgent(since);
  // Only used for id → name lookup, so a failure here shouldn't block the
  // page — the table falls back to labeling that agent "Deleted agent".
  const { data: agents } = useAgents();

  const isPending = summaryPending || byAgentPending;
  const isError = summaryError || byAgentError;

  const agentRows = useMemo(() => pivotUsageByAgent(byAgent, agents), [byAgent, agents]);
  const sourceRows = useMemo(() => pivotUsageBySource(byAgent), [byAgent]);

  const chatTokens = quantityFor(summary, "chat_completion");
  const embeddingTokens = quantityFor(summary, "embedding");
  const toolCalls = quantityFor(summary, "tool_execution");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Usage"
        description="OpenAI token spend and tool calls for this organization. No limits are enforced yet — this is visibility only."
        breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "Usage" }]}
        actions={
          <Select value={period} onValueChange={(value) => setPeriod(value as UsagePeriod)}>
            <SelectTrigger className="w-40">
              <SelectValue>
                {(value: UsagePeriod) =>
                  USAGE_PERIOD_OPTIONS.find((option) => option.value === value)?.label ?? value
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {USAGE_PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {isPending ? (
        <Loading label="Loading usage…" />
      ) : isError ? (
        <ErrorState
          title="Couldn't load usage"
          onRetry={() => {
            refetchSummary();
            refetchByAgent();
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              icon={MessageSquare}
              label="Chat tokens"
              value={
                <span title={chatTokens.toLocaleString()}>{formatUsageQuantity(chatTokens)}</span>
              }
              accent="primary"
            />
            <StatCard
              icon={Database}
              label="Embedding tokens"
              value={
                <span title={embeddingTokens.toLocaleString()}>
                  {formatUsageQuantity(embeddingTokens)}
                </span>
              }
              accent="live"
            />
            <StatCard
              icon={ToolCase}
              label="Tool calls"
              value={
                <span title={toolCalls.toLocaleString()}>{formatUsageQuantity(toolCalls)}</span>
              }
              accent="warning"
            />
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium tracking-tight">By source</h2>
            <UsageTable
              rows={sourceRows}
              labelHeader="Source"
              emptyIcon={Layers}
              emptyTitle="No usage yet"
              emptyDescription="Usage will show up here once an agent has a conversation, a document is embedded, or a workflow runs."
            />
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium tracking-tight">By agent</h2>
            <UsageTable
              rows={agentRows}
              labelHeader="Agent"
              emptyIcon={Bot}
              emptyTitle="No usage yet"
              emptyDescription="Usage will show up here once an agent has a conversation or calls a tool."
            />
          </div>
        </>
      )}
    </div>
  );
}
