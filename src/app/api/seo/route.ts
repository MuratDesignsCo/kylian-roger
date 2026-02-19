import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

// GET /api/seo — fetch all SEO records ordered by page_slug
export async function GET() {
  try {
    const supabase = createServerSupabase()

    const { data, error } = await supabase
      .from('pages_seo')
      .select('*')
      .order('page_slug', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/seo — upsert an array of SEO records by id
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const records: Array<Record<string, unknown>> = await request.json()

    if (!Array.isArray(records)) {
      return NextResponse.json(
        { error: 'Request body must be an array of SEO records' },
        { status: 400 }
      )
    }

    for (const record of records) {
      const { error } = await supabase
        .from('pages_seo')
        .upsert(record, { onConflict: 'id' })

      if (error) {
        return NextResponse.json(
          { error: `pages_seo upsert (${record.id}): ${error.message}` },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
