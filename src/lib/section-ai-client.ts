import { getSystemPrompt, buildSectionReportPrompt } from './section-prompts'
import type { SectionSnapshot } from '@/services/snapshotBuilder'

export interface InsightsJSON {
  score: {
    clarity: number
    consistency: number
    completeness: number
    impact_potential: number
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
const DEFAULT_TEMPERATURE = 0.7
const DEFAULT_TONE = 'intermediario'
const DEFAULT_PROMPT_VERSION = '1.0.0'

/**
 * Gera um relatório de seção usando IA
 */
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
    promptVersion = DEFAULT_PROMPT_VERSION,
    tone = DEFAULT_TONE,
  } = options

  const systemPrompt = getSystemPrompt(tone)
  const userPrompt = buildSectionReportPrompt(sectionCode, snapshot, tone)

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
      throw new Error(
        `Erro na API OpenAI: ${error.error?.message || response.statusText}`,
      )
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('Resposta vazia da OpenAI')
    }

    // Parse e validação da resposta
    const parsed = parseAIResponse(content)

    return {
      report_markdown: parsed.report_markdown,
      insights: parsed.insights,
      token_usage: data.usage,
    }
  } catch (error: any) {
    console.error('Erro ao gerar relatório com OpenAI:', error)
    throw new Error(`Falha na geração do relatório: ${error.message}`)
  }
}

/**
 * Parse robusto da resposta da IA
 */
function parseAIResponse(content: string): AIReportResponse {
  // 1. Tentar parse JSON direto
  try {
    const parsed = JSON.parse(content)
    if (validateAIResponse(parsed)) {
      return parsed
    }
  } catch (error) {
    // JSON inválido, tentar extrair
  }

  // 2. Tentar extrair JSON de markdown (caso a IA tenha envolvido em markdown)
  try {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0]
      const parsed = JSON.parse(jsonStr)
      if (validateAIResponse(parsed)) {
        return parsed
      }
    }
  } catch (error) {
    // Falha ao extrair JSON
  }

  // 3. Tentar corrigir JSON comum (adicionar chaves faltantes)
  try {
    const parsed = JSON.parse(content)
    const corrected = {
      report_markdown: parsed.report_markdown || parsed.report || '# Relatório\n\nErro ao processar resposta.',
      insights: correctInsightsStructure(parsed.insights || parsed),
    }
    if (validateAIResponse(corrected)) {
      return corrected
    }
  } catch (error) {
    // Falha na correção
  }

  throw new Error('Não foi possível parsear a resposta da IA. Formato inválido.')
}

/**
 * Valida estrutura da resposta
 */
function validateAIResponse(data: any): data is AIReportResponse {
  if (!data || typeof data !== 'object') return false

  if (!data.report_markdown || typeof data.report_markdown !== 'string') {
    return false
  }

  if (!data.insights || typeof data.insights !== 'object') {
    return false
  }

  // Validar estrutura básica de insights
  const insights = data.insights
  if (!insights.score || typeof insights.score !== 'object') return false
  if (typeof insights.score.clarity !== 'number') return false
  if (typeof insights.score.consistency !== 'number') return false
  if (typeof insights.score.completeness !== 'number') return false
  if (typeof insights.score.impact_potential !== 'number') return false

  // Arrays devem existir (podem estar vazios)
  if (!Array.isArray(insights.alerts)) return false
  if (!Array.isArray(insights.recommendations)) return false
  if (!Array.isArray(insights.missing_data)) return false
  if (!Array.isArray(insights.contradictions)) return false
  if (!Array.isArray(insights.tags)) return false

  return true
}

/**
 * Corrige estrutura de insights se estiver incompleta
 */
function correctInsightsStructure(insights: any): InsightsJSON {
  return {
    score: {
      clarity: insights.score?.clarity ?? insights.clarity ?? 5,
      consistency: insights.score?.consistency ?? insights.consistency ?? 5,
      completeness: insights.score?.completeness ?? insights.completeness ?? 5,
      impact_potential: insights.score?.impact_potential ?? insights.impact_potential ?? 5,
    },
    alerts: Array.isArray(insights.alerts) ? insights.alerts : [],
    recommendations: Array.isArray(insights.recommendations) ? insights.recommendations : [],
    missing_data: Array.isArray(insights.missing_data) ? insights.missing_data : [],
    contradictions: Array.isArray(insights.contradictions) ? insights.contradictions : [],
    tags: Array.isArray(insights.tags) ? insights.tags : [],
  }
}

/**
 * Gera relatório com retry (1 tentativa)
 */
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
    // 1 retry máximo
    console.warn('Primeira tentativa falhou, tentando novamente...', error.message)
    try {
      return await generateSectionReport(sectionCode, snapshot, options)
    } catch (retryError: any) {
      throw new Error(`Falha após retry: ${retryError.message}`)
    }
  }
}


