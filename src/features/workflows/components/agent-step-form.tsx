"use client";

import Link from "next/link";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAgents } from "@/features/agents/hooks/use-agents";

import type { AgentStepConfig } from "../types/workflow.types";

interface AgentStepFormProps {
  config: AgentStepConfig;
  disabled: boolean;
  onChange: (config: AgentStepConfig) => void;
}

export function AgentStepForm({ config, disabled, onChange }: AgentStepFormProps) {
  const { data: agents, isPending } = useAgents();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="step-agent">Agent</Label>
        {agents && agents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You haven&apos;t created any agents yet.{" "}
            <Link href="/agents" className="text-primary hover:underline">
              Create an agent
            </Link>
          </p>
        ) : (
          <Select
            items={agents?.map((agent) => ({ value: agent.id, label: agent.name })) ?? []}
            value={config.agentId || undefined}
            onValueChange={(value) => value && onChange({ ...config, agentId: value })}
            disabled={disabled || isPending}
          >
            <SelectTrigger id="step-agent" className="w-full">
              <SelectValue placeholder={isPending ? "Loading agents…" : "Select an agent"} />
            </SelectTrigger>
            <SelectContent>
              {agents?.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="step-prompt-template">Prompt template</Label>
        <Textarea
          id="step-prompt-template"
          value={config.promptTemplate ?? ""}
          onChange={(event) => onChange({ ...config, promptTemplate: event.target.value })}
          disabled={disabled}
          maxLength={10000}
          placeholder={"e.g. Summarize this:\n\n{{input}}"}
          className="min-h-32 font-mono text-xs"
        />
        <p className="text-xs text-muted-foreground">
          <code className="rounded bg-muted px-1 py-0.5">{"{{input}}"}</code> resolves to the
          current pipeline input. Leave blank to send the raw input verbatim.
        </p>
      </div>
    </div>
  );
}
