"use client";

import type { Connection, Node, OnConnect } from "@xyflow/react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo } from "react";

import "@xyflow/react/dist/style.css";

import type { WorkflowEdgeDraft, WorkflowStepDraft, WorkflowStepType } from "../types/workflow.types";
import {
  buildWorkflowGraph,
  FINISH_NODE_ID,
  START_NODE_ID,
  wouldCreateCycle,
  type TerminalRFEdge,
  type WorkflowRFEdge,
} from "../utils/workflow-graph";
import { AddStepMenu } from "./add-step-menu";
import { TerminalEdge } from "./edges/terminal-edge";
import { WorkflowEdge } from "./edges/workflow-edge";
import { AgentStepNode } from "./nodes/agent-step-node";
import { ConditionStepNode } from "./nodes/condition-step-node";
import { FinishMarkerNode } from "./nodes/finish-marker-node";
import { StartMarkerNode } from "./nodes/start-marker-node";
import { ToolStepNode } from "./nodes/tool-step-node";

// Module scope — a fresh object on every render would trigger React Flow's
// "new nodeTypes/edgeTypes object" re-registration warning.
const nodeTypes = {
  agent: AgentStepNode,
  tool: ToolStepNode,
  condition: ConditionStepNode,
  "start-marker": StartMarkerNode,
  "finish-marker": FinishMarkerNode,
};

const edgeTypes = {
  "workflow-edge": WorkflowEdge,
  "terminal-edge": TerminalEdge,
};

interface WorkflowCanvasProps {
  steps: WorkflowStepDraft[];
  edges: WorkflowEdgeDraft[];
  entryClientId: string | null;
  selectedClientId: string | null;
  canManage: boolean;
  onSelect: (clientId: string) => void;
  onRemoveStep: (clientId: string) => void;
  onSetEntry: (clientId: string) => void;
  onUnsetEntry: () => void;
  onAddStep: (type: WorkflowStepType) => void;
  onAddEdge: (fromClientId: string, branch: string, toClientId: string) => void;
  onRemoveEdge: (clientId: string) => void;
  onPositionChange: (clientId: string, position: { x: number; y: number }) => void;
}

function WorkflowCanvasInner({
  steps,
  edges,
  entryClientId,
  selectedClientId,
  canManage,
  onSelect,
  onRemoveStep,
  onSetEntry,
  onUnsetEntry,
  onAddStep,
  onAddEdge,
  onRemoveEdge,
  onPositionChange,
}: WorkflowCanvasProps) {
  // `steps` (each carrying its own position) and `edges` are the single
  // source of truth — the graph below is derived from them on every
  // relevant change. useNodesState/useEdgesState are just React Flow's
  // required rendering mirror (needed so onNodesChange can drive smooth
  // in-progress drag positions); the effect below resets that mirror
  // whenever the derived graph changes.
  const graph = useMemo(
    () =>
      buildWorkflowGraph(steps, edges, {
        selectedClientId,
        entryClientId,
        canManage,
        onSelect,
        onRemove: onRemoveStep,
        onSetEntry,
        onUnsetEntry,
        onRemoveEdge,
      }),
    [
      steps,
      edges,
      selectedClientId,
      entryClientId,
      canManage,
      onSelect,
      onRemoveStep,
      onSetEntry,
      onUnsetEntry,
      onRemoveEdge,
    ]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes);
  const [rfEdges, setEdges, onEdgesChange] = useEdgesState(graph.edges);

  useEffect(() => {
    setNodes(graph.nodes);
    setEdges(graph.edges);
  }, [graph, setNodes, setEdges]);

  const isValidConnection = useCallback(
    (connection: Connection | WorkflowRFEdge | TerminalRFEdge) => {
      const { source, target, sourceHandle } = connection;

      // The Finish marker isn't user-connectable at all (its dashed lines
      // are computed, not drawn) — no edge should ever target it.
      if (target === FINISH_NODE_ID) return false;

      // Dragging from Start to a step sets that step as the start — special
      // case, not a real WorkflowEdgeDraft, so skip the branch/cycle checks
      // below (there's nothing in `edges` to check against).
      if (source === START_NODE_ID) return target !== START_NODE_ID;

      if (!sourceHandle || source === target) return false;

      const branchAlreadyUsed = edges.some(
        (edge) => edge.fromClientId === source && edge.branch === sourceHandle
      );
      if (branchAlreadyUsed) return false;

      return !wouldCreateCycle(edges, source, target);
    },
    [edges]
  );

  const handleConnect: OnConnect = useCallback(
    (connection) => {
      if (!connection.source || !connection.target) return;

      if (connection.source === START_NODE_ID) {
        onSetEntry(connection.target);
        return;
      }

      if (!connection.sourceHandle) return;
      onAddEdge(connection.source, connection.sourceHandle, connection.target);
    },
    [onAddEdge, onSetEntry]
  );

  const handleNodeDragStop = useCallback(
    (_event: unknown, node: Node) => {
      if (node.id === START_NODE_ID || node.id === FINISH_NODE_ID) return;
      onPositionChange(node.id, node.position);
    },
    [onPositionChange]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={rfEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeDragStop={handleNodeDragStop}
      onConnect={handleConnect}
      isValidConnection={isValidConnection}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      colorMode="dark"
      nodesDraggable={canManage}
      nodesConnectable={canManage}
      edgesReconnectable={false}
      edgesFocusable={false}
      elementsSelectable={false}
      deleteKeyCode={null}
      fitView
      fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
    >
      <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
      <Controls showInteractive={false} />
      {canManage && (
        <Panel position="top-left">
          <AddStepMenu label="Add step" onSelect={onAddStep} />
        </Panel>
      )}
    </ReactFlow>
  );
}

export function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <div className="h-140 w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <ReactFlowProvider>
        <WorkflowCanvasInner {...props} />
      </ReactFlowProvider>
    </div>
  );
}
