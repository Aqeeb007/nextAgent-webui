import type { LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { UsageBreakdownRow } from "../types/usage.types";
import { formatUsageQuantity } from "../utils/usage-summary";

interface UsageTableProps {
  rows: UsageBreakdownRow[];
  labelHeader: string;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
}

// Shared "one labeled row, three metric columns" shape behind both the "By
// source" and "By agent" breakdowns on the Usage page — same underlying
// usage_events, two different pivots of it (see utils/usage-by-source.ts /
// usage-by-agent.ts), rendered through one table instead of two
// near-identical ones.
export function UsageTable({ rows, labelHeader, emptyIcon, emptyTitle, emptyDescription }: UsageTableProps) {
  if (rows.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{labelHeader}</TableHead>
            <TableHead className="text-right">Chat tokens</TableHead>
            <TableHead className="text-right">Embedding tokens</TableHead>
            <TableHead className="text-right">Tool calls</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.key}>
              <TableCell className="font-medium text-foreground">{row.label}</TableCell>
              <TableCell
                className="text-right tabular-nums text-muted-foreground"
                title={row.chatTokens.toLocaleString()}
              >
                {formatUsageQuantity(row.chatTokens)}
              </TableCell>
              <TableCell
                className="text-right tabular-nums text-muted-foreground"
                title={row.embeddingTokens.toLocaleString()}
              >
                {formatUsageQuantity(row.embeddingTokens)}
              </TableCell>
              <TableCell
                className="text-right tabular-nums text-muted-foreground"
                title={row.toolCalls.toLocaleString()}
              >
                {formatUsageQuantity(row.toolCalls)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
