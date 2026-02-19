'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2 } from 'lucide-react'

interface ImageItem {
  image_url: string
  alt_text: string
}

interface MultiImageUploadProps {
  images: ImageItem[]
  onChange: (images: ImageItem[]) => void
  bucket?: string
  folder?: string
  label?: string
  maxImages?: number
}

const IMAGE_ACCEPT = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/avif': ['.avif'],
}

const IMAGE_MAX_SIZE = 5 * 1024 * 1024 // 5MB

export default function MultiImageUpload({
  images,
  onChange,
  bucket = 'portfolio',
  folder = '',
  label,
  maxImages,
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      // Check max images limit
      const remaining = maxImages ? maxImages - images.length : Infinity
      const filesToUpload = acceptedFiles.slice(0, remaining)

      if (filesToUpload.length === 0) {
        setError(`Maximum ${maxImages} images allowed`)
        return
      }

      setError(null)
      setUploading(true)
      setProgress({ current: 0, total: filesToUpload.length })

      const newImages: ImageItem[] = [...images]

      for (let i = 0; i < filesToUpload.length; i++) {
        setProgress({ current: i + 1, total: filesToUpload.length })

        try {
          const formData = new FormData()
          formData.append('file', filesToUpload[i])
          formData.append('bucket', bucket)
          if (folder) formData.append('folder', folder)

          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (!res.ok) {
            const data = await res.json()
            throw new Error(data.error || 'Upload failed')
          }

          const data = await res.json()
          newImages.push({
            image_url: data.url,
            alt_text: '',
          })
        } catch (err) {
          setError(
            `Failed to upload ${filesToUpload[i].name}: ${
              err instanceof Error ? err.message : 'Unknown error'
            }`
          )
        }
      }

      onChange(newImages)
      setUploading(false)
      setProgress({ current: 0, total: 0 })
    },
    [images, onChange, bucket, folder, maxImages]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: IMAGE_ACCEPT,
    maxSize: IMAGE_MAX_SIZE,
    multiple: true,
    disabled: uploading || (maxImages !== undefined && images.length >= maxImages),
    onDropRejected: (rejections) => {
      const firstError = rejections[0]?.errors[0]
      if (firstError?.code === 'file-too-large') {
        setError('One or more files exceed the 5MB limit')
      } else if (firstError?.code === 'file-invalid-type') {
        setError('Invalid file type. Accepted: JPEG, PNG, WebP, AVIF')
      } else {
        setError('One or more files were rejected')
      }
    },
  })

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index)
    onChange(updated)
  }

  const handleAltTextChange = (index: number, altText: string) => {
    const updated = images.map((img, i) =>
      i === index ? { ...img, alt_text: altText } : img
    )
    onChange(updated)
  }

  const isAtLimit = maxImages !== undefined && images.length >= maxImages

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-zinc-300">
          {label}
        </label>
      )}

      {/* Drop zone */}
      {!isAtLimit && (
        <div
          {...getRootProps()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-6 transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-zinc-700 bg-zinc-800 hover:border-zinc-500'
          } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <>
              <Loader2 className="mb-2 h-6 w-6 animate-spin text-zinc-400" />
              <p className="text-sm text-zinc-400">
                Uploading {progress.current}/{progress.total}...
              </p>
            </>
          ) : (
            <>
              <Upload className="mb-2 h-6 w-6 text-zinc-400" />
              <p className="text-sm text-zinc-400">
                {isDragActive
                  ? 'Drop images here'
                  : 'Drag & drop or click to upload images'}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Max 5MB per image
                {maxImages && ` \u00B7 ${images.length}/${maxImages}`}
              </p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img, index) => (
            <div key={`${img.image_url}-${index}`} className="space-y-1.5">
              <div className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800">
                <img
                  src={img.image_url}
                  alt={img.alt_text || `Image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-1.5 right-1.5 rounded-full bg-zinc-900/80 p-1 text-zinc-400 opacity-0 transition-opacity hover:bg-zinc-900 hover:text-white group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <input
                type="text"
                value={img.alt_text}
                onChange={(e) => handleAltTextChange(index, e.target.value)}
                placeholder="Alt text"
                className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
