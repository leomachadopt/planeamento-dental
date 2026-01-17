import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateToken, requireAdmin, AuthRequest } from '@/lib/api-shared/auth'
import pool from '@/lib/api-shared/db'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'POST,OPTIONS',
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
        const { method } = req

        if (method === 'POST') {
          const { updates } = req.body

          if (!updates || !Array.isArray(updates)) {
            return res.status(400).json({ error: 'Updates array é obrigatório' })
          }

          console.log('🔄 Reordenando perguntas:', updates)

          // Atualizar a ordem de cada pergunta
          const client = await pool.connect()
          try {
            await client.query('BEGIN')

            for (const update of updates) {
              await client.query(
                'UPDATE questions SET order_index = $1 WHERE id = $2',
                [update.order_index, update.id]
              )
            }

            await client.query('COMMIT')
            console.log('✅ Reordenação concluída com sucesso')
          } catch (error) {
            await client.query('ROLLBACK')
            throw error
          } finally {
            client.release()
          }

          return res.status(200).json({ success: true })
        }

        return res.status(405).json({ error: 'Method not allowed' })
      } catch (error: any) {
        console.error('❌ Erro ao reordenar perguntas:', error)
        return res.status(500).json({ error: error.message || 'Erro interno do servidor' })
      }
    })
  })
}
