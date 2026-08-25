"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

import { ErrorState } from "@/components/common/ErrorState";
import { Loading } from "@/components/common/Loading";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentFormDialog } from "@/features/agents/components/agent-form-dialog";
import { AgentToolsPanel } from "@/features/agents/components/agent-tools-panel";
import { DeleteAgentDialog } from "@/features/agents/components/delete-agent-dialog";
import { useAgent } from "@/features/agents/hooks/use-agent";
import { ConversationView } from "@/features/conversations/components/conversation-view";
import { useCurrentOrganization } from "@/features/organizations/hooks/use-current-organization";

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: agent, isPending, isError, refetch } = useAgent(id);
  const { data: organization } = useCurrentOrganization();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isPending) {
    return <Loading label="Loading agent…" />;
  }

  if (isError) {
    return <ErrorState title="Couldn't load agent" onRetry={() => refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[{ label: "Agents", href: "/agents" }, { label: agent.name }]}
        title={
          <span className="flex flex-wrap items-center gap-2.5">
            {agent.name}
            <Badge variant="outline" className="font-mono">
              {agent.model}
            </Badge>
          </span>
        }
        description={agent.description}
        actions={
          <>
            <Link href={`/agents/${agent.id}/chat`} className={buttonVariants({ size: "sm" })}>
              Open chat
            </Link>
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-6 pt-4">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2.5">
              <span className="flex gap-1.5">
                <span className="size-2 rounded-full bg-destructive/50" />
                <span className="size-2 rounded-full bg-warning/50" />
                <span className="size-2 rounded-full bg-success/50" />
              </span>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                System prompt
              </p>
            </div>
            <div className="p-4">
              <p className="font-mono text-sm whitespace-pre-wrap text-muted-foreground">
                {agent.systemPrompt}
              </p>
            </div>
          </div>

          {agent.configuration && (
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2.5">
                <span className="flex gap-1.5">
                  <span className="size-2 rounded-full bg-destructive/50" />
                  <span className="size-2 rounded-full bg-warning/50" />
                  <span className="size-2 rounded-full bg-success/50" />
                </span>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Configuration
                </p>
              </div>
              <div className="p-4">
                <pre className="font-mono text-sm whitespace-pre-wrap text-muted-foreground">
                  {JSON.stringify(agent.configuration, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1 rounded-lg border border-border bg-card px-4 py-3 shadow-xs">
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
            <div className="flex flex-col gap-1 rounded-lg border border-border bg-card px-4 py-3 shadow-xs">
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
      <DeleteAgentDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        agent={agent}
        onDeleted={() => router.push("/agents")}
      />
    </div>
  );
}
