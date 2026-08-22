"use client";

import { LayoutGrid, Plus, Table2, ToolCase } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Loading } from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeleteToolDialog } from "@/features/tools/components/delete-tool-dialog";
import { TestToolDialog } from "@/features/tools/components/test-tool-dialog";
import { ToolFormDialog } from "@/features/tools/components/tool-form-dialog";
import { createToolColumns } from "@/features/tools/components/tools-table/columns";
import { ToolsGrid } from "@/features/tools/components/tools-grid";
import { useTools } from "@/features/tools/hooks/use-tools";
import type { Tool } from "@/features/tools/types/tool.types";

type ToolsView = "grid" | "table";

export default function ToolsPage() {
  const { data: tools, isPending, isError, refetch } = useTools();

  const [view, setView] = useState<ToolsView>("grid");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [deletingTool, setDeletingTool] = useState<Tool | null>(null);
  const [testingTool, setTestingTool] = useState<Tool | null>(null);

  function openCreate() {
    setEditingTool(null);
    setFormOpen(true);
  }

  function openEdit(tool: Tool) {
    setEditingTool(tool);
    setFormOpen(true);
  }

  const columns = createToolColumns({
    onEdit: openEdit,
    onTest: setTestingTool,
    onDelete: setDeletingTool,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Tools</h1>
          <p className="text-sm text-muted-foreground">
            HTTP tools your agents can call during a conversation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tools && tools.length > 0 && (
            <Tabs value={view} onValueChange={(value) => setView(value as ToolsView)}>
              <TabsList>
                <TabsTrigger value="grid" aria-label="Grid view">
                  <LayoutGrid />
                </TabsTrigger>
                <TabsTrigger value="table" aria-label="Table view">
                  <Table2 />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus className="size-4" />
            Add tool
          </Button>
        </div>
      </div>

      {isPending ? (
        <Loading label="Loading tools…" />
      ) : isError ? (
        <ErrorState title="Couldn't load tools" onRetry={() => refetch()} />
      ) : tools.length === 0 ? (
        <EmptyState
          icon={ToolCase}
          title="No tools yet"
          description="Add an HTTP tool to let your agents call external APIs."
          actionLabel="Add tool"
          onAction={openCreate}
        />
      ) : view === "grid" ? (
        <ToolsGrid
          tools={tools}
          onEdit={openEdit}
          onTest={setTestingTool}
          onDelete={setDeletingTool}
        />
      ) : (
        <DataTable columns={columns} data={tools} searchPlaceholder="Search tools…" />
      )}

      <ToolFormDialog
        key={editingTool?.id ?? "create"}
        open={formOpen}
        onOpenChange={setFormOpen}
        tool={editingTool}
      />
      <DeleteToolDialog
        key={deletingTool ? `delete-${deletingTool.id}` : "delete-none"}
        open={deletingTool !== null}
        onOpenChange={(open) => !open && setDeletingTool(null)}
        tool={deletingTool}
      />
      <TestToolDialog
        key={testingTool ? `test-${testingTool.id}` : "test-none"}
        open={testingTool !== null}
        onOpenChange={(open) => !open && setTestingTool(null)}
        tool={testingTool}
      />
    </div>
  );
}
