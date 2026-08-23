"use client";

import { MessagesSquare } from "lucide-react";
import { useEffect, useRef } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Loading } from "@/components/common/Loading";
import { MessageBubble } from "@/features/conversations/components/message-bubble";
import { MessageComposer } from "@/features/conversations/components/message-composer";
import { useChatMessages } from "@/features/conversations/hooks/use-chat-messages";
import { useSendMessage } from "@/features/conversations/hooks/use-send-message";
import { getErrorMessage } from "@/lib/api/error";

interface ChatPanelProps {
  agentId: string;
  conversationId: string | null;
}

export function ChatPanel({ agentId, conversationId }: ChatPanelProps) {
  const {
    data: history,
    isPending,
    isError,
    refetch,
  } = useChatMessages(agentId, conversationId);
  const sendMessage = useSendMessage(agentId, conversationId ?? "");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [history?.messages.length]);

  function handleSend(message: string) {
    if (!conversationId) return;
    sendMessage.mutate({ message });
  }

  if (!conversationId) {
    return (
      <EmptyState
        icon={MessagesSquare}
        title="No conversation selected"
        description="Start a new conversation or pick one from the list."
        className="h-full border-transparent"
      />
    );
  }

  if (isPending) {
    return <Loading label="Loading conversation…" />;
  }

  if (isError) {
    return <ErrorState title="Couldn't load conversation" onRetry={() => refetch()} />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {history.messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Send a message to start the conversation.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {history.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {sendMessage.isPending && (
              <div className="flex justify-start">
                <div className="rounded-xl bg-muted/60 px-3.5 py-2.5 text-sm text-muted-foreground">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {sendMessage.isError && (
        <p role="alert" className="px-4 pb-2 text-sm text-destructive">
          {getErrorMessage(sendMessage.error)}
        </p>
      )}

      <MessageComposer onSend={handleSend} disabled={sendMessage.isPending} />
    </div>
  );
}
