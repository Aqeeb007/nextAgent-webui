"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

import { ErrorState } from "@/components/common/ErrorState";
import { Loading } from "@/components/common/Loading";
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
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-sm">
          <Link href="/agents" className="text-primary hover:underline">
            Agents
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link href={`/agents/${agent.id}`} className="text-primary hover:underline">
            {agent.name}
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">Chat</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{agent.name}</h1>
      </div>

      <ConversationView agentId={agent.id} />
    </div>
  );
}
