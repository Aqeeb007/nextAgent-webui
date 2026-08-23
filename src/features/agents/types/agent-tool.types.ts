import type { ToolType } from "@/features/tools/types/tool.types";

// Shape of GET /agents/:agentId/tools — a curated join of agent_tools + tools,
// distinct from the full Tool record in the tools feature (no config/parameters).
export interface AgentTool {
  id: string;
  name: string;
  type: ToolType;
  attachedAt: string;
}
