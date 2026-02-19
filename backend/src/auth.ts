import jwt from 'jsonwebtoken'
import type { Request } from 'express'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export interface JwtPayload {
  userId: string
  email: string
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}

export function getTokenFromRequest(req: Request): string | null {
  const auth = req.headers.authorization
  if (auth?.startsWith('Bearer ')) {
    return auth.slice(7)
  }
  return null
}

export interface GqlContext {
  user: JwtPayload | null
}

export function buildContext(req: Request): GqlContext {
  const token = getTokenFromRequest(req)
  if (!token) return { user: null }
  try {
    const user = verifyToken(token)
    return { user }
  } catch {
    return { user: null }
  }
}

export function requireAuth(context: GqlContext): JwtPayload {
  if (!context.user) {
    throw new Error('Authentication required')
  }
  return context.user
}
