import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

// GET /api/settings — get global site settings
export async function GET() {
  try {
    const supabase = createServerSupabase()

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'global')
      .single()

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

// PUT /api/settings — update global site settings
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const body = await request.json()

    const { data, error } = await supabase
      .from('site_settings')
      .update(body)
      .eq('id', 'global')
      .select()
      .single()

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
