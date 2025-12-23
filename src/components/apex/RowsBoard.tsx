import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Edit, Trash2, GripVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sortable, SortableItem, SortableItemHandle } from "@/components/ui/sortable";
import { toast } from "sonner";

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
  onReorderCards?: (cards: RowsCard[]) => void;
}

interface SortableCardContentProps {
  card: RowsCard;
  onEditCard: (card: RowsCard) => void;
  onDeleteCard: (cardId: string) => void;
  listeners?: any;
  isDragging?: boolean;
}

function SortableCardContent({ card, onEditCard, onDeleteCard, listeners, isDragging }: SortableCardContentProps) {
  return (
    <Card className={`bg-card border-border transition-all ${isDragging ? 'shadow-lg ring-2 ring-primary/20' : 'hover:shadow-md'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <SortableItemHandle listeners={listeners} className="mt-1 text-muted-foreground hover:text-foreground">
            <GripVertical className="h-5 w-5" />
          </SortableItemHandle>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">{card.title}</h3>
            {card.description && (
              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap line-clamp-2">
                {card.description}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
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
      </CardContent>
    </Card>
  );
}

export function RowsBoard({ cards, onAddCard, onEditCard, onDeleteCard, onReorderCards }: RowsBoardProps) {
  const sortedCards = [...cards].sort((a, b) => a.order_index - b.order_index);

  const handleValueChange = (newCards: RowsCard[]) => {
    const updatedCards = newCards.map((card, index) => ({
      ...card,
      order_index: index,
    }));
    
    if (onReorderCards) {
      onReorderCards(updatedCards);
      toast.success('Elementos reordenados!');
    }
  };

  const getItemValue = (card: RowsCard) => card.id;

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
        <Sortable
          value={sortedCards}
          onValueChange={handleValueChange}
          getItemValue={getItemValue}
        >
          {sortedCards.map((card) => (
            <SortableItem key={card.id} value={card.id}>
              <SortableCardContent
                card={card}
                onEditCard={onEditCard}
                onDeleteCard={onDeleteCard}
              />
            </SortableItem>
          ))}
        </Sortable>
      )}
    </div>
  );
}