'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Link as LinkIcon, Unlink } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write something...',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-invert prose-sm max-w-none px-4 py-3 min-h-[120px] focus:outline-none text-zinc-200',
      },
    },
  })

  if (!editor) return null

  const handleSetLink = () => {
    const url = window.prompt('URL:')
    if (url === null) return

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    const hoverImg = window.prompt('Hover image URL (optional):')

    const attrs: { href: string; 'data-hover-img'?: string } = { href: url }
    if (hoverImg) {
      attrs['data-hover-img'] = hoverImg
    }

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink(attrs as { href: string })
      .run()
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-zinc-700 px-2 py-1.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-zinc-700" />

        <ToolbarButton
          onClick={handleSetLink}
          active={editor.isActive('link')}
          title="Add link"
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          active={false}
          disabled={!editor.isActive('link')}
          title="Remove link"
        >
          <Unlink className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}

function ToolbarButton({
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
          ? 'bg-zinc-600 text-white'
          : 'text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
      } ${disabled ? 'cursor-not-allowed opacity-30' : ''}`}
    >
      {children}
    </button>
  )
}
