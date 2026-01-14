import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateToken, AuthRequest } from '../../../_shared/auth.js'
import pool from '../../../_shared/db.js'
import { markSectionReportsAsStale, getSectionForEntity, markFinalReportAsStale } from '../../../_shared/staleTracking.js'
import { updateSectionCompletion } from '../../../_shared/sectionCompletion.js'

const TABLE_NAME = 'capacities'

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
            `SELECT * FROM ${TABLE_NAME} WHERE clinic_id = $1 AND dossier_id = $2 ORDER BY resource_type, created_at`,
            [clinicId, dossierId],
          )
          return res.status(200).json(result.rows)
        }
      }

      if (method === 'POST') {
        const { resourceType, name, quantity, unit, constraints, notes } = req.body
        if (!resourceType || !name || quantity === undefined) {
          return res.status(400).json({ error: 'resourceType, name e quantity são obrigatórios' })
        }

        const result = await pool.query(
          `INSERT INTO ${TABLE_NAME} (clinic_id, dossier_id, resource_type, name, quantity, unit, constraints, notes, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
           RETURNING *`,
          [clinicId, dossierId, resourceType, name, quantity, unit || null, constraints || null, notes || null],
        )
        
        // Marcar relatórios como stale
        const sectionCode = getSectionForEntity('capacities')
        if (sectionCode) {
          await markSectionReportsAsStale(dossierId, sectionCode)
          await updateSectionCompletion(dossierId, sectionCode)
        }
        
        return res.status(201).json(result.rows[0])
      }

      if (method === 'PUT' && entityId) {
        const { resourceType, name, quantity, unit, constraints, notes, status } = req.body

        const updateFields: string[] = []
        const updateValues: any[] = []
        let paramIndex = 1

        if (resourceType !== undefined) {
          updateFields.push(`resource_type = $${paramIndex++}`)
          updateValues.push(resourceType)
        }
        if (name !== undefined) {
          updateFields.push(`name = $${paramIndex++}`)
          updateValues.push(name)
        }
        if (quantity !== undefined) {
          updateFields.push(`quantity = $${paramIndex++}`)
          updateValues.push(quantity)
        }
        if (unit !== undefined) {
          updateFields.push(`unit = $${paramIndex++}`)
          updateValues.push(unit)
        }
        if (constraints !== undefined) {
          updateFields.push(`constraints = $${paramIndex++}`)
          updateValues.push(constraints)
        }
        if (notes !== undefined) {
          updateFields.push(`notes = $${paramIndex++}`)
          updateValues.push(notes)
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
        const sectionCode = getSectionForEntity('capacities')
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


