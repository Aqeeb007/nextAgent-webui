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
import { useUploadDocument } from "@/features/documents/hooks/use-upload-document";
import { getErrorMessage } from "@/lib/api/error";

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mounted with a fresh `key` each time it's opened (see documents/page.tsx),
// so local state resets between uploads without a manual reset effect —
// same idiom as ToolFormDialog.
export function UploadDocumentDialog({ open, onOpenChange }: UploadDocumentDialogProps) {
  const { mutate, isPending, error, data: result, reset } = useUploadDocument();

  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!file) return;

    mutate({ file, name: name.trim() || undefined });
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  }

  // The backend upload call is synchronous end-to-end (parse + chunk +
  // embed can take several seconds) and always returns 200/201 — a
  // processing failure (bad PDF, embeddings outage) comes back as
  // `status: "failed"` on the response body, not an HTTP error, so it needs
  // its own check distinct from the mutation's own error state.
  const processingFailed = result?.status === "failed";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Upload document</DialogTitle>
            <DialogDescription>
              Upload a PDF for your agents to search during a conversation.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="document-file">PDF file</Label>
            <Input
              id="document-file"
              type="file"
              accept="application/pdf"
              disabled={isPending}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="document-name">Name (optional)</Label>
            <Input
              id="document-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={file?.name ?? "Defaults to the file name"}
              disabled={isPending}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {getErrorMessage(error)}
            </p>
          )}

          {processingFailed && (
            <p role="alert" className="text-sm text-destructive">
              {result.error ?? "This document couldn't be processed."}
            </p>
          )}

          {result && !processingFailed && (
            <p className="text-sm text-success">
              Uploaded and indexed — {result.chunkCount} chunks ready to search.
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              {result && !processingFailed ? "Done" : "Cancel"}
            </Button>
            {(!result || processingFailed) && (
              <Button type="submit" disabled={isPending || !file}>
                {isPending && <Loader2 className="animate-spin" />}
                {isPending ? "Processing…" : "Upload"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
