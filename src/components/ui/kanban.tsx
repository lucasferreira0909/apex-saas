import * as React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { 
  SortableContext, 
  useSortable, 
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  arrayMove 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface KanbanContextValue {
  getItemValue: (item: any) => string;
  activeItemId: string | null;
  activeColumnId: string | null;
  draggingType: 'item' | 'column' | null;
}

const KanbanContext = React.createContext<KanbanContextValue | null>(null);

function useKanbanContext() {
  const context = React.useContext(KanbanContext);
  if (!context) {
    throw new Error('Kanban components must be used within Kanban');
  }
  return context;
}

interface KanbanProps<T = any> {
  value: Record<string, T[]>;
  onValueChange: (value: Record<string, T[]>) => void;
  getItemValue: (item: T) => string;
  columnOrder: string[];
  onColumnOrderChange?: (newOrder: string[]) => void;
  children: React.ReactNode;
}

export function Kanban<T = any>({ 
  value, 
  onValueChange, 
  getItemValue, 
  columnOrder,
  onColumnOrderChange,
  children 
}: KanbanProps<T>) {
  const [activeItemId, setActiveItemId] = React.useState<string | null>(null);
  const [activeColumnId, setActiveColumnId] = React.useState<string | null>(null);
  const [draggingType, setDraggingType] = React.useState<'item' | 'column' | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;

    // Check if dragging a column
    if (activeId.startsWith('column-')) {
      setActiveColumnId(activeId.replace('column-', ''));
      setDraggingType('column');
      return;
    }

    // Dragging an item
    setActiveItemId(activeId);
    setDraggingType('item');

    // Find which column contains this item
    for (const [columnId, items] of Object.entries(value)) {
      if (items.some((item) => getItemValue(item) === activeId)) {
        setActiveColumnId(columnId);
        break;
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || draggingType !== 'item') return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source column
    let sourceColumn: string | null = null;
    for (const [columnId, items] of Object.entries(value)) {
      if (items.some((item) => getItemValue(item) === activeId)) {
        sourceColumn = columnId;
        break;
      }
    }

    if (!sourceColumn) return;

    // Determine destination column
    let destColumn: string | null = null;
    
    // Check if dropping on column content area
    if (overId.startsWith('content-')) {
      destColumn = overId.replace('content-', '');
    } else if (overId.startsWith('column-')) {
      destColumn = overId.replace('column-', '');
    } else {
      // Dropping on an item - find which column contains it
      for (const [columnId, items] of Object.entries(value)) {
        if (items.some((item) => getItemValue(item) === overId)) {
          destColumn = columnId;
          break;
        }
      }
    }

    if (!destColumn) return;

    // If same column, handle reordering
    if (sourceColumn === destColumn) {
      const items = [...(value[sourceColumn] || [])];
      const activeIndex = items.findIndex((item) => getItemValue(item) === activeId);
      const overIndex = items.findIndex((item) => getItemValue(item) === overId);

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        const newItems = arrayMove(items, activeIndex, overIndex);
        const newValue = {
          ...value,
          [sourceColumn]: newItems,
        };
        onValueChange(newValue);
      }
      return;
    }

    // Move item to different column
    const newValue = { ...value };
    const sourceItems = [...newValue[sourceColumn]];
    const destItems = [...(newValue[destColumn] || [])];

    const activeIndex = sourceItems.findIndex((item) => getItemValue(item) === activeId);
    if (activeIndex === -1) return;
    
    const [movedItem] = sourceItems.splice(activeIndex, 1);
    
    // Find the position to insert based on the over item
    const overIndex = destItems.findIndex((item) => getItemValue(item) === overId);
    if (overIndex !== -1) {
      destItems.splice(overIndex, 0, movedItem);
    } else {
      destItems.push(movedItem);
    }

    newValue[sourceColumn] = sourceItems;
    newValue[destColumn] = destItems;

    onValueChange(newValue);
    setActiveColumnId(destColumn);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (draggingType === 'column' && over && onColumnOrderChange) {
      const activeId = (active.id as string).replace('column-', '');
      const overId = (over.id as string).replace('column-', '');

      if (activeId !== overId) {
        const oldIndex = columnOrder.indexOf(activeId);
        const newIndex = columnOrder.indexOf(overId);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(columnOrder, oldIndex, newIndex);
          onColumnOrderChange(newOrder);
        }
      }
    }

    setActiveItemId(null);
    setActiveColumnId(null);
    setDraggingType(null);
  };

  const activeItem = React.useMemo(() => {
    if (!activeItemId || !activeColumnId || draggingType !== 'item') return null;
    return value[activeColumnId]?.find((item) => getItemValue(item) === activeItemId);
  }, [activeItemId, activeColumnId, value, getItemValue, draggingType]);

  return (
    <KanbanContext.Provider value={{ getItemValue, activeItemId, activeColumnId, draggingType }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
          {draggingType === 'item' && activeItem && (
            <div className="opacity-90 rotate-3 scale-105 shadow-xl">
              <div className="rounded-md border bg-card p-3 shadow-lg">
                <span className="text-sm font-medium">Movendo...</span>
              </div>
            </div>
          )}
          {draggingType === 'column' && activeColumnId && (
            <div className="opacity-80 rotate-2 scale-[1.02] shadow-2xl">
              <div className="rounded-md border bg-card p-4 min-w-[300px] shadow-lg">
                <span className="text-sm font-semibold">Movendo coluna...</span>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </KanbanContext.Provider>
  );
}

interface KanbanBoardProps {
  children: React.ReactNode;
  className?: string;
  columnOrder: string[];
}

export function KanbanBoard({ children, className, columnOrder }: KanbanBoardProps) {
  return (
    <SortableContext items={columnOrder.map(id => `column-${id}`)} strategy={horizontalListSortingStrategy}>
      <div className={cn('flex gap-4 overflow-x-auto pb-4', className)}>{children}</div>
    </SortableContext>
  );
}

interface KanbanColumnProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function KanbanColumn({ value, children, className }: KanbanColumnProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `column-${value}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn('flex flex-col', className)}
      {...attributes}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === KanbanColumnHandle) {
          return React.cloneElement(child as React.ReactElement<any>, { listeners });
        }
        return child;
      })}
    </div>
  );
}

interface KanbanColumnHandleProps {
  children: React.ReactNode;
  asChild?: boolean;
  listeners?: Record<string, any>;
}

export function KanbanColumnHandle({ children, asChild, listeners }: KanbanColumnHandleProps) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ...listeners,
      style: { cursor: 'grab' },
    });
  }
  
  return (
    <div {...listeners} style={{ cursor: 'grab' }}>
      {children}
    </div>
  );
}

interface KanbanColumnContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function KanbanColumnContent({ value, children, className }: KanbanColumnContentProps) {
  const { getItemValue } = useKanbanContext();

  const items = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === KanbanItem
  );

  const itemIds = items.map((item) => {
    if (React.isValidElement(item)) {
      return item.props.value;
    }
    return '';
  });

  return (
    <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
      <div 
        id={`content-${value}`}
        className={cn('flex flex-col gap-2', className)}
      >
        {children}
      </div>
    </SortableContext>
  );
}

interface KanbanItemProps {
  value: string;
  children: React.ReactNode;
}

export function KanbanItem({ value, children }: KanbanItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: value,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

interface KanbanItemHandleProps {
  children: React.ReactNode;
}

export function KanbanItemHandle({ children }: KanbanItemHandleProps) {
  return <>{children}</>;
}

interface KanbanOverlayProps {
  children: React.ReactNode;
}

export function KanbanOverlay({ children }: KanbanOverlayProps) {
  return <>{children}</>;
}
