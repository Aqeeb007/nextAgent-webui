"use client";

import { Bot, Plus, Sparkles, ToolCase } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { CardGridSkeleton } from "@/components/common/CardGridSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AgentFormDialog } from "@/features/agents/components/agent-form-dialog";
import { AgentsGrid } from "@/features/agents/components/agents-grid";
import { useAgents } from "@/features/agents/hooks/use-agents";
import { ToolFormDialog } from "@/features/tools/components/tool-form-dialog";
import { useTools } from "@/features/tools/hooks/use-tools";
import { useAuthStore } from "@/stores/auth.store";

const RECENT_AGENTS_LIMIT = 6;

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const {
    data: agents,
    isPending: agentsPending,
    isError: agentsError,
    refetch: refetchAgents,
  } = useAgents();
  const { data: tools, isPending: toolsPending } = useTools();

  const [agentFormOpen, setAgentFormOpen] = useState(false);
  const [toolFormOpen, setToolFormOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={user ? `Welcome back, ${user.firstName}` : "Dashboard"}
        description="An overview of your agents and tools."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Bot}
          label="Agents"
          value={agentsPending ? "—" : (agents?.length ?? 0)}
          accent="primary"
        />
        <StatCard
          icon={ToolCase}
          label="Tools"
          value={toolsPending ? "—" : (tools?.length ?? 0)}
          accent="live"
        />
        <Card className="flex flex-col justify-center gap-2.5 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Sparkles className="size-4 text-primary" />
            Quick actions
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 justify-center gap-1.5"
              onClick={() => setAgentFormOpen(true)}
            >
              <Plus className="size-3.5" />
              Agent
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 justify-center gap-1.5"
              onClick={() => setToolFormOpen(true)}
            >
              <Plus className="size-3.5" />
              Tool
            </Button>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium tracking-tight">Your agents</h2>
          {agents && agents.length > 0 && (
            <Link
              href="/agents"
              className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              View all
            </Link>
          )}
        </div>

        {agentsPending ? (
          <CardGridSkeleton count={3} />
        ) : agentsError ? (
          <ErrorState title="Couldn't load agents" onRetry={() => refetchAgents()} />
        ) : agents.length === 0 ? (
          <EmptyState
            icon={Bot}
            title="No agents yet"
            description="Create your first agent to get started."
            actionLabel="Create agent"
            onAction={() => setAgentFormOpen(true)}
          />
        ) : (
          <AgentsGrid agents={agents.slice(0, RECENT_AGENTS_LIMIT)} />
        )}
      </div>

      <AgentFormDialog open={agentFormOpen} onOpenChange={setAgentFormOpen} />
      <ToolFormDialog open={toolFormOpen} onOpenChange={setToolFormOpen} tool={null} />
    </div>
  );
}
