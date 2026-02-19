import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

// GET /api/contact — fetch all contact page data
export async function GET() {
  try {
    const supabase = createServerSupabase()

    const [pageResult, blocksResult, awardsResult, btsResult] =
      await Promise.all([
        supabase
          .from('contact_page')
          .select('*')
          .eq('id', 'main')
          .single(),
        supabase
          .from('contact_info_blocks')
          .select('*')
          .order('sort_order', { ascending: true }),
        supabase
          .from('awards')
          .select('*')
          .order('sort_order', { ascending: true }),
        supabase
          .from('bts_images')
          .select('*')
          .order('sort_order', { ascending: true }),
      ])

    if (pageResult.error) {
      return NextResponse.json(
        { error: pageResult.error.message },
        { status: 500 }
      )
    }
    if (blocksResult.error) {
      return NextResponse.json(
        { error: blocksResult.error.message },
        { status: 500 }
      )
    }
    if (awardsResult.error) {
      return NextResponse.json(
        { error: awardsResult.error.message },
        { status: 500 }
      )
    }
    if (btsResult.error) {
      return NextResponse.json(
        { error: btsResult.error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      page: pageResult.data,
      infoBlocks: blocksResult.data,
      awards: awardsResult.data,
      btsImages: btsResult.data,
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/contact — update contact page data
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { page, infoBlocks, awards, btsImages } = await request.json()

    // --- Update contact page record ---
    if (page !== undefined) {
      const { error: pageError } = await supabase
        .from('contact_page')
        .update(page)
        .eq('id', 'main')

      if (pageError) {
        return NextResponse.json(
          { error: `contact_page update: ${pageError.message}` },
          { status: 500 }
        )
      }
    }

    // --- Info Blocks: delete all, then insert new ---
    if (infoBlocks !== undefined) {
      const { error: deleteBlocksError } = await supabase
        .from('contact_info_blocks')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000')

      if (deleteBlocksError) {
        return NextResponse.json(
          { error: `contact_info_blocks delete: ${deleteBlocksError.message}` },
          { status: 500 }
        )
      }

      if (infoBlocks.length > 0) {
        const { error: insertBlocksError } = await supabase
          .from('contact_info_blocks')
          .insert(infoBlocks)

        if (insertBlocksError) {
          return NextResponse.json(
            { error: `contact_info_blocks insert: ${insertBlocksError.message}` },
            { status: 500 }
          )
        }
      }
    }

    // --- Awards: delete all, then insert new ---
    if (awards !== undefined) {
      const { error: deleteAwardsError } = await supabase
        .from('awards')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000')

      if (deleteAwardsError) {
        return NextResponse.json(
          { error: `awards delete: ${deleteAwardsError.message}` },
          { status: 500 }
        )
      }

      if (awards.length > 0) {
        const { error: insertAwardsError } = await supabase
          .from('awards')
          .insert(awards)

        if (insertAwardsError) {
          return NextResponse.json(
            { error: `awards insert: ${insertAwardsError.message}` },
            { status: 500 }
          )
        }
      }
    }

    // --- BTS Images: delete all, then insert new ---
    if (btsImages !== undefined) {
      const { error: deleteBtsError } = await supabase
        .from('bts_images')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000')

      if (deleteBtsError) {
        return NextResponse.json(
          { error: `bts_images delete: ${deleteBtsError.message}` },
          { status: 500 }
        )
      }

      if (btsImages.length > 0) {
        const { error: insertBtsError } = await supabase
          .from('bts_images')
          .insert(btsImages)

        if (insertBtsError) {
          return NextResponse.json(
            { error: `bts_images insert: ${insertBtsError.message}` },
            { status: 500 }
          )
        }
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
