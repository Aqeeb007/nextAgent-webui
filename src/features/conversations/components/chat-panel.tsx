"use client";

import { MessagesSquare, RotateCcw } from "lucide-react";
import { useEffect, useRef } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Loading } from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "@/features/conversations/components/message-bubble";
import { MessageComposer } from "@/features/conversations/components/message-composer";
import { useChatHistory } from "@/features/conversations/hooks/use-chat-history";
import { useResetChat } from "@/features/conversations/hooks/use-reset-chat";
import { useSendChatMessage } from "@/features/conversations/hooks/use-send-chat-message";
import { getErrorMessage } from "@/lib/api/error";

interface ChatPanelProps {
  agentId: string;
}

// One conversation per (agent, user) on the backend — no list/switcher, just
// this single thread. See webapp-api's src/chat module.
export function ChatPanel({ agentId }: ChatPanelProps) {
  const { data: history, isPending, isError, refetch } = useChatHistory(agentId);
  const sendMessage = useSendChatMessage(agentId);
  const resetMutation = useResetChat(agentId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [history?.messages.length]);

  function handleSend(message: string) {
    sendMessage.mutate({ message });
  }

  if (isPending) {
    return <Loading label="Loading conversation…" />;
  }

  if (isError) {
    return <ErrorState title="Couldn't load conversation" onRetry={() => refetch()} />;
  }

  const hasMessages = history.messages.length > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <p className="text-sm font-medium text-foreground">Conversation</p>
        {hasMessages && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-destructive"
            onClick={() => resetMutation.mutate()}
            disabled={resetMutation.isPending}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!hasMessages ? (
          <EmptyState
            icon={MessagesSquare}
            title="No messages yet"
            description="Send a message to start chatting with this agent."
            className="h-full border-transparent"
          />
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
      {resetMutation.isError && (
        <p role="alert" className="px-4 pb-2 text-sm text-destructive">
          {getErrorMessage(resetMutation.error)}
        </p>
      )}

      <MessageComposer onSend={handleSend} disabled={sendMessage.isPending} />
    </div>
  );
}
