'use client';

import * as React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface SortableContextValue<T> {
  activeItem: T | null;
}

const SortableCtx = React.createContext<SortableContextValue<any> | null>(null);

function useSortableContext<T>() {
  const context = React.useContext(SortableCtx);
  return context as SortableContextValue<T> | null;
}

interface SortableProps<T> {
  value: T[];
  onValueChange: (items: T[]) => void;
  getItemValue: (item: T) => string;
  children: React.ReactNode;
  className?: string;
}

export function Sortable<T>({
  value,
  onValueChange,
  getItemValue,
  children,
  className,
}: SortableProps<T>) {
  const [activeItem, setActiveItem] = React.useState<T | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = event.active.id as string;
    const item = value.find((i) => getItemValue(i) === activeId);
    setActiveItem(item || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over || active.id === over.id) return;

    const oldIndex = value.findIndex((item) => getItemValue(item) === active.id);
    const newIndex = value.findIndex((item) => getItemValue(item) === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newItems = arrayMove(value, oldIndex, newIndex);
      onValueChange(newItems);
    }
  };

  const itemIds = value.map((item) => getItemValue(item));

  return (
    <SortableCtx.Provider value={{ activeItem }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div className={cn('flex flex-col gap-2', className)}>{children}</div>
        </SortableContext>
        <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
          {activeItem && (
            <div className="opacity-90 rotate-1 scale-[1.02] shadow-xl">
              <div className="rounded-lg border bg-card p-4 shadow-lg">
                <span className="text-sm font-medium">Movendo...</span>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </SortableCtx.Provider>
  );
}

interface SortableItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function SortableItem({ value, children, className }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: value });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(className)}
      {...attributes}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === SortableItemHandle) {
          return React.cloneElement(child as React.ReactElement<any>, { listeners });
        }
        return child;
      })}
    </div>
  );
}

interface SortableItemHandleProps {
  children: React.ReactNode;
  className?: string;
  listeners?: Record<string, any>;
}

export function SortableItemHandle({ children, className, listeners }: SortableItemHandleProps) {
  return (
    <div className={cn('cursor-grab active:cursor-grabbing', className)} {...listeners}>
      {children}
    </div>
  );
}
