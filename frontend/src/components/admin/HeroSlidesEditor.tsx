'use client'

import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { UPLOAD_URL } from '@/lib/graphql/client'
import { getAuthToken } from '@/components/admin/AuthGuard'
import toast from 'react-hot-toast'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export interface HeroSlideLocal {
  tempId: string
  image_url: string
  alt_text: string
  sort_order: number
}

interface HeroSlidesEditorProps {
  slides: HeroSlideLocal[]
  onSlidesChange: (slides: HeroSlideLocal[]) => void
  maxSlots?: number
}

let tempCounter = 0
function genTempId() {
  return `hero_slide_${Date.now()}_${++tempCounter}`
}

export function ensureSlots(
  slides: HeroSlideLocal[],
  max: number
): HeroSlideLocal[] {
  const result = [...slides]
  while (result.length < max) {
    result.push({
      tempId: genTempId(),
      image_url: '',
      alt_text: '',
      sort_order: result.length,
    })
  }
  return result.slice(0, max)
}

export default function HeroSlidesEditor({
  slides,
  onSlidesChange,
  maxSlots = 5,
}: HeroSlidesEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const ids = slides.map((s) => s.tempId)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))

    if (oldIndex !== -1 && newIndex !== -1) {
      onSlidesChange(arrayMove(slides, oldIndex, newIndex))
    }
  }

  const handleReplace = (tempId: string, url: string) => {
    onSlidesChange(
      slides.map((s) => (s.tempId === tempId ? { ...s, image_url: url } : s))
    )
  }

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
          <div className="grid grid-cols-5 gap-3">
            {slides.map((slide) => (
              <SortableSlide
                key={slide.tempId}
                item={slide}
                onReplace={(url) => handleReplace(slide.tempId, url)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <p className="mt-3 text-xs text-gray-400">
        Cliquez sur une image pour la remplacer. Maintenez et glissez pour
        changer l&apos;ordre.
      </p>
    </div>
  )
}

function SortableSlide({
  item,
  onReplace,
}: {
  item: HeroSlideLocal
  onReplace: (url: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.tempId })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const token = getAuthToken()
      const res = await fetch(UPLOAD_URL, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      onReplace(data.url)
    } catch {
      toast.error('Erreur upload')
    }
    setUploading(false)
    e.target.value = ''
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      fileInputRef.current?.click()
    }
    e.stopPropagation()
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="hero-image-thumb" onClick={handleClick}>
        {item.image_url ? (
          <>
            <img src={item.image_url} alt="" draggable={false} />
            <div className="hero-image-overlay">
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-50">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            ) : (
              <Camera className="h-5 w-5 text-gray-300" />
            )}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}
