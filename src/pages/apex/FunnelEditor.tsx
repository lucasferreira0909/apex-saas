import { useState, useEffect, useCallback } from "react";
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
  Node, 
  Edge, 
  Connection, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Controls,
  Background,
  MiniMap,
  ConnectionLineType,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FunnelFlowNode } from '@/components/apex/FunnelFlowNode';
import CustomConnectionLine from '@/components/apex/CustomConnectionLine';
const nodeTypes = {
  funnelNode: FunnelFlowNode,
};

export default function FunnelEditor() {
  const { id } = useParams();
  const { updateProject, projects } = useProjects();
  const { funnelId, loading: funnelLoading } = useFunnelProject(id);
  const { elements, loading: elementsLoading, saveAllElements, saveElement } = useFunnelElements(funnelId || undefined);
  const [isSaved, setIsSaved] = useState(false);
  const [showExitButton, setShowExitButton] = useState(false);
  const [funnelElements, setFunnelElements] = useState<FunnelElement[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Get current project
  const currentProject = projects.find(p => p.id === id);

  // Convert funnel elements to React Flow nodes
  useEffect(() => {
    if (!elementsLoading && !funnelLoading) {
      setFunnelElements(elements);
      
      const flowNodes: Node[] = elements.map(element => ({
        id: element.id,
        type: 'funnelNode',
        position: element.position,
        data: element,
      }));
      
      setNodes(flowNodes);
    }
  }, [elements, elementsLoading, funnelLoading, setNodes]);
  const generateUniqueId = () => crypto.randomUUID();
  const findOptimalPosition = () => {
    // Only calculate positions for NEW elements, not existing ones
    if (funnelElements.length === 0) {
      return { x: 50, y: 50 };
    }

    // Simple positioning logic: place new elements to the right
    const lastElement = funnelElements[funnelElements.length - 1];
    return {
      x: lastElement.position.x + 280,
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
    
    setFunnelElements(prev => [...prev, newElement]);
    
    // Add to React Flow nodes
    const newNode: Node = {
      id: newElement.id,
      type: 'funnelNode',
      position: newElement.position,
      data: newElement,
    };
    
    setNodes(prev => [...prev, newNode]);
    setShowAddDialog(false);
  };
  
  // Handle connections between nodes
  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge({
      ...connection,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#D4A574', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#D4A574' },
    }, eds));
  }, [setEdges]);
  // Handle node position changes
  const onNodeDragStop = useCallback((_event: any, node: Node) => {
    const elementToUpdate = funnelElements.find(el => el.id === node.id);
    if (elementToUpdate && funnelId) {
      const updatedElement = { ...elementToUpdate, position: node.position };
      saveElement(updatedElement);
      setFunnelElements(prev => prev.map(el => 
        el.id === node.id ? updatedElement : el
      ));
    }
  }, [funnelElements, funnelId, saveElement]);
  const handleSave = async () => {
    if (!id || !funnelId) {
      console.error('No project ID or funnel ID provided');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Saving elements:', funnelElements);
      
      // Save elements to database
      await saveAllElements(funnelElements);
      
      // Update project status when saving
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
        
        <div className="flex items-center space-x-2">
          
          <Button 
            onClick={handleSave} 
            className={isSaved ? "bg-success" : ""} 
            disabled={isLoading}
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Salvando..." : isSaved ? "Salvo" : "Salvar"}
          </Button>
          {showExitButton && <Link to="/funnels">
              <Button variant="secondary">
                Sair do Projeto
              </Button>
            </Link>}
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
        <CardContent className="p-0">
          {funnelElements.length === 0 ? (
            <div className="p-8">
              <EmptyCanvas onAddElement={() => setShowAddDialog(true)} />
            </div>
          ) : (
            <div className="h-[600px] w-full">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDragStop={onNodeDragStop}
                nodeTypes={nodeTypes}
                connectionLineComponent={CustomConnectionLine}
                connectionLineType={ConnectionLineType.SmoothStep}
                fitView
                className="bg-muted/20"
              >
                <Background />
                <Controls />
                <MiniMap 
                  nodeColor="#D4A574"
                  maskColor="rgb(0, 0, 0, 0.1)"
                />
              </ReactFlow>
            </div>
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
    </div>;
}