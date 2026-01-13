import type { VercelRequest, VercelResponse } from '@vercel/node'
import jwt from 'jsonwebtoken'
import pool from '../_shared/db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    console.log('=== INÍCIO DO LOGIN ===')
    console.log('Request method:', req.method)
    console.log('Request body exists:', !!req.body)
    
    const { email, password } = req.body || {}

    if (!email || !password) {
      console.log('Email ou senha faltando:', { hasEmail: !!email, hasPassword: !!password })
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    console.log('Tentativa de login para:', email.toLowerCase())
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('JWT_SECRET exists:', !!JWT_SECRET)

    // Buscar usuário
    console.log('Executando query no banco...')
    let userResult
    try {
      userResult = await pool.query(
        'SELECT id, email, password_hash, name, role, clinic_id, is_active FROM users WHERE email = $1',
        [email.toLowerCase()]
      )
      console.log('Query executada com sucesso')
    } catch (dbError: any) {
      console.error('❌ Erro na query do banco:', dbError)
      console.error('❌ DB Error message:', dbError?.message)
      console.error('❌ DB Error code:', dbError?.code)
      throw new Error('Erro ao conectar com o banco de dados: ' + dbError?.message)
    }

    console.log('Usuários encontrados:', userResult.rows.length)

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    const user = userResult.rows[0]

    if (!user.is_active) {
      return res.status(403).json({ error: 'Conta desativada. Entre em contato com o administrador.' })
    }

    // Verificar senha
    console.log('Verificando senha...')
    console.log('Password hash length:', user.password_hash?.length)
    
    let isValidPassword = false
    try {
      console.log('Importando bcryptjs...')
      const bcrypt = await import('bcryptjs')
      console.log('bcryptjs importado:', { hasBcrypt: !!bcrypt, hasDefault: !!bcrypt.default })
      
      if (!bcrypt.default || typeof bcrypt.default.compare !== 'function') {
        throw new Error('bcrypt.default.compare não está disponível')
      }
      
      console.log('Chamando bcrypt.compare...')
      isValidPassword = await bcrypt.default.compare(password, user.password_hash)
      console.log('Senha válida:', isValidPassword)
    } catch (bcryptError: any) {
      console.error('❌ Erro ao verificar senha:', bcryptError)
      console.error('❌ Bcrypt error message:', bcryptError?.message)
      console.error('❌ Bcrypt error stack:', bcryptError?.stack)
      throw new Error('Erro ao verificar senha: ' + bcryptError?.message)
    }

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    // Atualizar último login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    )

    // Gerar token JWT
    console.log('Gerando token JWT...')
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        clinicId: user.clinic_id,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    console.log('Token gerado com sucesso')
    console.log('=== LOGIN CONCLUÍDO COM SUCESSO ===')

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clinicId: user.clinic_id,
      },
    })
  } catch (error: any) {
    console.error('❌ Erro no login:', error)
    console.error('❌ Stack trace:', error?.stack)
    console.error('❌ Error name:', error?.name)
    console.error('❌ Error code:', error?.code)
    
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error?.message || 'Erro desconhecido',
      ...(process.env.NODE_ENV === 'development' && {
        details: error?.stack,
        errorName: error?.name,
        errorCode: error?.code
      })
    })
  }
}
