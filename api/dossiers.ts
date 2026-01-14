import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateToken, AuthRequest } from './_shared/auth.js'
import pool from './_shared/db.js'

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
        // Listar dossiês de uma clínica
        const { clinicId } = req.query

        if (!clinicId) {
          return res.status(400).json({ error: 'clinicId é obrigatório' })
        }

        // Validar que o usuário tem acesso à clínica
        if (user.role !== 'admin' && user.clinicId !== clinicId) {
          return res.status(403).json({ error: 'Acesso negado a esta clínica' })
        }

        const result = await pool.query(
          'SELECT * FROM dossiers WHERE clinic_id = $1 ORDER BY created_at DESC',
          [clinicId],
        )

        return res.status(200).json(result.rows)
      }

      if (method === 'POST') {
        // Criar novo dossiê
        const { clinicId, title, baselineDate } = req.body

        if (!clinicId || !title) {
          return res.status(400).json({ error: 'clinicId e title são obrigatórios' })
        }

        // Validar que o usuário tem acesso à clínica
        if (user.role !== 'admin' && user.clinicId !== clinicId) {
          return res.status(403).json({ error: 'Acesso negado a esta clínica' })
        }

        // Verificar se a clínica existe
        const clinicCheck = await pool.query('SELECT id FROM clinics WHERE id = $1', [
          clinicId,
        ])
        if (clinicCheck.rows.length === 0) {
          return res.status(404).json({ error: 'Clínica não encontrada' })
        }

        const result = await pool.query(
          `INSERT INTO dossiers (clinic_id, title, baseline_date, status, version_number)
           VALUES ($1, $2, $3, 'draft', 1)
           RETURNING *`,
          [clinicId, title, baselineDate || null],
        )

        const newDossier = result.rows[0]

        // Inicializar status das seções para o novo dossiê
        const sections = await pool.query('SELECT id FROM sections ORDER BY order_index')
        const statusPromises = sections.rows.map((section) =>
          pool.query(
            `INSERT INTO dossier_sections_status (dossier_id, section_id, status, completion_percent)
             VALUES ($1, $2, 'not_started', 0)
             ON CONFLICT (dossier_id, section_id) DO NOTHING`,
            [newDossier.id, section.id],
          ),
        )
        await Promise.all(statusPromises)

        return res.status(201).json(newDossier)
      }

      return res.status(405).json({ error: 'Método não permitido' })
    } catch (error: any) {
      console.error('Erro na API de dossiês:', error)
      return res.status(500).json({ error: error.message })
    }
  })
}



