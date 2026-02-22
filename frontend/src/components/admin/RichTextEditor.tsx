'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Link as LinkIcon,
  Unlink,
  X,
  Check,
  ExternalLink,
  FileText,
  Upload,
  Loader2,
} from 'lucide-react'
import { getAuthToken } from '@/components/admin/AuthGuard'
import { UPLOAD_URL } from '@/lib/graphql/client'

// ============================================================
// Types
// ============================================================

interface LinkPage {
  label: string
  href: string
}

interface HoverImage {
  link_identifier: string
  image_url: string
}

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  linkPages?: LinkPage[]
  hoverImages?: HoverImage[]
  onHoverImageChange?: (linkIdentifier: string, imageUrl: string) => void
}

// ============================================================
// Component
// ============================================================

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write something...',
  linkPages,
  hoverImages,
  onHoverImageChange,
}: RichTextEditorProps) {
  const [showLinkPanel, setShowLinkPanel] = useState(false)
  const [linkType, setLinkType] = useState<'page' | 'external'>('page')
  const [linkUrl, setLinkUrl] = useState('')
  const [hoverImgUrl, setHoverImgUrl] = useState('')
  const [hoverImgUploading, setHoverImgUploading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const hoverFileRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML())
    },
    editorProps: {
      handleClick: (_view, _pos, event) => {
        // Prevent navigation when clicking links inside the editor
        const target = event.target as HTMLElement
        if (target.tagName === 'A' || target.closest('a')) {
          event.preventDefault()
          return true
        }
        return false
      },
    },
  })

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setShowLinkPanel(false)
      }
    }
    if (showLinkPanel) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showLinkPanel])

  // ============================================================
  // Link popover handlers
  // ============================================================

  const openLinkPanel = useCallback(() => {
    if (!editor) return
    const currentHref = editor.getAttributes('link').href
    if (currentHref) {
      const isPage = linkPages?.some((p) => p.href === currentHref)
      setLinkType(isPage ? 'page' : 'external')
      setLinkUrl(currentHref)
      // Load existing hover image
      const existingHover = hoverImages?.find(
        (h) => h.link_identifier === currentHref
      )
      setHoverImgUrl(existingHover?.image_url || '')
    } else {
      setLinkType(linkPages ? 'page' : 'external')
      setLinkUrl('')
      setHoverImgUrl('')
    }
    setShowLinkPanel(true)
  }, [editor, linkPages, hoverImages])

  const confirmLink = () => {
    if (!editor || !linkUrl) return

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: linkUrl })
      .run()

    // Save hover image via callback
    if (onHoverImageChange) {
      onHoverImageChange(linkUrl, hoverImgUrl)
    }

    setShowLinkPanel(false)
  }

  const removeLink = () => {
    if (!editor) return
    const currentHref = editor.getAttributes('link').href
    editor.chain().focus().unsetLink().run()
    // Remove hover image
    if (onHoverImageChange && currentHref) {
      onHoverImageChange(currentHref, '')
    }
    setShowLinkPanel(false)
  }

  // ============================================================
  // Hover image upload
  // ============================================================

  const handleHoverImgUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    setHoverImgUploading(true)
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
      setHoverImgUrl(data.url)
      // Immediately notify parent so the hover image is saved in state
      if (onHoverImageChange && linkUrl) {
        onHoverImageChange(linkUrl, data.url)
      }
    } catch {
      // silently fail
    }
    setHoverImgUploading(false)
    e.target.value = ''
  }

  if (!editor) return null

  return (
    <div className="tiptap-editor relative">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-[#e5e5e5] px-3 py-2">
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Gras"
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italique"
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <div className="mx-1.5 h-4 w-px bg-[#e5e5e5]" />

        <ToolbarBtn
          onClick={openLinkPanel}
          active={editor.isActive('link')}
          title="Ajouter un lien"
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().unsetLink().run()}
          active={false}
          disabled={!editor.isActive('link')}
          title="Retirer le lien"
        >
          <Unlink className="h-3.5 w-3.5" />
        </ToolbarBtn>
      </div>

      {/* Link Panel — slides below toolbar */}
      {showLinkPanel && (
        <div
          ref={panelRef}
          className="border-b border-[#e5e5e5] bg-[#fafafa] px-4 py-4"
        >
          {/* Link type toggle */}
          {linkPages && linkPages.length > 0 && (
            <div className="mb-3 flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setLinkType('page')
                  setLinkUrl('')
                }}
                className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  linkType === 'page'
                    ? 'text-black'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <FileText className="h-3 w-3" />
                Page du site
              </button>
              <button
                type="button"
                onClick={() => {
                  setLinkType('external')
                  setLinkUrl('')
                }}
                className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  linkType === 'external'
                    ? 'text-black'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <ExternalLink className="h-3 w-3" />
                URL externe
              </button>
            </div>
          )}

          {/* URL input */}
          <div className="mb-3">
            {linkType === 'page' && linkPages ? (
              <select
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              >
                <option value="">-- Choisir une page --</option>
                {linkPages.map((page) => (
                  <option key={page.href} value={page.href}>
                    {page.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmLink()
                }}
              />
            )}
          </div>

          {/* Hover image upload — only if callback provided */}
          {onHoverImageChange && linkUrl && (
            <div className="mb-3">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Image de survol (optionnel)
              </span>
              {hoverImgUrl ? (
                <div className="group relative inline-block">
                  <img
                    src={hoverImgUrl}
                    alt="Hover preview"
                    className="h-20 w-28 border border-[#e5e5e5] object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setHoverImgUrl('')
                      if (onHoverImageChange && linkUrl) {
                        onHoverImageChange(linkUrl, '')
                      }
                    }}
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => hoverFileRef.current?.click()}
                  disabled={hoverImgUploading}
                  className="flex items-center gap-2 border border-dashed border-gray-300 px-4 py-2.5 text-xs text-gray-400 transition-colors hover:border-black hover:text-black"
                >
                  {hoverImgUploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  {hoverImgUploading
                    ? 'Upload...'
                    : 'Uploader une image'}
                </button>
              )}
              <input
                ref={hoverFileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleHoverImgUpload}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={confirmLink}
              disabled={!linkUrl}
              className="btn-primary text-[0.625rem] disabled:opacity-30"
            >
              <Check className="h-3 w-3" />
              Confirmer
            </button>
            {editor.isActive('link') && (
              <button
                type="button"
                onClick={removeLink}
                className="btn-secondary text-[0.625rem] !border-red-200 !text-red-500 hover:!border-red-500 hover:!bg-red-500 hover:!text-white"
              >
                <Unlink className="h-3 w-3" />
                Retirer le lien
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowLinkPanel(false)}
              className="ml-auto text-xs text-gray-400 transition-colors hover:text-gray-600"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* BubbleMenu — floating toolbar when text is selected */}
      <BubbleMenu editor={editor}>
        <div className="flex items-center gap-0.5 rounded-full border border-[#e5e5e5] bg-white px-1.5 py-1 shadow-lg">
          <BubbleBtn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
          >
            <Bold className="h-3 w-3" />
          </BubbleBtn>
          <BubbleBtn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
          >
            <Italic className="h-3 w-3" />
          </BubbleBtn>
          <div className="mx-0.5 h-3 w-px bg-[#e5e5e5]" />
          <BubbleBtn
            onClick={openLinkPanel}
            active={editor.isActive('link')}
          >
            <LinkIcon className="h-3 w-3" />
          </BubbleBtn>
          {editor.isActive('link') && (
            <BubbleBtn
              onClick={() => editor.chain().focus().unsetLink().run()}
              active={false}
            >
              <Unlink className="h-3 w-3" />
            </BubbleBtn>
          )}
        </div>
      </BubbleMenu>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  )
}

// ============================================================
// Toolbar button
// ============================================================

function ToolbarBtn({
  children,
  onClick,
  active,
  disabled,
  title,
}: {
  children: React.ReactNode
  onClick: () => void
  active: boolean
  disabled?: boolean
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded p-1.5 transition-colors ${
        active
          ? 'bg-black text-white'
          : 'text-gray-400 hover:bg-gray-100 hover:text-black'
      } ${disabled ? 'cursor-not-allowed opacity-20' : ''}`}
    >
      {children}
    </button>
  )
}

// ============================================================
// Bubble menu button (smaller)
// ============================================================

function BubbleBtn({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode
  onClick: () => void
  active: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full p-1.5 transition-colors ${
        active
          ? 'bg-black text-white'
          : 'text-gray-500 hover:bg-gray-100 hover:text-black'
      }`}
    >
      {children}
    </button>
  )
}
