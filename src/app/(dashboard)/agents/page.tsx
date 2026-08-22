import { Bot } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";

export default function AgentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Agents</h1>
      <EmptyState
        icon={Bot}
        title="No agents yet"
        description="Create your first agent to get started."
      />
    </div>
  );
}
