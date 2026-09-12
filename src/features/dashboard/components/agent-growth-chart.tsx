"use client";

import { TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ChartCard } from "@/features/dashboard/components/chart-card";
import type { Agent } from "@/features/agents/types/agent.types";

interface AgentGrowthChartProps {
  agents: Agent[] | undefined;
  isPending: boolean;
  isError: boolean;
}

export function AgentGrowthChart({ agents, isPending, isError }: AgentGrowthChartProps) {
  const data = useMemo(() => {
    if (!agents || agents.length === 0) return [];
    const dayCounts = new Map<string, number>();
    for (const agent of agents) {
      const day = agent.createdAt.slice(0, 10);
      dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
    }
    const sortedDays = Array.from(dayCounts.keys()).sort();
    let cumulative = 0;
    return sortedDays.map((day) => {
      cumulative += dayCounts.get(day)!;
      return { date: day, count: cumulative };
    });
  }, [agents]);

  return (
    <ChartCard
      title="Agent growth"
      icon={TrendingUp}
      isLoading={isPending}
      isEmpty={data.length < 2}
      hasError={isError}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            tickFormatter={(value: string) =>
              new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })
            }
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ stroke: "var(--border)" }}
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--foreground)" }}
            labelFormatter={(value) =>
              new Date(String(value)).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            }
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="var(--chart-1)"
            fillOpacity={0.1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
