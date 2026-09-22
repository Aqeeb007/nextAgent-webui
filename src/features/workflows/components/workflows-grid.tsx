import type { WorkflowWithSteps } from "../types/workflow.types";
import { WorkflowCard } from "./workflow-card";

interface WorkflowsGridProps {
  workflows: WorkflowWithSteps[];
}

export function WorkflowsGrid({ workflows }: WorkflowsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {workflows.map((workflow, index) => (
        <WorkflowCard
          key={workflow.id}
          workflow={workflow}
          style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
        />
      ))}
    </div>
  );
}
