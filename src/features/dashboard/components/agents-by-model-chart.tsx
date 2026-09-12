"use client";

import { BarChart3 } from "lucide-react";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ChartCard } from "@/features/dashboard/components/chart-card";
import type { Agent } from "@/features/agents/types/agent.types";

interface AgentsByModelChartProps {
  agents: Agent[] | undefined;
  isPending: boolean;
  isError: boolean;
}

export function AgentsByModelChart({ agents, isPending, isError }: AgentsByModelChartProps) {
  const data = useMemo(() => {
    if (!agents) return [];
    const counts = new Map<string, number>();
    for (const agent of agents) {
      const key = agent.model || "Unknown";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts, ([model, count]) => ({ model, count })).sort(
      (a, b) => b.count - a.count
    );
  }, [agents]);

  return (
    <ChartCard
      title="Agents by model"
      icon={BarChart3}
      isLoading={isPending}
      isEmpty={data.length === 0}
      hasError={isError}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid horizontal={false} stroke="var(--border)" />
          <XAxis type="number" allowDecimals={false} hide />
          <YAxis
            type="category"
            dataKey="model"
            width={100}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--foreground)" }}
          />
          <Bar dataKey="count" fill="var(--chart-1)" radius={[0, 4, 4, 0]} maxBarSize={20}>
            <LabelList
              dataKey="count"
              position="right"
              style={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
