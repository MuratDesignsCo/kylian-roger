import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

// GET /api/homepage — fetch all homepage-related data
export async function GET() {
  try {
    const supabase = createServerSupabase()

    const [heroResult, featuredResult, hoverResult, projectsResult] =
      await Promise.all([
        supabase
          .from('hero_images')
          .select('*')
          .order('sort_order', { ascending: true }),
        supabase
          .from('homepage_featured_works')
          .select('*, projects(*)')
          .order('sort_order', { ascending: true }),
        supabase
          .from('about_hover_images')
          .select('*')
          .order('link_identifier', { ascending: true }),
        supabase
          .from('projects')
          .select('id, title, slug, category, thumbnail_url')
          .eq('is_published', true)
          .order('sort_order', { ascending: true }),
      ])

    if (heroResult.error) {
      return NextResponse.json(
        { error: heroResult.error.message },
        { status: 500 }
      )
    }
    if (featuredResult.error) {
      return NextResponse.json(
        { error: featuredResult.error.message },
        { status: 500 }
      )
    }
    if (hoverResult.error) {
      return NextResponse.json(
        { error: hoverResult.error.message },
        { status: 500 }
      )
    }
    if (projectsResult.error) {
      return NextResponse.json(
        { error: projectsResult.error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      heroImages: heroResult.data,
      featuredWorks: featuredResult.data,
      hoverImages: hoverResult.data,
      allProjects: projectsResult.data,
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/homepage — update homepage data (hero images, featured works, hover images)
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { heroImages, featuredWorks, hoverImages } = await request.json()

    // --- Hero Images: delete all, then insert new ---
    if (heroImages !== undefined) {
      const { error: deleteHeroError } = await supabase
        .from('hero_images')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000') // delete all rows

      if (deleteHeroError) {
        return NextResponse.json(
          { error: `hero_images delete: ${deleteHeroError.message}` },
          { status: 500 }
        )
      }

      if (heroImages.length > 0) {
        const { error: insertHeroError } = await supabase
          .from('hero_images')
          .insert(heroImages)

        if (insertHeroError) {
          return NextResponse.json(
            { error: `hero_images insert: ${insertHeroError.message}` },
            { status: 500 }
          )
        }
      }
    }

    // --- Featured Works: delete all, then insert new ---
    if (featuredWorks !== undefined) {
      const { error: deleteFeaturedError } = await supabase
        .from('homepage_featured_works')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000')

      if (deleteFeaturedError) {
        return NextResponse.json(
          { error: `homepage_featured_works delete: ${deleteFeaturedError.message}` },
          { status: 500 }
        )
      }

      if (featuredWorks.length > 0) {
        const { error: insertFeaturedError } = await supabase
          .from('homepage_featured_works')
          .insert(featuredWorks)

        if (insertFeaturedError) {
          return NextResponse.json(
            { error: `homepage_featured_works insert: ${insertFeaturedError.message}` },
            { status: 500 }
          )
        }
      }
    }

    // --- Hover Images: update each by link_identifier ---
    if (hoverImages !== undefined) {
      for (const img of hoverImages) {
        const { link_identifier, ...updateData } = img
        const { error: updateError } = await supabase
          .from('about_hover_images')
          .update(updateData)
          .eq('link_identifier', link_identifier)

        if (updateError) {
          return NextResponse.json(
            { error: `about_hover_images update (${link_identifier}): ${updateError.message}` },
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
