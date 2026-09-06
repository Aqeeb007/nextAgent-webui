"use client";

import { FileText, LayoutGrid, Plus, Table2 } from "lucide-react";
import { useState } from "react";

import { CardGridSkeleton } from "@/components/common/CardGridSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeleteDocumentDialog } from "@/features/documents/components/delete-document-dialog";
import { createDocumentColumns } from "@/features/documents/components/documents-table/columns";
import { DocumentsGrid } from "@/features/documents/components/documents-grid";
import { UploadDocumentDialog } from "@/features/documents/components/upload-document-dialog";
import { useDocuments } from "@/features/documents/hooks/use-documents";
import type { Document } from "@/features/documents/types/document.types";
import { useCurrentMembership } from "@/features/organizations/hooks/use-current-membership";
import { canDeleteDocuments } from "@/features/organizations/utils/permissions";

type DocumentsView = "grid" | "table";

export default function DocumentsPage() {
  const { data: documents, isPending, isError, refetch } = useDocuments();
  const { membership: currentMembership } = useCurrentMembership();
  const canDelete = canDeleteDocuments(currentMembership?.role.slug);

  const [view, setView] = useState<DocumentsView>("grid");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(null);

  function openUpload() {
    setUploadKey((key) => key + 1);
    setUploadOpen(true);
  }

  const columns = createDocumentColumns({ canDelete, onDelete: setDeletingDocument });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Knowledge Base"
        description="PDF documents your agents can search during a conversation."
        actions={
          <>
            {documents && documents.length > 0 && (
              <Tabs value={view} onValueChange={(value) => setView(value as DocumentsView)}>
                <TabsList>
                  <TabsTrigger value="grid" aria-label="Grid view">
                    <LayoutGrid />
                  </TabsTrigger>
                  <TabsTrigger value="table" aria-label="Table view">
                    <Table2 />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            <Button size="sm" className="gap-1.5" onClick={openUpload}>
              <Plus className="size-4" />
              Upload document
            </Button>
          </>
        }
      />

      {isPending ? (
        <CardGridSkeleton />
      ) : isError ? (
        <ErrorState title="Couldn't load documents" onRetry={() => refetch()} />
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Upload a PDF so your agents can search its content during a conversation."
          actionLabel="Upload document"
          onAction={openUpload}
        />
      ) : view === "grid" ? (
        <DocumentsGrid
          documents={documents}
          canDelete={canDelete}
          onDelete={setDeletingDocument}
        />
      ) : (
        <DataTable columns={columns} data={documents} searchPlaceholder="Search documents…" />
      )}

      <UploadDocumentDialog key={uploadKey} open={uploadOpen} onOpenChange={setUploadOpen} />
      <DeleteDocumentDialog
        key={deletingDocument ? `delete-${deletingDocument.id}` : "delete-none"}
        open={deletingDocument !== null}
        onOpenChange={(open) => !open && setDeletingDocument(null)}
        document={deletingDocument}
      />
    </div>
  );
}
