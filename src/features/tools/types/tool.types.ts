// Backend accepts "http" | "database" | "custom_js" (CreateToolDto:
// @IsIn(['http', 'database', 'custom_js'])) — keep this union in sync with
// that list so a new type is a type-checked addition, not a guess.
export type ToolType = "http" | "database" | "custom_js";

export type HttpToolMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HttpToolConfig {
  url: string;
  method: HttpToolMethod;
  headers?: Record<string, string>;
}

export type DatabaseEngine = "postgres" | "mysql";

export interface DatabaseToolConfig {
  engine: DatabaseEngine;
  host: string;
  port: number;
  database: string;
  user: string;
  // Returned in plaintext by GET /tools (see ToolsService.TOOL_COLUMNS) —
  // the edit form prefills it the same way it prefills every other field.
  password: string;
  ssl?: boolean;
  // A SELECT-only template using named placeholders (":customerId"),
  // enforced server-side by assertSelectOnly (sql-guard.ts).
  query: string;
}

export interface CustomJsToolConfig {
  // Wrapped at execution time as `(async () => { <code> })()` — must
  // `return` a JSON-serializable value.
  code: string;
  timeoutMs?: number;
}

interface ToolBase {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  parameters: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export type Tool =
  | (ToolBase & { type: "http"; config: HttpToolConfig })
  | (ToolBase & { type: "database"; config: DatabaseToolConfig })
  | (ToolBase & { type: "custom_js"; config: CustomJsToolConfig });

export type ToolPayload =
  | {
      name: string;
      type: "http";
      config: HttpToolConfig;
      description: string;
      parameters?: Record<string, unknown>;
    }
  | {
      name: string;
      type: "database";
      config: DatabaseToolConfig;
      description: string;
      parameters?: Record<string, unknown>;
    }
  | {
      name: string;
      type: "custom_js";
      config: CustomJsToolConfig;
      description: string;
      parameters?: Record<string, unknown>;
    };

// Partial<ToolPayload> would collapse to only the keys shared by every
// variant (TS doesn't distribute Partial over a union on its own) — this
// distributes it manually so each variant keeps its own config shape,
// just optional.
export type UpdateToolPayload = ToolPayload extends infer T
  ? T extends ToolPayload
    ? Partial<T>
    : never
  : never;

export interface TestToolPayload {
  args?: Record<string, unknown>;
}

export interface ToolExecutionResult {
  ok: boolean;
  status: number;
  body: unknown;
  truncated?: boolean;
}
