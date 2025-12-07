import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useFunnelElements } from "@/hooks/useFunnelElements";
import { useFunnelProject } from "@/hooks/useFunnelProject";
import { useDebounceValue } from "@/hooks/useDebounceValue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Loader2, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { AddElementDialog, ElementType } from "@/components/apex/AddElementDialog";
import { FlowCanvas } from "@/components/apex/FlowCanvas";
import { FunnelElement } from "@/types/funnel";
import { Node, Edge } from "@xyflow/react";
import { getElementIcon } from "@/hooks/useFunnelElements";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { toast } from "@/hooks/use-toast";
export default function FunnelEditor() {
  const {
    id
  } = useParams();
  const {
    funnel,
    funnelId,
    loading: funnelLoading
  } = useFunnelProject(id);
  const {
    elements,
    loading: elementsLoading,
    saveAllElements
  } = useFunnelElements(funnelId || undefined);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isInitialLoad = useRef(true);

  // Handle delete node request
  const handleDeleteRequest = useCallback((nodeId: string) => {
    setNodeToDelete(nodeId);
    setShowDeleteConfirm(true);
  }, []);

  // Confirm delete node
  const handleConfirmDelete = useCallback(() => {
    if (nodeToDelete) {
      setNodes(prev => prev.filter(node => node.id !== nodeToDelete));
      // Also remove edges connected to this node
      setEdges(prev => prev.filter(edge => edge.source !== nodeToDelete && edge.target !== nodeToDelete));
      toast({
        title: "Elemento excluído",
        description: "O elemento foi removido do funil.",
      });
    }
    setNodeToDelete(null);
    setShowDeleteConfirm(false);
  }, [nodeToDelete]);

  // Convert FunnelElements to ReactFlow Nodes
  const elementsToNodes = useCallback((elements: FunnelElement[]): Node[] => {
    return elements.map(element => ({
      id: element.id,
      type: 'funnelNode',
      position: element.position,
      data: {
        label: element.type,
        icon: element.icon,
        configured: element.configured,
        stats: element.stats,
        onDelete: handleDeleteRequest
      }
    }));
  }, [handleDeleteRequest]);

  // Convert ReactFlow Nodes to FunnelElements
  const nodesToElements = useCallback((nodes: Node[]): FunnelElement[] => {
    return nodes.map(node => ({
      id: node.id,
      type: node.data.label as string,
      icon: node.data.icon,
      position: node.position,
      configured: node.data.configured as boolean,
      stats: node.data.stats as Record<string, string | number>
    }));
  }, []);

  // Load elements from database
  useEffect(() => {
    if (!elementsLoading && !funnelLoading && elements.length > 0) {
      console.log('Loading elements from DB:', elements);
      const convertedNodes = elementsToNodes(elements);
      setNodes(convertedNodes);
      setEdges([]);
      // Mark initial load as complete after a short delay
      setTimeout(() => {
        isInitialLoad.current = false;
      }, 500);
    } else if (!elementsLoading && !funnelLoading && elements.length === 0) {
      isInitialLoad.current = false;
    }
  }, [elements, elementsLoading, funnelLoading, elementsToNodes]);

  // Convert nodes to elements for saving
  const elementsForSave = nodesToElements(nodes);

  // Debounced elements for auto-save
  const debouncedElements = useDebounceValue(elementsForSave, 1000);

  // Auto-save when elements change
  useEffect(() => {
    const autoSave = async () => {
      if (isInitialLoad.current || !funnelId || debouncedElements.length === 0) {
        return;
      }

      setIsSaving(true);
      setSaveStatus('saving');
      
      try {
        await saveAllElements(debouncedElements);
        setSaveStatus('saved');
        console.log('Auto-saved funnel elements');
        
        // Reset status after 2 seconds
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      } catch (error) {
        console.error('Error auto-saving:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar as alterações automaticamente.",
          variant: "destructive",
        });
        setSaveStatus('idle');
      } finally {
        setIsSaving(false);
      }
    };

    autoSave();
  }, [debouncedElements, funnelId, saveAllElements]);
  const generateUniqueId = () => crypto.randomUUID();
  const findOptimalPosition = () => {
    if (nodes.length === 0) {
      return {
        x: 50,
        y: 50
      };
    }
    const lastNode = nodes[nodes.length - 1];
    return {
      x: lastNode.position.x + 300,
      y: lastNode.position.y
    };
  };
  const handleAddElement = (elementType: ElementType) => {
    const position = findOptimalPosition();
    const newNode: Node = {
      id: generateUniqueId(),
      type: 'funnelNode',
      position,
      data: {
        label: elementType.name,
        icon: elementType.icon,
        configured: false,
        stats: {},
        onDelete: handleDeleteRequest
      }
    };
    setNodes(prev => [...prev, newNode]);
    setShowAddDialog(false);
  };
  const handleNodesChange = useCallback((updatedNodes: Node[]) => {
    setNodes(updatedNodes);
  }, []);
  const handleEdgesChange = useCallback((updatedEdges: Edge[]) => {
    setEdges(updatedEdges);
  }, []);
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/funnels">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Editor de Funis</h1>
          </div>
        </div>
        
        {/* Save Status Indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {saveStatus === 'saving' && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Salvando...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-green-500">Salvo</span>
            </>
          )}
        </div>
      </div>

      {/* Funnel Canvas */}
      <Card className="bg-card border-border min-h-[600px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground">Canvas do Funil</CardTitle>
              <CardDescription>Configure e conecte os elementos do seu funil</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Elemento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative bg-muted/20 rounded-lg h-[600px] w-full">
            <FlowCanvas initialNodes={nodes} initialEdges={edges} onNodesChange={handleNodesChange} onEdgesChange={handleEdgesChange} />
          </div>
        </CardContent>
      </Card>

      {/* Add Element Dialog */}
      <AddElementDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAddElement={handleAddElement} templateType={funnel?.template_type as 'sales' | 'ltv' | 'remarketing' | null || null} />
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title="Excluir elemento"
        description="Tem certeza que deseja excluir este elemento? Esta ação não pode ser desfeita."
      />
    </div>;
}