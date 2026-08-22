import { Bot, ToolCase } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";

export default function ToolsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Tools</h1>
      <EmptyState
        icon={ToolCase}
        title="No tools yet"
        description="Create your first tool to get started."
      />
    </div>
  );
}
