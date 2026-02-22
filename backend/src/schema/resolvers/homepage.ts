import pool from '../../db.js'
import { requireAuth, type GqlContext } from '../../auth.js'

async function fetchHomepageData() {
  const [heroRes, featuredRes, hoverRes, projectsRes] = await Promise.all([
    pool.query('SELECT * FROM hero_images ORDER BY sort_order'),
    pool.query(`
      SELECT fw.*, row_to_json(p.*) as project
      FROM homepage_featured_works fw
      LEFT JOIN projects p ON p.id = fw.project_id
      ORDER BY fw.sort_order
    `),
    pool.query('SELECT * FROM about_hover_images ORDER BY link_identifier'),
    pool.query("SELECT * FROM projects WHERE is_published = true ORDER BY sort_order ASC, created_at DESC"),
  ])

  return {
    heroImages: heroRes.rows,
    featuredWorks: featuredRes.rows,
    hoverImages: hoverRes.rows,
    projects: projectsRes.rows,
  }
}

export const homepageResolvers = {
  Query: {
    homepage: fetchHomepageData,
  },

  HomepageFeaturedWork: {
    project: (parent: { project: unknown; project_id: string }) => {
      // Already joined in the query above
      return parent.project || null
    },
  },

  Mutation: {
    updateHomepage: async (_: unknown, { input }: { input: Record<string, unknown> }, context: GqlContext) => {
      requireAuth(context)

      // Hero images: delete all, re-insert
      if (input.heroImages) {
        await pool.query('DELETE FROM hero_images')
        const images = input.heroImages as Array<Record<string, unknown>>
        for (const img of images) {
          await pool.query(
            'INSERT INTO hero_images (image_url, alt_text, sort_order) VALUES ($1, $2, $3)',
            [img.image_url, img.alt_text || '', img.sort_order || 0]
          )
        }
      }

      // Featured works: delete all, re-insert
      if (input.featuredWorks) {
        await pool.query('DELETE FROM homepage_featured_works')
        const works = input.featuredWorks as Array<Record<string, unknown>>
        for (const fw of works) {
          await pool.query(
            'INSERT INTO homepage_featured_works (project_id, slot_category, slot_index, sort_order) VALUES ($1, $2, $3, $4)',
            [fw.project_id, fw.slot_category, fw.slot_index, fw.sort_order || 0]
          )
        }
      }

      // Hover images: delete all, re-insert (same pattern as hero images)
      if (input.hoverImages) {
        await pool.query('DELETE FROM about_hover_images')
        const images = input.hoverImages as Array<Record<string, unknown>>
        for (const img of images) {
          if (img.link_identifier && img.image_url) {
            await pool.query(
              'INSERT INTO about_hover_images (link_identifier, image_url, alt_text) VALUES ($1, $2, $3)',
              [img.link_identifier, img.image_url, img.alt_text || '']
            )
          }
        }
      }

      return fetchHomepageData()
    },
  },
}
