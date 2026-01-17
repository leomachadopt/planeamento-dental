import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateToken, AuthRequest } from '@/lib/api-shared/auth'
import pool from '@/lib/api-shared/db'

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

  return authenticateToken(req as AuthRequest, res, async () => {
    try {
      const { method } = req
      const authReq = req as AuthRequest
      const user = authReq.user!

      if (method === 'GET') {
        // Listar clínicas - usuários veem apenas suas clínicas, admin vê todas
        let query = 'SELECT * FROM clinics'
        let params: any[] = []

        if (user.role !== 'admin' && user.clinicId) {
          query += ' WHERE id = $1'
          params = [user.clinicId]
        }

        query += ' ORDER BY created_at DESC'

        const result = await pool.query(query, params)
        return res.status(200).json(result.rows)
      }

      if (method === 'POST') {
        // Apenas admin pode criar clínicas
        if (user.role !== 'admin') {
          return res.status(403).json({ error: 'Apenas administradores podem criar clínicas' })
        }

        // Criar nova clínica
        const { clinicName } = req.body
        if (!clinicName) {
          return res.status(400).json({ error: 'Nome da clínica é obrigatório' })
        }

        const result = await pool.query(
          'INSERT INTO clinics (clinic_name) VALUES ($1) RETURNING id',
          [clinicName],
        )
        return res.status(201).json({ id: result.rows[0].id })
      }

      return res.status(405).json({ error: 'Método não permitido' })
    } catch (error: any) {
      console.error('Erro na API:', error)
      return res.status(500).json({ error: error.message })
    }
  })
}

