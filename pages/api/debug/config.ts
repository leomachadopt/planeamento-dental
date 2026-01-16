import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateToken, AuthRequest } from '@/lib/api-shared/auth'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
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

      // Apenas admin pode ver configurações
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' })
      }

      // Verificar variáveis de ambiente (sem expor valores completos)
      const config = {
        DATABASE_URL: process.env.DATABASE_URL ? '✅ Configurado' : '❌ Não configurado',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '✅ Configurado' : '❌ Não configurado',
        NODE_ENV: process.env.NODE_ENV || 'development',
        VERCEL: process.env.VERCEL ? 'Sim' : 'Não',
        VERCEL_ENV: process.env.VERCEL_ENV || 'N/A',
      }

      // Se configurado, mostrar primeiros/últimos caracteres
      if (process.env.OPENAI_API_KEY) {
        const key = process.env.OPENAI_API_KEY
        config.OPENAI_API_KEY = `✅ ${key.substring(0, 7)}...${key.substring(key.length - 4)}`
      }

      return res.status(200).json({
        status: 'ok',
        config,
        ready_for_ai_reports: !!process.env.OPENAI_API_KEY,
      })
    } catch (error: any) {
      console.error('Erro na API de config:', error)
      return res.status(500).json({ error: error.message })
    }
  })
}
