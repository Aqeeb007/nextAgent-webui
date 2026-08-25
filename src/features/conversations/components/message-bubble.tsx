import { Bot, ChevronRight, Wrench } from "lucide-react";

import { Markdown } from "@/features/conversations/components/markdown";
import type {
  AssistantToolCallData,
  ChatMessage,
  ToolResultData,
} from "@/features/conversations/types/conversation.types";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

interface MessageBubbleProps {
  message: ChatMessage;
}

function AssistantAvatar() {
  return (
    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary/25 to-primary/10 text-primary">
      <Bot className="size-3.5" />
    </div>
  );
}

function UserAvatar() {
  const initial = useAuthStore((state) => state.user?.firstName?.[0]?.toUpperCase() ?? "?");
  return (
    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-secondary-foreground">
      {initial}
    </div>
  );
}

export function MessageBubble({ message }: MessageBubbleProps) {
  if (message.role === "tool") {
    const data = message.toolCallData as unknown as ToolResultData | null;

    return (
      <div className="flex items-start gap-2.5">
        <AssistantAvatar />
        <details className="group max-w-[75%] rounded-xl border border-border bg-muted/30 px-3.5 py-2.5">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-muted-foreground [&::-webkit-details-marker]:hidden">
            <ChevronRight className="size-3.5 shrink-0 transition-transform group-open:rotate-90" />
            <Wrench className="size-3.5 shrink-0" />
            {data?.toolName ?? "Tool result"}
          </summary>
          <pre className="mt-2 max-h-40 overflow-auto font-mono text-[11px] whitespace-pre-wrap text-muted-foreground">
            {message.content}
          </pre>
        </details>
      </div>
    );
  }

  // Assistant turns that only trigger tool calls persist with empty content
  // (see toOpenAiMessages in the backend's conversations.service.ts) — the
  // reply text comes in a later row once tools have run.
  const toolCallData = message.toolCallData as unknown as AssistantToolCallData | null;
  if (message.role === "assistant" && !message.content && toolCallData?.toolCalls?.length) {
    return (
      <div className="flex items-center gap-2.5">
        <AssistantAvatar />
        <div className="flex items-center gap-1.5 rounded-xl bg-muted/30 px-3.5 py-2 text-xs text-muted-foreground">
          <Wrench className="size-3.5" />
          Calling {toolCallData.toolCalls.map((call) => call.function.name).join(", ")}…
        </div>
      </div>
    );
  }

  const isUser = message.role === "user";

  return (
    <div className={cn("flex items-end gap-2.5", isUser ? "flex-row-reverse" : "flex-row")}>
      {isUser ? <UserAvatar /> : <AssistantAvatar />}
      <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "max-w-[min(75%,32rem)] rounded-2xl px-3.5 py-2.5 shadow-sm",
            isUser
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md bg-muted/60 text-foreground"
          )}
        >
          <Markdown content={message.content} />
        </div>
        <span className="px-1 text-[11px] text-muted-foreground">
          {new Date(message.createdAt).toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
