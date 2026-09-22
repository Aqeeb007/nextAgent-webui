import { Bot } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { AgentUsageRow } from "../utils/usage-by-agent";
import { formatUsageQuantity } from "../utils/usage-summary";

interface UsageByAgentTableProps {
  rows: AgentUsageRow[];
}

export function UsageByAgentTable({ rows }: UsageByAgentTableProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Bot}
        title="No usage yet"
        description="Usage will show up here once an agent has a conversation or calls a tool."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agent</TableHead>
            <TableHead className="text-right">Chat tokens</TableHead>
            <TableHead className="text-right">Embedding tokens</TableHead>
            <TableHead className="text-right">Tool calls</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.agentId ?? "unassigned"}>
              <TableCell className="font-medium text-foreground">{row.agentName}</TableCell>
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
