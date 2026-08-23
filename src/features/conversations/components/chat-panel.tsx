"use client";

import { MessagesSquare, Wrench } from "lucide-react";
import { useEffect, useRef } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Loading } from "@/components/common/Loading";
import { Badge } from "@/components/ui/badge";
import { MessageBubble } from "@/features/conversations/components/message-bubble";
import { MessageComposer } from "@/features/conversations/components/message-composer";
import { TypewriterText } from "@/features/conversations/components/typewriter-text";
import { useChatMessages } from "@/features/conversations/hooks/use-chat-messages";
import { useConversationChat } from "@/features/conversations/hooks/use-conversation-chat";
import type { ChatStepEvent } from "@/features/conversations/types/conversation.types";
import { getErrorMessage } from "@/lib/api/error";

interface ChatPanelProps {
  agentId: string;
  conversationId: string | null;
}

function describeStep(step: ChatStepEvent | null): string {
  switch (step?.type) {
    case "tool_call":
      return `Calling ${step.toolName}…`;
    case "tool_result":
      return `Got a result from ${step.toolName}…`;
    default:
      return "Thinking…";
  }
}

export function ChatPanel({ agentId, conversationId }: ChatPanelProps) {
  const {
    data: history,
    isPending,
    isError,
    refetch,
  } = useChatMessages(agentId, conversationId);
  const { connected, step, sendMessage, isSending, sendError } = useConversationChat(
    agentId,
    conversationId
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [history?.messages.length, isSending]);

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
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <p className="text-sm font-medium text-foreground">Conversation</p>
        {connected && <Badge variant="live">Live</Badge>}
      </div>

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
            {isSending &&
              (step?.type === "done" ? (
                // The 'done' step already carries the full final text (the
                // backend doesn't stream tokens) — reveal it client-side so
                // it doesn't just pop in once the ack also lands.
                <div className="flex justify-start">
                  <div className="max-w-[75%] rounded-xl bg-muted/60 px-3.5 py-2.5 text-foreground">
                    <TypewriterText text={step.content} key={step.content} />
                  </div>
                </div>
              ) : (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-xl bg-muted/60 px-3.5 py-2.5 text-sm text-muted-foreground">
                    {step?.type === "tool_call" && <Wrench className="size-3.5" />}
                    {describeStep(step)}
                  </div>
                </div>
              ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {sendError && (
        <p role="alert" className="px-4 pb-2 text-sm text-destructive">
          {getErrorMessage(sendError)}
        </p>
      )}

      <MessageComposer
        onSend={sendMessage}
        disabled={isSending || !connected}
        placeholder={connected ? undefined : "Connecting…"}
      />
    </div>
  );
}
