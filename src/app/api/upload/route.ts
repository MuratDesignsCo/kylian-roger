import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

const IMAGE_MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const VIDEO_MAX_SIZE = 100 * 1024 * 1024 // 100 MB

// POST /api/upload — upload a file to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const formData = await request.formData()

    const file = formData.get('file') as File | null
    const bucket = (formData.get('bucket') as string) || 'images'
    const folder = (formData.get('folder') as string) || 'uploads'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Determine size limit based on file type
    const isVideo = file.type.startsWith('video/')
    const maxSize = isVideo ? VIDEO_MAX_SIZE : IMAGE_MAX_SIZE
    const maxLabel = isVideo ? '100MB' : '5MB'

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxLabel}.` },
        { status: 400 }
      )
    }

    // Build storage path: folder/timestamp-filename
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = `${folder}/${timestamp}-${safeName}`

    // Read file into buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: filePath,
      bucket,
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
