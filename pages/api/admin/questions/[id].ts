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
    'GET,PUT,DELETE,OPTIONS',
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
        const { id } = req.query

        if (!id || typeof id !== 'string') {
          return res.status(400).json({ error: 'ID da pergunta é obrigatório' })
        }

        if (method === 'GET') {
          // Verificar se a tabela question_contexts existe
          let hasQuestionContexts = false
          try {
            const tableCheck = await pool.query(`
              SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'question_contexts'
              )
            `)
            hasQuestionContexts = tableCheck.rows[0]?.exists || false
          } catch {
            hasQuestionContexts = false
          }

          let questionQuery = `SELECT q.* FROM questions q WHERE q.id = $1`
          if (hasQuestionContexts) {
            questionQuery = `SELECT q.*, qc.*
             FROM questions q
             LEFT JOIN question_contexts qc ON qc.question_id = q.id
             WHERE q.id = $1`
          }

          const questionResult = await pool.query(questionQuery, [id])

          if (questionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Pergunta não encontrada' })
          }

          const question = questionResult.rows[0]

          // Buscar opções
          if (question.type === 'single_select' || question.type === 'multi_select') {
            const optionsResult = await pool.query(
              'SELECT * FROM question_options WHERE question_id = $1 ORDER BY order_index',
              [id]
            )
            question.options = optionsResult.rows
          }

          // Parse validation_schema
          if (question.validation_schema && typeof question.validation_schema === 'string') {
            try {
              question.validation_schema = JSON.parse(question.validation_schema)
            } catch {
              question.validation_schema = null
            }
          }

          return res.status(200).json(question)
        }

        if (method === 'PUT') {
          const {
            code,
            text,
            help_text,
            type,
            required,
            order_index,
            validation_schema,
            ai_importance_weight,
            options,
            context,
          } = req.body

          // Atualizar pergunta
          await pool.query(
            `UPDATE questions SET
              code = $1, text = $2, help_text = $3, type = $4,
              required = $5, order_index = $6, validation_schema = $7,
              ai_importance_weight = $8
            WHERE id = $9`,
            [
              code,
              text,
              help_text || null,
              type,
              required,
              order_index,
              validation_schema ? JSON.stringify(validation_schema) : null,
              ai_importance_weight || 0.5,
              id,
            ]
          )

          // Atualizar opções
          if (type === 'single_select' || type === 'multi_select') {
            // Deletar opções antigas
            await pool.query('DELETE FROM question_options WHERE question_id = $1', [id])

            // Inserir novas opções
            if (options && Array.isArray(options) && options.length > 0) {
              for (const option of options) {
                await pool.query(
                  `INSERT INTO question_options (question_id, label, value, order_index)
                   VALUES ($1, $2, $3, $4)`,
                  [id, option.label, option.value, option.order_index || 0]
                )
              }
            }
          } else {
            // Se mudou de tipo que tinha opções para um que não tem, deletar opções
            await pool.query('DELETE FROM question_options WHERE question_id = $1', [id])
          }

          // Verificar se a tabela question_contexts existe
          let hasQuestionContexts = false
          try {
            const tableCheck = await pool.query(`
              SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'question_contexts'
              )
            `)
            hasQuestionContexts = tableCheck.rows[0]?.exists || false
          } catch {
            hasQuestionContexts = false
          }

          // Atualizar ou criar contexto (apenas se a tabela existir)
          if (context !== undefined && hasQuestionContexts) {
            const contextResult = await pool.query(
              'SELECT id FROM question_contexts WHERE question_id = $1',
              [id]
            )

            if (contextResult.rows.length > 0) {
              // Atualizar
              await pool.query(
                `UPDATE question_contexts SET
                  why = $1, consequences = $2, how_to_answer = $3,
                  good_examples = $4, bad_examples = $5,
                  show_why = $6, show_consequences = $7, show_how_to_answer = $8,
                  show_good_examples = $9, show_bad_examples = $10,
                  updated_at = NOW()
                WHERE question_id = $11`,
                [
                  context.why || null,
                  context.consequences && Array.isArray(context.consequences) ? context.consequences : null,
                  context.how_to_answer || null,
                  context.good_examples && Array.isArray(context.good_examples) ? context.good_examples : null,
                  context.bad_examples && Array.isArray(context.bad_examples) ? context.bad_examples : null,
                  context.show_why !== undefined ? context.show_why : true,
                  context.show_consequences !== undefined ? context.show_consequences : true,
                  context.show_how_to_answer !== undefined ? context.show_how_to_answer : true,
                  context.show_good_examples !== undefined ? context.show_good_examples : true,
                  context.show_bad_examples !== undefined ? context.show_bad_examples : true,
                  id,
                ]
              )
            } else if (context && (context.why || context.how_to_answer || context.consequences || context.good_examples || context.bad_examples)) {
              // Criar apenas se houver conteúdo
              await pool.query(
                `INSERT INTO question_contexts (
                  question_id, why, consequences, how_to_answer,
                  good_examples, bad_examples,
                  show_why, show_consequences, show_how_to_answer,
                  show_good_examples, show_bad_examples
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [
                  id,
                  context.why || null,
                  context.consequences && Array.isArray(context.consequences) ? context.consequences : null,
                  context.how_to_answer || null,
                  context.good_examples && Array.isArray(context.good_examples) ? context.good_examples : null,
                  context.bad_examples && Array.isArray(context.bad_examples) ? context.bad_examples : null,
                  context.show_why !== undefined ? context.show_why : true,
                  context.show_consequences !== undefined ? context.show_consequences : true,
                  context.show_how_to_answer !== undefined ? context.show_how_to_answer : true,
                  context.show_good_examples !== undefined ? context.show_good_examples : true,
                  context.show_bad_examples !== undefined ? context.show_bad_examples : true,
                ]
              )
            }
          }

          return res.status(200).json({ success: true })
        }

        if (method === 'DELETE') {
          // Deletar pergunta (cascata deleta contexto e opções)
          const deleteResult = await pool.query('DELETE FROM questions WHERE id = $1 RETURNING id', [id])
          
          if (deleteResult.rows.length === 0) {
            return res.status(404).json({ error: 'Pergunta não encontrada' })
          }

          return res.status(200).json({ success: true })
        }

        return res.status(405).json({ error: 'Method not allowed' })
      } catch (error: any) {
        console.error('Erro na API de perguntas:', error)
        return res.status(500).json({ error: error.message || 'Erro interno do servidor' })
      }
    })
  })
}

