"use client";

import { Loader2, MessageSquarePlus, MessagesSquare, Trash2 } from "lucide-react";
import type { MouseEvent } from "react";

import { ErrorState } from "@/components/common/ErrorState";
import { Loading } from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import { useConversations } from "@/features/conversations/hooks/use-conversations";
import { useCreateConversation } from "@/features/conversations/hooks/use-create-conversation";
import { useDeleteConversation } from "@/features/conversations/hooks/use-delete-conversation";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  agentId: string;
  activeConversationId: string | null;
  onSelect: (conversationId: string) => void;
  onDeleted: (conversationId: string) => void;
}

export function ConversationList({
  agentId,
  activeConversationId,
  onSelect,
  onDeleted,
}: ConversationListProps) {
  const { data: conversations, isPending, isError, refetch } = useConversations(agentId);
  const createMutation = useCreateConversation(agentId);
  const deleteMutation = useDeleteConversation(agentId);

  function handleCreate() {
    createMutation.mutate(undefined, {
      onSuccess: (conversation) => onSelect(conversation.id),
    });
  }

  function handleDelete(event: MouseEvent, conversationId: string) {
    event.stopPropagation();
    deleteMutation.mutate(conversationId, {
      onSuccess: () => onDeleted(conversationId),
    });
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <Button
        size="sm"
        variant="outline"
        className="w-full justify-start gap-1.5"
        onClick={handleCreate}
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? (
          <Loader2 className="animate-spin" />
        ) : (
          <MessageSquarePlus className="size-4" />
        )}
        New conversation
      </Button>

      <div className="flex-1 overflow-y-auto">
        {isPending ? (
          <Loading label="Loading…" />
        ) : isError ? (
          <ErrorState title="Couldn't load conversations" onRetry={() => refetch()} />
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
            <MessagesSquare className="size-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              No conversations yet. Start one to chat with this agent.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {conversations.map((conversation) => {
              const isDeletingThis =
                deleteMutation.isPending && deleteMutation.variables === conversation.id;
              const isActive = activeConversationId === conversation.id;
              const lastActivity = conversation.lastMessageAt ?? conversation.createdAt;

              return (
                <div
                  key={conversation.id}
                  className={cn(
                    "group flex items-center gap-1 rounded-lg pr-1.5 transition-colors hover:bg-muted",
                    isActive && "bg-primary/15 hover:bg-primary/15"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(conversation.id)}
                    className="flex min-w-0 flex-1 flex-col gap-0.5 px-2.5 py-2 text-left"
                  >
                    <span
                      className={cn(
                        "truncate text-sm text-muted-foreground",
                        isActive && "text-foreground"
                      )}
                    >
                      {conversation.preview ?? "New conversation"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(lastActivity).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    disabled={deleteMutation.isPending}
                    onClick={(event) => handleDelete(event, conversation.id)}
                    aria-label="Delete conversation"
                    className="shrink-0 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
                  >
                    {isDeletingThis ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Trash2 />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
