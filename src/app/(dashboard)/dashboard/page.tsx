"use client";

import { Bot, ToolCase } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Loading } from "@/components/common/Loading";
import { Card, CardContent } from "@/components/ui/card";
import { AgentsGrid } from "@/features/agents/components/agents-grid";
import { useAgents } from "@/features/agents/hooks/use-agents";
import { useTools } from "@/features/tools/hooks/use-tools";

const RECENT_AGENTS_LIMIT = 6;

export default function DashboardPage() {
  const {
    data: agents,
    isPending: agentsPending,
    isError: agentsError,
    refetch: refetchAgents,
  } = useAgents();
  const { data: tools, isPending: toolsPending } = useTools();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">An overview of your agents and tools.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bot className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                {agentsPending ? "—" : (agents?.length ?? 0)}
              </span>
              <span className="text-sm text-muted-foreground">Agents</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ToolCase className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                {toolsPending ? "—" : (tools?.length ?? 0)}
              </span>
              <span className="text-sm text-muted-foreground">Tools</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium tracking-tight">Your agents</h2>
          {agents && agents.length > 0 && (
            <Link href="/agents" className="text-sm text-primary hover:underline">
              View all
            </Link>
          )}
        </div>

        {agentsPending ? (
          <Loading label="Loading agents…" />
        ) : agentsError ? (
          <ErrorState title="Couldn't load agents" onRetry={() => refetchAgents()} />
        ) : agents.length === 0 ? (
          <EmptyState
            icon={Bot}
            title="No agents yet"
            description="Create your first agent to get started."
            actionLabel="Create agent"
            actionHref="/agents"
          />
        ) : (
          <AgentsGrid agents={agents.slice(0, RECENT_AGENTS_LIMIT)} />
        )}
      </div>
    </div>
  );
}
