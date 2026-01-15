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
    'GET,OPTIONS',
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
          // Estatísticas gerais
          const [usersResult, clinicsResult, reportsResult] = await Promise.all([
            pool.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_active = true) as active FROM users'),
            pool.query('SELECT COUNT(*) as total FROM clinics'),
            pool.query(`
              SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE generated_at >= CURRENT_DATE) as today,
                COUNT(*) FILTER (WHERE generated_at >= DATE_TRUNC('month', CURRENT_DATE)) as this_month
              FROM reports
            `).catch(() => ({ rows: [{ total: '0', today: '0', this_month: '0' }] })),
          ])

          return res.status(200).json({
            totalUsers: parseInt(usersResult.rows[0]?.total || '0'),
            activeUsers: parseInt(usersResult.rows[0]?.active || '0'),
            totalClinics: parseInt(clinicsResult.rows[0]?.total || '0'),
            totalReports: parseInt(reportsResult.rows[0]?.total || '0'),
            reportsToday: parseInt(reportsResult.rows[0]?.today || '0'),
            reportsThisMonth: parseInt(reportsResult.rows[0]?.this_month || '0'),
            pendingReports: 0, // TODO: implementar status de relatórios
            failedReports: 0, // TODO: implementar status de relatórios
          })
        }

        return res.status(405).json({ error: 'Método não permitido' })
      } catch (error: any) {
        console.error('Erro na API de estatísticas:', error)
        return res.status(500).json({ error: 'Erro interno do servidor' })
      }
    })
  })
}




