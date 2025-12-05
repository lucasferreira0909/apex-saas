import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Kanban,
  KanbanBoard as KanbanBoardUI,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHandle,
  KanbanItem,
  KanbanOverlay,
} from '@/components/ui/kanban';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { BoardCard, BoardColumn } from '@/types/board';
import { useUpdateMultipleCards } from '@/hooks/useBoardColumns';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

interface KanbanBoardProps {
  columns: BoardColumn[];
  cards: BoardCard[];
  boardId: string;
  onCardMove: (cardId: string, newColumnId: string, newOrderIndex: number) => void;
  onAddCard: (columnId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onColumnsReorder?: (columnIds: string[]) => void;
}

function CardItem({ 
  card, 
  onDelete 
}: { 
  card: BoardCard; 
  onDelete: () => void;
}) {
  return (
    <KanbanItem value={card.id}>
      <div className="rounded-md border bg-card p-3 shadow-xs group cursor-grab active:cursor-grabbing">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="line-clamp-1 font-medium text-sm">{card.title}</span>
            {card.priority && (
              <Badge
                variant={card.priority === 'high' ? 'destructive' : card.priority === 'medium' ? 'default' : 'secondary'}
                className="pointer-events-none h-5 rounded-sm px-1.5 text-[11px] capitalize shrink-0"
              >
                {card.priority === 'high' ? 'Alta' : card.priority === 'medium' ? 'Média' : 'Baixa'}
              </Badge>
            )}
          </div>
          {card.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{card.description}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              {new Date(card.created_at).toLocaleDateString('pt-BR')}
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </KanbanItem>
  );
}

function Column({ 
  column, 
  cards, 
  isOverlay,
  onAddCard,
  onDeleteCard 
}: {
  column: BoardColumn;
  cards: BoardCard[];
  isOverlay?: boolean;
  onAddCard: () => void;
  onDeleteCard: (cardId: string) => void;
}) {
  return (
    <KanbanColumn value={column.id} draggable className="rounded-md border bg-muted/30 p-2.5 shadow-xs min-w-[300px]">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-sm">{column.title}</span>
          <Badge variant="secondary">{cards.length}</Badge>
        </div>
        <KanbanColumnHandle asChild columnId={column.id}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4" />
          </Button>
        </KanbanColumnHandle>
      </div>
      <KanbanColumnContent value={column.id} className="flex flex-col gap-2.5 p-0.5 min-h-[200px]">
        {cards.map((card) => (
          <CardItem 
            key={card.id} 
            card={card} 
            onDelete={() => onDeleteCard(card.id)}
          />
        ))}
        {!isOverlay && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-muted-foreground"
            onClick={onAddCard}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar card
          </Button>
        )}
      </KanbanColumnContent>
    </KanbanColumn>
  );
}

export function KanbanBoard({ 
  columns, 
  cards, 
  boardId,
  onCardMove, 
  onAddCard, 
  onDeleteCard,
  onColumnsReorder 
}: KanbanBoardProps) {
  const updateMultipleCards = useUpdateMultipleCards();
  
  const cardsByColumn = React.useMemo(() => {
    const organized: Record<string, BoardCard[]> = {};
    columns.forEach(col => {
      organized[col.id] = cards
        .filter(card => card.column_id === col.id)
        .sort((a, b) => a.order_index - b.order_index);
    });
    return organized;
  }, [columns, cards]);

  const [columnsState, setColumnsState] = React.useState(cardsByColumn);
  const [columnOrder, setColumnOrder] = React.useState(columns.map(c => c.id));
  const [pendingUpdates, setPendingUpdates] = React.useState<Array<{
    id: string;
    column_id: string;
    order_index: number;
  }>>([]);

  const debouncedUpdates = useDebouncedValue(pendingUpdates, 500);

  React.useEffect(() => {
    setColumnsState(cardsByColumn);
  }, [cardsByColumn]);

  React.useEffect(() => {
    setColumnOrder(columns.map(c => c.id));
  }, [columns]);

  // Batch update cards when debounced updates change
  React.useEffect(() => {
    if (debouncedUpdates.length > 0) {
      updateMultipleCards.mutate({
        board_id: boardId,
        updates: debouncedUpdates
      });
      setPendingUpdates([]);
    }
  }, [debouncedUpdates, boardId]);

  const handleValueChange = (newColumns: Record<string, BoardCard[]>) => {
    setColumnsState(newColumns);
    
    // Collect all updates
    const updates: Array<{ id: string; column_id: string; order_index: number }> = [];
    
    Object.entries(newColumns).forEach(([columnId, columnCards]) => {
      columnCards.forEach((card, index) => {
        const originalCard = cards.find(c => c.id === card.id);
        if (originalCard && (originalCard.column_id !== columnId || originalCard.order_index !== index)) {
          updates.push({
            id: card.id,
            column_id: columnId,
            order_index: index
          });
        }
      });
    });

    if (updates.length > 0) {
      setPendingUpdates(updates);
    }
  };

  const handleColumnsChange = (newColumnOrder: string[]) => {
    setColumnOrder(newColumnOrder);
    onColumnsReorder?.(newColumnOrder);
  };

  const sortedColumns = React.useMemo(() => {
    return columnOrder
      .map(id => columns.find(c => c.id === id))
      .filter((c): c is BoardColumn => !!c);
  }, [columnOrder, columns]);

  return (
    <Kanban 
      value={columnsState} 
      onValueChange={handleValueChange}
      getItemValue={(item) => item.id}
      columns={columnOrder}
      onColumnsChange={handleColumnsChange}
    >
      <KanbanBoardUI className="flex gap-4 overflow-x-auto pb-4" columnIds={columnOrder}>
        {sortedColumns.map((column) => (
          <Column
            key={column.id}
            column={column}
            cards={columnsState[column.id] || []}
            onAddCard={() => onAddCard(column.id)}
            onDeleteCard={onDeleteCard}
          />
        ))}
      </KanbanBoardUI>
      <KanbanOverlay>
        <div className="rounded-md bg-muted/60 size-full" />
      </KanbanOverlay>
    </Kanban>
  );
}
