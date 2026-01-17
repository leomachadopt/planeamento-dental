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
      const dossierId = req.query.id as string

      if (!dossierId) {
        return res.status(400).json({ error: 'ID do dossiê é obrigatório' })
      }

      // Buscar dossiê e validar acesso
      const dossierResult = await pool.query('SELECT * FROM dossiers WHERE id = $1', [
        dossierId,
      ])

      if (dossierResult.rows.length === 0) {
        return res.status(404).json({ error: 'Dossiê não encontrado' })
      }

      const dossier = dossierResult.rows[0]

      // Validar que o usuário tem acesso à clínica do dossiê
      if (user.role !== 'admin' && user.clinicId !== dossier.clinic_id) {
        return res.status(403).json({ error: 'Acesso negado a este dossiê' })
      }

      if (method === 'GET') {
        return res.status(200).json(dossier)
      }

      if (method === 'PUT') {
        // Atualizar dossiê
        const { title, status, baselineDate } = req.body

        const updateFields: string[] = []
        const updateValues: any[] = []
        let paramIndex = 1

        if (title !== undefined) {
          updateFields.push(`title = $${paramIndex++}`)
          updateValues.push(title)
        }
        if (status !== undefined) {
          updateFields.push(`status = $${paramIndex++}`)
          updateValues.push(status)
        }
        if (baselineDate !== undefined) {
          updateFields.push(`baseline_date = $${paramIndex++}`)
          updateValues.push(baselineDate)
        }

        if (updateFields.length === 0) {
          return res.status(400).json({ error: 'Nenhum campo para atualizar' })
        }

        updateFields.push(`updated_at = NOW()`)
        updateValues.push(dossierId)

        const result = await pool.query(
          `UPDATE dossiers SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
          updateValues,
        )

        return res.status(200).json(result.rows[0])
      }

      if (method === 'DELETE') {
        // Arquivar dossiê (não deletar fisicamente)
        const result = await pool.query(
          `UPDATE dossiers SET status = 'archived', updated_at = NOW() WHERE id = $1 RETURNING *`,
          [dossierId],
        )

        return res.status(200).json(result.rows[0])
      }

      return res.status(405).json({ error: 'Método não permitido' })
    } catch (error: any) {
      console.error('Erro na API de dossiê:', error)
      return res.status(500).json({ error: error.message })
    }
  })
}




