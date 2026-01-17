import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateToken, requireAdmin, AuthRequest } from '@/lib/api-shared/auth'
import pool from '@/lib/api-shared/db'

/**
 * API para importação em lote de perguntas via JSON
 * Recebe um JSON com estrutura:
 * {
 *   "block": {
 *     "code": "OFFER_VALUE_PROPOSITION",
 *     "name": "Bloco 4 — Oferta & Proposta de Valor",
 *     "description": "...",
 *     "questions": [...]
 *   }
 * }
 */
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
        if (req.method === 'POST') {
          const { block } = req.body

          if (!block || !block.code || !block.questions || !Array.isArray(block.questions)) {
            return res.status(400).json({
              error: 'Formato inválido. Esperado: { block: { code, name, description, questions: [...] } }'
            })
          }

          console.log('📦 Iniciando importação em lote')
          console.log(`📋 Bloco: ${block.code}`)
          console.log(`📊 Perguntas: ${block.questions.length}`)

          // Extrair o código da seção do código do bloco (ex: "OFFER" de "OFFER_VALUE_PROPOSITION")
          const sectionCode = block.code.split('_')[0]
          console.log(`🔍 Seção extraída: ${sectionCode}`)

          // Buscar seção
          const sectionResult = await pool.query(
            'SELECT id, code, name FROM sections WHERE code = $1',
            [sectionCode]
          )

          if (sectionResult.rows.length === 0) {
            return res.status(404).json({
              error: `Seção '${sectionCode}' não encontrada`,
              hint: 'Certifique-se de que a seção existe no banco de dados'
            })
          }

          const section = sectionResult.rows[0]
          console.log(`✅ Seção encontrada: ${section.name} (${section.id})`)

          // Verificar se já existe um question_set com este código
          let questionSet
          const existingQuestionSetResult = await pool.query(
            `SELECT id, name, version FROM question_sets
             WHERE section_id = $1 AND code = $2 AND is_active = true
             ORDER BY version DESC LIMIT 1`,
            [section.id, block.code]
          )

          if (existingQuestionSetResult.rows.length > 0) {
            questionSet = existingQuestionSetResult.rows[0]
            console.log(`📦 Question Set existente encontrado: ${questionSet.name} (v${questionSet.version})`)
            console.log('⚠️  As perguntas serão adicionadas a este question set existente')
          } else {
            // Criar novo question_set
            const newQuestionSetResult = await pool.query(
              `INSERT INTO question_sets (section_id, code, name, description, version, is_active)
               VALUES ($1, $2, $3, $4, 1, true)
               RETURNING id, name, version`,
              [section.id, block.code, block.name, block.description || null]
            )
            questionSet = newQuestionSetResult.rows[0]
            console.log(`✅ Novo Question Set criado: ${questionSet.name} (${questionSet.id})`)
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

          console.log(`📋 Tabela question_contexts existe: ${hasQuestionContexts}`)

          // Importar perguntas
          const importedQuestions: any[] = []
          const skippedQuestions: any[] = []
          const errors: any[] = []

          for (let i = 0; i < block.questions.length; i++) {
            const questionData = block.questions[i]

            try {
              console.log(`\n📝 Processando pergunta ${i + 1}/${block.questions.length}: ${questionData.code}`)

              // Verificar se já existe pergunta com este código
              const existingQuestion = await pool.query(
                'SELECT id, text FROM questions WHERE question_set_id = $1 AND code = $2',
                [questionSet.id, questionData.code]
              )

              if (existingQuestion.rows.length > 0) {
                console.log(`⚠️  Pergunta já existe: ${questionData.code}`)
                skippedQuestions.push({
                  code: questionData.code,
                  reason: 'Já existe',
                  existingId: existingQuestion.rows[0].id
                })
                continue
              }

              // Processar validation_schema
              let processedValidationSchema: string | null = null
              if (questionData.validation_schema && typeof questionData.validation_schema === 'object') {
                const cleaned = Object.fromEntries(
                  Object.entries(questionData.validation_schema).filter(([_, v]) => v !== undefined && v !== null && v !== '')
                )
                if (Object.keys(cleaned).length > 0) {
                  processedValidationSchema = JSON.stringify(cleaned)
                }
              }

              // Inserir pergunta
              const questionResult = await pool.query(
                `INSERT INTO questions (
                  question_set_id, code, text, help_text, type, required,
                  order_index, validation_schema, ai_importance_weight
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *`,
                [
                  questionSet.id,
                  questionData.code,
                  questionData.text,
                  questionData.help_text || null,
                  questionData.type,
                  questionData.required || false,
                  i, // order_index baseado na posição no array
                  processedValidationSchema,
                  questionData.ai_importance_weight || 0.5,
                ]
              )

              const question = questionResult.rows[0]
              console.log(`✅ Pergunta criada: ${question.code} (${question.id})`)

              // Inserir opções se houver
              if ((questionData.type === 'single_select' || questionData.type === 'multi_select') &&
                  questionData.options && Array.isArray(questionData.options) &&
                  questionData.options.length > 0) {
                for (let j = 0; j < questionData.options.length; j++) {
                  const option = questionData.options[j]
                  await pool.query(
                    `INSERT INTO question_options (question_id, label, value, order_index)
                     VALUES ($1, $2, $3, $4)`,
                    [question.id, option.label, option.value || option.label, option.order_index || j]
                  )
                }
                console.log(`   ✅ ${questionData.options.length} opções criadas`)
              }

              // Inserir contexto se houver e se a tabela existir
              if (questionData.context && hasQuestionContexts) {
                const ctx = questionData.context
                await pool.query(
                  `INSERT INTO question_contexts (
                    question_id, why, consequences, how_to_answer,
                    good_examples, bad_examples,
                    show_why, show_consequences, show_how_to_answer,
                    show_good_examples, show_bad_examples
                  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                  [
                    question.id,
                    ctx.why || null,
                    ctx.consequences && Array.isArray(ctx.consequences) ? ctx.consequences : null,
                    ctx.how_to_answer || null,
                    ctx.good_examples && Array.isArray(ctx.good_examples) ? ctx.good_examples : null,
                    ctx.bad_examples && Array.isArray(ctx.bad_examples) ? ctx.bad_examples : null,
                    ctx.show_why !== undefined ? ctx.show_why : true,
                    ctx.show_consequences !== undefined ? ctx.show_consequences : true,
                    ctx.show_how_to_answer !== undefined ? ctx.show_how_to_answer : true,
                    ctx.show_good_examples !== undefined ? ctx.show_good_examples : true,
                    ctx.show_bad_examples !== undefined ? ctx.show_bad_examples : true,
                  ]
                )
                console.log(`   ✅ Contexto criado`)
              }

              importedQuestions.push({
                id: question.id,
                code: question.code,
                text: question.text
              })

            } catch (error: any) {
              console.error(`❌ Erro ao processar pergunta ${questionData.code}:`, error.message)
              errors.push({
                code: questionData.code,
                error: error.message
              })
            }
          }

          console.log('\n✅ Importação concluída')
          console.log(`   Importadas: ${importedQuestions.length}`)
          console.log(`   Ignoradas: ${skippedQuestions.length}`)
          console.log(`   Erros: ${errors.length}`)

          return res.status(200).json({
            success: true,
            questionSet: {
              id: questionSet.id,
              name: questionSet.name,
              version: questionSet.version
            },
            section: {
              id: section.id,
              code: section.code,
              name: section.name
            },
            summary: {
              total: block.questions.length,
              imported: importedQuestions.length,
              skipped: skippedQuestions.length,
              errors: errors.length
            },
            imported: importedQuestions,
            skipped: skippedQuestions,
            errors: errors
          })
        }

        return res.status(405).json({ error: 'Method not allowed' })
      } catch (error: any) {
        console.error('❌ Erro na importação em lote:', error)
        console.error('🔍 Stack trace:', error.stack)
        return res.status(500).json({
          error: error.message || 'Erro interno do servidor',
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        })
      }
    })
  })
}
