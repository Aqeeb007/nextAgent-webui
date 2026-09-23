"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAgents } from "@/features/agents/hooks/use-agents";
import { useTools } from "@/features/tools/hooks/use-tools";
import { cn } from "@/lib/utils";

import { STEP_TYPE_ICONS } from "../utils/step-display";

interface AddStepMenuProps {
  onAddAgentStep: (agentId: string) => void;
  onAddToolStep: (toolId: string) => void;
  onAddConditionStep: () => void;
  className?: string;
  label?: string;
}

const AgentIcon = STEP_TYPE_ICONS.agent;
const ToolIcon = STEP_TYPE_ICONS.tool;
const ConditionIcon = STEP_TYPE_ICONS.condition;

// Agent/tool steps need a real agentId/toolId the moment they're created —
// the backend validates config.agentId/config.toolId as a uuid on the very
// first POST, so there's no "blank step, fill in later" state the way
// Phase 1's local-only draft allowed. Picking the specific agent/tool here
// IS the add-step action for those two types; a condition step's default
// config has no such requirement, so it stays a single click.
export function AddStepMenu({
  onAddAgentStep,
  onAddToolStep,
  onAddConditionStep,
  className,
  label,
}: AddStepMenuProps) {
  const { data: agents } = useAgents();
  const { data: tools } = useTools();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size={label ? "sm" : "icon-sm"}
            className={cn("nodrag rounded-full border-dashed", className)}
          />
        }
      >
        <Plus className="size-3.5" />
        {label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <AgentIcon className="size-4" />
            Agent
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {agents && agents.length === 0 ? (
              <DropdownMenuItem disabled>No agents yet — create one first</DropdownMenuItem>
            ) : (
              agents?.map((agent) => (
                <DropdownMenuItem key={agent.id} onClick={() => onAddAgentStep(agent.id)}>
                  {agent.name}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ToolIcon className="size-4" />
            Tool
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {tools && tools.length === 0 ? (
              <DropdownMenuItem disabled>No tools yet — create one first</DropdownMenuItem>
            ) : (
              tools?.map((tool) => (
                <DropdownMenuItem key={tool.id} onClick={() => onAddToolStep(tool.id)}>
                  {tool.name}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem onClick={onAddConditionStep}>
          <ConditionIcon className="size-4" />
          Condition
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
