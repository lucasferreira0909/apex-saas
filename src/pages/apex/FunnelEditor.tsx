import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save, LogOut, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFunnelProject } from "@/hooks/useFunnelProject";
import { useFunnelElements } from "@/hooks/useFunnelElements";
import { AddElementDialog, ElementType } from "@/components/apex/AddElementDialog";
import { FunnelElement } from "@/types/funnel";
import { EmptyCanvas } from "@/components/apex/EmptyCanvas";
import FunnelSchemaNode from "@/components/apex/FunnelSchemaNode";

const nodeTypes = {
  funnelNode: FunnelSchemaNode,
};

export default function FunnelEditor() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { funnelId } = useFunnelProject(projectId);
  const { elements: loadedElements, saveElement, saveAllElements } = useFunnelElements(funnelId);
  
  const [isSaved, setIsSaved] = useState(true);
  const [showExitButton, setShowExitButton] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (loadedElements && loadedElements.length > 0) {
      const flowNodes: Node[] = loadedElements.map((element) => ({
        id: element.id,
        type: 'funnelNode',
        position: element.position,
        data: { element },
      }));
      setNodes(flowNodes);
    }
  }, [loadedElements, setNodes]);

  const generateUniqueId = () => {
    return `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const findOptimalPosition = () => {
    if (nodes.length === 0) {
      return { x: 100, y: 100 };
    }
    
    const lastNode = nodes[nodes.length - 1];
    return {
      x: lastNode.position.x + 320,
      y: lastNode.position.y
    };
  };

  const handleAddElement = (elementType: ElementType) => {
    const newElement: FunnelElement = {
      id: generateUniqueId(),
      type: elementType.name,
      icon: elementType.icon,
      position: findOptimalPosition(),
      configured: false,
      stats: {}
    };
    
    const newNode: Node = {
      id: newElement.id,
      type: 'funnelNode',
      position: newElement.position,
      data: { element: newElement },
    };
    
    setNodes((nds) => [...nds, newNode]);
    setIsSaved(false);
    setShowAddDialog(false);
  };

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        ...connection,
        id: `e${connection.source}-${connection.target}`,
        type: 'default',
        animated: true,
        style: { 
          stroke: 'hsl(var(--chart-1))', 
          strokeWidth: 2,
        },
        markerEnd: {
          type: 'arrowclosed',
          color: 'hsl(var(--chart-1))',
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      setIsSaved(false);
    },
    [setEdges]
  );

  const onNodeDragStop = useCallback(
    async (_event: any, node: Node) => {
      if (!funnelId) return;

      try {
        const { error } = await supabase
          .from('funnel_elements')
          .update({
            position_x: node.position.x,
            position_y: node.position.y
          })
          .eq('id', node.id)
          .eq('funnel_id', funnelId);

        if (error) {
          console.error('Error saving position:', error);
          toast.error('Erro ao salvar posição do elemento');
        } else {
          setIsSaved(false);
        }
      } catch (error) {
        console.error('Error in onNodeDragStop:', error);
      }
    },
    [funnelId]
  );

  const handleSave = async () => {
    if (!funnelId || !projectId) {
      toast.error("ID do funil ou projeto não encontrado");
      return;
    }

    setIsLoading(true);
    try {
      const elementsToSave: FunnelElement[] = nodes.map((node) => ({
        id: node.id,
        type: node.data.element.type,
        icon: node.data.element.icon,
        position: node.position,
        configured: node.data.element.configured,
        stats: node.data.element.stats,
      }));

      await saveAllElements(elementsToSave);
      
      const { error: projectError } = await supabase
        .from('projects')
        .update({ 
          status: 'active',
          stats: { elements: nodes.length }
        })
        .eq('id', projectId);

      if (projectError) throw projectError;

      setIsSaved(true);
      setShowExitButton(true);
      toast.success("Funil salvo com sucesso!");
    } catch (error) {
      console.error('Error saving funnel:', error);
      toast.error("Erro ao salvar o funil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExit = () => {
    navigate('/apex/library');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/apex/library')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Editor de Funil</h1>
                <p className="text-sm text-muted-foreground">
                  Arraste e conecte os elementos do funil
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setShowAddDialog(true)}
                variant="outline"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar Elemento
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={isSaved || isLoading}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
              
              {showExitButton && (
                <Button
                  onClick={handleExit}
                  variant="outline"
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sair do Projeto
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-6">
            <div className="h-[600px] border rounded-lg bg-muted/5 relative">
              {nodes.length === 0 ? (
                <EmptyCanvas onAddElement={() => setShowAddDialog(true)} />
              ) : (
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onNodeDragStop={onNodeDragStop}
                  nodeTypes={nodeTypes}
                  fitView
                  className="bg-background"
                  connectionLineStyle={{ stroke: 'hsl(var(--chart-1))', strokeWidth: 2 }}
                  defaultEdgeOptions={{
                    type: 'default',
                    animated: true,
                    style: { stroke: 'hsl(var(--chart-1))', strokeWidth: 2 },
                  }}
                >
                  <Background 
                    variant={BackgroundVariant.Dots}
                    gap={12}
                    size={1}
                    color="hsl(var(--muted-foreground) / 0.2)"
                  />
                  <Controls 
                    className="bg-card border border-border rounded-lg shadow-sm"
                    showInteractive={false}
                  />
                  <MiniMap 
                    className="bg-card border border-border rounded-lg shadow-sm"
                    nodeColor="hsl(var(--primary))"
                    maskColor="hsl(var(--muted) / 0.6)"
                  />
                </ReactFlow>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AddElementDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddElement={handleAddElement}
      />
    </div>
  );
}
