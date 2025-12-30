import { useState, useCallback, useEffect, useMemo } from "react";
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
import { AIFlowAttachmentNode } from "@/components/apex/AIFlowAttachmentNode";
import { AIFlowTextCardNode } from "@/components/apex/AIFlowTextCardNode";
import { AIFlowHistorySheet } from "@/components/apex/AIFlowHistorySheet";
import { AIFlowAttachmentSheet, AttachmentData } from "@/components/apex/AIFlowAttachmentSheet";
import { AIFlowProvider } from "@/contexts/AIFlowContext";
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

// Memoized node types - defined outside component to avoid recreation
const nodeTypes = {
  aiToolNode: AIFlowToolNode,
  aiChatNode: AIFlowChatNode,
  attachmentNode: AIFlowAttachmentNode,
  textCardNode: AIFlowTextCardNode,
};

// Helper to get node type category
const getNodeCategory = (node: Node): 'tool' | 'chat' | 'attachment' | 'unknown' => {
  if (node.type === 'aiChatNode') return 'chat';
  if (node.type === 'attachmentNode') return 'attachment';
  if (node.type === 'aiToolNode') return 'tool';
  return 'unknown';
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
  const [showAttachmentSheet, setShowAttachmentSheet] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { funnel, loading: isLoadingProject } = useFunnelProject(id || '');
  const { elements, loading: isLoadingElements, saveAllElements } = useFunnelElements(id || '');
  const { edges: edgesData, loading: isLoadingEdges, saveAllEdges } = useFunnelEdges(id || '');
  const { logs, isLoading: isLoadingHistory, addLog, clearHistory, isClearing } = useAIFlowHistory(id || '');

  // Load initial data - only once when data is available
  useEffect(() => {
    if (isInitialized || isLoadingElements || isLoadingEdges) return;
    
    if (elements.length > 0 || edgesData.length > 0) {
      const loadedNodes: Node[] = elements.map((el) => {
        const isChat = el.type === 'apex-chat' || el.type === 'apex-ai';
        const isAttachment = el.type.startsWith('attachment-');
        
        return {
          id: el.id,
          type: isChat ? 'aiChatNode' : isAttachment ? 'attachmentNode' : 'aiToolNode',
          position: el.position,
          data: {
            label: isChat ? 'Apex AI' : el.type,
            toolId: isChat ? 'apex-ai' : el.type,
            config: el.stats || {},
            configured: el.configured,
            ...(el.stats || {}),
          },
        };
      });
      setNodes(loadedNodes);
      setEdges(edgesData);
      setIsInitialized(true);
    }
  }, [elements, edgesData, isLoadingElements, isLoadingEdges, isInitialized, setNodes, setEdges]);

  // Mark as initialized when loading completes even with empty data
  useEffect(() => {
    if (!isLoadingElements && !isLoadingEdges && !isInitialized) {
      setIsInitialized(true);
    }
  }, [isLoadingElements, isLoadingEdges, isInitialized]);

  // Validate connection
  const isValidConnection = useCallback((source: Node, target: Node): { valid: boolean; message?: string } => {
    const sourceCategory = getNodeCategory(source);
    const targetCategory = getNodeCategory(target);

    if (sourceCategory === 'attachment' && targetCategory === 'attachment') {
      return { valid: false, message: 'Não é possível conectar anexos entre si' };
    }
    if (sourceCategory === 'tool' && targetCategory === 'tool') {
      return { valid: false, message: 'Não é possível conectar ferramentas entre si' };
    }
    if (sourceCategory === 'attachment' && targetCategory === 'tool') {
      return { valid: false, message: 'Anexos só podem ser conectados ao Apex AI' };
    }
    if (sourceCategory === 'tool' && targetCategory === 'attachment') {
      return { valid: false, message: 'Ferramentas não podem se conectar a anexos' };
    }
    return { valid: true };
  }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);

      if (!sourceNode || !targetNode) return;

      const validation = isValidConnection(sourceNode, targetNode);
      
      if (!validation.valid) {
        toast.error(validation.message);
        return;
      }

      setEdges((eds) => addEdge({ 
        ...params, 
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
        animated: true,
      }, eds));
      setHasUnsavedChanges(true);
    },
    [setEdges, nodes, isValidConnection]
  );

  const handleNodesChangeWrapper = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      // Only mark as unsaved for position/selection changes, not internal updates
      const hasRealChanges = changes.some((c: any) => 
        c.type === 'position' || c.type === 'remove' || c.type === 'add'
      );
      if (hasRealChanges) {
        setHasUnsavedChanges(true);
      }
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
        id: crypto.randomUUID(),
        type: isChat ? 'aiChatNode' : 'aiToolNode',
        position,
        data: {
          label: isChat ? 'Apex AI' : tool.title,
          toolId: isChat ? 'apex-ai' : tool.id,
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

  const handleAddAttachment = useCallback((attachment: AttachmentData) => {
    const newNode: Node = {
      id: attachment.id,
      type: 'attachmentNode',
      position: { x: 200, y: 200 },
      data: {
        title: attachment.title,
        attachmentType: attachment.type,
        url: attachment.url,
        thumbnailUrl: attachment.thumbnailUrl,
        isVertical: attachment.isVertical,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setHasUnsavedChanges(true);
  }, [setNodes]);

  // Helper to validate if string is a valid UUID
  const isValidUUID = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const handleSave = async () => {
    if (!id) return;

    setIsSaving(true);
    try {
      const idMapping: Record<string, string> = {};
      
      const elementsToSave = nodes.map((node) => {
        const validId = isValidUUID(node.id) ? node.id : crypto.randomUUID();
        if (!isValidUUID(node.id)) {
          idMapping[node.id] = validId;
        }

        return {
          id: validId,
          type: node.type === 'attachmentNode' 
            ? `attachment-${(node.data as any).attachmentType}`
            : (node.data as any).toolId || (node.data as any).label,
          position: node.position,
          configured: (node.data as any).configured || false,
          stats: {
            ...(node.data as any).config,
            title: (node.data as any).title,
            attachmentType: (node.data as any).attachmentType,
            url: (node.data as any).url,
            thumbnailUrl: (node.data as any).thumbnailUrl,
            isVertical: (node.data as any).isVertical,
          },
          icon: null,
        };
      });

      const updatedEdges = edges.map((edge) => ({
        ...edge,
        source: idMapping[edge.source] || edge.source,
        target: idMapping[edge.target] || edge.target,
      }));

      await saveAllElements(elementsToSave);
      await saveAllEdges(updatedEdges);

      if (Object.keys(idMapping).length > 0) {
        setNodes((nds) => 
          nds.map((node) => ({
            ...node,
            id: idMapping[node.id] || node.id,
          }))
        );
        setEdges(updatedEdges);
      }

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

  // Memoize the provider value setter
  const setHasUnsavedChangesStable = useCallback((value: boolean) => {
    setHasUnsavedChanges(value);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <AIFlowProvider
      nodes={nodes}
      edges={edges}
      setNodes={setNodes}
      setEdges={setEdges}
      setHasUnsavedChanges={setHasUnsavedChangesStable}
      addLog={addLog}
      funnelId={id || ''}
    >
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
              <AIFlowSidebar onOpenAttachmentSheet={() => setShowAttachmentSheet(true)} />

              {/* ReactFlow Canvas */}
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodesChangeWrapper}
                onEdgesChange={handleEdgesChangeWrapper}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                connectionMode={ConnectionMode.Loose}
                nodesDraggable={true}
                nodesConnectable={true}
                elementsSelectable={true}
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

        {/* Attachment Sheet */}
        <AIFlowAttachmentSheet
          open={showAttachmentSheet}
          onOpenChange={setShowAttachmentSheet}
          onAddAttachment={handleAddAttachment}
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
    </AIFlowProvider>
  );
}
