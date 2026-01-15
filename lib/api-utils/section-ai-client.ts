// Versão server-side do AI client
import { getSystemPrompt, buildSectionReportPrompt } from '../../src/lib/section-prompts'
import type { SectionSnapshot } from './snapshotBuilder'
import pool from './db'

export interface InsightsJSON {
  score: {
    clarity: number
    consistency: number
    completeness: number
    impact_potential: number
  }
  identity_summary?: {
    purpose?: string
    vision?: string
    values?: string[]
    priority_audience?: string
    positioning?: string
    growth_focus?: string
  }
  alerts: Array<{
    severity: 'high' | 'medium' | 'low'
    title: string
    detail: string
    evidence: string[]
  }>
  recommendations: Array<{
    priority: number
    title: string
    detail: string
    effort: 'low' | 'medium' | 'high'
    expected_impact: 'low' | 'medium' | 'high'
  }>
  missing_data: Array<{
    item: string
    why_it_matters: string
    how_to_fill: string
  }>
  contradictions: Array<{
    title: string
    detail: string
    evidence: string[]
  }>
  checklist?: string[]
  tags: string[]
}

export interface AIReportResponse {
  report_markdown: string
  insights: InsightsJSON
}

export interface GenerateOptions {
  apiKey: string
  model?: string
  temperature?: number
  promptVersion?: string
  tone?: string
}

const DEFAULT_MODEL = 'gpt-4o'
const DEFAULT_TEMPERATURE = 0.5 // 0.4-0.6 para IDENTITY conforme especificado
const DEFAULT_TONE = 'intermediario'

/**
 * Busca prompt customizado do banco de dados
 * Retorna null se não encontrar, para usar fallback do código
 */
async function getCustomPromptFromDB(
  promptKey: string,
): Promise<{ system_prompt: string | null; user_prompt: string | null } | null> {
  try {
    const result = await pool.query(
      `SELECT system_prompt, user_prompt
       FROM ai_prompt_templates
       WHERE key = $1 AND is_active = true
       ORDER BY created_at DESC
       LIMIT 1`,
      [promptKey],
    )

    if (result.rows.length > 0) {
      return {
        system_prompt: result.rows[0].system_prompt,
        user_prompt: result.rows[0].user_prompt,
      }
    }

    return null
  } catch (error: any) {
    console.warn('Erro ao buscar prompt do banco:', error.message)
    return null
  }
}

/**
 * Substitui placeholders no user prompt (ex: {{SNAPSHOT_JSON}})
 */
function replacePlaceholders(userPrompt: string, snapshot: SectionSnapshot): string {
  const snapshotJson = JSON.stringify(snapshot, null, 2)
  return userPrompt.replace(/\{\{SNAPSHOT_JSON\}\}/g, snapshotJson)
}

export async function generateSectionReport(
  sectionCode: string,
  snapshot: SectionSnapshot,
  options: GenerateOptions,
): Promise<{
  report_markdown: string
  insights: InsightsJSON
  token_usage?: any
}> {
  const {
    apiKey,
    model = DEFAULT_MODEL,
    temperature = DEFAULT_TEMPERATURE,
    tone = DEFAULT_TONE,
  } = options

  let systemPrompt: string
  let userPrompt: string
  
  try {
    // Tentar buscar prompt customizado do banco primeiro
    const promptKey = `section_${sectionCode}`
    const customPrompt = await getCustomPromptFromDB(promptKey)

    if (customPrompt && (customPrompt.system_prompt || customPrompt.user_prompt)) {
      // Usar prompts customizados do banco
      systemPrompt = customPrompt.system_prompt || getSystemPrompt(tone)
      
      if (customPrompt.user_prompt) {
        // Substituir placeholders no user prompt
        userPrompt = replacePlaceholders(customPrompt.user_prompt, snapshot)
      } else {
        // Se não tiver user_prompt customizado, usar o do código
        userPrompt = buildSectionReportPrompt(sectionCode, snapshot, tone)
      }
      
      console.log(`Usando prompts customizados do banco para ${sectionCode}`)
    } else {
      // Fallback: usar prompts do código
      systemPrompt = getSystemPrompt(tone)
      userPrompt = buildSectionReportPrompt(sectionCode, snapshot, tone)
      console.log(`Usando prompts do código para ${sectionCode}`)
    }
  } catch (importError: any) {
    console.error('Erro ao carregar prompts:', importError)
    // Fallback em caso de erro
    systemPrompt = getSystemPrompt(tone)
    userPrompt = buildSectionReportPrompt(sectionCode, snapshot, tone)
  }

  // Ajustar max_tokens baseado na seção (IDENTITY precisa de mais tokens para 1400+ palavras)
  // 8000 tokens = ~6000 palavras, suficiente para 1400+ palavras de conteúdo + JSON structure
  const maxTokens = sectionCode === 'IDENTITY' ? 8000 : 4000

  let response: Response
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      }),
    })
  } catch (fetchError: any) {
    console.error('Erro na requisição para OpenAI:', fetchError)
    throw new Error(`Erro de conexão com OpenAI: ${fetchError.message}`)
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText)
    let errorData: any
    try {
      errorData = JSON.parse(errorText)
    } catch {
      errorData = { error: { message: errorText } }
    }
    console.error('Erro da API OpenAI:', errorData)
    throw new Error(`Erro na API OpenAI: ${errorData.error?.message || response.statusText} (Status: ${response.status})`)
  }

  let data: any
  try {
    data = await response.json()
  } catch (parseError: any) {
    console.error('Erro ao parsear resposta da OpenAI:', parseError)
    throw new Error('Resposta inválida da OpenAI')
  }

  const content = data.choices[0]?.message?.content

  if (!content) {
    console.error('Resposta vazia da OpenAI. Data recebida:', JSON.stringify(data).substring(0, 500))
    throw new Error('Resposta vazia da OpenAI')
  }

  // Verificar se a resposta foi cortada (finish_reason = 'length')
  const finishReason = data.choices[0]?.finish_reason
  if (finishReason === 'length') {
    console.warn('⚠️ ATENÇÃO: Resposta da IA foi cortada por limite de tokens!')
    console.warn('Token usage:', data.usage)
    console.warn('Tamanho do conteúdo recebido:', content.length, 'caracteres')
  }

  try {
    const parsed = parseAIResponse(content)

    // Verificar se o report_markdown está completo
    if (parsed.report_markdown) {
      console.log(`Report markdown gerado: ${parsed.report_markdown.length} caracteres`)
      if (finishReason === 'length' && parsed.report_markdown.length < 2000) {
        console.warn('⚠️ Relatório pode estar incompleto devido ao limite de tokens')
      }
    }

    return {
      report_markdown: parsed.report_markdown,
      insights: parsed.insights,
      token_usage: data.usage,
    }
  } catch (parseError: any) {
    console.error('Erro ao parsear resposta da IA:', parseError)
    console.error('Conteúdo recebido (primeiros 1000 chars):', content.substring(0, 1000))
    console.error('Conteúdo recebido (últimos 500 chars):', content.substring(Math.max(0, content.length - 500)))
    throw new Error(`Erro ao processar resposta da IA: ${parseError.message}`)
  }
}

function parseAIResponse(content: string): AIReportResponse {
  // Log do conteúdo recebido para debug
  console.log('Parseando resposta da IA. Tamanho:', content.length)
  console.log('Primeiros 500 caracteres:', content.substring(0, 500))

  // 1. Tentar parse JSON direto
  try {
    const parsed = JSON.parse(content)
    if (validateAIResponse(parsed)) {
      console.log('Parse bem-sucedido: JSON direto válido')
      return parsed
    } else {
      console.warn('JSON parseado mas validação falhou')
    }
  } catch (error: any) {
    console.log('Erro no parse JSON direto:', error.message)
  }

  // 2. Tentar extrair JSON de markdown code blocks
  try {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0]
      const parsed = JSON.parse(jsonStr)
      if (validateAIResponse(parsed)) {
        console.log('Parse bem-sucedido: JSON extraído de markdown')
        return parsed
      } else {
        console.warn('JSON extraído mas validação falhou')
      }
    }
  } catch (error: any) {
    console.log('Erro ao extrair JSON de markdown:', error.message)
  }

  // 3. Tentar corrigir estrutura (campos faltantes)
  try {
    const parsed = JSON.parse(content)
    const corrected = {
      report_markdown: parsed.report_markdown || parsed.report || '# Relatório\n\nErro ao processar resposta.',
      insights: correctInsightsStructure(parsed.insights || parsed),
    }
    if (validateAIResponse(corrected)) {
      console.log('Parse bem-sucedido: JSON corrigido')
      return corrected
    } else {
      console.warn('JSON corrigido mas validação ainda falhou')
      // Verificar se o report_markdown está presente e tem tamanho razoável
      if (corrected.report_markdown && corrected.report_markdown.length > 100) {
        console.warn('Retornando resposta parcial (sem validação completa) - report_markdown presente')
        return corrected as AIReportResponse
      }
    }
  } catch (error: any) {
    console.log('Erro ao corrigir JSON:', error.message)
    // Se o erro for de JSON truncado, tentar extrair o que for possível
    if (error.message.includes('Unexpected end') || error.message.includes('truncated')) {
      console.warn('JSON parece estar truncado. Tentando extrair conteúdo parcial...')
      try {
        // Tentar encontrar o report_markdown mesmo com JSON incompleto
        const markdownMatch = content.match(/"report_markdown"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/)
        if (markdownMatch && markdownMatch[1]) {
          const extractedMarkdown = markdownMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
          console.warn('Extraído report_markdown parcial do JSON truncado')
          return {
            report_markdown: extractedMarkdown,
            insights: correctInsightsStructure({}),
          }
        }
      } catch (extractError) {
        console.error('Erro ao extrair conteúdo parcial:', extractError)
      }
    }
  }

  // 4. Última tentativa: criar resposta mínima
  console.error('Não foi possível parsear resposta. Tamanho do conteúdo:', content.length)
  console.error('Primeiros 500 chars:', content.substring(0, 500))
  console.error('Últimos 500 chars:', content.substring(Math.max(0, content.length - 500)))
  throw new Error(`Não foi possível parsear a resposta da IA. Formato inválido. Tamanho: ${content.length} caracteres`)
}

function validateAIResponse(data: any): data is AIReportResponse {
  if (!data || typeof data !== 'object') return false
  if (!data.report_markdown || typeof data.report_markdown !== 'string') return false
  if (!data.insights || typeof data.insights !== 'object') return false

  const insights = data.insights
  if (!insights.score || typeof insights.score !== 'object') return false
  if (typeof insights.score.clarity !== 'number') return false
  if (typeof insights.score.consistency !== 'number') return false
  if (typeof insights.score.completeness !== 'number') return false
  if (typeof insights.score.impact_potential !== 'number') return false

  // identity_summary é opcional (apenas para IDENTITY)
  if (insights.identity_summary && typeof insights.identity_summary !== 'object') return false

  if (!Array.isArray(insights.alerts)) return false
  if (!Array.isArray(insights.recommendations)) return false
  if (!Array.isArray(insights.missing_data)) return false
  if (!Array.isArray(insights.contradictions)) return false
  if (insights.checklist && !Array.isArray(insights.checklist)) return false
  if (!Array.isArray(insights.tags)) return false

  return true
}

function correctInsightsStructure(insights: any): InsightsJSON {
  return {
    score: {
      clarity: insights.score?.clarity ?? insights.clarity ?? 5,
      consistency: insights.score?.consistency ?? insights.consistency ?? 5,
      completeness: insights.score?.completeness ?? insights.completeness ?? 5,
      impact_potential: insights.score?.impact_potential ?? insights.impact_potential ?? 5,
    },
    identity_summary: insights.identity_summary || undefined,
    alerts: Array.isArray(insights.alerts) ? insights.alerts : [],
    recommendations: Array.isArray(insights.recommendations) ? insights.recommendations : [],
    missing_data: Array.isArray(insights.missing_data) ? insights.missing_data : [],
    contradictions: Array.isArray(insights.contradictions) ? insights.contradictions : [],
    checklist: Array.isArray(insights.checklist) ? insights.checklist : undefined,
    tags: Array.isArray(insights.tags) ? insights.tags : [],
  }
}

export async function generateSectionReportWithRetry(
  sectionCode: string,
  snapshot: SectionSnapshot,
  options: GenerateOptions,
): Promise<{
  report_markdown: string
  insights: InsightsJSON
  token_usage?: any
}> {
  try {
    return await generateSectionReport(sectionCode, snapshot, options)
  } catch (error: any) {
    console.warn('Primeira tentativa falhou, tentando novamente...', error.message)
    try {
      return await generateSectionReport(sectionCode, snapshot, options)
    } catch (retryError: any) {
      throw new Error(`Falha após retry: ${retryError.message}`)
    }
  }
}



