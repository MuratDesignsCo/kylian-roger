import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
export function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}
export function getTokenFromRequest(req) {
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
        return auth.slice(7);
    }
    return null;
}
export function buildContext(req) {
    const token = getTokenFromRequest(req);
    if (!token)
        return { user: null };
    try {
        const user = verifyToken(token);
        return { user };
    }
    catch {
        return { user: null };
    }
}
export function requireAuth(context) {
    if (!context.user) {
        throw new Error('Authentication required');
    }
    return context.user;
}
//# sourceMappingURL=auth.js.map