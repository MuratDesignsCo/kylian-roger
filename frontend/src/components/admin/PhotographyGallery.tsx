'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import SortableList from './SortableList'
import MultiImageUpload from './MultiImageUpload'

type RowLayout = 'full' | 'half' | 'third'

interface RowImage {
  image_url: string
  alt_text: string
  sort_order: number
}

interface GalleryRow {
  id: string
  layout: RowLayout
  images: RowImage[]
}

interface PhotographyGalleryProps {
  rows: GalleryRow[]
  onChange: (rows: GalleryRow[]) => void
}

const LAYOUT_OPTIONS: { value: RowLayout; label: string; cols: number }[] = [
  { value: 'full', label: 'Full (1 photo)', cols: 1 },
  { value: 'half', label: 'Half (2 photos)', cols: 2 },
  { value: 'third', label: 'Third (3 photos)', cols: 3 },
]

function getLayoutCols(layout: RowLayout): number {
  return LAYOUT_OPTIONS.find((o) => o.value === layout)?.cols ?? 1
}

function generateId(): string {
  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function PhotographyGallery({
  rows,
  onChange,
}: PhotographyGalleryProps) {
  const [addLayout, setAddLayout] = useState<RowLayout>('full')

  const handleAddRow = () => {
    const newRow: GalleryRow = {
      id: generateId(),
      layout: addLayout,
      images: [],
    }
    onChange([...rows, newRow])
  }

  const handleRemoveRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index))
  }

  const handleRowLayoutChange = (index: number, layout: RowLayout) => {
    const updated = rows.map((row, i) =>
      i === index
        ? {
            ...row,
            layout,
            // Trim images if new layout has fewer columns
            images: row.images.slice(0, getLayoutCols(layout)),
          }
        : row
    )
    onChange(updated)
  }

  const handleRowImagesChange = (
    index: number,
    images: { image_url: string; alt_text: string }[]
  ) => {
    const updated = rows.map((row, i) =>
      i === index
        ? {
            ...row,
            images: images.map((img, si) => ({
              ...img,
              sort_order: si,
            })),
          }
        : row
    )
    onChange(updated)
  }

  const handleReorder = (reorderedRows: GalleryRow[]) => {
    onChange(reorderedRows)
  }

  return (
    <div className="space-y-4">
      {/* Rows list */}
      {rows.length > 0 && (
        <SortableList
          items={rows}
          onReorder={handleReorder}
          getId={(row) => row.id}
          renderItem={(row, index) => (
            <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-zinc-500 uppercase">
                    Row {index + 1}
                  </span>
                  <select
                    value={row.layout}
                    onChange={(e) =>
                      handleRowLayoutChange(index, e.target.value as RowLayout)
                    }
                    className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-200 focus:border-zinc-500 focus:outline-none"
                  >
                    {LAYOUT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveRow(index)}
                  className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Images for this row */}
              <MultiImageUpload
                images={row.images.map((img) => ({
                  image_url: img.image_url,
                  alt_text: img.alt_text,
                }))}
                onChange={(images) => handleRowImagesChange(index, images)}
                maxImages={getLayoutCols(row.layout)}
                folder="photography"
              />
            </div>
          )}
        />
      )}

      {/* Add row controls */}
      <div className="flex items-center gap-3">
        <select
          value={addLayout}
          onChange={(e) => setAddLayout(e.target.value as RowLayout)}
          className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-zinc-500 focus:outline-none"
        >
          {LAYOUT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAddRow}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-600"
        >
          <Plus className="h-4 w-4" />
          Add row
        </button>
      </div>
    </div>
  )
}
