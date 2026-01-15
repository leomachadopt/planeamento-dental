import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateToken, AuthRequest } from '@/lib/api-shared/auth'
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

  return authenticateToken(req as AuthRequest, res, async () => {
    try {
      const { method } = req
      const authReq = req as AuthRequest
      const user = authReq.user!
      const dossierId = req.query.id as string
      const sectionCode = req.query.sectionCode as string

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
        if (sectionCode) {
          // Carregar dados completos de uma seção específica
          const sectionResult = await pool.query(
            'SELECT * FROM sections WHERE code = $1',
            [sectionCode],
          )

          if (sectionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Seção não encontrada' })
          }

          const section = sectionResult.rows[0]

          // Buscar status da seção
          const statusResult = await pool.query(
            `SELECT * FROM dossier_sections_status 
             WHERE dossier_id = $1 AND section_id = $2`,
            [dossierId, section.id],
          )

          const sectionStatus = statusResult.rows[0] || {
            status: 'not_started',
            completion_percent: 0,
          }

          // Buscar question_sets ativos da seção (apenas a versão mais recente de cada)
          const questionSetsResult = await pool.query(
            `SELECT DISTINCT ON (qs.subsection_id, qs.section_id)
             qs.*, sub.code as subsection_code, sub.name as subsection_name
             FROM question_sets qs
             LEFT JOIN subsections sub ON sub.id = qs.subsection_id
             WHERE qs.section_id = $1 AND qs.is_active = true
             ORDER BY qs.subsection_id, qs.section_id, qs.version DESC`,
            [section.id],
          )

          // Para cada question_set, buscar perguntas e respostas
          const questionSetsWithData = await Promise.all(
            questionSetsResult.rows.map(async (qs) => {
              const questionsResult = await pool.query(
                `SELECT q.*, 
                 json_agg(
                   json_build_object('id', qo.id, 'label', qo.label, 'value', qo.value, 'order_index', qo.order_index)
                   ORDER BY qo.order_index
                 ) FILTER (WHERE qo.id IS NOT NULL) as options
                 FROM questions q
                 LEFT JOIN question_options qo ON qo.question_id = q.id
                 WHERE q.question_set_id = $1
                 GROUP BY q.id
                 ORDER BY q.order_index`,
                [qs.id],
              )

              // Buscar respostas para estas perguntas
              const questionIds = questionsResult.rows.map((q: any) => q.id)
              let answers: any[] = []

              if (questionIds.length > 0) {
                const answersResult = await pool.query(
                  `SELECT * FROM answers 
                   WHERE dossier_id = $1 AND question_id = ANY($2::uuid[])`,
                  [dossierId, questionIds],
                )
                answers = answersResult.rows
              }

              // Mapear respostas por question_id
              const answersMap = new Map(answers.map((a) => [a.question_id, a]))

              const questions = questionsResult.rows.map((q: any) => ({
                ...q,
                options: q.options || [],
                answer: answersMap.get(q.id) || null,
              }))

              return {
                ...qs,
                questions,
              }
            }),
          )

          // Buscar entidades relacionadas à seção (se for Identidade)
          let entities: any = {}
          if (sectionCode === 'IDENTITY') {
            const segmentsResult = await pool.query(
              'SELECT * FROM customer_segments WHERE clinic_id = $1 AND dossier_id = $2 ORDER BY priority, created_at',
              [clinicId, dossierId],
            )
            entities.customerSegments = segmentsResult.rows

            const propositionsResult = await pool.query(
              `SELECT vp.*, cs.name as target_segment_name
               FROM value_propositions vp
               LEFT JOIN customer_segments cs ON cs.id = vp.target_segment_id
               WHERE vp.clinic_id = $1 AND vp.dossier_id = $2
               ORDER BY vp.created_at`,
              [clinicId, dossierId],
            )
            entities.valuePropositions = propositionsResult.rows
          }

          return res.status(200).json({
            section,
            status: sectionStatus,
            questionSets: questionSetsWithData,
            entities,
          })
        } else {
          // Listar todas as seções com status
          const sectionsResult = await pool.query(
            `SELECT s.*, 
             COALESCE(dss.status, 'not_started') as status,
             COALESCE(dss.completion_percent, 0) as completion_percent,
             dss.last_updated_at
             FROM sections s
             LEFT JOIN dossier_sections_status dss ON dss.section_id = s.id AND dss.dossier_id = $1
             ORDER BY s.order_index`,
            [dossierId],
          )

          return res.status(200).json(sectionsResult.rows)
        }
      }

      return res.status(405).json({ error: 'Método não permitido' })
    } catch (error: any) {
      console.error('Erro na API de seções:', error)
      return res.status(500).json({ error: error.message })
    }
  })
}




