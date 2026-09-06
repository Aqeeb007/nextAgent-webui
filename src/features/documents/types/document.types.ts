// Backend statuses (DocumentsService.create) — kept in sync manually, same
// posture as ToolType in the tools feature.
export type DocumentStatus = "processing" | "ready" | "failed";

export interface Document {
  id: string;
  organizationId: string;
  name: string;
  status: DocumentStatus;
  error: string | null;
  chunkCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UploadDocumentPayload {
  file: File;
  name?: string;
}
