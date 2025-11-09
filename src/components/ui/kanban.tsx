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
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface KanbanContextValue {
  getItemValue: (item: any) => string;
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
  children: React.ReactNode;
}

export function Kanban<T = any>({ value, onValueChange, getItemValue, children }: KanbanProps<T>) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [activeColumn, setActiveColumn] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    // Find which column contains this item
    for (const [columnId, items] of Object.entries(value)) {
      if (items.some((item) => getItemValue(item) === active.id)) {
        setActiveColumn(columnId);
        break;
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source and destination columns
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

    if (!sourceColumn || !destColumn || sourceColumn === destColumn) return;

    // Move item to different column
    const newValue = { ...value };
    const sourceItems = [...newValue[sourceColumn]];
    const destItems = [...newValue[destColumn]];

    const activeIndex = sourceItems.findIndex((item) => getItemValue(item) === activeId);
    const [movedItem] = sourceItems.splice(activeIndex, 1);

    destItems.push(movedItem);

    newValue[sourceColumn] = sourceItems;
    newValue[destColumn] = destItems;

    onValueChange(newValue);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveColumn(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Find the column containing the items
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

    if (activeIndex !== overIndex) {
      const [movedItem] = items.splice(activeIndex, 1);
      items.splice(overIndex, 0, movedItem);

      onValueChange({
        ...value,
        [columnId]: items,
      });
    }
  };

  const activeItem = React.useMemo(() => {
    if (!activeId || !activeColumn) return null;
    return value[activeColumn]?.find((item) => getItemValue(item) === activeId);
  }, [activeId, activeColumn, value, getItemValue]);

  return (
    <KanbanContext.Provider value={{ getItemValue }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay>{activeItem && <div className="opacity-50">Dragging...</div>}</DragOverlay>
      </DndContext>
    </KanbanContext.Provider>
  );
}

interface KanbanBoardProps {
  children: React.ReactNode;
  className?: string;
}

export function KanbanBoard({ children, className }: KanbanBoardProps) {
  return <div className={cn('flex gap-4 overflow-x-auto pb-4', className)}>{children}</div>;
}

interface KanbanColumnProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function KanbanColumn({ value, children, className }: KanbanColumnProps) {
  return (
    <div id={`column-${value}`} className={cn('flex flex-col', className)}>
      {children}
    </div>
  );
}

interface KanbanColumnHandleProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export function KanbanColumnHandle({ children, asChild }: KanbanColumnHandleProps) {
  return <>{children}</>;
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
