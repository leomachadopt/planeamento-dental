import type { VercelRequest, VercelResponse } from '@vercel/node'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends VercelRequest {
  user?: {
    id: string
    email: string
    role: 'admin' | 'user'
    clinicId?: string
    name: string
  }
}

// Usar variável de ambiente ou fallback
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET não configurado! Usando valor padrão inseguro.')
}

export function authenticateToken(
  req: AuthRequest,
  res: VercelResponse,
  next: () => void
) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest['user']
    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido ou expirado' })
  }
}

export function requireAdmin(
  req: AuthRequest,
  res: VercelResponse,
  next: () => void
) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Admin necessário.' })
  }
  next()
}

export function optionalAuth(
  req: AuthRequest,
  res: VercelResponse,
  next: () => void
) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest['user']
      req.user = decoded
    } catch (error) {
      // Token inválido, mas continua sem autenticação
    }
  }
  next()
}




