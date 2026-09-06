"use client";

import { FileText, Loader2, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Loading } from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import { AttachDocumentDialog } from "@/features/agents/components/attach-document-dialog";
import { useAgentDocuments } from "@/features/agents/hooks/use-agent-documents";
import { useDetachAgentDocument } from "@/features/agents/hooks/use-detach-agent-document";
import { DocumentStatusBadge } from "@/features/documents/components/document-status-badge";

interface AgentDocumentsPanelProps {
  agentId: string;
}

export function AgentDocumentsPanel({ agentId }: AgentDocumentsPanelProps) {
  const { data: agentDocuments, isPending, isError, refetch } = useAgentDocuments(agentId);
  const detachMutation = useDetachAgentDocument(agentId);

  const [attachOpen, setAttachOpen] = useState(false);

  const attachedDocumentIds = useMemo(
    () => new Set((agentDocuments ?? []).map((document) => document.id)),
    [agentDocuments]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Documents this agent can search during a conversation.
        </p>
        <Button size="sm" className="shrink-0 gap-1.5" onClick={() => setAttachOpen(true)}>
          <Plus className="size-4" />
          Attach document
        </Button>
      </div>

      {isPending ? (
        <Loading label="Loading documents…" />
      ) : isError ? (
        <ErrorState title="Couldn't load documents" onRetry={() => refetch()} />
      ) : agentDocuments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents attached"
          description="Attach a document so this agent can search it during a conversation."
          actionLabel="Attach document"
          onAction={() => setAttachOpen(true)}
        />
      ) : (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl ring-1 ring-foreground/10">
          {agentDocuments.map((document) => {
            const isDetachingThis =
              detachMutation.isPending && detachMutation.variables === document.id;

            return (
              <div key={document.id} className="flex items-center gap-3 bg-card px-4 py-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <FileText className="size-4" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-medium text-foreground">
                      {document.name}
                    </span>
                    <DocumentStatusBadge status={document.status} />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Attached{" "}
                    {new Date(document.attachedAt).toLocaleDateString(undefined, {
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
                  onClick={() => detachMutation.mutate(document.id)}
                  aria-label={`Remove ${document.name} from this agent`}
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

      <AttachDocumentDialog
        open={attachOpen}
        onOpenChange={setAttachOpen}
        agentId={agentId}
        attachedDocumentIds={attachedDocumentIds}
      />
    </div>
  );
}
