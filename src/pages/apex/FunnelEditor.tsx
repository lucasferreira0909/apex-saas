import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useProjects } from "@/hooks/useProjects";
import { useFunnelElements } from "@/hooks/useFunnelElements";
import { useFunnelProject } from "@/hooks/useFunnelProject";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, ArrowLeft, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { AddElementDialog, ElementType } from "@/components/apex/AddElementDialog";
import { EmptyCanvas } from "@/components/apex/EmptyCanvas";
import { FunnelElement } from "@/types/funnel";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import FunnelFlowNode from "@/components/apex/FunnelFlowNode";

const nodeTypes = {
  funnelNode: FunnelFlowNode as any,
};

export default function FunnelEditor() {
  const { id } = useParams();
  const { updateProject, projects } = useProjects();
  const { funnelId, loading: funnelLoading } = useFunnelProject(id);
  const { elements, loading: elementsLoading, saveAllElements } = useFunnelElements(funnelId || undefined);
  const [isSaved, setIsSaved] = useState(false);
  const [showExitButton, setShowExitButton] = useState(false);
  const [funnelElements, setFunnelElements] = useState<FunnelElement[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const currentProject = projects.find(p => p.id === id);

  // Convert FunnelElements to React Flow nodes
  useEffect(() => {
    if (!elementsLoading && !funnelLoading) {
      console.log('Loading elements from DB:', elements);
      setFunnelElements(elements);
      
      const flowNodes: Node[] = elements.map(element => ({
        id: element.id,
        type: 'funnelNode',
        position: element.position,
        data: { element },
      }));
      
      setNodes(flowNodes);
    }
  }, [elements, elementsLoading, funnelLoading, setNodes]);

  // Update funnelElements when nodes change position
  useEffect(() => {
    const updatedElements = funnelElements.map(element => {
      const node = nodes.find(n => n.id === element.id);
      if (node && (node.position.x !== element.position.x || node.position.y !== element.position.y)) {
        return { ...element, position: node.position };
      }
      return element;
    });
    
    if (JSON.stringify(updatedElements) !== JSON.stringify(funnelElements)) {
      setFunnelElements(updatedElements);
    }
  }, [nodes]);

  const generateUniqueId = () => crypto.randomUUID();
  
  const findOptimalPosition = () => {
    if (funnelElements.length === 0) {
      return { x: 100, y: 100 };
    }

    const lastElement = funnelElements[funnelElements.length - 1];
    return {
      x: lastElement.position.x + 300,
      y: lastElement.position.y
    };
  };

  const handleAddElement = (elementType: ElementType) => {
    const position = findOptimalPosition();
    
    const newElement: FunnelElement = {
      id: generateUniqueId(),
      type: elementType.name,
      icon: elementType.icon,
      position,
      configured: false,
      stats: {}
    };
    
    const newNode: Node = {
      id: newElement.id,
      type: 'funnelNode',
      position: newElement.position,
      data: { element: newElement },
    };
    
    setFunnelElements(prev => [...prev, newElement]);
    setNodes(prev => [...prev, newNode]);
    setShowAddDialog(false);
  };

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({
        ...params,
        id: `${params.source}-${params.target}-${Date.now()}`,
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--primary))',
        },
      }, eds));
    },
    [setEdges]
  );

  const handleSave = async () => {
    if (!id || !funnelId) {
      console.error('No project ID or funnel ID provided');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Saving elements:', funnelElements);
      
      await saveAllElements(funnelElements);
      
      await updateProject(id, { 
        status: 'active',
        stats: {
          conversion: "0%",
          visitors: "0", 
          revenue: "R$ 0",
          elements: funnelElements.length.toString()
        }
      });
      
      setIsSaved(true);
      setShowExitButton(true);
      console.log('Funnel saved successfully');
    } catch (error) {
      console.error('Error saving funnel:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
        
        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleSave} 
            className={isSaved ? "bg-success" : ""} 
            disabled={isLoading}
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Salvando..." : isSaved ? "Salvo" : "Salvar"}
          </Button>
          {showExitButton && (
            <Link to="/funnels">
              <Button variant="secondary">
                Sair do Projeto
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Funnel Canvas */}
      <Card className="bg-card border-border h-[700px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground">Canvas do Funil</CardTitle>
              <CardDescription>Arraste os elementos, conecte-os e configure seu funil</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Elemento
            </Button>
          </div>
        </CardHeader>
        <CardContent className="h-[calc(100%-100px)]">
          {funnelElements.length === 0 ? (
            <div className="flex items-center justify-center h-full bg-muted/20 rounded-lg">
              <EmptyCanvas onAddElement={() => setShowAddDialog(true)} />
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              className="bg-muted/20 rounded-lg"
            >
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
              <Controls />
              <MiniMap 
                nodeColor={(node) => 'hsl(var(--primary))'}
                className="bg-background border border-border"
              />
            </ReactFlow>
          )}
        </CardContent>
      </Card>

      {/* Add Element Dialog */}
      <AddElementDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
        onAddElement={handleAddElement}
        templateType={currentProject?.templateType || null}
      />
    </div>
  );
}
