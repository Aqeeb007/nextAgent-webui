"use client";

import { useState } from "react";

import { ChatPanel } from "@/features/conversations/components/chat-panel";
import { ConversationList } from "@/features/conversations/components/conversation-list";

interface ConversationViewProps {
  agentId: string;
}

export function ConversationView({ agentId }: ConversationViewProps) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  function handleDeleted(conversationId: string) {
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
    }
  }

  return (
    <div className="flex h-[min(70vh,720px)] min-h-[560px] flex-col gap-4 lg:h-[min(70vh,720px)] lg:min-h-[420px] lg:flex-row">
      <div className="h-48 shrink-0 overflow-hidden rounded-xl bg-card p-3 shadow-sm ring-1 ring-foreground/10 lg:h-auto lg:w-72">
        <ConversationList
          agentId={agentId}
          activeConversationId={activeConversationId}
          onSelect={setActiveConversationId}
          onDeleted={handleDeleted}
        />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-foreground/10">
        <ChatPanel agentId={agentId} conversationId={activeConversationId} />
      </div>
    </div>
  );
}
