import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

import type { Document, UploadDocumentPayload } from "../types/document.types";

export async function listDocuments() {
  const { data } = await apiClient.get<Document[]>(endpoints.documents.list);
  return data;
}

export async function uploadDocument({ file, name }: UploadDocumentPayload) {
  const formData = new FormData();
  formData.append("file", file);
  if (name) formData.append("name", name);

  // apiClient's instance-level `Content-Type: application/json` (see
  // client.ts) would otherwise clobber the multipart boundary — unsetting it
  // here lets the browser set the correct `multipart/form-data; boundary=…`
  // header itself. The only upload endpoint in this app, so the only place
  // that needs this.
  const { data } = await apiClient.post<Document>(endpoints.documents.list, formData, {
    headers: { "Content-Type": undefined },
  });
  return data;
}

export async function deleteDocument(id: string) {
  await apiClient.delete(endpoints.documents.detail(id));
}
