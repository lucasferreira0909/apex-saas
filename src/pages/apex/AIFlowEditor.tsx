import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ReactFlow, Background, Controls, MiniMap, Node, Edge, useNodesState, useEdgesState, addEdge, Connection, ConnectionMode } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useFunnelProject } from "@/hooks/useFunnelProject";
import { useFunnelElements } from "@/hooks/useFunnelElements";
import { useFunnelEdges } from "@/hooks/useFunnelEdges";
import { AIFlowSidebar } from "@/components/apex/AIFlowSidebar";
import { AIFlowToolNode } from "@/components/apex/AIFlowToolNode";
import { AIFlowChatNode } from "@/components/apex/AIFlowChatNode";

const nodeTypes = {
  aiToolNode: AIFlowToolNode,
  aiChatNode: AIFlowChatNode,
};

export default function AIFlowEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { funnel, loading: isLoadingProject } = useFunnelProject(id || '');
  const { elements, loading: isLoadingElements, saveAllElements } = useFunnelElements(id || '');
  const { edges: edgesData, loading: isLoadingEdges, saveAllEdges } = useFunnelEdges(id || '');

  // Load initial data
  useEffect(() => {
    if (elements.length > 0) {
      const loadedNodes: Node[] = elements.map((el) => ({
        id: el.id,
        type: el.type === 'apex-chat' ? 'aiChatNode' : 'aiToolNode',
        position: el.position,
        data: {
          label: el.type,
          toolId: el.type,
          config: el.stats || {},
          configured: el.configured,
        },
      }));
      setNodes(loadedNodes);
    }

    if (edgesData.length > 0) {
      setEdges(edgesData);
    }
  }, [elements, edgesData, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ 
        ...params, 
        style: { stroke: '#6366f1', strokeWidth: 2 },
        animated: true,
      }, eds));
      setHasUnsavedChanges(true);
    },
    [setEdges]
  );

  const handleNodesChangeWrapper = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      setHasUnsavedChanges(true);
    },
    [onNodesChange]
  );

  const handleEdgesChangeWrapper = useCallback(
    (changes: any) => {
      onEdgesChange(changes);
      setHasUnsavedChanges(true);
    },
    [onEdgesChange]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const toolData = event.dataTransfer.getData('application/json');
      if (!toolData) return;

      const tool = JSON.parse(toolData);
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left - 150,
        y: event.clientY - reactFlowBounds.top - 150,
      };

      const isChat = tool.type === 'chat' || tool.id === 'apex-chat';

      const newNode: Node = {
        id: `${tool.id}-${Date.now()}`,
        type: isChat ? 'aiChatNode' : 'aiToolNode',
        position,
        data: {
          label: tool.title,
          toolId: tool.id,
          config: {},
          configured: false,
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setHasUnsavedChanges(true);
    },
    [setNodes]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleSave = async () => {
    if (!id) return;

    setIsSaving(true);
    try {
      const elementsToSave = nodes.map((node, index) => ({
        id: node.id,
        type: (node.data as any).toolId || (node.data as any).label,
        position: node.position,
        configured: (node.data as any).configured || false,
        stats: (node.data as any).config || {},
        icon: null,
      }));

      await saveAllElements(elementsToSave);
      await saveAllEdges(edges);

      setHasUnsavedChanges(false);
      toast.success("Fluxo salvo com sucesso!");
    } catch (error) {
      console.error('Error saving flow:', error);
      toast.error("Erro ao salvar o fluxo");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (confirm("Você tem alterações não salvas. Deseja sair mesmo assim?")) {
        navigate('/funnels');
      }
    } else {
      navigate('/funnels');
    }
  };

  const isLoading = isLoadingProject || isLoadingElements || isLoadingEdges;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {funnel?.name || 'Fluxo de IA'}
            </h1>
            <p className="text-sm text-muted-foreground">Editor de Fluxo de IA</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </>
          )}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        {/* Sidebar Island */}
        <AIFlowSidebar />

        {/* Canvas */}
        <div 
          className="h-full w-full bg-muted/30"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChangeWrapper}
            onEdgesChange={handleEdgesChangeWrapper}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            className="bg-background"
          >
            <Background gap={20} size={1} color="hsl(var(--muted-foreground) / 0.1)" />
            <Controls className="bg-background border-border" />
            <MiniMap 
              className="bg-background border-border"
              nodeColor="hsl(var(--primary))"
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
