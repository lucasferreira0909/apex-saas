import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Kanban, KanbanBoard as KanbanBoardUI, KanbanColumn, KanbanColumnContent, KanbanItem, KanbanOverlay } from '@/components/ui/kanban';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { icons } from 'lucide-react';
import { BoardCard, BoardColumn } from '@/types/board';
interface KanbanBoardProps {
  columns: BoardColumn[];
  cards: BoardCard[];
  onCardMove: (cardId: string, newColumnId: string, newOrderIndex: number) => void;
  onColumnMove?: (columnId: string, newOrderIndex: number) => void;
  onAddCard: (columnId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onEditColumn?: (columnId: string, currentName: string, currentIcon: string | null) => void;
  onDeleteColumn?: (columnId: string) => void;
  onEditCard?: (card: BoardCard) => void;
  hideColumnActions?: boolean;
}
function CardItem({
  card,
  onDelete,
  onEdit
}: {
  card: BoardCard;
  onDelete: () => void;
  onEdit?: () => void;
}) {
  return <KanbanItem value={card.id}>
      <div className="rounded-md border bg-card p-3 shadow-xs group cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors" onClick={e => {
      // Only trigger edit if not dragging
      if (!(e.target as HTMLElement).closest('button')) {
        onEdit?.();
      }
    }}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="line-clamp-2 font-medium text-sm">{card.title}</span>
          </div>
          {card.description && <p className="text-xs text-muted-foreground line-clamp-2">{card.description}</p>}
          <div className="flex items-center justify-end">
            <Button variant="ghost" size="sm" onClick={e => {
            e.stopPropagation();
            onDelete();
          }} className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </KanbanItem>;
}
function ColumnIcon({ iconName }: { iconName: string | null }) {
  if (!iconName) return null;
  const LucideIcon = icons[iconName as keyof typeof icons];
  if (!LucideIcon) return null;
  return <LucideIcon className="h-4 w-4 text-muted-foreground" />;
}

function Column({
  column,
  cards,
  onAddCard,
  onDeleteCard,
  onEditColumn,
  onDeleteColumn,
  onEditCard,
  hideColumnActions
}: {
  column: BoardColumn;
  cards: BoardCard[];
  onAddCard: () => void;
  onDeleteCard: (cardId: string) => void;
  onEditColumn?: () => void;
  onDeleteColumn?: () => void;
  onEditCard?: (card: BoardCard) => void;
  hideColumnActions?: boolean;
}) {
  return <KanbanColumn value={column.id} className="rounded-md border bg-muted/30 p-2.5 shadow-xs min-w-[300px]">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <ColumnIcon iconName={column.icon} />
          <span className="font-semibold text-sm">{column.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onAddCard}>
            <Plus className="h-4 w-4" />
          </Button>
          {!hideColumnActions && <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreHorizontal className="h-4 w-4" />
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
            </DropdownMenu>}
        </div>
      </div>
      <KanbanColumnContent value={column.id} className="flex flex-col gap-2.5 p-0.5 min-h-[200px]">
        {cards.map(card => <CardItem key={card.id} card={card} onDelete={() => onDeleteCard(card.id)} onEdit={() => onEditCard?.(card)} />)}
      </KanbanColumnContent>
    </KanbanColumn>;
}
export function KanbanBoard({
  columns,
  cards,
  onCardMove,
  onColumnMove,
  onAddCard,
  onDeleteCard,
  onEditColumn,
  onDeleteColumn,
  onEditCard,
  hideColumnActions
}: KanbanBoardProps) {
  const [columnOrder, setColumnOrder] = React.useState<string[]>(() => columns.map(c => c.id));
  React.useEffect(() => {
    setColumnOrder(columns.map(c => c.id));
  }, [columns]);
  const cardsByColumn = React.useMemo(() => {
    const organized: Record<string, BoardCard[]> = {};
    columns.forEach(col => {
      organized[col.id] = cards.filter(card => card.column_id === col.id).sort((a, b) => a.order_index - b.order_index);
    });
    return organized;
  }, [columns, cards]);
  const [columnsState, setColumnsState] = React.useState(cardsByColumn);
  React.useEffect(() => {
    setColumnsState(cardsByColumn);
  }, [cardsByColumn]);
  const handleValueChange = (newColumns: Record<string, BoardCard[]>) => {
    setColumnsState(newColumns);

    // Find cards that have changed position or column
    Object.entries(newColumns).forEach(([columnId, columnCards]) => {
      columnCards.forEach((card, index) => {
        const originalCard = cards.find(c => c.id === card.id);
        // Only trigger update if column or position actually changed
        if (originalCard && (originalCard.column_id !== columnId || originalCard.order_index !== index)) {
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
    return columnOrder.map(id => columns.find(c => c.id === id)).filter((c): c is BoardColumn => c !== undefined);
  }, [columnOrder, columns]);
  return <Kanban value={columnsState} onValueChange={handleValueChange} getItemValue={item => item.id} columnOrder={columnOrder} onColumnOrderChange={handleColumnOrderChange}>
      <KanbanBoardUI className="flex gap-4 overflow-x-auto pb-4" columnOrder={columnOrder}>
        {sortedColumns.map(column => <Column key={column.id} column={column} cards={columnsState[column.id] || []} onAddCard={() => onAddCard(column.id)} onDeleteCard={onDeleteCard} onEditColumn={() => onEditColumn?.(column.id, column.title, column.icon)} onDeleteColumn={() => onDeleteColumn?.(column.id)} onEditCard={onEditCard} hideColumnActions={hideColumnActions} />)}
      </KanbanBoardUI>
      <KanbanOverlay>
        <div className="rounded-md bg-muted/60 size-full" />
      </KanbanOverlay>
    </Kanban>;
}