import pool from '../../db.js'
import { requireAuth, type GqlContext } from '../../auth.js'

export const seoResolvers = {
  Query: {
    seoPages: async () => {
      const { rows } = await pool.query('SELECT * FROM pages_seo ORDER BY page_slug')
      return rows
    },

    seoPage: async (_: unknown, { slug }: { slug: string }) => {
      const { rows } = await pool.query('SELECT * FROM pages_seo WHERE page_slug = $1', [slug])
      return rows[0] || null
    },
  },

  Mutation: {
    upsertSeoPages: async (_: unknown, { input }: { input: Array<Record<string, unknown>> }, context: GqlContext) => {
      requireAuth(context)

      const results = []
      for (const page of input) {
        if (page.id) {
          const { rows } = await pool.query(
            `UPDATE pages_seo SET
              page_slug = $1, meta_title = $2, meta_description = $3,
              og_title = $4, og_description = $5, og_image_url = $6
            WHERE id = $7 RETURNING *`,
            [
              page.page_slug, page.meta_title, page.meta_description,
              page.og_title || '', page.og_description || '', page.og_image_url || '',
              page.id,
            ]
          )
          if (rows[0]) results.push(rows[0])
        } else {
          const { rows } = await pool.query(
            `INSERT INTO pages_seo (page_slug, meta_title, meta_description, og_title, og_description, og_image_url)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (page_slug) DO UPDATE SET
              meta_title = EXCLUDED.meta_title,
              meta_description = EXCLUDED.meta_description,
              og_title = EXCLUDED.og_title,
              og_description = EXCLUDED.og_description,
              og_image_url = EXCLUDED.og_image_url
            RETURNING *`,
            [
              page.page_slug, page.meta_title, page.meta_description,
              page.og_title || '', page.og_description || '', page.og_image_url || '',
            ]
          )
          results.push(rows[0])
        }
      }
      return results
    },
  },
}
