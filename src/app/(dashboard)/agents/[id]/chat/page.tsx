"use client";

import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { ErrorState } from "@/components/common/ErrorState";
import { Loading } from "@/components/common/Loading";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConversationView } from "@/features/conversations/components/conversation-view";
import { useAgent } from "@/features/agents/hooks/use-agent";

function AgentChatPageContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversationId");
  const { data: agent, isPending, isError, refetch } = useAgent(id);

  function selectConversation(nextConversationId: string | null) {
    router.replace(
      nextConversationId ? `${pathname}?conversationId=${nextConversationId}` : pathname,
      { scroll: false }
    );
  }

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

      <ConversationView
        agentId={agent.id}
        activeConversationId={conversationId}
        onSelectConversation={selectConversation}
        onConversationDeleted={(deletedId) => {
          if (deletedId === conversationId) {
            selectConversation(null);
          }
        }}
      />
    </div>
  );
}

export default function AgentChatPage() {
  return (
    <Suspense fallback={<Loading label="Loading agent…" />}>
      <AgentChatPageContent />
    </Suspense>
  );
}
