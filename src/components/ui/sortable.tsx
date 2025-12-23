'use client';

import * as React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = value.findIndex((item) => getItemValue(item) === active.id);
      const newIndex = value.findIndex((item) => getItemValue(item) === over.id);
      onValueChange(arrayMove(value, oldIndex, newIndex));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={value.map(getItemValue)}
        strategy={verticalListSortingStrategy}
      >
        <div className={cn('space-y-2', className)}>{children}</div>
      </SortableContext>
    </DndContext>
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative',
        isDragging && 'z-50 opacity-90',
        className
      )}
      {...attributes}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            listeners,
            isDragging,
          });
        }
        return child;
      })}
    </div>
  );
}

interface SortableItemHandleProps {
  listeners?: any;
  className?: string;
  children: React.ReactNode;
}

export function SortableItemHandle({
  listeners,
  className,
  children,
}: SortableItemHandleProps) {
  return (
    <button
      type="button"
      className={cn('cursor-grab active:cursor-grabbing touch-none', className)}
      {...listeners}
    >
      {children}
    </button>
  );
}
