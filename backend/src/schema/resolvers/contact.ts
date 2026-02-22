import pool from '../../db.js'
import { requireAuth, type GqlContext } from '../../auth.js'

async function fetchContactData() {
  const [pageRes, blocksRes, awardsRes, btsRes, mkRes] = await Promise.all([
    pool.query("SELECT * FROM contact_page WHERE id = 'main'"),
    pool.query('SELECT * FROM contact_info_blocks ORDER BY sort_order'),
    pool.query('SELECT * FROM awards ORDER BY sort_order'),
    pool.query('SELECT * FROM bts_images ORDER BY sort_order'),
    pool.query('SELECT * FROM media_kit_buttons ORDER BY sort_order'),
  ])

  return {
    page: pageRes.rows[0] || {
      id: 'main', title: 'CONTACT', portrait_image_url: '', portrait_image_alt: '',
      bio_html: '', awards_title: 'AWARDS', bts_title: 'BEHIND THE SCENES', updated_at: new Date().toISOString(),
    },
    infoBlocks: blocksRes.rows,
    awards: awardsRes.rows,
    btsImages: btsRes.rows,
    mediaKitButtons: mkRes.rows,
  }
}

export const contactResolvers = {
  Query: {
    contact: fetchContactData,
  },

  Mutation: {
    updateContact: async (_: unknown, { input }: { input: Record<string, unknown> }, context: GqlContext) => {
      requireAuth(context)

      // Upsert contact page (create row if it doesn't exist yet)
      if (input.page) {
        const page = input.page as Record<string, unknown>
        const fields = Object.keys(page).filter(k => page[k] !== undefined)
        if (fields.length > 0) {
          // Ensure the 'main' row exists
          await pool.query(
            `INSERT INTO contact_page (id) VALUES ('main') ON CONFLICT (id) DO NOTHING`
          )
          const setClauses = fields.map((f, i) => `${f} = $${i + 1}`)
          const values = fields.map(f => page[f])
          await pool.query(
            `UPDATE contact_page SET ${setClauses.join(', ')} WHERE id = 'main'`,
            values
          )
        }
      }

      // Info blocks: delete all, re-insert
      if (input.infoBlocks) {
        await pool.query('DELETE FROM contact_info_blocks')
        const blocks = input.infoBlocks as Array<Record<string, unknown>>
        for (const block of blocks) {
          await pool.query(
            'INSERT INTO contact_info_blocks (label, email, phone, sort_order) VALUES ($1, $2, $3, $4)',
            [block.label, block.email || '', block.phone || '', block.sort_order || 0]
          )
        }
      }

      // Awards: delete all, re-insert
      if (input.awards) {
        await pool.query('DELETE FROM awards')
        const awards = input.awards as Array<Record<string, unknown>>
        for (const award of awards) {
          await pool.query(
            'INSERT INTO awards (award_name, organizer, year, hover_image_url, sort_order) VALUES ($1, $2, $3, $4, $5)',
            [award.award_name, award.organizer, award.year, award.hover_image_url || '', award.sort_order || 0]
          )
        }
      }

      // BTS images: delete all, re-insert
      if (input.btsImages) {
        await pool.query('DELETE FROM bts_images')
        const images = input.btsImages as Array<Record<string, unknown>>
        for (const img of images) {
          await pool.query(
            'INSERT INTO bts_images (image_url, alt_text, sort_order) VALUES ($1, $2, $3)',
            [img.image_url, img.alt_text || 'Behind the scenes', img.sort_order || 0]
          )
        }
      }

      // Media kit buttons: delete all, re-insert
      if (input.mediaKitButtons) {
        await pool.query('DELETE FROM media_kit_buttons')
        const buttons = input.mediaKitButtons as Array<Record<string, unknown>>
        for (const btn of buttons) {
          await pool.query(
            'INSERT INTO media_kit_buttons (label, file_url, sort_order) VALUES ($1, $2, $3)',
            [btn.label, btn.file_url || '', btn.sort_order || 0]
          )
        }
      }

      return fetchContactData()
    },
  },
}
