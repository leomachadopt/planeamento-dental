import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateToken, AuthRequest } from '../../_shared/auth.js'
import pool from '../../_shared/db.js'

const TABLE_NAME = 'roles'

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
      const clinicId = req.query.id as string
      const entityId = req.query.entityId as string

      if (!clinicId) {
        return res.status(400).json({ error: 'ID da clínica é obrigatório' })
      }

      if (user.role !== 'admin' && user.clinicId !== clinicId) {
        return res.status(403).json({ error: 'Acesso negado' })
      }

      if (method === 'GET') {
        if (entityId) {
          const result = await pool.query(
            `SELECT * FROM ${TABLE_NAME} WHERE id = $1 AND clinic_id = $2`,
            [entityId, clinicId],
          )
          if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Entidade não encontrada' })
          }
          return res.status(200).json(result.rows[0])
        } else {
          const result = await pool.query(
            `SELECT * FROM ${TABLE_NAME} WHERE clinic_id = $1 ORDER BY created_at`,
            [clinicId],
          )
          return res.status(200).json(result.rows)
        }
      }

      if (method === 'POST') {
        const { name, description } = req.body
        if (!name) {
          return res.status(400).json({ error: 'name é obrigatório' })
        }

        const result = await pool.query(
          `INSERT INTO ${TABLE_NAME} (clinic_id, name, description)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [clinicId, name, description || null],
        )
        
        return res.status(201).json(result.rows[0])
      }

      if (method === 'PUT' && entityId) {
        const { name, description } = req.body

        const updateFields: string[] = []
        const updateValues: any[] = []
        let paramIndex = 1

        if (name !== undefined) {
          updateFields.push(`name = $${paramIndex++}`)
          updateValues.push(name)
        }
        if (description !== undefined) {
          updateFields.push(`description = $${paramIndex++}`)
          updateValues.push(description)
        }

        if (updateFields.length === 0) {
          return res.status(400).json({ error: 'Nenhum campo para atualizar' })
        }

        updateFields.push(`updated_at = NOW()`)
        updateValues.push(clinicId, entityId)

        const result = await pool.query(
          `UPDATE ${TABLE_NAME} 
           SET ${updateFields.join(', ')}
           WHERE clinic_id = $${paramIndex++} AND id = $${paramIndex++}
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
           WHERE id = $1 AND clinic_id = $2
           RETURNING *`,
          [entityId, clinicId],
        )

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Entidade não encontrada' })
        }

        return res.status(200).json({ message: 'Entidade excluída com sucesso' })
      }

      return res.status(405).json({ error: 'Método não permitido' })
    } catch (error: any) {
      console.error('Erro na API de roles:', error)
      return res.status(500).json({ error: error.message || 'Erro interno do servidor' })
    }
  })
}

