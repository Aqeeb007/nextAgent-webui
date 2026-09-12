"use client";

import { MessagesSquare } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChatPanel } from "@/features/conversations/components/chat-panel";
import { ConversationList } from "@/features/conversations/components/conversation-list";

interface ConversationViewProps {
  agentId: string;
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onConversationDeleted: (conversationId: string) => void;
}

export function ConversationView({
  agentId,
  activeConversationId,
  onSelectConversation,
  onConversationDeleted,
}: ConversationViewProps) {
  const [listOpen, setListOpen] = useState(false);

  function handleSelect(conversationId: string) {
    onSelectConversation(conversationId);
    setListOpen(false);
  }

  return (
    <div className="flex h-[calc(100svh-13rem)] min-h-140 flex-col gap-4 lg:h-[calc(100svh-11rem)] lg:min-h-120 lg:flex-row">
      <div className="lg:hidden">
        <Sheet open={listOpen} onOpenChange={setListOpen}>
          <SheetTrigger
            render={<Button variant="outline" size="sm" className="w-full justify-start gap-1.5" />}
          >
            <MessagesSquare className="size-4" />
            Conversations
          </SheetTrigger>
          <SheetContent>
            <ConversationList
              agentId={agentId}
              activeConversationId={activeConversationId}
              onSelect={handleSelect}
              onDeleted={onConversationDeleted}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden overflow-hidden rounded-xl bg-card p-3 shadow-sm ring-1 ring-foreground/10 lg:block lg:w-72">
        <ConversationList
          agentId={agentId}
          activeConversationId={activeConversationId}
          onSelect={onSelectConversation}
          onDeleted={onConversationDeleted}
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-foreground/10">
        <ChatPanel agentId={agentId} conversationId={activeConversationId} />
      </div>
    </div>
  );
}
