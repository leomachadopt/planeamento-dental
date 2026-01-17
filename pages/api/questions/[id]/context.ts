import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateToken, AuthRequest } from '@/lib/api-shared/auth'
import pool from '@/lib/api-shared/db'

// API pública (autenticada) para buscar contexto de uma pergunta
// Usada pelo QuestionWizard para exibir contexto dinâmico
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

  return authenticateToken(req as AuthRequest, res, async () => {
    try {
      if (req.method === 'GET') {
        const { id } = req.query

        if (!id || typeof id !== 'string') {
          return res.status(400).json({ error: 'ID da pergunta é obrigatório' })
        }

        const result = await pool.query(
          `SELECT 
            qc.why,
            qc.consequences,
            qc.how_to_answer,
            qc.good_examples,
            qc.bad_examples,
            qc.show_why,
            qc.show_consequences,
            qc.show_how_to_answer,
            qc.show_good_examples,
            qc.show_bad_examples,
            q.code as question_code
          FROM question_contexts qc
          JOIN questions q ON q.id = qc.question_id
          WHERE qc.question_id = $1`,
          [id]
        )

        if (result.rows.length === 0) {
          return res.status(200).json(null) // Sem contexto, retorna null
        }

        const context = result.rows[0]

        // Retornar apenas seções que devem ser mostradas
        const response: any = {
          question_code: context.question_code,
        }

        if (context.show_why && context.why) {
          response.why = context.why
        }

        if (context.show_consequences && context.consequences && context.consequences.length > 0) {
          response.consequences = context.consequences
        }

        if (context.show_how_to_answer && context.how_to_answer) {
          response.howToAnswer = context.how_to_answer
        }

        if (context.show_good_examples && context.good_examples && context.good_examples.length > 0) {
          response.goodExamples = context.good_examples
        }

        if (context.show_bad_examples && context.bad_examples && context.bad_examples.length > 0) {
          response.badExamples = context.bad_examples
        }

        return res.status(200).json(response)
      }

      return res.status(405).json({ error: 'Method not allowed' })
    } catch (error: any) {
      console.error('Erro ao buscar contexto:', error)
      return res.status(500).json({ error: error.message || 'Erro interno do servidor' })
    }
  })
}

