"use client";

import { Globe, Loader2, Plus, ToolCase, X } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Loading } from "@/components/common/Loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AttachToolDialog } from "@/features/agents/components/attach-tool-dialog";
import { useAgentTools } from "@/features/agents/hooks/use-agent-tools";
import { useDetachAgentTool } from "@/features/agents/hooks/use-detach-agent-tool";

interface AgentToolsPanelProps {
  agentId: string;
}

export function AgentToolsPanel({ agentId }: AgentToolsPanelProps) {
  const { data: agentTools, isPending, isError, refetch } = useAgentTools(agentId);
  const detachMutation = useDetachAgentTool(agentId);

  const [attachOpen, setAttachOpen] = useState(false);

  const attachedToolIds = useMemo(
    () => new Set((agentTools ?? []).map((tool) => tool.id)),
    [agentTools]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Tools this agent can call during a conversation.
        </p>
        <Button size="sm" className="shrink-0 gap-1.5" onClick={() => setAttachOpen(true)}>
          <Plus className="size-4" />
          Attach tool
        </Button>
      </div>

      {isPending ? (
        <Loading label="Loading tools…" />
      ) : isError ? (
        <ErrorState title="Couldn't load tools" onRetry={() => refetch()} />
      ) : agentTools.length === 0 ? (
        <EmptyState
          icon={ToolCase}
          title="No tools attached"
          description="Attach a tool so this agent can call it during a conversation."
          actionLabel="Attach tool"
          onAction={() => setAttachOpen(true)}
        />
      ) : (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl ring-1 ring-foreground/10">
          {agentTools.map((tool) => {
            const isDetachingThis =
              detachMutation.isPending && detachMutation.variables === tool.id;

            return (
              <div key={tool.id} className="flex items-center gap-3 bg-card px-4 py-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Globe className="size-4" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-medium text-foreground">
                      {tool.name}
                    </span>
                    <Badge variant="outline" className="font-mono uppercase">
                      {tool.type}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Attached{" "}
                    {new Date(tool.attachedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={detachMutation.isPending}
                  onClick={() => detachMutation.mutate(tool.id)}
                  aria-label={`Remove ${tool.name} from this agent`}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  {isDetachingThis ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <X className="size-4" />
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <AttachToolDialog
        open={attachOpen}
        onOpenChange={setAttachOpen}
        agentId={agentId}
        attachedToolIds={attachedToolIds}
      />
    </div>
  );
}
