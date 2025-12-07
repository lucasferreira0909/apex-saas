import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  Node,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  ConnectionMode,
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
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);

  // Sync with external state changes
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

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
        edges
      );
      setEdges(newEdges);
      onEdgesChange?.(newEdges);
    },
    [edges, setEdges, onEdgesChange, getEdgeStyle]
  );

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChangeInternal(changes);
      // Delay to get updated nodes after internal state change
      setTimeout(() => {
        setNodes((currentNodes) => {
          onNodesChange?.(currentNodes);
          return currentNodes;
        });
      }, 0);
    },
    [onNodesChangeInternal, onNodesChange, setNodes]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChangeInternal(changes);
      setTimeout(() => {
        setEdges((currentEdges) => {
          onEdgesChange?.(currentEdges);
          return currentEdges;
        });
      }, 0);
    },
    [onEdgesChangeInternal, onEdgesChange, setEdges]
  );

  return (
    <div className="w-full h-full min-h-[600px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
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
