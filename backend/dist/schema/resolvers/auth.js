import bcrypt from 'bcryptjs';
import pool from '../../db.js';
import { signToken } from '../../auth.js';
export const authResolvers = {
    Mutation: {
        login: async (_, { email, password }) => {
            const { rows } = await pool.query('SELECT * FROM admin_users WHERE email = $1', [email]);
            const user = rows[0];
            if (!user) {
                throw new Error('Invalid email or password');
            }
            const valid = await bcrypt.compare(password, user.password_hash);
            if (!valid) {
                throw new Error('Invalid email or password');
            }
            const token = signToken({ userId: user.id, email: user.email });
            return {
                token,
                user: { id: user.id, email: user.email },
            };
        },
    },
};
//# sourceMappingURL=auth.js.map