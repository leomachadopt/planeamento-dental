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

  return authenticateToken(req as AuthRequest, res, async () => {
    try {
      const authReq = req as AuthRequest
      const user = authReq.user!
      const { dossierId, sectionCode } = req.query

      if (!dossierId) {
        return res.status(400).json({ error: 'dossierId é obrigatório' })
      }

      // Validar acesso ao dossiê
      const dossierResult = await pool.query(
        'SELECT clinic_id, title FROM dossiers WHERE id = $1',
        [dossierId],
      )

      if (dossierResult.rows.length === 0) {
        return res.status(404).json({ error: 'Dossiê não encontrado' })
      }

      const clinicId = dossierResult.rows[0].clinic_id

      if (user.role !== 'admin' && user.clinicId !== clinicId) {
        return res.status(403).json({ error: 'Acesso negado a este dossiê' })
      }

      // Buscar respostas
      let query = `
        SELECT
          a.id,
          a.dossier_id,
          a.question_id,
          a.value_text,
          a.value_number,
          a.value_json,
          a.source,
          a.updated_at,
          q.code as question_code,
          q.text as question_text,
          q.type as question_type,
          s.code as section_code,
          s.name as section_name
        FROM answers a
        JOIN questions q ON q.id = a.question_id
        JOIN question_sets qs ON qs.id = q.question_set_id
        JOIN sections s ON s.id = qs.section_id
        WHERE a.dossier_id = $1
      `
      const params: any[] = [dossierId]

      if (sectionCode) {
        query += ' AND s.code = $2'
        params.push(sectionCode)
      }

      query += ' ORDER BY a.updated_at DESC'

      const answersResult = await pool.query(query, params)

      return res.status(200).json({
        dossier: dossierResult.rows[0],
        answersCount: answersResult.rows.length,
        answers: answersResult.rows,
      })
    } catch (error: any) {
      console.error('Erro na API de debug de respostas:', error)
      return res.status(500).json({ error: error.message })
    }
  })
}
