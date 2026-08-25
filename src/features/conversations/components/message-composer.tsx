"use client";

import { ArrowUp, Loader2 } from "lucide-react";
import { useState } from "react";
import type { KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageComposerProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageComposer({
  onSend,
  disabled = false,
  placeholder = "Message this agent…",
}: MessageComposerProps) {
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
    <div className="border-t border-border bg-muted/20 p-3">
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-1.5 pl-3 shadow-sm transition-colors focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/15">
        <Textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          // Deliberately not disabled while `disabled` (a send in flight) —
          // disabling would blur the field, and re-enabling it afterwards
          // doesn't restore focus, forcing an extra click to keep typing.
          // handleSend/handleKeyDown already guard against sending while
          // disabled, so this only lets the next message be drafted early.
          rows={1}
          className="max-h-40 min-h-8 flex-1 resize-none border-none bg-transparent px-0 py-1.5 shadow-none focus-visible:ring-0"
        />
        <Button
          type="button"
          size="icon"
          className="rounded-full"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
        >
          {disabled ? <Loader2 className="animate-spin" /> : <ArrowUp />}
        </Button>
      </div>
    </div>
  );
}
