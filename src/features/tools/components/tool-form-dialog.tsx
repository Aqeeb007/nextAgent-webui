"use client";

import { Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
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
  HttpToolConfig,
  HttpToolMethod,
  Tool,
  ToolPayload,
} from "@/features/tools/types/tool.types";
import { getErrorMessage } from "@/lib/api/error";

const HTTP_METHODS: HttpToolMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

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

  const [name, setName] = useState(tool?.name ?? "");
  const [description, setDescription] = useState(tool?.description ?? "");
  const [url, setUrl] = useState(tool?.config.url ?? "");
  const [method, setMethod] = useState<HttpToolMethod>(tool?.config.method ?? "GET");
  const [headers, setHeaders] = useState<HeaderRow[]>(() =>
    Object.entries(tool?.config.headers ?? {}).map(([key, value]) => ({
      key,
      value,
    }))
  );
  const [parametersText, setParametersText] = useState(() =>
    tool?.parameters ? JSON.stringify(tool.parameters, null, 2) : ""
  );
  const [parametersError, setParametersError] = useState<string | null>(null);

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

    const cleanHeaders = Object.fromEntries(
      headers.filter((row) => row.key.trim()).map((row) => [row.key.trim(), row.value])
    );

    const config: HttpToolConfig = {
      url,
      method,
      ...(Object.keys(cleanHeaders).length > 0 && { headers: cleanHeaders }),
    };

    const payload: ToolPayload = { name, type: "http", config, description, parameters };

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
          <DialogDescription>
            Tools call an HTTP endpoint on the agent&apos;s behalf.
          </DialogDescription>
        </DialogHeader>

        <form id="tool-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
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
