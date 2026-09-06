"use client";

import { FileText, Loader2, Search } from "lucide-react";
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
import { useAttachAgentDocument } from "@/features/agents/hooks/use-attach-agent-document";
import { DocumentStatusBadge } from "@/features/documents/components/document-status-badge";
import { useDocuments } from "@/features/documents/hooks/use-documents";
import type { Document } from "@/features/documents/types/document.types";
import { getErrorMessage } from "@/lib/api/error";

interface AttachDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  attachedDocumentIds: Set<string>;
}

export function AttachDocumentDialog({
  open,
  onOpenChange,
  agentId,
  attachedDocumentIds,
}: AttachDocumentDialogProps) {
  const { data: documents, isPending, isError } = useDocuments();
  const attachMutation = useAttachAgentDocument(agentId);

  const [query, setQuery] = useState("");

  const availableDocuments = useMemo(() => {
    const unattached = (documents ?? []).filter(
      (document) => !attachedDocumentIds.has(document.id)
    );
    if (!query.trim()) return unattached;
    const q = query.trim().toLowerCase();
    return unattached.filter((document) => document.name.toLowerCase().includes(q));
  }, [documents, attachedDocumentIds, query]);

  function handleAttach(document: Document) {
    attachMutation.mutate(document.id);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-x-hidden overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Attach document</DialogTitle>
          <DialogDescription>
            Choose a document this agent can search during a conversation.
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Loading documents…
          </div>
        ) : isError ? (
          <p className="py-8 text-center text-sm text-destructive">
            Couldn&apos;t load documents.
          </p>
        ) : documents && documents.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
            <p>You haven&apos;t uploaded any documents yet.</p>
            <Link href="/documents" className="text-primary hover:underline">
              Upload a document
            </Link>
          </div>
        ) : (
          <div className="flex min-w-0 flex-col gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search documents…"
                className="pl-8"
              />
            </div>

            {availableDocuments.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {query.trim()
                  ? "No documents match your search."
                  : "All your documents are already attached."}
              </p>
            ) : (
              <div className="flex min-w-0 max-h-80 flex-col gap-1 overflow-y-auto">
                {availableDocuments.map((document) => {
                  const isAttachingThis =
                    attachMutation.isPending && attachMutation.variables === document.id;

                  return (
                    <div
                      key={document.id}
                      className="flex min-w-0 items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/40"
                    >
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
                        <span className="truncate text-xs text-muted-foreground">
                          {document.chunkCount} chunks
                        </span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={attachMutation.isPending}
                        onClick={() => handleAttach(document)}
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
