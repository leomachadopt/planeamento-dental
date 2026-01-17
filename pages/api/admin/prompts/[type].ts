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
    'GET,PUT,OPTIONS',
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
        const promptType = req.query.type as string

        if (!promptType) {
          return res.status(400).json({ error: 'Tipo de prompt é obrigatório' })
        }

        // Extrair section_code se for section_*
        let sectionCode: string | null = null
        if (promptType.startsWith('section_')) {
          sectionCode = promptType.replace('section_', '')
        }

        if (req.method === 'GET') {
          // Buscar prompt do banco
          const result = await pool.query(
            `SELECT 
              system_prompt,
              user_prompt,
              key,
              version,
              section_code,
              is_active,
              created_at,
              updated_at
            FROM ai_prompt_templates
            WHERE key = $1 AND is_active = true
            ORDER BY created_at DESC
            LIMIT 1`,
            [promptType],
          )

          if (result.rows.length > 0) {
            return res.status(200).json({
              key: result.rows[0].key,
              section_code: result.rows[0].section_code,
              system_prompt: result.rows[0].system_prompt || '',
              user_prompt: result.rows[0].user_prompt || '',
              version: result.rows[0].version,
              is_active: result.rows[0].is_active,
              created_at: result.rows[0].created_at,
              updated_at: result.rows[0].updated_at,
            })
          }

          // Se não encontrou, retornar vazio (frontend vai usar default do código)
          return res.status(200).json({
            key: promptType,
            section_code: sectionCode,
            system_prompt: '',
            user_prompt: '',
            version: '1.0.0',
            is_active: false,
            created_at: null,
            updated_at: null,
          })
        }

        if (req.method === 'PUT') {
          const { system_prompt, user_prompt } = req.body

          if (system_prompt === undefined && user_prompt === undefined) {
            return res.status(400).json({ error: 'system_prompt ou user_prompt é obrigatório' })
          }

          // Verificar se já existe um prompt ativo
          const existingResult = await pool.query(
            `SELECT id, version FROM ai_prompt_templates
             WHERE key = $1 AND is_active = true
             ORDER BY created_at DESC
             LIMIT 1`,
            [promptType],
          )

          let newVersion = '1.0.0'
          if (existingResult.rows.length > 0) {
            // Desativar versão anterior
            await pool.query(
              `UPDATE ai_prompt_templates
               SET is_active = false, updated_at = NOW()
               WHERE id = $1`,
              [existingResult.rows[0].id],
            )
            // Incrementar versão
            const currentVersion = existingResult.rows[0].version
            const versionParts = currentVersion.split('.')
            const minor = parseInt(versionParts[1] || '0') + 1
            newVersion = `${versionParts[0]}.${minor}.0`
          }

          // Buscar prompts atuais se não foram fornecidos
          let finalSystemPrompt = system_prompt
          let finalUserPrompt = user_prompt

          if (existingResult.rows.length > 0 && (system_prompt === undefined || user_prompt === undefined)) {
            const currentResult = await pool.query(
              `SELECT system_prompt, user_prompt FROM ai_prompt_templates WHERE id = $1`,
              [existingResult.rows[0].id],
            )
            if (currentResult.rows.length > 0) {
              if (system_prompt === undefined) {
                finalSystemPrompt = currentResult.rows[0].system_prompt
              }
              if (user_prompt === undefined) {
                finalUserPrompt = currentResult.rows[0].user_prompt
              }
            }
          }

          // Inserir nova versão
          const insertResult = await pool.query(
            `INSERT INTO ai_prompt_templates (
              key, version, template_text, system_prompt, user_prompt, section_code, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, true)
            RETURNING id, key, version, system_prompt, user_prompt, section_code, is_active, created_at, updated_at`,
            [
              promptType,
              newVersion,
              finalUserPrompt || '', // template_text mantido para compatibilidade
              finalSystemPrompt || '',
              finalUserPrompt || '',
              sectionCode,
            ],
          )

          return res.status(200).json({
            id: insertResult.rows[0].id,
            key: insertResult.rows[0].key,
            section_code: insertResult.rows[0].section_code,
            system_prompt: insertResult.rows[0].system_prompt,
            user_prompt: insertResult.rows[0].user_prompt,
            version: insertResult.rows[0].version,
            is_active: insertResult.rows[0].is_active,
            created_at: insertResult.rows[0].created_at,
            updated_at: insertResult.rows[0].updated_at,
          })
        }

        return res.status(405).json({ error: 'Método não permitido' })
      } catch (error: any) {
        console.error('Erro na API de prompts:', error)
        return res.status(500).json({ error: error.message })
      }
    })
  })
}


