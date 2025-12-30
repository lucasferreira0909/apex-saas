import { createContext, useContext, useRef, useCallback, ReactNode } from "react";
import { Node, Edge } from "@xyflow/react";

interface ConnectedTool {
  nodeId: string;
  toolId: string;
  label: string;
}

interface ConnectedAttachment {
  nodeId: string;
  title: string;
  type: string;
  url: string;
}

interface AIFlowContextType {
  getNodes: () => Node[];
  getEdges: () => Edge[];
  handleDeleteNode: (nodeId: string) => void;
  handleDuplicateNode: (nodeId: string) => void;
  handleRenameNode: (nodeId: string, newTitle: string) => void;
  handleSendToTool: (targetNodeId: string, output: string) => void;
  handleCreateTextCard: (sourceNodeId: string, content: string) => void;
  getConnectedTools: (chatNodeId: string) => ConnectedTool[];
  getConnectedAttachments: (chatNodeId: string) => ConnectedAttachment[];
  addLog: ((log: { node_id: string; node_type: string; input: string; output: string }) => void) | undefined;
  funnelId: string;
}

const AIFlowContext = createContext<AIFlowContextType | null>(null);

export function useAIFlowContext() {
  const context = useContext(AIFlowContext);
  if (!context) {
    throw new Error("useAIFlowContext must be used within an AIFlowProvider");
  }
  return context;
}

interface AIFlowProviderProps {
  children: ReactNode;
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setHasUnsavedChanges: (value: boolean) => void;
  addLog: ((log: { node_id: string; node_type: string; input: string; output: string }) => void) | undefined;
  funnelId: string;
}

export function AIFlowProvider({
  children,
  nodes,
  edges,
  setNodes,
  setEdges,
  setHasUnsavedChanges,
  addLog,
  funnelId,
}: AIFlowProviderProps) {
  // Use refs to avoid stale closures
  const nodesRef = useRef<Node[]>(nodes);
  const edgesRef = useRef<Edge[]>(edges);
  nodesRef.current = nodes;
  edgesRef.current = edges;

  const getNodes = useCallback(() => nodesRef.current, []);
  const getEdges = useCallback(() => edgesRef.current, []);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setHasUnsavedChanges(true);
  }, [setNodes, setEdges, setHasUnsavedChanges]);

  const handleDuplicateNode = useCallback((nodeId: string) => {
    setNodes((nds) => {
      const nodeToClone = nds.find((node) => node.id === nodeId);
      if (!nodeToClone) return nds;

      const newNode: Node = {
        ...nodeToClone,
        id: crypto.randomUUID(),
        position: {
          x: nodeToClone.position.x + 50,
          y: nodeToClone.position.y + 50,
        },
        data: { ...nodeToClone.data },
        selected: false,
      };

      return [...nds, newNode];
    });
    setHasUnsavedChanges(true);
  }, [setNodes, setHasUnsavedChanges]);

  const handleRenameNode = useCallback((nodeId: string, newTitle: string) => {
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              title: newTitle,
            },
          };
        }
        return node;
      })
    );
    setHasUnsavedChanges(true);
  }, [setNodes, setHasUnsavedChanges]);

  const handleSendToTool = useCallback((targetNodeId: string, output: string) => {
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id === targetNodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              output,
              isProcessing: false,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleCreateTextCard = useCallback((sourceNodeId: string, content: string) => {
    const currentNodes = nodesRef.current;
    const sourceNode = currentNodes.find(n => n.id === sourceNodeId);
    
    // Position the new card to the right of the source node
    const position = sourceNode 
      ? { x: sourceNode.position.x + 400, y: sourceNode.position.y }
      : { x: 300, y: 300 };

    const newNode: Node = {
      id: crypto.randomUUID(),
      type: 'textCardNode',
      position,
      data: {
        title: 'Resultado Exportado',
        content,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setHasUnsavedChanges(true);
  }, [setNodes, setHasUnsavedChanges]);

  const getConnectedTools = useCallback((chatNodeId: string): ConnectedTool[] => {
    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;
    const connectedTools: ConnectedTool[] = [];
    
    currentEdges.forEach((edge) => {
      if (edge.target === chatNodeId) {
        const sourceNode = currentNodes.find(n => n.id === edge.source);
        if (sourceNode && sourceNode.type === 'aiToolNode') {
          connectedTools.push({
            nodeId: sourceNode.id,
            toolId: (sourceNode.data as any)?.toolId || '',
            label: (sourceNode.data as any)?.label || 'Ferramenta',
          });
        }
      }
      if (edge.source === chatNodeId) {
        const targetNode = currentNodes.find(n => n.id === edge.target);
        if (targetNode && targetNode.type === 'aiToolNode') {
          if (!connectedTools.find(t => t.nodeId === targetNode.id)) {
            connectedTools.push({
              nodeId: targetNode.id,
              toolId: (targetNode.data as any)?.toolId || '',
              label: (targetNode.data as any)?.label || 'Ferramenta',
            });
          }
        }
      }
    });
    
    return connectedTools;
  }, []);

  const getConnectedAttachments = useCallback((chatNodeId: string): ConnectedAttachment[] => {
    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;
    const attachments: ConnectedAttachment[] = [];
    
    currentEdges.forEach((edge) => {
      if (edge.target === chatNodeId) {
        const sourceNode = currentNodes.find(n => n.id === edge.source);
        if (sourceNode && sourceNode.type === 'attachmentNode') {
          attachments.push({
            nodeId: sourceNode.id,
            title: (sourceNode.data as any)?.title || 'Anexo',
            type: (sourceNode.data as any)?.attachmentType || 'file',
            url: (sourceNode.data as any)?.url || '',
          });
        }
      }
    });
    
    return attachments;
  }, []);

  const value: AIFlowContextType = {
    getNodes,
    getEdges,
    handleDeleteNode,
    handleDuplicateNode,
    handleRenameNode,
    handleSendToTool,
    handleCreateTextCard,
    getConnectedTools,
    getConnectedAttachments,
    addLog,
    funnelId,
  };

  return (
    <AIFlowContext.Provider value={value}>
      {children}
    </AIFlowContext.Provider>
  );
}
