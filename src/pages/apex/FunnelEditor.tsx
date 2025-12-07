import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useFunnelElements } from "@/hooks/useFunnelElements";
import { useFunnelProject } from "@/hooks/useFunnelProject";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, ArrowLeft, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { AddElementDialog, ElementType } from "@/components/apex/AddElementDialog";
import { EmptyCanvas } from "@/components/apex/EmptyCanvas";
import { FlowCanvas } from "@/components/apex/FlowCanvas";
import { FunnelElement } from "@/types/funnel";
import { Node, Edge } from "@xyflow/react";
import { getElementIcon } from "@/hooks/useFunnelElements";
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
  const [isSaved, setIsSaved] = useState(false);
  const [showExitButton, setShowExitButton] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        stats: element.stats
      }
    }));
  }, []);

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
      // TODO: Load edges from database if stored
      setEdges([]);
    }
  }, [elements, elementsLoading, funnelLoading, elementsToNodes]);
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
        stats: {}
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
  const handleSave = async () => {
    if (!funnelId) {
      console.error('No funnel ID provided');
      return;
    }
    setIsLoading(true);
    try {
      // Convert nodes back to FunnelElements
      const funnelElements = nodesToElements(nodes);
      console.log('Saving elements:', funnelElements);
      await saveAllElements(funnelElements);
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
      <AddElementDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAddElement={handleAddElement} templateType={funnel?.template_type as 'sales' | 'ltv' | 'quiz' | null || null} />
    </div>;
}