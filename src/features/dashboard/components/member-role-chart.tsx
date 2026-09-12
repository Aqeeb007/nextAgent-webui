"use client";

import { Users } from "lucide-react";
import { useMemo } from "react";
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ChartCard } from "@/features/dashboard/components/chart-card";
import type { OrganizationMember, RoleSlug } from "@/features/organizations/types/organization.types";

interface MemberRoleChartProps {
  members: OrganizationMember[] | undefined;
  isPending: boolean;
  isError: boolean;
}

const ROLE_ORDER: RoleSlug[] = ["owner", "admin", "member"];

// Validated against the dark card surface (#14171c) with the dataviz skill's
// validate_palette.js: raw --success/--warning are tuned for badge text on a
// tinted background and fail the categorical lightness band as bare fills, so
// these are darker steps of the same hue holding the owner/admin meaning from
// the Members page badges. --chart-1 (already validated) covers "member".
const ROLE_CHART_COLOR: Record<RoleSlug, string> = {
  owner: "#16a34a",
  admin: "#d97706",
  member: "var(--chart-1)",
};

export function MemberRoleChart({ members, isPending, isError }: MemberRoleChartProps) {
  const { data, roles } = useMemo(() => {
    if (!members) return { data: [], roles: [] as { slug: RoleSlug; name: string }[] };
    const bySlug = new Map<RoleSlug, { name: string; count: number }>();
    for (const member of members) {
      const existing = bySlug.get(member.role.slug);
      if (existing) existing.count += 1;
      else bySlug.set(member.role.slug, { name: member.role.name, count: 1 });
    }
    const roles = ROLE_ORDER.filter((slug) => bySlug.has(slug)).map((slug) => ({
      slug,
      name: bySlug.get(slug)!.name,
    }));
    const row: Record<string, string | number> = { name: "Members" };
    for (const slug of roles.map((r) => r.slug)) {
      row[slug] = bySlug.get(slug)!.count;
    }
    return { data: [row], roles };
  }, [members]);

  return (
    <ChartCard
      title="Member roles"
      icon={Users}
      isLoading={isPending}
      isEmpty={data.length === 0}
      hasError={isError}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, bottom: 8 }}
          barCategoryGap="0%"
        >
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" hide />
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
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            formatter={(_value, entry) => {
              const slug = entry.dataKey as RoleSlug;
              return roles.find((r) => r.slug === slug)?.name ?? String(_value);
            }}
            wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
          />
          {roles.map(({ slug, name }, index) => (
            <Bar
              key={slug}
              dataKey={slug}
              name={name}
              stackId="roles"
              fill={ROLE_CHART_COLOR[slug]}
              stroke="var(--card)"
              strokeWidth={2}
              maxBarSize={40}
              radius={[
                index === 0 ? 4 : 0,
                index === roles.length - 1 ? 4 : 0,
                index === roles.length - 1 ? 4 : 0,
                index === 0 ? 4 : 0,
              ]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
