import { useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  Node,
  addEdge,
  BackgroundVariant,
  ConnectionMode,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import DatabaseSchemaFunnelNode from "./DatabaseSchemaFunnelNode";

const nodeTypes = {
  funnelNode: DatabaseSchemaFunnelNode,
};

interface FlowCanvasProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
}

export function FlowCanvas({
  initialNodes,
  initialEdges,
  onNodesChange,
  onEdgesChange,
}: FlowCanvasProps) {
  // Use refs to track if we're currently processing changes to avoid loops
  const isProcessingRef = useRef(false);

  // Get edge color based on source handle
  const getEdgeStyle = useCallback((sourceHandle: string | null | undefined) => {
    switch (sourceHandle) {
      case 'positive':
        return {
          stroke: 'hsl(142, 76%, 36%)', // green
          markerColor: 'hsl(142, 76%, 36%)',
        };
      case 'negative':
        return {
          stroke: 'hsl(0, 84%, 60%)', // red
          markerColor: 'hsl(0, 84%, 60%)',
        };
      case 'neutral':
      default:
        return {
          stroke: 'hsl(var(--muted-foreground))', // gray
          markerColor: 'hsl(var(--muted-foreground))',
        };
    }
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      const edgeStyle = getEdgeStyle(connection.sourceHandle);
      const newEdges = addEdge(
        {
          ...connection,
          type: "default",
          animated: true,
          style: {
            stroke: edgeStyle.stroke,
            strokeWidth: 2,
          },
          markerEnd: {
            type: "arrowclosed",
            color: edgeStyle.markerColor,
          },
        },
        initialEdges
      );
      onEdgesChange?.(newEdges);
    },
    [initialEdges, onEdgesChange, getEdgeStyle]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      
      const updatedNodes = applyNodeChanges(changes, initialNodes);
      onNodesChange?.(updatedNodes);
      
      // Reset flag after microtask
      Promise.resolve().then(() => {
        isProcessingRef.current = false;
      });
    },
    [initialNodes, onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      
      const updatedEdges = applyEdgeChanges(changes, initialEdges);
      onEdgesChange?.(updatedEdges);
      
      // Reset flag after microtask
      Promise.resolve().then(() => {
        isProcessingRef.current = false;
      });
    },
    [initialEdges, onEdgesChange]
  );

  return (
    <div className="w-full h-full min-h-[600px]">
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-muted/20"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="hsl(var(--primary) / 0.2)"
        />
        <Controls
          showInteractive={false}
          className="bg-card border-border shadow-lg"
        />
        <MiniMap
          nodeColor="hsl(var(--primary))"
          maskColor="hsl(var(--background) / 0.8)"
          className="bg-card border-2 border-border shadow-lg"
        />
      </ReactFlow>
    </div>
  );
}
