"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { env } from "@/config/env";
import { useAuthStore } from "@/stores/auth.store";

import type { ChatStepEvent } from "../types/conversation.types";

// One room per socket connection — ChatGateway has no `leave` handler and
// step-event payloads carry no conversationId, so joining a second
// conversation on the same connection would make incoming events
// ambiguous. Switching conversations therefore tears the socket down and
// reconnects rather than joining an additional room.
export function useConversationSocket(agentId: string, conversationId: string | null) {
  const hasToken = useAuthStore((state) => Boolean(state.accessToken));
  const [connected, setConnected] = useState(false);
  const [step, setStep] = useState<ChatStepEvent | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!conversationId || !hasToken) {
      return;
    }

    // Read fresh rather than subscribing to the token value itself — a
    // silent refresh rotating the token shouldn't interrupt an
    // already-joined connection, only a brand-new one needs the latest.
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      return;
    }

    const socket: Socket = io(env.wsUrl, { auth: { token } });
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
  }, [agentId, conversationId, hasToken]);

  const resetStep = useCallback(() => setStep(null), []);

  return { connected, step, resetStep };
}
