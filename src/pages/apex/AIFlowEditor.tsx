import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2, History } from "lucide-react";
import { toast } from "sonner";
import { ReactFlow, Background, Controls, MiniMap, Node, Edge, useNodesState, useEdgesState, addEdge, Connection, ConnectionMode } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useFunnelProject } from "@/hooks/useFunnelProject";
import { useFunnelElements } from "@/hooks/useFunnelElements";
import { useFunnelEdges } from "@/hooks/useFunnelEdges";
import { useAIFlowHistory } from "@/hooks/useAIFlowHistory";
import { AIFlowSidebar } from "@/components/apex/AIFlowSidebar";
import { AIFlowToolNode } from "@/components/apex/AIFlowToolNode";
import { AIFlowChatNode } from "@/components/apex/AIFlowChatNode";
import { AIFlowHistorySheet } from "@/components/apex/AIFlowHistorySheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [showHistory, setShowHistory] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const { funnel, loading: isLoadingProject } = useFunnelProject(id || '');
  const { elements, loading: isLoadingElements, saveAllElements } = useFunnelElements(id || '');
  const { edges: edgesData, loading: isLoadingEdges, saveAllEdges } = useFunnelEdges(id || '');
  const { logs, isLoading: isLoadingHistory, addLog, clearHistory, isClearing } = useAIFlowHistory(id || '');

  // Load initial data
  useEffect(() => {
    if (elements.length > 0) {
      const loadedNodes: Node[] = elements.map((el) => ({
        id: el.id,
        type: el.type === 'apex-chat' || el.type === 'apex-ai' ? 'aiChatNode' : 'aiToolNode',
        position: el.position,
        data: {
          label: el.type === 'apex-chat' ? 'Apex AI' : el.type,
          toolId: el.type === 'apex-chat' ? 'apex-ai' : el.type,
          config: el.stats || {},
          configured: el.configured,
          funnelId: id,
          addLog,
        },
      }));
      setNodes(loadedNodes);
    }

    if (edgesData.length > 0) {
      setEdges(edgesData);
    }
  }, [elements, edgesData, setNodes, setEdges, id, addLog]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ 
        ...params, 
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
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

      const isChat = tool.type === 'chat' || tool.id === 'apex-ai' || tool.id === 'apex-chat';

      const newNode: Node = {
        id: `${tool.id}-${Date.now()}`,
        type: isChat ? 'aiChatNode' : 'aiToolNode',
        position,
        data: {
          label: isChat ? 'Apex AI' : tool.title,
          toolId: isChat ? 'apex-ai' : tool.id,
          config: {},
          configured: false,
          funnelId: id,
          addLog,
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setHasUnsavedChanges(true);
    },
    [setNodes, id, addLog]
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

  const handleBackClick = (e: React.MouseEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      setShowExitConfirm(true);
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    setHasUnsavedChanges(false);
    navigate('/funnels');
  };

  const handleClearHistory = async () => {
    await clearHistory();
    toast.success("Histórico limpo com sucesso!");
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/funnels" onClick={handleBackClick}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Editor de Fluxo de IA</h1>
          </div>
        </div>
      </div>

      {/* Canvas Card */}
      <Card className="bg-card border-border min-h-[600px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground">
                {funnel?.name || 'Fluxo de IA'}
              </CardTitle>
              <CardDescription>
                Configure e conecte os elementos do seu fluxo de IA
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowHistory(true)}
              >
                <History className="mr-2 h-4 w-4" />
                Histórico
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Alterações
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="relative bg-muted/20 rounded-lg h-[600px] w-full"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {/* Sidebar Island */}
            <AIFlowSidebar />

            {/* ReactFlow Canvas */}
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChangeWrapper}
              onEdgesChange={handleEdgesChangeWrapper}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              connectionMode={ConnectionMode.Loose}
              fitView
              className="bg-background rounded-lg"
            >
              <Background gap={20} size={1} color="hsl(var(--muted-foreground) / 0.1)" />
              <Controls className="bg-background border-border" />
              <MiniMap 
                className="bg-background border-border"
                nodeColor="hsl(var(--primary))"
              />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>

      {/* History Sheet */}
      <AIFlowHistorySheet
        open={showHistory}
        onOpenChange={setShowHistory}
        logs={logs}
        isLoading={isLoadingHistory}
        onClearHistory={handleClearHistory}
        isClearing={isClearing}
      />

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterações não salvas</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem alterações não salvas. Deseja sair sem salvar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExit}>
              Sair sem salvar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
