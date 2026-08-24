import type { ToolType } from "@/features/tools/types/tool.types";

export const TOOL_TYPE_LABELS: Record<ToolType, string> = {
  http: "HTTP",
  database: "Database",
  custom_js: "Custom JS",
};

export function getToolTypeLabel(type: ToolType): string {
  return TOOL_TYPE_LABELS[type];
}
