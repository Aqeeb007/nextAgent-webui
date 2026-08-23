"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { env } from "@/config/env";
import { useAuthStore } from "@/stores/auth.store";
import { useOrganizationStore } from "@/stores/organization.store";

import type {
  ChatHistory,
  ChatMessage,
  ChatStepEvent,
  SendMessageResult,
} from "../types/conversation.types";

interface SocketErrorPayload {
  message: string;
}

// One room per socket connection — ChatGateway has no `leave` handler and
// step-event payloads carry no conversationId, so joining a second
// conversation on the same connection would make incoming events
// ambiguous. Switching conversations therefore tears the socket down and
// reconnects rather than joining an additional room.
//
// Sending a message is itself a socket event now too ('sendMessage' ->
// 'messageSent' / 'sendMessageError'), not an HTTP call — there's no
// fallback path, so callers should keep the composer disabled until
// `connected` is true.
export function useConversationChat(agentId: string, conversationId: string | null) {
  const hasToken = useAuthStore((state) => Boolean(state.accessToken));
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);
  const queryClient = useQueryClient();

  const [connected, setConnected] = useState(false);
  const [step, setStep] = useState<ChatStepEvent | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!conversationId || !hasToken || !selectedOrgId) {
      return;
    }

    // Read fresh rather than subscribing to the token value itself — a
    // silent refresh rotating the token shouldn't interrupt an
    // already-joined connection, only a brand-new one needs the latest.
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      return;
    }

    const socket: Socket = io(env.wsUrl, {
      auth: { token, organizationId: selectedOrgId },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", { agentId, conversationId });
    });
    socket.on("joined", () => {
      setConnected(true);
      // A fresh join means any step left over from a previous conversation
      // (or a previous, since-replaced connection attempt) no longer applies.
      setStep(null);
    });
    socket.on("error", () => setConnected(false));
    socket.on("disconnect", () => setConnected(false));

    socket.on("thinking", () => setStep({ type: "thinking" }));
    socket.on("tool_call", (event: { toolName: string }) =>
      setStep({ type: "tool_call", toolName: event.toolName })
    );
    socket.on("tool_result", (event: { toolName: string; result: unknown }) =>
      setStep({ type: "tool_result", toolName: event.toolName, result: event.result })
    );
    socket.on("done", (event: { content: string }) =>
      setStep({ type: "done", content: event.content })
    );

    return () => {
      // Disconnect first so the "disconnect" listener above fires and
      // clears `connected` itself — a callback-driven setState, not a bare
      // one in the effect body, and it reflects reality without a manual
      // reset. Listeners are stripped after, once the socket is torn down.
      socket.disconnect();
      socket.off();
      socketRef.current = null;
    };
  }, [agentId, conversationId, hasToken, selectedOrgId]);

  const messagesKey = [
    "agents",
    selectedOrgId,
    agentId,
    "conversations",
    conversationId,
    "messages",
  ];
  const listKey = ["agents", selectedOrgId, agentId, "conversations"];

  const mutation = useMutation({
    mutationFn: (message: string) => {
      const socket = socketRef.current;
      if (!conversationId || !socket?.connected) {
        return Promise.reject(new Error("Not connected to the conversation"));
      }
      const activeSocket = socket;

      return new Promise<SendMessageResult>((resolve, reject) => {
        function handleSent(result: SendMessageResult) {
          activeSocket.off("sendMessageError", handleError);
          resolve(result);
        }
        function handleError(event: SocketErrorPayload) {
          activeSocket.off("messageSent", handleSent);
          reject(new Error(event.message));
        }

        activeSocket.once("messageSent", handleSent);
        activeSocket.once("sendMessageError", handleError);
        activeSocket.emit("sendMessage", { agentId, conversationId, message });
      });
    },
    // Optimistically echo the user's message — the ack only carries the
    // final assistant text, not the full row set (tool-call turns are
    // persisted server-side but not echoed), so the authoritative view
    // comes from refetching messages on success rather than appending the
    // response in place. Also clears any step left over from the last send.
    onMutate: async (message: string) => {
      setStep(null);
      await queryClient.cancelQueries({ queryKey: messagesKey });
      const previous = queryClient.getQueryData<ChatHistory>(messagesKey);

      const optimisticMessage: ChatMessage = {
        id: `optimistic-${Date.now()}`,
        conversationId: conversationId ?? "",
        role: "user",
        content: message,
        toolCallData: null,
        sequence: Number.MAX_SAFE_INTEGER,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<ChatHistory>(messagesKey, (old) => ({
        conversationId: conversationId ?? "",
        messages: [...(old?.messages ?? []), optimisticMessage],
      }));

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(messagesKey, context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagesKey, exact: true });
      // Sending updates the conversation's preview/lastMessageAt in the list.
      queryClient.invalidateQueries({ queryKey: listKey, exact: true });
    },
  });

  return {
    connected,
    step,
    sendMessage: mutation.mutate,
    isSending: mutation.isPending,
    sendError: mutation.error,
  };
}
