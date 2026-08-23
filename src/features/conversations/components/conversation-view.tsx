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
    <div className="flex h-[min(70vh,720px)] min-h-[420px] gap-4">
      <div className="w-72 shrink-0 rounded-xl bg-card p-3 ring-1 ring-foreground/10">
        <ConversationList
          agentId={agentId}
          activeConversationId={activeConversationId}
          onSelect={setActiveConversationId}
          onDeleted={handleDeleted}
        />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <ChatPanel agentId={agentId} conversationId={activeConversationId} />
      </div>
    </div>
  );
}
