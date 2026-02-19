import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

// GET /api/projects — list all projects, optional ?category= filter
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let query = supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

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

// POST /api/projects — create a new project
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const body = await request.json()

    const { data, error } = await supabase
      .from('projects')
      .insert(body)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
