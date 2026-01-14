import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateToken, AuthRequest } from '../_shared/auth.js'
import pool from '../_shared/db.js'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  )
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  return authenticateToken(req as AuthRequest, res, async () => {
    try {
      const authReq = req as AuthRequest
      const userId = authReq.user?.id

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }

      // Buscar dados atualizados do usuário
      const result = await pool.query(
        'SELECT id, email, name, role, clinic_id, is_active, last_login, created_at FROM users WHERE id = $1',
        [userId]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      const user = result.rows[0]

      return res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          clinicId: user.clinic_id,
          isActive: user.is_active,
          lastLogin: user.last_login,
          createdAt: user.created_at,
        },
      })
    } catch (error: any) {
      console.error('Erro ao buscar usuário:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  })
}


