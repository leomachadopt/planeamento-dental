import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateToken, AuthRequest } from '../../_shared/auth.js'
import pool from '../../_shared/db.js'

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

      if (!dossierId) {
        return res.status(400).json({ error: 'ID do dossiê é obrigatório' })
      }

      // Validar acesso ao dossiê
      const dossierResult = await pool.query(
        'SELECT clinic_id FROM dossiers WHERE id = $1',
        [dossierId],
      )

      if (dossierResult.rows.length === 0) {
        return res.status(404).json({ error: 'Dossiê não encontrado' })
      }

      const clinicId = dossierResult.rows[0].clinic_id

      if (user.role !== 'admin' && user.clinicId !== clinicId) {
        return res.status(403).json({ error: 'Acesso negado a este dossiê' })
      }

      if (method === 'GET') {
        // Listar última versão de cada seção
        const reportsResult = await pool.query(
          `SELECT DISTINCT ON (ar.section_code)
           ar.*,
           s.name as section_name,
           s.description as section_description,
           s.order_index as section_order,
           dss.completion_percent,
           dss.status as section_status
           FROM ai_reports ar
           JOIN sections s ON s.id = ar.section_id
           LEFT JOIN dossier_sections_status dss ON dss.dossier_id = ar.dossier_id AND dss.section_id = ar.section_id
           WHERE ar.dossier_id = $1
           ORDER BY ar.section_code, ar.created_at DESC`,
          [dossierId],
        )

        // Buscar todas as seções para incluir as que não têm relatório
        const allSectionsResult = await pool.query(
          `SELECT s.*, 
           COALESCE(dss.completion_percent, 0) as completion_percent,
           COALESCE(dss.status, 'not_started') as section_status
           FROM sections s
           LEFT JOIN dossier_sections_status dss ON dss.section_id = s.id AND dss.dossier_id = $1
           ORDER BY s.order_index`,
          [dossierId],
        )

        // Mapear relatórios por section_code
        const reportsMap = new Map(
          reportsResult.rows.map((r: any) => [
            r.section_code,
            {
              id: r.id,
              section_code: r.section_code,
              section_name: r.section_name,
              status: r.status,
              created_at: r.created_at,
              updated_at: r.updated_at,
              insights: r.insights_json,
              prompt_key: r.prompt_key,
              prompt_version: r.prompt_version,
              model: r.model,
            },
          ]),
        )

        // Combinar seções com seus relatórios
        const sectionsWithReports = allSectionsResult.rows.map((section: any) => {
          const report = reportsMap.get(section.code)
          return {
            section: {
              id: section.id,
              code: section.code,
              name: section.name,
              description: section.description,
              order_index: section.order_index,
              completion_percent: section.completion_percent,
              status: section.section_status,
            },
            report: report || null,
          }
        })

        return res.status(200).json(sectionsWithReports)
      }

      return res.status(405).json({ error: 'Método não permitido' })
    } catch (error: any) {
      console.error('Erro na API de listagem de relatórios:', error)
      return res.status(500).json({ error: error.message })
    }
  })
}

