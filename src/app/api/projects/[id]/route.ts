import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/projects/[id] — get a single project by id
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = createServerSupabase()

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
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

// PUT /api/projects/[id] — update a project by id
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = createServerSupabase()
    const body = await request.json()

    const { data, error } = await supabase
      .from('projects')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
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

// DELETE /api/projects/[id] — delete a project by id (cascade handled by DB)
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = createServerSupabase()

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
