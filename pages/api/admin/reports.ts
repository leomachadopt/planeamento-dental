import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateToken, requireAdmin, AuthRequest } from '@/lib/api-shared/auth'
import pool from '@/lib/api-shared/db'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS',
  )
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  return authenticateToken(req as AuthRequest, res, () => {
    return requireAdmin(req as AuthRequest, res, async () => {
      try {
        if (req.method === 'GET') {
          // Listar todos os relatórios
          const result = await pool.query(`
            SELECT 
              r.id,
              r.clinic_id,
              r.report_type,
              r.generated_at,
              c.clinic_name
            FROM reports r
            LEFT JOIN clinics c ON r.clinic_id = c.id
            ORDER BY r.generated_at DESC
            LIMIT 1000
          `)

          return res.status(200).json({
            reports: result.rows.map((row) => ({
              id: row.id,
              clinic_id: row.clinic_id,
              clinic_name: row.clinic_name,
              report_type: row.report_type,
              generated_at: row.generated_at,
              status: 'success', // TODO: implementar status real
            })),
          })
        }

        return res.status(405).json({ error: 'Método não permitido' })
      } catch (error: any) {
        console.error('Erro na API de relatórios:', error)
        return res.status(500).json({ error: 'Erro interno do servidor' })
      }
    })
  })
}




