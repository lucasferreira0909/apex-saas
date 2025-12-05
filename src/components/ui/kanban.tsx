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
  columns?: string[];
  onColumnsChange?: (columns: string[]) => void;
  children: React.ReactNode;
}

export function Kanban<T = any>({ 
  value, 
  onValueChange, 
  getItemValue, 
  columns,
  onColumnsChange,
  children 
}: KanbanProps<T>) {
  const [activeItemId, setActiveItemId] = React.useState<string | null>(null);
  const [activeColumnId, setActiveColumnId] = React.useState<string | null>(null);
  const [dragType, setDragType] = React.useState<'item' | 'column' | null>(null);

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
    if (columns?.includes(activeId)) {
      setDragType('column');
      setActiveColumnId(activeId);
      return;
    }

    // Dragging an item
    setDragType('item');
    setActiveItemId(activeId);

    for (const [columnId, items] of Object.entries(value)) {
      if (items.some((item) => getItemValue(item) === activeId)) {
        setActiveColumnId(columnId);
        break;
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (dragType === 'column') return;
    
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    let sourceColumn: string | null = null;
    let destColumn: string | null = null;

    for (const [columnId, items] of Object.entries(value)) {
      if (items.some((item) => getItemValue(item) === activeId)) {
        sourceColumn = columnId;
      }
      if (items.some((item) => getItemValue(item) === overId) || columnId === overId) {
        destColumn = overId.startsWith('column-') ? overId.replace('column-', '') : columnId;
      }
    }

    // Check if over is a column itself
    if (columns?.includes(overId)) {
      destColumn = overId;
    }

    if (!sourceColumn || !destColumn || sourceColumn === destColumn) return;

    const newValue = { ...value };
    const sourceItems = [...newValue[sourceColumn]];
    const destItems = [...(newValue[destColumn] || [])];

    const activeIndex = sourceItems.findIndex((item) => getItemValue(item) === activeId);
    if (activeIndex === -1) return;

    const [movedItem] = sourceItems.splice(activeIndex, 1);
    destItems.push(movedItem);

    newValue[sourceColumn] = sourceItems;
    newValue[destColumn] = destItems;

    onValueChange(newValue);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveItemId(null);
    setActiveColumnId(null);
    setDragType(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle column reordering
    if (dragType === 'column' && columns && onColumnsChange) {
      const oldIndex = columns.indexOf(activeId);
      const newIndex = columns.indexOf(overId);
      
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        onColumnsChange(arrayMove(columns, oldIndex, newIndex));
      }
      return;
    }

    if (activeId === overId) return;

    // Handle item reordering within same column
    let columnId: string | null = null;
    for (const [colId, items] of Object.entries(value)) {
      if (items.some((item) => getItemValue(item) === activeId)) {
        columnId = colId;
        break;
      }
    }

    if (!columnId) return;

    const items = [...value[columnId]];
    const activeIndex = items.findIndex((item) => getItemValue(item) === activeId);
    const overIndex = items.findIndex((item) => getItemValue(item) === overId);

    if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
      const newItems = arrayMove(items, activeIndex, overIndex);
      onValueChange({
        ...value,
        [columnId]: newItems,
      });
    }
  };

  return (
    <KanbanContext.Provider value={{ getItemValue, activeItemId, activeColumnId }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay>
          {activeItemId && (
            <div className="opacity-80 rotate-3 scale-105">
              <div className="rounded-md border bg-card p-3 shadow-lg">
                Arrastando...
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
  columnIds?: string[];
}

export function KanbanBoard({ children, className, columnIds }: KanbanBoardProps) {
  const content = (
    <div className={cn('flex gap-4 overflow-x-auto pb-4', className)}>
      {children}
    </div>
  );

  if (columnIds) {
    return (
      <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
        {content}
      </SortableContext>
    );
  }

  return content;
}

interface KanbanColumnProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  draggable?: boolean;
}

export function KanbanColumn({ value, children, className, draggable }: KanbanColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: value,
    disabled: !draggable,
  });

  const style = draggable ? {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  return (
    <div 
      ref={draggable ? setNodeRef : undefined}
      style={style}
      id={`column-${value}`} 
      className={cn('flex flex-col', className)}
      {...(draggable ? attributes : {})}
    >
      {children}
    </div>
  );
}

interface KanbanColumnHandleProps {
  children: React.ReactNode;
  asChild?: boolean;
  columnId?: string;
}

export function KanbanColumnHandle({ children, asChild, columnId }: KanbanColumnHandleProps) {
  const { attributes, listeners } = useSortable({
    id: columnId || '',
    disabled: !columnId,
  });

  if (!columnId) {
    return <>{children}</>;
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ...attributes,
      ...listeners,
    });
  }

  return (
    <div {...attributes} {...listeners}>
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
      <div className={cn('flex flex-col gap-2', className)}>{children}</div>
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
