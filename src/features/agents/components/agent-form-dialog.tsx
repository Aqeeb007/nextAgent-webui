"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAgent } from "@/features/agents/hooks/use-create-agent";
import { useUpdateAgent } from "@/features/agents/hooks/use-update-agent";
import type { Agent, AgentPayload } from "@/features/agents/types/agent.types";
import { getErrorMessage } from "@/lib/api/error";

interface AgentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent?: Agent | null;
}

// Mounted with a `key` tied to which agent (or "create") is being edited (see
// callers), so a fresh instance — and fresh state below — is exactly what
// "open the form for a different agent" means. No reset effect needed.
export function AgentFormDialog({ open, onOpenChange, agent = null }: AgentFormDialogProps) {
  const isEditing = agent !== null;
  const createMutation = useCreateAgent();
  const updateMutation = useUpdateAgent();
  const { isPending, error } = isEditing ? updateMutation : createMutation;

  const [name, setName] = useState(agent?.name ?? "");
  const [description, setDescription] = useState(agent?.description ?? "");
  const [model, setModel] = useState(agent?.model ?? "");
  const [systemPrompt, setSystemPrompt] = useState(agent?.systemPrompt ?? "");
  const [configurationText, setConfigurationText] = useState(() =>
    agent?.configuration ? JSON.stringify(agent.configuration, null, 2) : ""
  );
  const [configurationError, setConfigurationError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let configuration: Record<string, unknown> | undefined;
    if (configurationText.trim()) {
      try {
        const parsed: unknown = JSON.parse(configurationText);
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
          throw new Error("Configuration must be a JSON object");
        }
        configuration = parsed as Record<string, unknown>;
      } catch (err) {
        setConfigurationError(
          err instanceof Error ? err.message : "Configuration must be valid JSON"
        );
        return;
      }
    }
    setConfigurationError(null);

    const payload: AgentPayload = {
      name,
      model,
      systemPrompt,
      ...(description.trim() && { description }),
      ...(configuration && { configuration }),
    };

    if (isEditing && agent) {
      updateMutation.mutate(
        { id: agent.id, payload },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit agent" : "Create agent"}</DialogTitle>
          <DialogDescription>
            Agents combine a model and a system prompt to handle conversations.
          </DialogDescription>
        </DialogHeader>

        <form id="agent-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="agent-name">Name</Label>
            <Input
              id="agent-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Support assistant"
              required
              maxLength={255}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="agent-model">Model</Label>
            <Input
              id="agent-model"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder="claude-sonnet-5"
              required
              maxLength={100}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="agent-description">Description</Label>
            <Textarea
              id="agent-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What this agent is for."
              maxLength={2000}
              className="min-h-16"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="agent-system-prompt">System prompt</Label>
            <Textarea
              id="agent-system-prompt"
              value={systemPrompt}
              onChange={(event) => setSystemPrompt(event.target.value)}
              placeholder="You are a helpful assistant that…"
              required
              maxLength={10000}
              className="min-h-32"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="agent-configuration">Configuration (JSON, optional)</Label>
            <Textarea
              id="agent-configuration"
              value={configurationText}
              onChange={(event) => setConfigurationText(event.target.value)}
              placeholder={'{\n  "temperature": 0.7\n}'}
              className="min-h-20 font-mono text-xs"
            />
            {configurationError && (
              <p role="alert" className="text-sm text-destructive">
                {configurationError}
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {getErrorMessage(error)}
            </p>
          )}
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
            Cancel
          </Button>
          <Button type="submit" form="agent-form" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {isPending ? "Saving…" : isEditing ? "Save changes" : "Create agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
