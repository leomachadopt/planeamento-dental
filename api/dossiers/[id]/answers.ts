import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateToken, AuthRequest } from '../../_shared/auth.js'
import pool from '../../_shared/db.js'
import { markSectionReportsAsStale, getSectionForQuestion, markFinalReportAsStale } from '../../_shared/staleTracking.js'
import { updateSectionCompletion } from '../../_shared/sectionCompletion.js'

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
        // Obter respostas por seção ou todas
        let query = `
          SELECT a.*, q.code as question_code, q.text as question_text, q.type as question_type
          FROM answers a
          JOIN questions q ON q.id = a.question_id
          WHERE a.dossier_id = $1
        `
        const params: any[] = [dossierId]

        if (sectionCode) {
          query += `
            AND q.question_set_id IN (
              SELECT qs.id FROM question_sets qs
              JOIN sections s ON s.id = qs.section_id
              WHERE s.code = $2
            )
          `
          params.push(sectionCode)
        }

        query += ' ORDER BY q.order_index'

        const result = await pool.query(query, params)
        return res.status(200).json(result.rows)
      }

      if (method === 'POST') {
        // Upsert de respostas (array)
        const { answers } = req.body

        if (!Array.isArray(answers)) {
          return res.status(400).json({ error: 'answers deve ser um array' })
        }

        // Validar que todas as perguntas existem e pertencem ao dossiê
        const questionIds = answers.map((a: any) => a.questionId).filter(Boolean)
        if (questionIds.length === 0) {
          return res.status(400).json({ error: 'Nenhuma pergunta válida fornecida' })
        }

        const questionsCheck = await pool.query(
          'SELECT id, code, type FROM questions WHERE id = ANY($1::uuid[])',
          [questionIds],
        )

        if (questionsCheck.rows.length !== questionIds.length) {
          return res.status(400).json({ error: 'Uma ou mais perguntas não foram encontradas' })
        }

        // Processar cada resposta
        const upsertPromises = answers.map(async (answer: any) => {
          const { questionId, valueText, valueNumber, valueJson, source } = answer

          // Determinar qual campo usar baseado no tipo da pergunta
          const question = questionsCheck.rows.find((q: any) => q.id === questionId)
          if (!question) return null

          let finalValueText = null
          let finalValueNumber = null
          let finalValueJson = null

          if (question.type === 'number' || question.type === 'currency' || question.type === 'scale') {
            finalValueNumber = valueNumber !== undefined ? valueNumber : (valueText ? parseFloat(valueText) : null)
          } else if (question.type === 'json' || question.type === 'multi_select') {
            finalValueJson = valueJson || (valueText ? JSON.parse(valueText) : null)
          } else {
            finalValueText = valueText !== undefined ? valueText : (valueNumber ? String(valueNumber) : null)
          }

          return pool.query(
            `INSERT INTO answers (dossier_id, question_id, value_text, value_number, value_json, source, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())
             ON CONFLICT (dossier_id, question_id) 
             DO UPDATE SET 
               value_text = EXCLUDED.value_text,
               value_number = EXCLUDED.value_number,
               value_json = EXCLUDED.value_json,
               source = EXCLUDED.source,
               updated_at = NOW()
             RETURNING *`,
            [dossierId, questionId, finalValueText, finalValueNumber, finalValueJson, source || 'user'],
          )
        })

        const results = await Promise.all(upsertPromises.filter(Boolean))
        const savedAnswers = results.map((r: any) => r.rows[0]).filter(Boolean)

        // Marcar relatórios como stale para as seções afetadas
        const affectedSections = new Set<string>()
        for (const answer of savedAnswers) {
          const sectionCode = await getSectionForQuestion(answer.question_id)
          if (sectionCode) {
            affectedSections.add(sectionCode)
          }
        }

        // Se sectionCode foi fornecido, usar ele diretamente
        if (sectionCode) {
          affectedSections.add(sectionCode)
        }

        // Marcar todos os relatórios das seções afetadas como stale
        for (const sectionCodeToMark of affectedSections) {
          await markSectionReportsAsStale(dossierId, sectionCodeToMark)
        }

        // Marcar relatório final como stale se alguma seção foi afetada
        if (affectedSections.size > 0) {
          await markFinalReportAsStale(dossierId)
        }

        // Atualizar completude das seções afetadas
        for (const sectionCodeToUpdate of affectedSections) {
          await updateSectionCompletion(dossierId, sectionCodeToUpdate)
        }

        return res.status(200).json({ saved: savedAnswers.length, answers: savedAnswers })
      }

      return res.status(405).json({ error: 'Método não permitido' })
    } catch (error: any) {
      console.error('Erro na API de respostas:', error)
      return res.status(500).json({ error: error.message })
    }
  })
}

