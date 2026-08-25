"use client";

import { useParams } from "next/navigation";

import { ErrorState } from "@/components/common/ErrorState";
import { Loading } from "@/components/common/Loading";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConversationView } from "@/features/conversations/components/conversation-view";
import { useAgent } from "@/features/agents/hooks/use-agent";

export default function AgentChatPage() {
  const { id } = useParams<{ id: string }>();
  const { data: agent, isPending, isError, refetch } = useAgent(id);

  if (isPending) {
    return <Loading label="Loading agent…" />;
  }

  if (isError) {
    return <ErrorState title="Couldn't load agent" onRetry={() => refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={agent.name}
        breadcrumbs={[
          { label: "Agents", href: "/agents" },
          { label: agent.name, href: `/agents/${agent.id}` },
          { label: "Chat" },
        ]}
      />

      <ConversationView agentId={agent.id} />
    </div>
  );
}
