import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateToken, AuthRequest } from '../../../_shared/auth.js'
import pool from '../../../_shared/db.js'
import { buildSectionSnapshot } from '../../../_shared/snapshotBuilder.js'
import { generateSectionReportWithRetry } from '../../../_shared/section-ai-client.js'
import { markFinalReportAsStale } from '../../../_shared/staleTracking.js'

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
      const sectionCode = req.query.sectionCode as string

      if (!dossierId || !sectionCode) {
        return res.status(400).json({ error: 'dossierId e sectionCode são obrigatórios' })
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

      // Validar seção
      const sectionResult = await pool.query('SELECT id FROM sections WHERE code = $1', [
        sectionCode,
      ])

      if (sectionResult.rows.length === 0) {
        return res.status(404).json({ error: 'Seção não encontrada' })
      }

      const sectionId = sectionResult.rows[0].id

      if (method === 'GET') {
        // Retornar último relatório da seção
        const reportResult = await pool.query(
          `SELECT * FROM ai_reports 
           WHERE dossier_id = $1 AND section_code = $2 
           ORDER BY created_at DESC 
           LIMIT 1`,
          [dossierId, sectionCode],
        )

        if (reportResult.rows.length === 0) {
          return res.status(404).json({ error: 'Relatório ainda não gerado para esta seção' })
        }

        const report = reportResult.rows[0]
        return res.status(200).json({
          id: report.id,
          status: report.status,
          report_markdown: report.report_markdown,
          insights: report.insights_json,
          created_at: report.created_at,
          updated_at: report.updated_at,
          prompt_key: report.prompt_key,
          prompt_version: report.prompt_version,
          model: report.model,
        })
      }

      if (method === 'POST') {
        // Gerar novo relatório
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
          console.error('OPENAI_API_KEY não configurada')
          return res.status(500).json({ error: 'Configuração do servidor incompleta' })
        }

        try {
          // 1. Build snapshot
          console.log(`Construindo snapshot para seção ${sectionCode}...`)
          const snapshot = await buildSectionSnapshot(dossierId, sectionCode)

          // 2. Registrar evento
          let reportId: string | null = null
          try {
            const eventResult = await pool.query(
              `INSERT INTO ai_report_events (ai_report_id, event_type, payload_json)
               VALUES (NULL, 'snapshot_built', $1)
               RETURNING id`,
              [JSON.stringify({ section_code: sectionCode, dossier_id: dossierId })],
            )
          } catch (error) {
            // Ignorar erro de eventos (opcional)
          }

          // 3. Call LLM
          console.log(`Chamando IA para gerar relatório...`)
          const aiResult = await generateSectionReportWithRetry(sectionCode, snapshot, {
            apiKey,
            model: 'gpt-4o',
            temperature: 0.7,
            promptVersion: '1.0.0',
            tone: 'intermediario',
          })

          // 4. Persistir relatório
          const insertResult = await pool.query(
            `INSERT INTO ai_reports (
              clinic_id, dossier_id, section_id, section_code, status,
              input_snapshot_json, report_markdown, insights_json,
              prompt_key, prompt_version, model, temperature, token_usage_json
            ) VALUES ($1, $2, $3, $4, 'generated', $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id`,
            [
              clinicId,
              dossierId,
              sectionId,
              sectionCode,
              JSON.stringify(snapshot),
              aiResult.report_markdown,
              JSON.stringify(aiResult.insights),
              'SECTION_REPORT_V1',
              '1.0.0',
              'gpt-4o',
              0.7,
              aiResult.token_usage ? JSON.stringify(aiResult.token_usage) : null,
            ],
          )

          reportId = insertResult.rows[0].id

          // 5. Marcar relatórios anteriores como stale
          await pool.query(
            `UPDATE ai_reports 
             SET status = 'stale', updated_at = NOW()
             WHERE dossier_id = $1 AND section_code = $2 AND id != $3 AND status = 'generated'`,
            [dossierId, sectionCode, reportId],
          )

          // Marcar relatório final como stale quando uma seção é regenerada
          await markFinalReportAsStale(dossierId)

          // 6. Registrar eventos
          try {
            await pool.query(
              `UPDATE ai_report_events SET ai_report_id = $1 WHERE ai_report_id IS NULL`,
              [reportId],
            )
            await pool.query(
              `INSERT INTO ai_report_events (ai_report_id, event_type, payload_json)
               VALUES ($1, 'llm_called', $2)`,
              [reportId, JSON.stringify({ model: 'gpt-4o', temperature: 0.7 })],
            )
            await pool.query(
              `INSERT INTO ai_report_events (ai_report_id, event_type, payload_json)
               VALUES ($1, 'persisted', $2)`,
              [reportId, JSON.stringify({ success: true })],
            )
          } catch (error) {
            // Ignorar erros de eventos
          }

          console.log(`Relatório gerado com sucesso: ${reportId}`)

          return res.status(200).json({
            id: reportId,
            status: 'generated',
            report_markdown: aiResult.report_markdown,
            insights: aiResult.insights,
            created_at: new Date().toISOString(),
          })
        } catch (error: any) {
          console.error('Erro ao gerar relatório:', error)

          // Salvar erro no banco
          try {
            const errorReportResult = await pool.query(
              `INSERT INTO ai_reports (
                clinic_id, dossier_id, section_id, section_code, status,
                input_snapshot_json, report_markdown, insights_json,
                error_message, prompt_key, prompt_version, model
              ) VALUES ($1, $2, $3, $4, 'error', $5, '', '{}', $6, $7, $8, $9)
              RETURNING id`,
              [
                clinicId,
                dossierId,
                sectionId,
                sectionCode,
                JSON.stringify({ error: 'Snapshot não pôde ser construído' }),
                error.message,
                'SECTION_REPORT_V1',
                '1.0.0',
                'gpt-4o',
              ],
            )

            // Registrar evento de erro
            try {
              await pool.query(
                `INSERT INTO ai_report_events (ai_report_id, event_type, payload_json)
                 VALUES ($1, 'error', $2)`,
                [errorReportResult.rows[0].id, JSON.stringify({ error: error.message })],
              )
            } catch {
              // Ignorar
            }
          } catch (dbError) {
            console.error('Erro ao salvar erro no banco:', dbError)
          }

          return res.status(500).json({
            error: 'Erro ao gerar relatório',
            message: error.message,
          })
        }
      }

      return res.status(405).json({ error: 'Método não permitido' })
    } catch (error: any) {
      console.error('Erro na API de relatórios:', error)
      return res.status(500).json({ error: error.message })
    }
  })
}

