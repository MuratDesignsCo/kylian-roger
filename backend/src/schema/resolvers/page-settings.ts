import pool from '../../db.js'
import { requireAuth, type GqlContext } from '../../auth.js'

export const pageSettingsResolvers = {
  Query: {
    pageSettings: async (_: unknown, { slug }: { slug: string }) => {
      const { rows } = await pool.query(
        'SELECT * FROM page_settings WHERE page_slug = $1',
        [slug]
      )
      return rows[0] || null
    },
  },

  Mutation: {
    upsertPageSettings: async (
      _: unknown,
      { input }: { input: { page_slug: string; page_title?: string; items_per_page?: number; items_per_page_alt?: number | null } },
      context: GqlContext
    ) => {
      requireAuth(context)

      const { rows } = await pool.query(
        `INSERT INTO page_settings (page_slug, page_title, items_per_page, items_per_page_alt)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (page_slug) DO UPDATE SET
           page_title = COALESCE($2, page_settings.page_title),
           items_per_page = COALESCE($3, page_settings.items_per_page),
           items_per_page_alt = $4
         RETURNING *`,
        [
          input.page_slug,
          input.page_title ?? null,
          input.items_per_page ?? null,
          input.items_per_page_alt ?? null,
        ]
      )
      return rows[0]
    },
  },
}
