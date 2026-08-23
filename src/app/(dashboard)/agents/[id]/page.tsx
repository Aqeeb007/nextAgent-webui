"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

import { ErrorState } from "@/components/common/ErrorState";
import { Loading } from "@/components/common/Loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentFormDialog } from "@/features/agents/components/agent-form-dialog";
import { AgentToolsPanel } from "@/features/agents/components/agent-tools-panel";
import { useAgent } from "@/features/agents/hooks/use-agent";
import { ConversationView } from "@/features/conversations/components/conversation-view";
import { useCurrentOrganization } from "@/features/organizations/hooks/use-current-organization";

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: agent, isPending, isError, refetch } = useAgent(id);
  const { data: organization } = useCurrentOrganization();

  const [editOpen, setEditOpen] = useState(false);

  if (isPending) {
    return <Loading label="Loading agent…" />;
  }

  if (isError) {
    return <ErrorState title="Couldn't load agent" onRetry={() => refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-sm">
            <Link href="/agents" className="text-primary hover:underline">
              Agents
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{agent.name}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight">{agent.name}</h1>
            <Badge variant="outline" className="font-mono">
              {agent.model}
            </Badge>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          Edit
        </Button>
      </div>

      {agent.description && (
        <p className="text-sm text-muted-foreground">{agent.description}</p>
      )}

      <Tabs defaultValue="overview">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-6 pt-4">
          <div className="flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              System prompt
            </p>
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="font-mono text-sm whitespace-pre-wrap text-muted-foreground">
                {agent.systemPrompt}
              </p>
            </div>
          </div>

          {agent.configuration && (
            <div className="flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Configuration
              </p>
              <div className="rounded-lg bg-muted/40 p-3">
                <pre className="font-mono text-sm whitespace-pre-wrap text-muted-foreground">
                  {JSON.stringify(agent.configuration, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-8">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Created
              </p>
              <p className="text-sm text-foreground">
                {new Date(agent.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Organization
              </p>
              <p className="text-sm text-foreground">{organization?.name ?? "—"}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="pt-4">
          <AgentToolsPanel agentId={agent.id} />
        </TabsContent>

        <TabsContent value="conversations" className="pt-4">
          <ConversationView agentId={agent.id} />
        </TabsContent>
      </Tabs>

      <AgentFormDialog open={editOpen} onOpenChange={setEditOpen} agent={agent} />
    </div>
  );
}
