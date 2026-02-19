import type { Request } from 'express';
export interface JwtPayload {
    userId: string;
    email: string;
}
export declare function signToken(payload: JwtPayload): string;
export declare function verifyToken(token: string): JwtPayload;
export declare function getTokenFromRequest(req: Request): string | null;
export interface GqlContext {
    user: JwtPayload | null;
}
export declare function buildContext(req: Request): GqlContext;
export declare function requireAuth(context: GqlContext): JwtPayload;
//# sourceMappingURL=auth.d.ts.map