'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import SortableList from './SortableList'
import MultiImageUpload from './MultiImageUpload'

// ---------- Types ----------

type GalleryLayout = 'full' | 'pair' | 'trio' | 'pair-full'
type ImageType = 'landscape' | 'portrait' | 'full'

interface GalleryImage {
  image_url: string
  alt_text: string
  image_type: ImageType
}

interface ContextBlock {
  id: string
  block_type: 'context'
  context_label: string
  context_heading: string
  context_text: string
}

interface GalleryBlock {
  id: string
  block_type: 'gallery'
  gallery_layout: GalleryLayout
  images: GalleryImage[]
}

interface DeliverableItem {
  number: string
  name: string
}

interface DeliverablesBlock {
  id: string
  block_type: 'deliverables'
  deliverables_items: DeliverableItem[]
}

type Block = ContextBlock | GalleryBlock | DeliverablesBlock
type BlockType = Block['block_type']

interface ArtDirectionBlocksProps {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
}

// ---------- Constants ----------

const BLOCK_TYPE_OPTIONS: { value: BlockType; label: string }[] = [
  { value: 'context', label: 'Context' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'deliverables', label: 'Deliverables' },
]

const GALLERY_LAYOUT_OPTIONS: { value: GalleryLayout; label: string; maxImages: number }[] = [
  { value: 'full', label: 'Full', maxImages: 1 },
  { value: 'pair', label: 'Pair', maxImages: 2 },
  { value: 'trio', label: 'Trio', maxImages: 3 },
  { value: 'pair-full', label: 'Pair + Full', maxImages: 3 },
]

const IMAGE_TYPE_OPTIONS: { value: ImageType; label: string }[] = [
  { value: 'landscape', label: 'Landscape' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'full', label: 'Full' },
]

function generateId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function getMaxImages(layout: GalleryLayout): number {
  return GALLERY_LAYOUT_OPTIONS.find((o) => o.value === layout)?.maxImages ?? 1
}

// ---------- Main Component ----------

export default function ArtDirectionBlocks({
  blocks,
  onChange,
}: ArtDirectionBlocksProps) {
  const [addType, setAddType] = useState<BlockType>('context')

  const handleAddBlock = () => {
    let newBlock: Block

    switch (addType) {
      case 'context':
        newBlock = {
          id: generateId(),
          block_type: 'context',
          context_label: '',
          context_heading: '',
          context_text: '',
        }
        break
      case 'gallery':
        newBlock = {
          id: generateId(),
          block_type: 'gallery',
          gallery_layout: 'full',
          images: [],
        }
        break
      case 'deliverables':
        newBlock = {
          id: generateId(),
          block_type: 'deliverables',
          deliverables_items: [{ number: '', name: '' }],
        }
        break
    }

    onChange([...blocks, newBlock])
  }

  const handleRemoveBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index))
  }

  const handleUpdateBlock = (index: number, updated: Block) => {
    onChange(blocks.map((b, i) => (i === index ? updated : b)))
  }

  const handleReorder = (reordered: Block[]) => {
    onChange(reordered)
  }

  return (
    <div className="space-y-4">
      {blocks.length > 0 && (
        <SortableList
          items={blocks}
          onReorder={handleReorder}
          getId={(block) => block.id}
          renderItem={(block, index) => (
            <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
              {/* Block header */}
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded bg-zinc-700 px-2 py-0.5 text-xs font-medium uppercase text-zinc-300">
                  {block.block_type}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveBlock(index)}
                  className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Block content by type */}
              {block.block_type === 'context' && (
                <ContextBlockEditor
                  block={block}
                  onChange={(updated) => handleUpdateBlock(index, updated)}
                />
              )}
              {block.block_type === 'gallery' && (
                <GalleryBlockEditor
                  block={block}
                  onChange={(updated) => handleUpdateBlock(index, updated)}
                />
              )}
              {block.block_type === 'deliverables' && (
                <DeliverablesBlockEditor
                  block={block}
                  onChange={(updated) => handleUpdateBlock(index, updated)}
                />
              )}
            </div>
          )}
        />
      )}

      {/* Add block controls */}
      <div className="flex items-center gap-3">
        <select
          value={addType}
          onChange={(e) => setAddType(e.target.value as BlockType)}
          className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-zinc-500 focus:outline-none"
        >
          {BLOCK_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAddBlock}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-600"
        >
          <Plus className="h-4 w-4" />
          Add block
        </button>
      </div>
    </div>
  )
}

// ---------- Context Block Editor ----------

function ContextBlockEditor({
  block,
  onChange,
}: {
  block: ContextBlock
  onChange: (block: ContextBlock) => void
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-400">
          Label
        </label>
        <input
          type="text"
          value={block.context_label}
          onChange={(e) =>
            onChange({ ...block, context_label: e.target.value })
          }
          placeholder="e.g. Context, Challenge, Approach"
          className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-400">
          Heading
        </label>
        <input
          type="text"
          value={block.context_heading}
          onChange={(e) =>
            onChange({ ...block, context_heading: e.target.value })
          }
          placeholder="Section heading"
          className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-400">
          Text
        </label>
        <textarea
          value={block.context_text}
          onChange={(e) =>
            onChange({ ...block, context_text: e.target.value })
          }
          placeholder="Description text..."
          rows={4}
          className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
        />
      </div>
    </div>
  )
}

// ---------- Gallery Block Editor ----------

function GalleryBlockEditor({
  block,
  onChange,
}: {
  block: GalleryBlock
  onChange: (block: GalleryBlock) => void
}) {
  const maxImages = getMaxImages(block.gallery_layout)

  const handleLayoutChange = (layout: GalleryLayout) => {
    const newMax = getMaxImages(layout)
    onChange({
      ...block,
      gallery_layout: layout,
      images: block.images.slice(0, newMax),
    })
  }

  const handleImagesChange = (
    images: { image_url: string; alt_text: string }[]
  ) => {
    onChange({
      ...block,
      images: images.map((img, i) => ({
        image_url: img.image_url,
        alt_text: img.alt_text,
        image_type: block.images[i]?.image_type ?? 'landscape',
      })),
    })
  }

  const handleImageTypeChange = (index: number, imageType: ImageType) => {
    const updated = block.images.map((img, i) =>
      i === index ? { ...img, image_type: imageType } : img
    )
    onChange({ ...block, images: updated })
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-400">
          Layout
        </label>
        <select
          value={block.gallery_layout}
          onChange={(e) =>
            handleLayoutChange(e.target.value as GalleryLayout)
          }
          className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-zinc-500 focus:outline-none"
        >
          {GALLERY_LAYOUT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} ({opt.maxImages} image{opt.maxImages > 1 ? 's' : ''})
            </option>
          ))}
        </select>
      </div>

      <MultiImageUpload
        images={block.images.map((img) => ({
          image_url: img.image_url,
          alt_text: img.alt_text,
        }))}
        onChange={handleImagesChange}
        maxImages={maxImages}
        folder="art-direction"
      />

      {/* Per-image type selector */}
      {block.images.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-zinc-400">
            Image types
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {block.images.map((img, index) => (
              <div
                key={`${img.image_url}-${index}`}
                className="flex items-center gap-2"
              >
                <img
                  src={img.image_url}
                  alt={img.alt_text}
                  className="h-10 w-10 rounded border border-zinc-700 object-cover"
                />
                <select
                  value={img.image_type}
                  onChange={(e) =>
                    handleImageTypeChange(index, e.target.value as ImageType)
                  }
                  className="flex-1 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-200 focus:border-zinc-500 focus:outline-none"
                >
                  {IMAGE_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------- Deliverables Block Editor ----------

function DeliverablesBlockEditor({
  block,
  onChange,
}: {
  block: DeliverablesBlock
  onChange: (block: DeliverablesBlock) => void
}) {
  const handleItemChange = (
    index: number,
    field: 'number' | 'name',
    value: string
  ) => {
    const updated = block.deliverables_items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    onChange({ ...block, deliverables_items: updated })
  }

  const handleAddItem = () => {
    onChange({
      ...block,
      deliverables_items: [
        ...block.deliverables_items,
        { number: '', name: '' },
      ],
    })
  }

  const handleRemoveItem = (index: number) => {
    onChange({
      ...block,
      deliverables_items: block.deliverables_items.filter(
        (_, i) => i !== index
      ),
    })
  }

  return (
    <div className="space-y-3">
      {block.deliverables_items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            value={item.number}
            onChange={(e) =>
              handleItemChange(index, 'number', e.target.value)
            }
            placeholder="#"
            className="w-16 rounded border border-zinc-700 bg-zinc-800 px-2 py-2 text-center text-sm text-zinc-200 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
          />
          <input
            type="text"
            value={item.name}
            onChange={(e) =>
              handleItemChange(index, 'name', e.target.value)
            }
            placeholder="Deliverable name"
            className="flex-1 rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => handleRemoveItem(index)}
            disabled={block.deliverables_items.length <= 1}
            className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-red-400 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddItem}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
      >
        <Plus className="h-3.5 w-3.5" />
        Add deliverable
      </button>
    </div>
  )
}
