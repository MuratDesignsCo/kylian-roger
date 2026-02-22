'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2 } from 'lucide-react'
import { getAuthToken } from '@/components/admin/AuthGuard'
import { UPLOAD_URL } from '@/lib/graphql/client'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  bucket?: string
  folder?: string
  accept?: 'image' | 'video'
  label?: string
  aspectRatio?: string
}

const IMAGE_ACCEPT = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/avif': ['.avif'],
  'image/svg+xml': ['.svg'],
}

const VIDEO_ACCEPT = {
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'video/quicktime': ['.mov'],
}

const IMAGE_MAX_SIZE = 5 * 1024 * 1024 // 5MB
const VIDEO_MAX_SIZE = 100 * 1024 * 1024 // 100MB

export default function ImageUpload({
  value,
  onChange,
  bucket = 'portfolio',
  folder = '',
  accept = 'image',
  label,
  aspectRatio,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isVideo = accept === 'video'
  const maxSize = isVideo ? VIDEO_MAX_SIZE : IMAGE_MAX_SIZE
  const acceptTypes = isVideo ? VIDEO_ACCEPT : IMAGE_ACCEPT

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setError(null)
      setUploading(true)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const token = getAuthToken()
        const res = await fetch(UPLOAD_URL, {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Upload failed')
        }

        const data = await res.json()
        onChange(data.url)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setUploading(false)
      }
    },
    [bucket, folder, onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptTypes,
    maxSize,
    multiple: false,
    disabled: uploading,
    onDropRejected: (rejections) => {
      const rejection = rejections[0]
      if (rejection?.errors[0]?.code === 'file-too-large') {
        setError(
          `File too large. Max size: ${isVideo ? '100MB' : '5MB'}`
        )
      } else if (rejection?.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type')
      } else {
        setError('File rejected')
      }
    },
  })

  const handleRemove = () => {
    onChange('')
    setError(null)
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {value ? (
        <div className="relative group">
          {isVideo ? (
            <video
              src={value}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 object-cover"
              style={aspectRatio ? { aspectRatio } : { maxHeight: '240px' }}
              controls
              muted
            />
          ) : (
            <img
              src={value}
              alt="Preview"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 object-cover"
              style={aspectRatio ? { aspectRatio } : { maxHeight: '240px' }}
            />
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 text-gray-500 shadow-sm opacity-0 transition-opacity hover:bg-white hover:text-gray-900 group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          style={aspectRatio ? { aspectRatio } : undefined}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <>
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-gray-500" />
              <p className="text-sm text-gray-500">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="mb-3 h-8 w-8 text-gray-500" />
              <p className="text-sm text-gray-500">
                {isDragActive
                  ? 'Drop the file here'
                  : `Drag & drop or click to upload ${isVideo ? 'a video' : 'an image'}`}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Max {isVideo ? '100MB' : '5MB'}
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
