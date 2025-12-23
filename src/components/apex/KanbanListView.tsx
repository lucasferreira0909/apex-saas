import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sortable, SortableItem, SortableItemHandle } from '@/components/ui/sortable';
import { GripVertical, Link2, Trash2, Pencil } from 'lucide-react';
import { icons } from 'lucide-react';
import { BoardCard, BoardColumn } from '@/types/board';
import { useCardAttachments } from '@/hooks/useCardAttachments';
import { toast } from 'sonner';

interface KanbanListViewProps {
  columns: BoardColumn[];
  cards: BoardCard[];
  onCardMove: (cardId: string, newColumnId: string, newOrderIndex: number) => void;
  onDeleteCard: (cardId: string) => void;
  onEditCard?: (card: BoardCard) => void;
}

interface CardWithColumn extends BoardCard {
  columnTitle: string;
  columnIcon: string | null;
}

function ColumnIcon({ iconName }: { iconName: string | null }) {
  if (!iconName) return null;
  const LucideIcon = icons[iconName as keyof typeof icons];
  if (!LucideIcon) return null;
  return <LucideIcon className="h-3 w-3" />;
}

function ListCardItem({
  card,
  columnTitle,
  columnIcon,
  onDelete,
  onEdit,
}: {
  card: BoardCard;
  columnTitle: string;
  columnIcon: string | null;
  onDelete: () => void;
  onEdit?: () => void;
}) {
  const { data: attachments } = useCardAttachments(card.id);
  const attachmentCount = attachments?.length || 0;

  return (
    <SortableItem value={card.id}>
      <div
        className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm group hover:border-primary/50 transition-colors"
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest('button') && !(e.target as HTMLElement).closest('a')) {
            onEdit?.();
          }
        }}
      >
        <SortableItemHandle>
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </SortableItemHandle>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm truncate">{card.title}</span>
          </div>
          {card.description && (
            <p className="text-xs text-muted-foreground truncate">{card.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {attachmentCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Link2 className="h-3 w-3" />
              <span>{attachmentCount}</span>
            </div>
          )}

          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <ColumnIcon iconName={columnIcon} />
            <span>{columnTitle}</span>
          </Badge>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              className="h-7 w-7 p-0"
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </SortableItem>
  );
}

export function KanbanListView({
  columns,
  cards,
  onCardMove,
  onDeleteCard,
  onEditCard,
}: KanbanListViewProps) {
  // Flatten all cards with their column info
  const allCards = React.useMemo<CardWithColumn[]>(() => {
    return cards
      .map((card) => {
        const column = columns.find((c) => c.id === card.column_id);
        return {
          ...card,
          columnTitle: column?.title || 'Sem coluna',
          columnIcon: column?.icon || null,
        };
      })
      .sort((a, b) => {
        // First sort by column order
        const colA = columns.find((c) => c.id === a.column_id);
        const colB = columns.find((c) => c.id === b.column_id);
        const colOrderDiff = (colA?.order_index || 0) - (colB?.order_index || 0);
        if (colOrderDiff !== 0) return colOrderDiff;
        // Then by card order within column
        return a.order_index - b.order_index;
      });
  }, [cards, columns]);

  const [sortedCards, setSortedCards] = React.useState(allCards);

  React.useEffect(() => {
    setSortedCards(allCards);
  }, [allCards]);

  const handleValueChange = (newCards: CardWithColumn[]) => {
    setSortedCards(newCards);

    // Notify about reorder
    newCards.forEach((card, index) => {
      const originalCard = cards.find((c) => c.id === card.id);
      if (originalCard && originalCard.order_index !== index) {
        onCardMove(card.id, card.column_id, index);
      }
    });

    toast.success('Cards reordenados!');
  };

  const getItemValue = (item: CardWithColumn) => item.id;

  if (sortedCards.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Nenhum card encontrado. Adicione cards às colunas.
      </div>
    );
  }

  return (
    <Sortable
      value={sortedCards}
      onValueChange={handleValueChange}
      getItemValue={getItemValue}
      className="gap-2"
    >
      {sortedCards.map((card) => (
        <ListCardItem
          key={card.id}
          card={card}
          columnTitle={card.columnTitle}
          columnIcon={card.columnIcon}
          onDelete={() => onDeleteCard(card.id)}
          onEdit={() => onEditCard?.(card)}
        />
      ))}
    </Sortable>
  );
}
