import pool from '../../db.js';
import { requireAuth } from '../../auth.js';
export const settingsResolvers = {
    Query: {
        settings: async () => {
            const { rows } = await pool.query('SELECT * FROM site_settings WHERE id = $1', ['global']);
            return rows[0] || null;
        },
    },
    Mutation: {
        updateSettings: async (_, { input }, context) => {
            requireAuth(context);
            const fields = Object.keys(input).filter(k => input[k] !== undefined);
            if (fields.length === 0) {
                const { rows } = await pool.query('SELECT * FROM site_settings WHERE id = $1', ['global']);
                return rows[0];
            }
            const setClauses = fields.map((f, i) => {
                if (f === 'works_section_links') {
                    return `${f} = $${i + 1}::jsonb`;
                }
                return `${f} = $${i + 1}`;
            });
            const values = fields.map(f => {
                const val = input[f];
                if (f === 'works_section_links')
                    return JSON.stringify(val);
                return val;
            });
            const { rows } = await pool.query(`UPDATE site_settings SET ${setClauses.join(', ')} WHERE id = 'global' RETURNING *`, values);
            return rows[0];
        },
    },
};
//# sourceMappingURL=settings.js.map