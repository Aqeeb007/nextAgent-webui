import { Badge } from "@/components/ui/badge";
import type { DocumentStatus } from "@/features/documents/types/document.types";

const STATUS_CONFIG: Record<
  DocumentStatus,
  { label: string; variant: "success" | "warning" | "destructive" }
> = {
  ready: { label: "Ready", variant: "success" },
  processing: { label: "Processing", variant: "warning" },
  failed: { label: "Failed", variant: "destructive" },
};

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const { label, variant } = STATUS_CONFIG[status];
  return <Badge variant={variant}>{label}</Badge>;
}
