"use client";

import { Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

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
import { useAttachAgentTool } from "@/features/agents/hooks/use-attach-agent-tool";
import { ToolTypeBadge } from "@/features/tools/components/tool-type-badge";
import { ToolTypeIcon } from "@/features/tools/components/tool-type-icon";
import { useTools } from "@/features/tools/hooks/use-tools";
import type { Tool } from "@/features/tools/types/tool.types";
import { getErrorMessage } from "@/lib/api/error";

interface AttachToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  attachedToolIds: Set<string>;
}

export function AttachToolDialog({
  open,
  onOpenChange,
  agentId,
  attachedToolIds,
}: AttachToolDialogProps) {
  const { data: tools, isPending, isError } = useTools();
  const attachMutation = useAttachAgentTool(agentId);

  const [query, setQuery] = useState("");

  const availableTools = useMemo(() => {
    const unattached = (tools ?? []).filter((tool) => !attachedToolIds.has(tool.id));
    if (!query.trim()) return unattached;
    const q = query.trim().toLowerCase();
    return unattached.filter(
      (tool) =>
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q)
    );
  }, [tools, attachedToolIds, query]);

  function handleAttach(tool: Tool) {
    attachMutation.mutate(tool.id);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Attach tool</DialogTitle>
          <DialogDescription>
            Choose a tool this agent can call during a conversation.
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Loading tools…
          </div>
        ) : isError ? (
          <p className="py-8 text-center text-sm text-destructive">
            Couldn&apos;t load tools.
          </p>
        ) : tools && tools.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
            <p>You haven&apos;t created any tools yet.</p>
            <Link href="/tools" className="text-primary hover:underline">
              Create a tool
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tools…"
                className="pl-8"
              />
            </div>

            {availableTools.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {query.trim() ? "No tools match your search." : "All your tools are already attached."}
              </p>
            ) : (
              <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
                {availableTools.map((tool) => {
                  const isAttachingThis =
                    attachMutation.isPending && attachMutation.variables === tool.id;

                  return (
                    <div
                      key={tool.id}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/40"
                    >
                      <ToolTypeIcon type={tool.type} />
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-medium text-foreground">
                            {tool.name}
                          </span>
                          <ToolTypeBadge tool={tool} />
                        </div>
                        <span className="truncate text-xs text-muted-foreground">
                          {tool.description}
                        </span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={attachMutation.isPending}
                        onClick={() => handleAttach(tool)}
                        className="shrink-0 gap-1.5"
                      >
                        {isAttachingThis && <Loader2 className="size-3.5 animate-spin" />}
                        {isAttachingThis ? "Attaching…" : "Attach"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {attachMutation.isError && (
              <p role="alert" className="text-sm text-destructive">
                {getErrorMessage(attachMutation.error)}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
