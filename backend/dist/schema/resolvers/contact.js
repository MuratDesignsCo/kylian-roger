import pool from '../../db.js';
import { requireAuth } from '../../auth.js';
async function fetchContactData() {
    const [pageRes, blocksRes, awardsRes, btsRes, mkRes] = await Promise.all([
        pool.query("SELECT * FROM contact_page WHERE id = 'main'"),
        pool.query('SELECT * FROM contact_info_blocks ORDER BY sort_order'),
        pool.query('SELECT * FROM awards ORDER BY sort_order'),
        pool.query('SELECT * FROM bts_images ORDER BY sort_order'),
        pool.query('SELECT * FROM media_kit_buttons ORDER BY sort_order'),
    ]);
    return {
        page: pageRes.rows[0] || {
            id: 'main', title: 'CONTACT', portrait_image_url: '', portrait_image_alt: '',
            bio_html: '', awards_title: 'AWARDS', bts_title: 'BEHIND THE SCENES', updated_at: new Date().toISOString(),
        },
        infoBlocks: blocksRes.rows,
        awards: awardsRes.rows,
        btsImages: btsRes.rows,
        mediaKitButtons: mkRes.rows,
    };
}
export const contactResolvers = {
    Query: {
        contact: fetchContactData,
    },
    Mutation: {
        updateContact: async (_, { input }, context) => {
            requireAuth(context);
            // Update contact page
            if (input.page) {
                const page = input.page;
                const fields = Object.keys(page).filter(k => page[k] !== undefined);
                if (fields.length > 0) {
                    const setClauses = fields.map((f, i) => `${f} = $${i + 1}`);
                    const values = fields.map(f => page[f]);
                    await pool.query(`UPDATE contact_page SET ${setClauses.join(', ')} WHERE id = 'main'`, values);
                }
            }
            // Info blocks: delete all, re-insert
            if (input.infoBlocks) {
                await pool.query('DELETE FROM contact_info_blocks');
                const blocks = input.infoBlocks;
                for (const block of blocks) {
                    await pool.query('INSERT INTO contact_info_blocks (label, email, phone, sort_order) VALUES ($1, $2, $3, $4)', [block.label, block.email || '', block.phone || '', block.sort_order || 0]);
                }
            }
            // Awards: delete all, re-insert
            if (input.awards) {
                await pool.query('DELETE FROM awards');
                const awards = input.awards;
                for (const award of awards) {
                    await pool.query('INSERT INTO awards (award_name, organizer, year, hover_image_url, sort_order) VALUES ($1, $2, $3, $4, $5)', [award.award_name, award.organizer, award.year, award.hover_image_url || '', award.sort_order || 0]);
                }
            }
            // BTS images: delete all, re-insert
            if (input.btsImages) {
                await pool.query('DELETE FROM bts_images');
                const images = input.btsImages;
                for (const img of images) {
                    await pool.query('INSERT INTO bts_images (image_url, alt_text, sort_order) VALUES ($1, $2, $3)', [img.image_url, img.alt_text || 'Behind the scenes', img.sort_order || 0]);
                }
            }
            return fetchContactData();
        },
    },
};
//# sourceMappingURL=contact.js.map