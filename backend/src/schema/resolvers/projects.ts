import pool from '../../db.js'
import { requireAuth, type GqlContext } from '../../auth.js'

export const projectsResolvers = {
  Query: {
    projects: async (_: unknown, { category, published }: { category?: string; published?: boolean }) => {
      let query = 'SELECT * FROM projects'
      const conditions: string[] = []
      const values: unknown[] = []
      let i = 1

      if (category) {
        conditions.push(`category = $${i++}`)
        values.push(category)
      }
      if (published !== undefined) {
        conditions.push(`is_published = $${i++}`)
        values.push(published)
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ')
      }
      query += ' ORDER BY project_date DESC NULLS LAST, year DESC, created_at DESC'

      const { rows } = await pool.query(query, values)
      return rows
    },

    project: async (_: unknown, { slug }: { slug: string }) => {
      const { rows } = await pool.query('SELECT * FROM projects WHERE slug = $1', [slug])
      return rows[0] || null
    },

    projectById: async (_: unknown, { id }: { id: string }) => {
      const { rows } = await pool.query('SELECT * FROM projects WHERE id = $1', [id])
      return rows[0] || null
    },
  },

  Project: {
    // Format DATE as "YYYY-MM-DD" string (pg driver returns Date objects)
    project_date: (parent: { project_date: Date | null }) => {
      if (!parent.project_date) return null
      const d = new Date(parent.project_date)
      return d.toISOString().split('T')[0]
    },

    gallery_rows: async (parent: { id: string }) => {
      const { rows } = await pool.query(
        'SELECT * FROM project_gallery_rows WHERE project_id = $1 ORDER BY sort_order',
        [parent.id]
      )
      return rows
    },

    hero_slides: async (parent: { id: string }) => {
      const { rows } = await pool.query(
        'SELECT * FROM project_hero_slides WHERE project_id = $1 ORDER BY sort_order',
        [parent.id]
      )
      return rows
    },

    blocks: async (parent: { id: string }) => {
      const { rows } = await pool.query(
        'SELECT * FROM project_blocks WHERE project_id = $1 ORDER BY sort_order',
        [parent.id]
      )
      return rows
    },
  },

  ProjectGalleryRow: {
    images: async (parent: { id: string }) => {
      const { rows } = await pool.query(
        'SELECT * FROM project_gallery_images WHERE row_id = $1 ORDER BY sort_order',
        [parent.id]
      )
      return rows
    },
  },

  ProjectBlock: {
    images: async (parent: { id: string }) => {
      const { rows } = await pool.query(
        'SELECT * FROM project_block_images WHERE block_id = $1 ORDER BY sort_order',
        [parent.id]
      )
      return rows
    },
  },

  Mutation: {
    createProject: async (_: unknown, { input }: { input: Record<string, unknown> }, context: GqlContext) => {
      requireAuth(context)

      // Auto-compute year from project_date if provided
      if (input.project_date && !input.year) {
        input.year = new Date(input.project_date as string).getFullYear()
      }

      const fields = [
        'slug', 'category', 'title', 'cover_image_url', 'cover_image_alt',
        'year', 'project_date', 'sort_order', 'is_published',
        'photo_subcategory', 'photo_location',
        'film_video_url', 'film_bg_image_url', 'film_subtitle', 'film_layout',
        'art_client', 'art_role', 'art_description', 'art_tags', 'art_hero_label',
        'card_label',
        'meta_title', 'meta_description', 'og_title', 'og_description', 'og_image_url',
      ]
      const presentFields = fields.filter(f => input[f] !== undefined)
      const placeholders = presentFields.map((_, i) => `$${i + 1}`)
      const values = presentFields.map(f => input[f])

      const { rows } = await pool.query(
        `INSERT INTO projects (${presentFields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
        values
      )
      return rows[0]
    },

    updateProject: async (_: unknown, { id, input }: { id: string; input: Record<string, unknown> }, context: GqlContext) => {
      requireAuth(context)

      // Auto-compute year from project_date if provided
      if (input.project_date) {
        input.year = new Date(input.project_date as string).getFullYear()
      }

      const fields = Object.keys(input).filter(k => input[k] !== undefined)
      if (fields.length === 0) {
        const { rows } = await pool.query('SELECT * FROM projects WHERE id = $1', [id])
        return rows[0]
      }

      const setClauses = fields.map((f, i) => `${f} = $${i + 1}`)
      const values = [...fields.map(f => input[f]), id]

      const { rows } = await pool.query(
        `UPDATE projects SET ${setClauses.join(', ')} WHERE id = $${fields.length + 1} RETURNING *`,
        values
      )
      return rows[0]
    },

    deleteProject: async (_: unknown, { id }: { id: string }, context: GqlContext) => {
      requireAuth(context)
      const { rowCount } = await pool.query('DELETE FROM projects WHERE id = $1', [id])
      return (rowCount ?? 0) > 0
    },

    saveGalleryRows: async (_: unknown, { projectId, rows: rowInputs }: { projectId: string; rows: Array<Record<string, unknown>> }, context: GqlContext) => {
      requireAuth(context)

      // Delete existing rows (cascade deletes images)
      await pool.query('DELETE FROM project_gallery_rows WHERE project_id = $1', [projectId])

      const results = []
      for (const row of rowInputs) {
        const { rows } = await pool.query(
          'INSERT INTO project_gallery_rows (project_id, sort_order, layout) VALUES ($1, $2, $3) RETURNING *',
          [projectId, row.sort_order, row.layout]
        )
        const newRow = rows[0]

        const images = (row.images as Array<Record<string, unknown>>) || []
        const rowImages = []
        for (const img of images) {
          const { rows: imgRows } = await pool.query(
            'INSERT INTO project_gallery_images (row_id, project_id, image_url, alt_text, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [newRow.id, projectId, img.image_url, img.alt_text || '', img.sort_order || 0]
          )
          rowImages.push(imgRows[0])
        }

        results.push({ ...newRow, images: rowImages })
      }
      return results
    },

    saveHeroSlides: async (_: unknown, { projectId, slides }: { projectId: string; slides: Array<Record<string, unknown>> }, context: GqlContext) => {
      requireAuth(context)

      await pool.query('DELETE FROM project_hero_slides WHERE project_id = $1', [projectId])

      const results = []
      for (const slide of slides) {
        const { rows } = await pool.query(
          'INSERT INTO project_hero_slides (project_id, image_url, alt_text, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
          [projectId, slide.image_url, slide.alt_text || '', slide.sort_order || 0]
        )
        results.push(rows[0])
      }
      return results
    },

    saveProjectBlocks: async (_: unknown, { projectId, blocks }: { projectId: string; blocks: Array<Record<string, unknown>> }, context: GqlContext) => {
      requireAuth(context)

      // Delete existing blocks (cascade deletes images)
      await pool.query('DELETE FROM project_blocks WHERE project_id = $1', [projectId])

      const results = []
      for (const block of blocks) {
        const { rows } = await pool.query(
          `INSERT INTO project_blocks (project_id, block_type, sort_order, context_label, context_heading, context_text, gallery_layout, deliverables_items)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [
            projectId, block.block_type, block.sort_order,
            block.context_label || null, block.context_heading || null, block.context_text || null,
            block.gallery_layout || null,
            block.deliverables_items ? JSON.stringify(block.deliverables_items) : null,
          ]
        )
        const newBlock = rows[0]

        const images = (block.images as Array<Record<string, unknown>>) || []
        const blockImages = []
        for (const img of images) {
          const { rows: imgRows } = await pool.query(
            'INSERT INTO project_block_images (block_id, image_url, alt_text, image_type, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [newBlock.id, img.image_url, img.alt_text || '', img.image_type || 'landscape', img.sort_order || 0]
          )
          blockImages.push(imgRows[0])
        }

        results.push({ ...newBlock, images: blockImages })
      }
      return results
    },
  },
}
