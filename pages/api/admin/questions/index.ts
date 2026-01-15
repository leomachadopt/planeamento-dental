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
    'GET,POST,OPTIONS',
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

        if (method === 'GET') {
          const { sectionCode, questionSetId } = req.query
          
          console.log('📋 Buscando perguntas:', { sectionCode, questionSetId })

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

          let query = `
            SELECT 
              q.id,
              q.code,
              q.text,
              q.help_text,
              q.type,
              q.required,
              q.order_index,
              q.validation_schema,
              q.ai_importance_weight,
              q.created_at,
              q.question_set_id,
              qs.section_id,
              qs.name as question_set_name,
              s.code as section_code,
              s.name as section_name
          `
          
          // Adicionar campos de contexto apenas se a tabela existir
          if (hasQuestionContexts) {
            query += `,
              qc.why,
              qc.consequences,
              qc.how_to_answer,
              qc.good_examples,
              qc.bad_examples,
              qc.show_why,
              qc.show_consequences,
              qc.show_how_to_answer,
              qc.show_good_examples,
              qc.show_bad_examples
            FROM questions q
            JOIN question_sets qs ON qs.id = q.question_set_id
            JOIN sections s ON s.id = qs.section_id
            LEFT JOIN question_contexts qc ON qc.question_id = q.id
            WHERE qs.is_active = true
          `
          } else {
            query += `
            FROM questions q
            JOIN question_sets qs ON qs.id = q.question_set_id
            JOIN sections s ON s.id = qs.section_id
            WHERE qs.is_active = true
          `
          }
          const params: any[] = []
          let paramIndex = 1

          if (sectionCode) {
            query += ` AND s.code = $${paramIndex}`
            params.push(sectionCode)
            paramIndex++
          }

          if (questionSetId) {
            const qsId = Array.isArray(questionSetId) ? questionSetId[0] : questionSetId
            query += ` AND q.question_set_id = $${paramIndex}`
            params.push(qsId)
            paramIndex++
            console.log('🔍 Filtrando por questionSetId:', qsId)
          }

          query += ` ORDER BY q.order_index`

          let result
          try {
            console.log('🔍 Executando query:', query.substring(0, 200) + '...')
            console.log('📊 Parâmetros:', params)
            result = await pool.query(query, params)
            console.log(`✅ Query executada com sucesso. ${result.rows.length} perguntas encontradas.`)
          } catch (queryError: any) {
            console.error('❌ Erro na query SQL:', queryError)
            console.error('📝 Query completa:', query)
            console.error('📊 Parâmetros:', params)
            console.error('🔍 Stack trace:', queryError.stack)
            throw new Error(`Erro ao executar query: ${queryError.message}`)
          }

          console.log(`📦 Processando ${result.rows.length} perguntas...`)
          
          // Buscar opções para cada pergunta
          const questionsWithOptions = await Promise.all(
            result.rows.map(async (q: any, index: number) => {
              if (index === 0) {
                console.log('📋 Primeira pergunta (amostra):', {
                  id: q.id,
                  code: q.code,
                  text: q.text?.substring(0, 50),
                  type: q.type,
                  hasContext: !!(q.why || q.consequences || q.how_to_answer)
                })
              }
              if (q.type === 'single_select' || q.type === 'multi_select') {
                const optionsResult = await pool.query(
                  'SELECT * FROM question_options WHERE question_id = $1 ORDER BY order_index',
                  [q.id]
                )
                q.options = optionsResult.rows.map((opt: any) => ({
                  id: opt.id,
                  label: opt.label,
                  value: opt.value,
                  order_index: opt.order_index,
                }))
              }
              
              // Parse JSON fields - validation_schema é JSONB, pode vir como objeto ou string
              if (q.validation_schema) {
                if (typeof q.validation_schema === 'string') {
                  try {
                    q.validation_schema = JSON.parse(q.validation_schema)
                  } catch {
                    q.validation_schema = null
                  }
                }
                // Se já for objeto, manter como está
              } else {
                q.validation_schema = null
              }
              
              // Formatar contexto se existir (apenas se a tabela question_contexts existir)
              if (hasQuestionContexts) {
                // Verificar se há algum campo de contexto não nulo
                const hasContext = (q.why !== null && q.why !== undefined) ||
                                  (q.consequences !== null && q.consequences !== undefined) ||
                                  (q.how_to_answer !== null && q.how_to_answer !== undefined) ||
                                  (q.good_examples !== null && q.good_examples !== undefined) ||
                                  (q.bad_examples !== null && q.bad_examples !== undefined)
                
                if (hasContext) {
                // Tratar arrays do PostgreSQL - podem vir como array ou como string
                const normalizeArray = (value: any): string[] => {
                  if (!value) return []
                  if (Array.isArray(value)) return value
                  if (typeof value === 'string') {
                    try {
                      const parsed = JSON.parse(value)
                      return Array.isArray(parsed) ? parsed : []
                    } catch {
                      return [value]
                    }
                  }
                  return []
                }
                
                q.context = {
                  why: q.why || undefined,
                  consequences: normalizeArray(q.consequences),
                  how_to_answer: q.how_to_answer || undefined,
                  good_examples: normalizeArray(q.good_examples),
                  bad_examples: normalizeArray(q.bad_examples),
                  show_why: q.show_why !== undefined && q.show_why !== null ? q.show_why : true,
                  show_consequences: q.show_consequences !== undefined && q.show_consequences !== null ? q.show_consequences : true,
                  show_how_to_answer: q.show_how_to_answer !== undefined && q.show_how_to_answer !== null ? q.show_how_to_answer : true,
                  show_good_examples: q.show_good_examples !== undefined && q.show_good_examples !== null ? q.show_good_examples : true,
                  show_bad_examples: q.show_bad_examples !== undefined && q.show_bad_examples !== null ? q.show_bad_examples : true,
                  }
                } else {
                  q.context = undefined
                }
                
                // Remover campos individuais do contexto para não duplicar
                if ('why' in q) delete q.why
                if ('consequences' in q) delete q.consequences
                if ('how_to_answer' in q) delete q.how_to_answer
                if ('good_examples' in q) delete q.good_examples
                if ('bad_examples' in q) delete q.bad_examples
                if ('show_why' in q) delete q.show_why
                if ('show_consequences' in q) delete q.show_consequences
                if ('show_how_to_answer' in q) delete q.show_how_to_answer
                if ('show_good_examples' in q) delete q.show_good_examples
                if ('show_bad_examples' in q) delete q.show_bad_examples
              } else {
                // Se a tabela não existe, contexto é sempre undefined
                q.context = undefined
              }
              
              return q
            })
          )

          console.log(`✅ Processamento concluído. Retornando ${questionsWithOptions.length} perguntas.`)
          
          try {
            return res.status(200).json(questionsWithOptions)
          } catch (jsonError: any) {
            console.error('❌ Erro ao serializar JSON:', jsonError)
            console.error('📋 Primeira pergunta (amostra):', JSON.stringify(questionsWithOptions[0], null, 2))
            throw new Error(`Erro ao serializar resposta: ${jsonError.message}`)
          }
        }

        if (method === 'POST') {
          const {
            question_set_id,
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

          console.log('📝 Dados recebidos no POST:', {
            question_set_id,
            code,
            text: text?.substring(0, 50),
            type,
            order_index,
            validation_schema,
            hasOptions: !!options,
            hasContext: !!context,
          })

          // Validar campos obrigatórios
          if (!question_set_id || !code || !text || !type) {
            return res.status(400).json({ error: 'Campos obrigatórios: question_set_id, code, text, type' })
          }

          // Se order_index não foi fornecido, definir como 0 (será ajustado pelo frontend)
          const finalOrderIndex = order_index !== undefined ? order_index : 0

          // Verificar se já existe uma pergunta com o mesmo code no mesmo question_set_id
          const existingQuestion = await pool.query(
            'SELECT id, text FROM questions WHERE question_set_id = $1 AND code = $2',
            [question_set_id, code]
          )

          if (existingQuestion.rows.length > 0) {
            return res.status(409).json({ 
              error: 'Já existe uma pergunta com este código neste question set',
              existingId: existingQuestion.rows[0].id,
              existingText: existingQuestion.rows[0].text,
              message: 'Use a edição para atualizar a pergunta existente ou altere o código.'
            })
          }

          // Processar validation_schema: remover propriedades undefined e tratar objeto vazio
          let processedValidationSchema: string | null = null
          if (validation_schema && typeof validation_schema === 'object') {
            // Remover propriedades undefined
            const cleaned = Object.fromEntries(
              Object.entries(validation_schema).filter(([_, v]) => v !== undefined && v !== null && v !== '')
            )
            // Só salvar se tiver pelo menos uma propriedade
            if (Object.keys(cleaned).length > 0) {
              processedValidationSchema = JSON.stringify(cleaned)
            }
          }

          // Criar pergunta
          const questionResult = await pool.query(
            `INSERT INTO questions (
              question_set_id, code, text, help_text, type, required,
              order_index, validation_schema, ai_importance_weight
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *`,
            [
              question_set_id,
              code,
              text,
              help_text || null,
              type,
              required || false,
              finalOrderIndex,
              processedValidationSchema,
              ai_importance_weight || 0.5,
            ]
          )

          const question = questionResult.rows[0]

          // Criar opções se for seleção
          if ((type === 'single_select' || type === 'multi_select') && options && Array.isArray(options)) {
            for (const option of options) {
              await pool.query(
                `INSERT INTO question_options (question_id, label, value, order_index)
                 VALUES ($1, $2, $3, $4)`,
                [question.id, option.label, option.value, option.order_index || 0]
              )
            }
          }

          // Verificar se a tabela question_contexts existe antes de criar contexto
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

          // Criar contexto se fornecido e se a tabela existir
          if (context && hasQuestionContexts) {
            await pool.query(
              `INSERT INTO question_contexts (
                question_id, why, consequences, how_to_answer, 
                good_examples, bad_examples,
                show_why, show_consequences, show_how_to_answer,
                show_good_examples, show_bad_examples
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
              [
                question.id,
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

          // Buscar pergunta completa com contexto e opções
          let fullQuestionQuery = `SELECT q.* FROM questions q WHERE q.id = $1`
          if (hasQuestionContexts) {
            fullQuestionQuery = `SELECT q.*, qc.*
             FROM questions q
             LEFT JOIN question_contexts qc ON qc.question_id = q.id
             WHERE q.id = $1`
          }
          
          const fullQuestionResult = await pool.query(fullQuestionQuery, [question.id])

          const fullQuestion = fullQuestionResult.rows[0]

          if (fullQuestion.type === 'single_select' || fullQuestion.type === 'multi_select') {
            const optionsResult = await pool.query(
              'SELECT * FROM question_options WHERE question_id = $1 ORDER BY order_index',
              [question.id]
            )
            fullQuestion.options = optionsResult.rows
          }

          return res.status(201).json(fullQuestion)
        }

        return res.status(405).json({ error: 'Method not allowed' })
      } catch (error: any) {
        console.error('❌ Erro na API de perguntas:', error)
        console.error('🔍 Stack trace:', error.stack)
        console.error('📋 Request body:', JSON.stringify(req.body, null, 2))
        console.error('📋 Request method:', req.method)
        return res.status(500).json({ 
          error: error.message || 'Erro interno do servidor',
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        })
      }
    })
  })
}

