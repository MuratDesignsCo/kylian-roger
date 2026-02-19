'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

interface SortableListProps<T> {
  items: T[]
  onReorder: (items: T[]) => void
  renderItem: (item: T, index: number) => React.ReactNode
  getId?: (item: T) => string
}

export default function SortableList<T>({
  items,
  onReorder,
  renderItem,
  getId,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const getItemId = (item: T, index: number): string => {
    if (getId) return getId(item)
    if (typeof item === 'object' && item !== null && 'id' in item) {
      return String((item as Record<string, unknown>).id)
    }
    return String(index)
  }

  const ids = items.map((item, i) => getItemId(item, i))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))

    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(arrayMove(items, oldIndex, newIndex))
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((item, index) => (
            <SortableItem key={getItemId(item, index)} id={getItemId(item, index)}>
              {renderItem(item, index)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function SortableItem({
  id,
  children,
}: {
  id: string
  children: React.ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2">
      <button
        type="button"
        className="mt-2 flex-shrink-0 cursor-grab rounded p-1 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
