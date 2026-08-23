"use client";

import { useEffect, useState } from "react";

import { Markdown } from "@/features/conversations/components/markdown";

const CHARS_PER_TICK = 3;
const TICK_MS = 16;

interface TypewriterTextProps {
  text: string;
}

// The backend doesn't stream tokens (chat.service.ts makes one non-streaming
// OpenAI call) — it only emits a 'done' step event carrying the full final
// text, arriving over the socket slightly ahead of the HTTP response. This
// simulates a streaming reveal client-side from that text so the reply
// doesn't just pop in all at once. Callers should mount a fresh instance per
// message (e.g. `key={text}`) so the reveal restarts instead of jumping.
export function TypewriterText({ text }: TypewriterTextProps) {
  const [revealedLength, setRevealedLength] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRevealedLength((length) => {
        if (length >= text.length) {
          clearInterval(timer);
          return length;
        }
        return Math.min(length + CHARS_PER_TICK, text.length);
      });
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [text]);

  return <Markdown content={text.slice(0, revealedLength)} />;
}
