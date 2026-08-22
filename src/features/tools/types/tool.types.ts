// Backend only accepts "http" today (CreateToolDto: @IsIn(['http'])) — the
// union is here so new tool types are a type-checked addition, not a guess.
export type ToolType = "http";

export type HttpToolMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HttpToolConfig {
  url: string;
  method: HttpToolMethod;
  headers?: Record<string, string>;
}

export interface Tool {
  id: string;
  organizationId: string;
  name: string;
  type: ToolType;
  config: HttpToolConfig;
  description: string;
  parameters: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ToolPayload {
  name: string;
  type: "http";
  config: HttpToolConfig;
  description: string;
  parameters?: Record<string, unknown>;
}

export type UpdateToolPayload = Partial<ToolPayload>;

export interface TestToolPayload {
  args?: Record<string, unknown>;
}

export interface ToolExecutionResult {
  ok: boolean;
  status: number;
  body: unknown;
  truncated?: boolean;
}
