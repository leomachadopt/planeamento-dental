import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateToken, requireAdmin, AuthRequest } from '@/lib/api-shared/auth'
import pool from '@/lib/api-shared/db'

// API para listar seções e question sets (para o admin gerenciar perguntas)
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
          // Buscar todas as seções
          const sectionsResult = await pool.query(
            'SELECT * FROM sections ORDER BY name'
          )

          // Para cada seção, buscar question sets ativos
          const sectionsWithQuestionSets = await Promise.all(
            sectionsResult.rows.map(async (section) => {
              const questionSetsResult = await pool.query(
                `SELECT DISTINCT ON (qs.subsection_id, qs.section_id)
                 qs.*, sub.code as subsection_code, sub.name as subsection_name
                 FROM question_sets qs
                 LEFT JOIN subsections sub ON sub.id = qs.subsection_id
                 WHERE qs.section_id = $1 AND qs.is_active = true
                 ORDER BY qs.subsection_id, qs.section_id, qs.version DESC`,
                [section.id]
              )

              return {
                ...section,
                questionSets: questionSetsResult.rows,
              }
            })
          )

          return res.status(200).json(sectionsWithQuestionSets)
        }

        return res.status(405).json({ error: 'Method not allowed' })
      } catch (error: any) {
        console.error('Erro ao buscar seções:', error)
        return res.status(500).json({ error: error.message || 'Erro interno do servidor' })
      }
    })
  })
}

