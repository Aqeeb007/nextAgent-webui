"use client";

import { ArrowUp, Loader2 } from "lucide-react";
import { useState } from "react";
import type { KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageComposerProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function MessageComposer({ onSend, disabled = false }: MessageComposerProps) {
  const [value, setValue] = useState("");

  function handleSend() {
    const content = value.trim();
    if (!content || disabled) return;
    onSend(content);
    setValue("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-border p-3">
      <Textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message this agent…"
        // Deliberately not disabled while `disabled` (a send in flight) —
        // disabling would blur the field, and re-enabling it afterwards
        // doesn't restore focus, forcing an extra click to keep typing.
        // handleSend/handleKeyDown already guard against sending while
        // disabled, so this only lets the next message be drafted early.
        rows={1}
        className="max-h-40 min-h-10 flex-1 resize-none"
      />
      <Button
        type="button"
        size="icon"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
      >
        {disabled ? <Loader2 className="animate-spin" /> : <ArrowUp />}
      </Button>
    </div>
  );
}
