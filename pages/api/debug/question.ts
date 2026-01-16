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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
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
      const { code } = req.query

      if (!code) {
        return res.status(400).json({ error: 'code é obrigatório' })
      }

      // Buscar pergunta por código
      const result = await pool.query(
        `SELECT
          q.id,
          q.code,
          q.text,
          q.type,
          q.help_text,
          q.required,
          q.order_index,
          q.validation_schema,
          s.code as section_code,
          s.name as section_name,
          qs.name as question_set_name
        FROM questions q
        JOIN question_sets qs ON qs.id = q.question_set_id
        JOIN sections s ON s.id = qs.section_id
        WHERE q.code = $1`,
        [code],
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Pergunta não encontrada' })
      }

      return res.status(200).json(result.rows[0])
    } catch (error: any) {
      console.error('Erro na API de debug de pergunta:', error)
      return res.status(500).json({ error: error.message })
    }
  })
}
