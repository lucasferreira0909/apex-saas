import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useBlocker } from "react-router-dom";
import { useFunnelElements } from "@/hooks/useFunnelElements";
import { useFunnelEdges } from "@/hooks/useFunnelEdges";
import { useFunnelProject } from "@/hooks/useFunnelProject";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Save, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { AddElementDialog, ElementType } from "@/components/apex/AddElementDialog";
import { FlowCanvas } from "@/components/apex/FlowCanvas";
import { FunnelElement } from "@/types/funnel";
import { Node, Edge } from "@xyflow/react";
import { getElementIcon } from "@/hooks/useFunnelElements";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { toast } from "@/hooks/use-toast";
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

export default function FunnelEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Use id directly from URL params for fetching elements and edges
  // This ensures data loads immediately without waiting for useFunnelProject
  const {
    elements,
    loading: elementsLoading,
    saveAllElements
  } = useFunnelElements(id);
  const {
    edges: savedEdges,
    loading: edgesLoading,
    saveAllEdges
  } = useFunnelEdges(id);
  
  // useFunnelProject still used for metadata (name, template_type)
  const { funnel, loading: funnelLoading } = useFunnelProject(id);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  
  const initialLoadDone = useRef(false);

  // Reset when funnel id changes (navigation between funnels)
  useEffect(() => {
    initialLoadDone.current = false;
    setNodes([]);
    setEdges([]);
    setHasUnsavedChanges(false);
  }, [id]);

  // Handle delete node request
  const handleDeleteRequest = useCallback((nodeId: string) => {
    setNodeToDelete(nodeId);
    setShowDeleteConfirm(true);
  }, []);

  // Confirm delete node
  const handleConfirmDelete = useCallback(() => {
    if (nodeToDelete) {
      setNodes(prev => prev.filter(node => node.id !== nodeToDelete));
      setEdges(prev => prev.filter(edge => edge.source !== nodeToDelete && edge.target !== nodeToDelete));
      setHasUnsavedChanges(true);
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

  // Load elements and edges from database
  useEffect(() => {
    // Guard: need valid id and loading must be complete
    if (!id) return;
    if (elementsLoading || edgesLoading) return;
    if (initialLoadDone.current) return;
    
    console.log('FunnelEditor: Loading data', { 
      id, 
      elementsCount: elements.length, 
      edgesCount: savedEdges.length 
    });
    
    // Load nodes (even if empty - valid for new canvas)
    const convertedNodes = elementsToNodes(elements);
    setNodes(convertedNodes);
    
    // Load edges (even if empty)
    setEdges(savedEdges);
    
    // Mark as done AFTER processing
    initialLoadDone.current = true;
  }, [id, elements, savedEdges, elementsLoading, edgesLoading, elementsToNodes]);

  const generateUniqueId = () => crypto.randomUUID();

  const findOptimalPosition = () => {
    if (nodes.length === 0) {
      return { x: 50, y: 50 };
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
    setHasUnsavedChanges(true);
    setShowAddDialog(false);
  };

  const handleNodesChange = useCallback((updatedNodes: Node[]) => {
    setNodes(updatedNodes);
    if (initialLoadDone.current) {
      setHasUnsavedChanges(true);
    }
  }, []);

  const handleEdgesChange = useCallback((updatedEdges: Edge[]) => {
    setEdges(updatedEdges);
    if (initialLoadDone.current) {
      setHasUnsavedChanges(true);
    }
  }, []);

  const handleSave = async () => {
    if (!id) {
      console.error('No funnel ID provided');
      return;
    }
    
    setIsSaving(true);
    try {
      // Convert nodes back to FunnelElements and save
      const funnelElements = nodesToElements(nodes);
      await saveAllElements(funnelElements);
      
      // Save edges
      await saveAllEdges(edges);
      
      setHasUnsavedChanges(false);
      toast({
        title: "Alterações salvas",
        description: "Seu funil foi salvo com sucesso.",
      });
    } catch (error) {
      console.error('Error saving funnel:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackClick = (e: React.MouseEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      setPendingNavigation("/funnels");
      setShowExitConfirm(true);
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    setHasUnsavedChanges(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

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
            <h1 className="text-2xl font-bold text-foreground">Editor de Funis</h1>
          </div>
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
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Elemento
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={isSaving}
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
          <div className="relative bg-muted/20 rounded-lg h-[600px] w-full">
            <FlowCanvas 
              initialNodes={nodes} 
              initialEdges={edges} 
              onNodesChange={handleNodesChange} 
              onEdgesChange={handleEdgesChange} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Element Dialog */}
      <AddElementDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
        onAddElement={handleAddElement} 
        templateType={funnel?.template_type as 'sales' | 'ltv' | 'remarketing' | null || null} 
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title="Excluir elemento"
        description="Tem certeza que deseja excluir este elemento? Esta ação não pode ser desfeita."
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
