"use client";

import { Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTool } from "@/features/tools/hooks/use-create-tool";
import { useUpdateTool } from "@/features/tools/hooks/use-update-tool";
import type {
  DatabaseEngine,
  HttpToolConfig,
  HttpToolMethod,
  Tool,
  ToolPayload,
  ToolType,
} from "@/features/tools/types/tool.types";
import { getErrorMessage } from "@/lib/api/error";

const HTTP_METHODS: HttpToolMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const TOOL_TYPES: { value: ToolType; label: string }[] = [
  { value: "http", label: "HTTP" },
  { value: "database", label: "Database" },
  { value: "custom_js", label: "Custom JS" },
];

const TOOL_TYPE_DESCRIPTIONS: Record<ToolType, string> = {
  http: "Calls an HTTP endpoint on the agent's behalf.",
  database: "Runs a read-only SQL query against a Postgres or MySQL database.",
  custom_js: "Runs a JavaScript function in a sandboxed worker.",
};

const DEFAULT_DB_PORTS: Record<DatabaseEngine, string> = {
  postgres: "5432",
  mysql: "3306",
};

const CUSTOM_JS_PLACEHOLDER = `const response = await fetch(\`https://api.example.com/items/\${args.id}\`);
const data = await response.json();
return data;`;

interface HeaderRow {
  key: string;
  value: string;
}

interface ToolFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tool: Tool | null;
}

// Mounted with a `key` tied to which tool (or "create") is being edited (see
// tools/page.tsx), so a fresh instance — and fresh state below — is exactly
// what "open the form for a different tool" means. No reset effect needed.
export function ToolFormDialog({ open, onOpenChange, tool }: ToolFormDialogProps) {
  const isEditing = tool !== null;
  const createMutation = useCreateTool();
  const updateMutation = useUpdateTool();
  const { isPending, error } = isEditing ? updateMutation : createMutation;

  const [type, setType] = useState<ToolType>(tool?.type ?? "http");

  const [name, setName] = useState(tool?.name ?? "");
  const [description, setDescription] = useState(tool?.description ?? "");

  // http
  const [url, setUrl] = useState(tool?.type === "http" ? tool.config.url : "");
  const [method, setMethod] = useState<HttpToolMethod>(
    tool?.type === "http" ? tool.config.method : "GET"
  );
  const [headers, setHeaders] = useState<HeaderRow[]>(() =>
    Object.entries(tool?.type === "http" ? (tool.config.headers ?? {}) : {}).map(
      ([key, value]) => ({ key, value })
    )
  );

  // database
  const [engine, setEngine] = useState<DatabaseEngine>(
    tool?.type === "database" ? tool.config.engine : "postgres"
  );
  const [dbHost, setDbHost] = useState(tool?.type === "database" ? tool.config.host : "");
  const [dbPort, setDbPort] = useState(
    tool?.type === "database" ? String(tool.config.port) : DEFAULT_DB_PORTS.postgres
  );
  const [dbName, setDbName] = useState(tool?.type === "database" ? tool.config.database : "");
  const [dbUser, setDbUser] = useState(tool?.type === "database" ? tool.config.user : "");
  const [dbPassword, setDbPassword] = useState(
    tool?.type === "database" ? tool.config.password : ""
  );
  const [dbSsl, setDbSsl] = useState(tool?.type === "database" ? Boolean(tool.config.ssl) : false);
  const [dbQuery, setDbQuery] = useState(tool?.type === "database" ? tool.config.query : "");

  // custom_js
  const [jsCode, setJsCode] = useState(tool?.type === "custom_js" ? tool.config.code : "");
  const [jsTimeout, setJsTimeout] = useState(
    tool?.type === "custom_js" && tool.config.timeoutMs
      ? String(tool.config.timeoutMs)
      : ""
  );

  const [parametersText, setParametersText] = useState(() =>
    tool?.parameters ? JSON.stringify(tool.parameters, null, 2) : ""
  );
  const [parametersError, setParametersError] = useState<string | null>(null);

  function handleEngineChange(next: DatabaseEngine) {
    setEngine(next);
    setDbPort((prev) => (prev.trim() ? prev : DEFAULT_DB_PORTS[next]));
  }

  function addHeaderRow() {
    setHeaders((rows) => [...rows, { key: "", value: "" }]);
  }

  function updateHeaderRow(index: number, field: keyof HeaderRow, value: string) {
    setHeaders((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function removeHeaderRow(index: number) {
    setHeaders((rows) => rows.filter((_, i) => i !== index));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let parameters: Record<string, unknown> | undefined;
    if (parametersText.trim()) {
      try {
        const parsed: unknown = JSON.parse(parametersText);
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
          throw new Error("Parameters must be a JSON object");
        }
        parameters = parsed as Record<string, unknown>;
      } catch (err) {
        setParametersError(
          err instanceof Error ? err.message : "Parameters must be valid JSON"
        );
        return;
      }
    }
    setParametersError(null);

    let payload: ToolPayload;

    if (type === "http") {
      const cleanHeaders = Object.fromEntries(
        headers.filter((row) => row.key.trim()).map((row) => [row.key.trim(), row.value])
      );

      const config: HttpToolConfig = {
        url,
        method,
        ...(Object.keys(cleanHeaders).length > 0 && { headers: cleanHeaders }),
      };

      payload = { name, type: "http", config, description, parameters };
    } else if (type === "database") {
      payload = {
        name,
        type: "database",
        config: {
          engine,
          host: dbHost,
          port: Number(dbPort),
          database: dbName,
          user: dbUser,
          password: dbPassword,
          ssl: dbSsl,
          query: dbQuery,
        },
        description,
        parameters,
      };
    } else {
      const timeoutMs = jsTimeout.trim() ? Number(jsTimeout) : undefined;

      payload = {
        name,
        type: "custom_js",
        config: {
          code: jsCode,
          ...(timeoutMs !== undefined && { timeoutMs }),
        },
        description,
        parameters,
      };
    }

    if (isEditing && tool) {
      updateMutation.mutate(
        { id: tool.id, payload },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit tool" : "Add tool"}</DialogTitle>
          <DialogDescription>{TOOL_TYPE_DESCRIPTIONS[type]}</DialogDescription>
        </DialogHeader>

        <form id="tool-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tool-type">Type</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as ToolType)}
              disabled={isEditing}
            >
              <SelectTrigger id="tool-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TOOL_TYPES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isEditing && (
              <p className="text-xs text-muted-foreground">
                A tool&apos;s type can&apos;t be changed after it&apos;s created.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tool-name">Name</Label>
            <Input
              id="tool-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="get_weather"
              required
              maxLength={255}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tool-description">Description</Label>
            <Textarea
              id="tool-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What this tool does — shown to the model when deciding whether to call it."
              required
              maxLength={1000}
              className="min-h-20"
            />
          </div>

          {type === "http" && (
            <>
              <div className="grid grid-cols-[8rem_1fr] gap-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="tool-method">Method</Label>
                  <Select
                    value={method}
                    onValueChange={(value) => setMethod(value as HttpToolMethod)}
                  >
                    <SelectTrigger id="tool-method" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HTTP_METHODS.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="tool-url">URL</Label>
                  <Input
                    id="tool-url"
                    type="url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://api.example.com/weather"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label>Headers</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={addHeaderRow}
                    className="gap-1"
                  >
                    <Plus />
                    Add header
                  </Button>
                </div>
                {headers.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No custom headers.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {headers.map((row, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={row.key}
                          onChange={(event) =>
                            updateHeaderRow(index, "key", event.target.value)
                          }
                          placeholder="Authorization"
                          className="font-mono text-xs"
                        />
                        <Input
                          value={row.value}
                          onChange={(event) =>
                            updateHeaderRow(index, "value", event.target.value)
                          }
                          placeholder="Bearer …"
                          className="font-mono text-xs"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeHeaderRow(index)}
                          aria-label="Remove header"
                        >
                          <X />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {type === "database" && (
            <>
              <div className="grid grid-cols-[10rem_1fr] gap-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="tool-db-engine">Engine</Label>
                  <Select
                    value={engine}
                    onValueChange={(value) => handleEngineChange(value as DatabaseEngine)}
                  >
                    <SelectTrigger id="tool-db-engine" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgres">PostgreSQL</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="tool-db-host">Host</Label>
                  <Input
                    id="tool-db-host"
                    value={dbHost}
                    onChange={(event) => setDbHost(event.target.value)}
                    placeholder="db.example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-[8rem_1fr] gap-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="tool-db-port">Port</Label>
                  <Input
                    id="tool-db-port"
                    type="number"
                    min={1}
                    max={65535}
                    value={dbPort}
                    onChange={(event) => setDbPort(event.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="tool-db-name">Database</Label>
                  <Input
                    id="tool-db-name"
                    value={dbName}
                    onChange={(event) => setDbName(event.target.value)}
                    placeholder="app_production"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="tool-db-user">User</Label>
                  <Input
                    id="tool-db-user"
                    value={dbUser}
                    onChange={(event) => setDbUser(event.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="tool-db-password">Password</Label>
                  <PasswordInput
                    id="tool-db-password"
                    value={dbPassword}
                    onChange={(event) => setDbPassword(event.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>

              <label htmlFor="tool-db-ssl" className="flex items-center gap-2 text-sm">
                <Checkbox
                  id="tool-db-ssl"
                  checked={dbSsl}
                  onCheckedChange={(checked) => setDbSsl(checked === true)}
                />
                Require SSL
              </label>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tool-db-query">Query</Label>
                <Textarea
                  id="tool-db-query"
                  value={dbQuery}
                  onChange={(event) => setDbQuery(event.target.value)}
                  placeholder={"SELECT id, name, email\nFROM customers\nWHERE id = :customerId"}
                  className="min-h-24 font-mono text-xs"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Read-only — must be a single SELECT (or WITH) statement. Use named
                  placeholders like <code className="font-mono">:customerId</code> for
                  arguments; they&apos;re bound as real query parameters, never
                  interpolated as text.
                </p>
              </div>
            </>
          )}

          {type === "custom_js" && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tool-js-code">Code</Label>
                <Textarea
                  id="tool-js-code"
                  value={jsCode}
                  onChange={(event) => setJsCode(event.target.value)}
                  placeholder={CUSTOM_JS_PLACEHOLDER}
                  className="min-h-40 font-mono text-xs"
                  maxLength={20_000}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Runs in a sandboxed worker with the tool&apos;s call arguments
                  available as <code className="font-mono">args</code>. Must{" "}
                  <code className="font-mono">return</code> a JSON-serializable
                  value.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tool-js-timeout">Timeout (ms, optional)</Label>
                <Input
                  id="tool-js-timeout"
                  type="number"
                  min={100}
                  max={30_000}
                  value={jsTimeout}
                  onChange={(event) => setJsTimeout(event.target.value)}
                  placeholder="5000 (default)"
                  className="max-w-40"
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tool-parameters">Parameters (JSON Schema, optional)</Label>
            <Textarea
              id="tool-parameters"
              value={parametersText}
              onChange={(event) => setParametersText(event.target.value)}
              placeholder={'{\n  "type": "object",\n  "properties": {\n    "city": { "type": "string" }\n  },\n  "required": ["city"]\n}'}
              className="min-h-24 font-mono text-xs"
            />
            {parametersError && (
              <p role="alert" className="text-sm text-destructive">
                {parametersError}
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {getErrorMessage(error)}
            </p>
          )}
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            Cancel
          </Button>
          <Button type="submit" form="tool-form" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {isPending ? "Saving…" : isEditing ? "Save changes" : "Add tool"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
