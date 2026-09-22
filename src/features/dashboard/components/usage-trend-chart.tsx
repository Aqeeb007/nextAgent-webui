"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ChartCard } from "@/features/dashboard/components/chart-card";
import type { UsageDailyPoint } from "@/features/usage/types/usage.types";

interface UsageTrendChartProps {
  data: UsageDailyPoint[] | undefined;
  isPending: boolean;
  isError: boolean;
}

export function UsageTrendChart({ data, isPending, isError }: UsageTrendChartProps) {
  const points = data ?? [];

  return (
    <ChartCard
      title="Token usage (last 14 days)"
      icon={TrendingUp}
      isLoading={isPending}
      isEmpty={points.length < 2}
      hasError={isError}
      emptyMessage="Not enough usage yet to show a trend."
      className="lg:col-span-3"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ left: -16, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="day"
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
            formatter={(value) => (typeof value === "number" ? value.toLocaleString() : value)}
          />
          <Line
            type="monotone"
            dataKey="totalTokens"
            name="Tokens"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--chart-1)", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
