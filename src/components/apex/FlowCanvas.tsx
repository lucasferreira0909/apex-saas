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

  const onConnect = useCallback(
    (connection: Connection) => {
      // Validar se a conexão é válida
      if (!connection.source || !connection.target) {
        console.error('Conexão inválida: faltam source ou target', connection);
        return;
      }

      console.log('Conectando:', connection);
      
      setEdges((currentEdges) => {
        const newEdges = addEdge(
          {
            ...connection,
            type: "smoothstep",
            animated: true,
            style: {
              stroke: "hsl(var(--primary))",
              strokeWidth: 2,
            },
            markerEnd: {
              type: "arrowclosed",
              color: "hsl(var(--primary))",
            },
          },
          currentEdges
        );
        console.log('Novas edges após conexão:', newEdges);
        onEdgesChange?.(newEdges);
        return newEdges;
      });
    },
    [setEdges, onEdgesChange]
  );

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChangeInternal(changes);
      requestAnimationFrame(() => {
        setNodes((currentNodes) => {
          onNodesChange?.(currentNodes);
          return currentNodes;
        });
      });
    },
    [onNodesChangeInternal, onNodesChange, setNodes]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChangeInternal(changes);
      requestAnimationFrame(() => {
        setEdges((currentEdges) => {
          onEdgesChange?.(currentEdges);
          return currentEdges;
        });
      });
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
