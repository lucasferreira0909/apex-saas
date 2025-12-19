import { Button } from "@/components/ui/button";
import { Plus, Workflow } from "lucide-react";
interface EmptyCanvasProps {
  onAddElement: () => void;
}
export function EmptyCanvas({
  onAddElement
}: EmptyCanvasProps) {
  return <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center space-y-6">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
        <Workflow className="h-10 w-10 text-primary" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-foreground">
          Seu funil está vazio
        </h3>
        <p className="text-muted-foreground max-w-md">
          Comece adicionando elementos ao seu funil de vendas. 
          Cada elemento representa uma etapa importante na jornada do cliente.
        </p>
      </div>
      
      <Button onClick={onAddElement} size="lg" className="gap-2">
        <Plus className="h-5 w-5" />
        Adicionar Primeiro Elemento
      </Button>
      
      
    </div>;
}