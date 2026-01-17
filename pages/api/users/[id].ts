import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateToken, requireAdmin, AuthRequest } from '@/lib/api-shared/auth'
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

  return authenticateToken(req as AuthRequest, res, () => {
    return requireAdmin(req as AuthRequest, res, async () => {
      try {
        const { id } = req.query

        if (!id || typeof id !== 'string') {
          return res.status(400).json({ error: 'ID do usuário é obrigatório' })
        }

        if (req.method === 'GET') {
          const result = await pool.query(
            `SELECT 
              u.id, 
              u.email, 
              u.name, 
              u.role, 
              u.clinic_id, 
              u.is_active, 
              u.last_login, 
              u.created_at,
              c.clinic_name
            FROM users u
            LEFT JOIN clinics c ON u.clinic_id = c.id
            WHERE u.id = $1`,
            [id]
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
              clinicName: user.clinic_name,
              isActive: user.is_active,
              lastLogin: user.last_login,
              createdAt: user.created_at,
            },
          })
        }

        if (req.method === 'PUT' || req.method === 'PATCH') {
          const { name, role, clinicId, isActive, password } = req.body

          // Validação: usuários não-admin devem ter clínica
          // Primeiro, precisamos verificar o role atual do usuário se não estiver sendo alterado
          if (role !== undefined || clinicId !== undefined) {
            const currentUser = await pool.query('SELECT role, clinic_id FROM users WHERE id = $1', [id])
            if (currentUser.rows.length === 0) {
              return res.status(404).json({ error: 'Usuário não encontrado' })
            }

            const finalRole = role !== undefined ? role : currentUser.rows[0].role
            const finalClinicId = clinicId !== undefined ? clinicId : currentUser.rows[0].clinic_id

            if (finalRole !== 'admin' && !finalClinicId) {
              return res.status(400).json({ error: 'Usuários devem estar associados a uma clínica' })
            }

            // Validar se a clínica existe (se fornecida)
            if (finalClinicId) {
              const clinicCheck = await pool.query('SELECT id FROM clinics WHERE id = $1', [finalClinicId])
              if (clinicCheck.rows.length === 0) {
                return res.status(400).json({ error: 'Clínica não encontrada' })
              }
            }
          }

          const updates: string[] = []
          const values: any[] = []
          let paramCount = 1

          if (name !== undefined) {
            updates.push(`name = $${paramCount++}`)
            values.push(name)
          }
          if (role !== undefined) {
            updates.push(`role = $${paramCount++}`)
            values.push(role)
          }
          if (clinicId !== undefined) {
            updates.push(`clinic_id = $${paramCount++}`)
            values.push(clinicId || null)
          }
          if (isActive !== undefined) {
            updates.push(`is_active = $${paramCount++}`)
            values.push(isActive)
          }
          if (password !== undefined) {
            if (password.length < 8) {
              return res.status(400).json({ error: 'Senha deve ter no mínimo 8 caracteres' })
            }
            const bcrypt = await import('bcryptjs')
            const passwordHash = await bcrypt.default.hash(password, 10)
            updates.push(`password_hash = $${paramCount++}`)
            values.push(passwordHash)
          }

          if (updates.length === 0) {
            return res.status(400).json({ error: 'Nenhum campo para atualizar' })
          }

          updates.push(`updated_at = NOW()`)
          values.push(id)

          const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, email, name, role, clinic_id, is_active`

          const result = await pool.query(query, values)

          return res.status(200).json({
            user: {
              id: result.rows[0].id,
              email: result.rows[0].email,
              name: result.rows[0].name,
              role: result.rows[0].role,
              clinicId: result.rows[0].clinic_id,
              isActive: result.rows[0].is_active,
            },
          })
        }

        if (req.method === 'DELETE') {
          await pool.query('DELETE FROM users WHERE id = $1', [id])
          return res.status(200).json({ message: 'Usuário deletado com sucesso' })
        }

        return res.status(405).json({ error: 'Método não permitido' })
      } catch (error: any) {
        console.error('Erro na API de usuário:', error)
        return res.status(500).json({ error: 'Erro interno do servidor' })
      }
    })
  })
}


