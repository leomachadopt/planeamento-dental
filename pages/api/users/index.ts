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
        if (req.method === 'GET') {
          // Listar todos os usuários
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
            ORDER BY u.created_at DESC`
          )

          return res.status(200).json({
            users: result.rows.map((row) => ({
              id: row.id,
              email: row.email,
              name: row.name,
              role: row.role,
              clinicId: row.clinic_id,
              clinicName: row.clinic_name,
              isActive: row.is_active,
              lastLogin: row.last_login,
              createdAt: row.created_at,
            })),
          })
        }

        if (req.method === 'POST') {
          // Criar novo usuário (admin)
          const { email, password, name, role, clinicId } = req.body

          if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' })
          }

          if (password.length < 8) {
            return res.status(400).json({ error: 'Senha deve ter no mínimo 8 caracteres' })
          }

          const userRole = role || 'user'

          // Validação: usuários não-admin devem ter clínica
          if (userRole !== 'admin' && !clinicId) {
            return res.status(400).json({ error: 'Usuários devem estar associados a uma clínica' })
          }

          // Validar se a clínica existe (se fornecida)
          if (clinicId) {
            const clinicCheck = await pool.query('SELECT id FROM clinics WHERE id = $1', [clinicId])
            if (clinicCheck.rows.length === 0) {
              return res.status(400).json({ error: 'Clínica não encontrada' })
            }
          }

          const bcrypt = await import('bcryptjs')
          const passwordHash = await bcrypt.default.hash(password, 10)

          const result = await pool.query(
            'INSERT INTO users (email, password_hash, name, role, clinic_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, clinic_id',
            [email.toLowerCase(), passwordHash, name, userRole, clinicId || null]
          )

          return res.status(201).json({
            user: {
              id: result.rows[0].id,
              email: result.rows[0].email,
              name: result.rows[0].name,
              role: result.rows[0].role,
              clinicId: result.rows[0].clinic_id,
            },
          })
        }

        return res.status(405).json({ error: 'Método não permitido' })
      } catch (error: any) {
        console.error('Erro na API de usuários:', error)
        if (error.code === '23505') {
          return res.status(409).json({ error: 'Email já cadastrado' })
        }
        return res.status(500).json({ error: 'Erro interno do servidor' })
      }
    })
  })
}


