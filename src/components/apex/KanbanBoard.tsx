import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Kanban,
  KanbanBoard as KanbanBoardUI,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanOverlay,
} from '@/components/ui/kanban';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { BoardCard, BoardColumn } from '@/types/board';

interface KanbanBoardProps {
  columns: BoardColumn[];
  cards: BoardCard[];
  onCardMove: (cardId: string, newColumnId: string, newOrderIndex: number) => void;
  onColumnMove?: (columnId: string, newOrderIndex: number) => void;
  onAddCard: (columnId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onEditColumn?: (columnId: string, currentName: string) => void;
  onDeleteColumn?: (columnId: string) => void;
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
  onDeleteCard,
  onEditColumn,
  onDeleteColumn
}: {
  column: BoardColumn;
  cards: BoardCard[];
  isOverlay?: boolean;
  onAddCard: () => void;
  onDeleteCard: (cardId: string) => void;
  onEditColumn?: () => void;
  onDeleteColumn?: () => void;
}) {
  return (
    <KanbanColumn value={column.id} className="rounded-md border bg-muted/30 p-2.5 shadow-xs min-w-[300px]">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-sm">{column.title}</span>
          <Badge variant="secondary">{cards.length}</Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover">
            <DropdownMenuItem onClick={onEditColumn}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar coluna
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDeleteColumn} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir coluna
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
  onCardMove, 
  onColumnMove,
  onAddCard, 
  onDeleteCard,
  onEditColumn,
  onDeleteColumn
}: KanbanBoardProps) {
  const [columnOrder, setColumnOrder] = React.useState<string[]>(() => 
    columns.map(c => c.id)
  );

  React.useEffect(() => {
    setColumnOrder(columns.map(c => c.id));
  }, [columns]);

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

  React.useEffect(() => {
    setColumnsState(cardsByColumn);
  }, [cardsByColumn]);

  const handleValueChange = (newColumns: Record<string, BoardCard[]>) => {
    setColumnsState(newColumns);
    
    Object.entries(newColumns).forEach(([columnId, columnCards]) => {
      columnCards.forEach((card, index) => {
        if (card.column_id !== columnId || card.order_index !== index) {
          onCardMove(card.id, columnId, index);
        }
      });
    });
  };

  const handleColumnOrderChange = (newOrder: string[]) => {
    setColumnOrder(newOrder);
    
    if (onColumnMove) {
      newOrder.forEach((columnId, index) => {
        const column = columns.find(c => c.id === columnId);
        if (column && column.order_index !== index) {
          onColumnMove(columnId, index);
        }
      });
    }
  };

  const sortedColumns = React.useMemo(() => {
    return columnOrder
      .map(id => columns.find(c => c.id === id))
      .filter((c): c is BoardColumn => c !== undefined);
  }, [columnOrder, columns]);

  return (
    <Kanban 
      value={columnsState} 
      onValueChange={handleValueChange}
      getItemValue={(item) => item.id}
      columnOrder={columnOrder}
      onColumnOrderChange={handleColumnOrderChange}
    >
      <KanbanBoardUI className="flex gap-4 overflow-x-auto pb-4" columnOrder={columnOrder}>
        {sortedColumns.map((column) => (
          <Column
            key={column.id}
            column={column}
            cards={columnsState[column.id] || []}
            onAddCard={() => onAddCard(column.id)}
            onDeleteCard={onDeleteCard}
            onEditColumn={() => onEditColumn?.(column.id, column.title)}
            onDeleteColumn={() => onDeleteColumn?.(column.id)}
          />
        ))}
      </KanbanBoardUI>
      <KanbanOverlay>
        <div className="rounded-md bg-muted/60 size-full" />
      </KanbanOverlay>
    </Kanban>
  );
}
