import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useProjects } from "@/hooks/useProjects";
import { useFunnelElements } from "@/hooks/useFunnelElements";
import { useFunnelProject } from "@/hooks/useFunnelProject";
import { useDebounce } from "@/hooks/useDebounce";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, ArrowLeft, Settings, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { FunnelSchemaNode } from "@/components/apex/FunnelSchemaNode";
import { FunnelConnection } from "@/components/apex/FunnelConnection";
import { AddElementDialog, ElementType } from "@/components/apex/AddElementDialog";
import { EmptyCanvas } from "@/components/apex/EmptyCanvas";
import { FunnelElement, FunnelConnection as FunnelConnectionType } from "@/types/funnel";
export default function FunnelEditor() {
  const { id } = useParams();
  const { updateProject, projects } = useProjects();
  // Get the funnel ID based on the project ID
  const { funnelId, loading: funnelLoading } = useFunnelProject(id);
  const { elements, loading: elementsLoading, saveAllElements, saveElement } = useFunnelElements(funnelId || undefined);
  const [isSaved, setIsSaved] = useState(false);
  const [showExitButton, setShowExitButton] = useState(false);
  const [funnelElements, setFunnelElements] = useState<FunnelElement[]>([]);
  const [connections, setConnections] = useState<FunnelConnectionType[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get current project
  const currentProject = projects.find(p => p.id === id);

  // Load elements from database when they're fetched
  useEffect(() => {
    if (!elementsLoading && !funnelLoading) {
      console.log('Loading elements from DB:', elements);
      console.log('Elements positions:', elements.map(e => ({ id: e.id, type: e.type, position: e.position })));
      console.log('Funnel ID:', funnelId);
      setFunnelElements(elements);
    }
  }, [elements, elementsLoading, funnelLoading, funnelId]);
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
    console.log('Adding element:', elementType);
    console.log('New element position:', position);
    
    const newElement: FunnelElement = {
      id: generateUniqueId(),
      type: elementType.name,
      icon: elementType.icon,
      position,
      configured: false,
      stats: {}
    };
    
    console.log('New element created:', newElement);
    setFunnelElements(prev => {
      const updated = [...prev, newElement];
      console.log('Updated elements array:', updated);
      return updated;
    });
    setShowAddDialog(false);
  };
  // Debounced function to save position to database
  const savePositionToDatabase = useCallback(async (elementId: string, newPosition: { x: number; y: number }) => {
    try {
      const elementToUpdate = funnelElements.find(el => el.id === elementId);
      if (elementToUpdate && funnelId) {
        const updatedElement = { ...elementToUpdate, position: newPosition };
        await saveElement(updatedElement);
        console.log('Position saved to database:', { elementId, newPosition });
      }
    } catch (error) {
      console.error('Error saving position:', error);
    }
  }, [funnelElements, funnelId, saveElement]);

  const debouncedSavePosition = useDebounce(savePositionToDatabase, 500);

  const handleElementPositionChange = (elementId: string, newPosition: { x: number; y: number }) => {
    console.log('Position change:', { elementId, newPosition });
    
    // Update local state immediately for smooth UX
    setFunnelElements(prev => prev.map(element => 
      element.id === elementId ? { ...element, position: newPosition } : element
    ));

    // Save position to database with debounce to avoid too many requests
    debouncedSavePosition(elementId, newPosition);
  };
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
        <CardContent>
          <div className="relative bg-muted/20 rounded-lg p-8 min-h-[600px] w-full overflow-auto">
            {funnelElements.length === 0 ? (
              <EmptyCanvas onAddElement={() => setShowAddDialog(true)} />
            ) : (
              <div className="relative w-full h-full min-w-[1200px] min-h-[500px]">
                <div className="absolute top-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                  Elementos: {funnelElements.length}
                </div>
                {/* Render Funnel Elements */}
                {funnelElements.map(element => (
                  <FunnelSchemaNode 
                    key={element.id} 
                    element={element} 
                    position={element.position} 
                    onPositionChange={handleElementPositionChange} 
                  />
                ))}
              </div>
            )}
          </div>
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