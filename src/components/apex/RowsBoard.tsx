import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface RowsCard {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
}

interface RowsBoardProps {
  cards: RowsCard[];
  onAddCard: () => void;
  onEditCard: (card: RowsCard) => void;
  onDeleteCard: (cardId: string) => void;
}

export function RowsBoard({ cards, onAddCard, onEditCard, onDeleteCard }: RowsBoardProps) {
  const sortedCards = [...cards].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onAddCard}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Elemento
        </Button>
      </div>

      {sortedCards.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Nenhum elemento adicionado ainda</p>
            <Button variant="outline" onClick={onAddCard}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar primeiro elemento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedCards.map((card) => (
            <Card key={card.id} className="bg-card border-border hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditCard(card)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => onDeleteCard(card.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              {card.description && (
                <CardContent>
                  <CardDescription className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {card.description}
                  </CardDescription>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}