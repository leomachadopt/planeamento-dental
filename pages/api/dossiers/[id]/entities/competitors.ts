import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateToken, AuthRequest } from '@/lib/api-shared/auth'
import pool from '@/lib/api-shared/db'
import { markSectionReportsAsStale, getSectionForEntity, markFinalReportAsStale } from '@/lib/api-shared/staleTracking'
import { updateSectionCompletion } from '@/lib/api-shared/sectionCompletion'

const TABLE_NAME = 'competitors'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')

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
      const entityId = req.query.entityId as string

      if (!dossierId) {
        return res.status(400).json({ error: 'ID do dossiê é obrigatório' })
      }

      const dossierResult = await pool.query('SELECT clinic_id FROM dossiers WHERE id = $1', [dossierId])
      if (dossierResult.rows.length === 0) {
        return res.status(404).json({ error: 'Dossiê não encontrado' })
      }

      const clinicId = dossierResult.rows[0].clinic_id
      if (user.role !== 'admin' && user.clinicId !== clinicId) {
        return res.status(403).json({ error: 'Acesso negado' })
      }

      if (method === 'GET') {
        if (entityId) {
          const result = await pool.query(
            `SELECT * FROM ${TABLE_NAME} WHERE id = $1 AND clinic_id = $2 AND dossier_id = $3`,
            [entityId, clinicId, dossierId],
          )
          if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Entidade não encontrada' })
          }
          return res.status(200).json(result.rows[0])
        } else {
          const result = await pool.query(
            `SELECT * FROM ${TABLE_NAME} WHERE clinic_id = $1 AND dossier_id = $2 ORDER BY type, created_at`,
            [clinicId, dossierId],
          )
          return res.status(200).json(result.rows)
        }
      }

      if (method === 'POST') {
        const { name, type, notes, differentiationSummary } = req.body
        if (!name || !type) {
          return res.status(400).json({ error: 'name e type são obrigatórios' })
        }

        const result = await pool.query(
          `INSERT INTO ${TABLE_NAME} (clinic_id, dossier_id, name, type, notes, differentiation_summary, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'active')
           RETURNING *`,
          [clinicId, dossierId, name, type, notes || null, differentiationSummary || null],
        )
        
        // Marcar relatórios como stale
        const sectionCode = getSectionForEntity('competitors')
        if (sectionCode) {
          await markSectionReportsAsStale(dossierId, sectionCode)
          await updateSectionCompletion(dossierId, sectionCode)
        }
        
        return res.status(201).json(result.rows[0])
      }

      if (method === 'PUT' && entityId) {
        const { name, type, notes, differentiationSummary, status } = req.body

        const updateFields: string[] = []
        const updateValues: any[] = []
        let paramIndex = 1

        if (name !== undefined) {
          updateFields.push(`name = $${paramIndex++}`)
          updateValues.push(name)
        }
        if (type !== undefined) {
          updateFields.push(`type = $${paramIndex++}`)
          updateValues.push(type)
        }
        if (notes !== undefined) {
          updateFields.push(`notes = $${paramIndex++}`)
          updateValues.push(notes)
        }
        if (differentiationSummary !== undefined) {
          updateFields.push(`differentiation_summary = $${paramIndex++}`)
          updateValues.push(differentiationSummary)
        }
        if (status !== undefined) {
          updateFields.push(`status = $${paramIndex++}`)
          updateValues.push(status)
        }

        if (updateFields.length === 0) {
          return res.status(400).json({ error: 'Nenhum campo para atualizar' })
        }

        updateFields.push(`updated_at = NOW()`)
        updateValues.push(entityId, clinicId, dossierId)

        const result = await pool.query(
          `UPDATE ${TABLE_NAME} SET ${updateFields.join(', ')} 
           WHERE id = $${paramIndex} AND clinic_id = $${paramIndex + 1} AND dossier_id = $${paramIndex + 2}
           RETURNING *`,
          updateValues,
        )

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Entidade não encontrada' })
        }

        // Marcar relatórios como stale
        const sectionCode = getSectionForEntity('competitors')
        if (sectionCode) {
          await markSectionReportsAsStale(dossierId, sectionCode)
          await markFinalReportAsStale(dossierId)
          await updateSectionCompletion(dossierId, sectionCode)
        }

        return res.status(200).json(result.rows[0])
      }

      if (method === 'DELETE' && entityId) {
        const result = await pool.query(
          `DELETE FROM ${TABLE_NAME} 
           WHERE id = $1 AND clinic_id = $2 AND dossier_id = $3
           RETURNING *`,
          [entityId, clinicId, dossierId],
        )

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Entidade não encontrada' })
        }

        // Marcar relatórios como stale
        const sectionCode = getSectionForEntity('competitors')
        if (sectionCode) {
          await markSectionReportsAsStale(dossierId, sectionCode)
          await markFinalReportAsStale(dossierId)
          await updateSectionCompletion(dossierId, sectionCode)
        }

        return res.status(200).json({ message: 'Entidade deletada', id: entityId })
      }

      return res.status(405).json({ error: 'Método não permitido' })
    } catch (error: any) {
      console.error(`Erro na API de ${TABLE_NAME}:`, error)
      return res.status(500).json({ error: error.message })
    }
  })
}


