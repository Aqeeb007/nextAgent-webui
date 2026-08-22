import { AgentCard } from "@/features/agents/components/agent-card";
import type { Agent } from "@/features/agents/types/agent.types";

interface AgentsGridProps {
  agents: Agent[];
}

export function AgentsGrid({ agents }: AgentsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
