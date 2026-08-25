"use client";

import { Bot, LayoutGrid, Plus, Table2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CardGridSkeleton } from "@/components/common/CardGridSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentFormDialog } from "@/features/agents/components/agent-form-dialog";
import { agentColumns } from "@/features/agents/components/agents-table/columns";
import { AgentsGrid } from "@/features/agents/components/agents-grid";
import { useAgents } from "@/features/agents/hooks/use-agents";
import type { Agent } from "@/features/agents/types/agent.types";

type AgentsView = "grid" | "table";

export default function AgentsPage() {
  const router = useRouter();
  const { data: agents, isPending, isError, refetch } = useAgents();

  const [view, setView] = useState<AgentsView>("grid");
  const [formOpen, setFormOpen] = useState(false);

  function goToAgent(agent: Agent) {
    router.push(`/agents/${agent.id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Agents"
        description="Agents that use your tools to handle conversations."
        actions={
          <>
            {agents && agents.length > 0 && (
              <Tabs value={view} onValueChange={(value) => setView(value as AgentsView)}>
                <TabsList>
                  <TabsTrigger value="grid" aria-label="Grid view">
                    <LayoutGrid />
                  </TabsTrigger>
                  <TabsTrigger value="table" aria-label="Table view">
                    <Table2 />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            <Button size="sm" className="gap-1.5" onClick={() => setFormOpen(true)}>
              <Plus className="size-4" />
              Create agent
            </Button>
          </>
        }
      />

      {isPending ? (
        <CardGridSkeleton />
      ) : isError ? (
        <ErrorState title="Couldn't load agents" onRetry={() => refetch()} />
      ) : agents.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="No agents yet"
          description="Create your first agent to get started."
          actionLabel="Create agent"
          onAction={() => setFormOpen(true)}
        />
      ) : view === "grid" ? (
        <AgentsGrid agents={agents} />
      ) : (
        <DataTable
          columns={agentColumns}
          data={agents}
          searchPlaceholder="Search agents…"
          onRowClick={goToAgent}
        />
      )}

      <AgentFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
