// Versão server-side do AI client
import { getSystemPrompt, buildSectionReportPrompt } from '@/lib/section-prompts'
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

const DEFAULT_MODEL = 'gpt-4o-2024-08-06' // Suporta até 16K tokens de output
const DEFAULT_TEMPERATURE = 0.5 // 0.4-0.6 para IDENTITY conforme especificado
const DEFAULT_TONE = 'intermediario'

export interface PromptConfig {
  system_prompt: string | null
  user_prompt: string | null
  temperature: number
  max_tokens: number
  model: string
}

/**
 * Busca prompt customizado do banco de dados com configurações de modelo
 * Retorna null se não encontrar, para usar fallback do código
 */
async function getCustomPromptFromDB(
  promptKey: string,
): Promise<PromptConfig | null> {
  try {
    const result = await pool.query(
      `SELECT system_prompt, user_prompt, temperature, max_tokens, model
       FROM ai_prompt_templates
       WHERE key = $1 AND is_active = true
       ORDER BY created_at DESC
       LIMIT 1`,
      [promptKey],
    )

    if (result.rows.length > 0) {
      // Se max_tokens do banco for muito baixo (< 8000), usar 16384 como fallback
      const dbMaxTokens = result.rows[0].max_tokens || 0
      const safeMaxTokens = dbMaxTokens >= 8000 ? dbMaxTokens : 16384

      if (dbMaxTokens > 0 && dbMaxTokens < 8000) {
        console.warn(`[getCustomPromptFromDB] max_tokens do banco (${dbMaxTokens}) é muito baixo. Usando ${safeMaxTokens} como fallback.`)
      }

      return {
        system_prompt: result.rows[0].system_prompt,
        user_prompt: result.rows[0].user_prompt,
        temperature: parseFloat(result.rows[0].temperature) || 0.7,
        max_tokens: safeMaxTokens,
        model: result.rows[0].model || 'gpt-4o',
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
    model: optModel = DEFAULT_MODEL,
    temperature: optTemperature = DEFAULT_TEMPERATURE,
    tone = DEFAULT_TONE,
  } = options

  let systemPrompt: string
  let userPrompt: string
  let finalModel = optModel
  let finalTemperature = optTemperature
  let finalMaxTokens = 16384 // Default máximo

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

      // Usar configurações de modelo do banco de dados
      finalModel = customPrompt.model || optModel
      finalTemperature = customPrompt.temperature || optTemperature
      finalMaxTokens = customPrompt.max_tokens || 16384

      console.log(`Usando prompts customizados do banco para ${sectionCode}`)
      console.log(`  Model: ${finalModel}, Temperature: ${finalTemperature}, Max Tokens: ${finalMaxTokens}`)
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

  const maxTokens = finalMaxTokens

  let response: Response
  try {
    const requestBody = {
      model: finalModel,
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
      temperature: finalTemperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
      stop: ['<<END_REPORT>>'], // Stop sequence para evitar lixo após JSON
    }

    // ===== LOG DO PAYLOAD COMPLETO =====
    console.log('===== PAYLOAD ENVIADO PARA OPENAI =====')
    console.log('model:', requestBody.model)
    console.log('temperature:', requestBody.temperature)
    console.log('max_tokens:', requestBody.max_tokens)
    console.log('response_format:', JSON.stringify(requestBody.response_format))
    console.log('stop:', JSON.stringify(requestBody.stop))
    console.log('messages[0].role:', requestBody.messages[0].role)
    console.log('messages[0].content (length):', requestBody.messages[0].content.length)
    console.log('messages[1].role:', requestBody.messages[1].role)
    console.log('messages[1].content (length):', requestBody.messages[1].content.length)
    console.log('========================================')

    // Log resumido para facilitar leitura
    console.log(`[OpenAI Request] Model: ${finalModel}, MaxTokens: ${maxTokens}, Temperature: ${finalTemperature}, Stop: ${JSON.stringify(requestBody.stop)}`)

    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
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

  // ===== LOG DA RESPOSTA CRUA (APÓS CHAMADA) =====
  const finishReason = data.choices?.[0]?.finish_reason
  const rawContent = data.choices?.[0]?.message?.content
  const contentLength = rawContent?.length || 0
  const last200Chars = rawContent?.substring(Math.max(0, contentLength - 200)) || ''
  const hasStopMarker = rawContent?.includes('<<END_REPORT>>') || false

  console.log('===== RESPOSTA DA OPENAI (APÓS CHAMADA) =====')
  console.log('finish_reason:', finishReason)
  console.log('token_usage:', JSON.stringify(data.usage))
  console.log('model:', data.model)
  console.log('Campo usado: data.choices[0].message.content')
  console.log('Tamanho:', contentLength, 'caracteres')
  console.log('Últimos 200 chars:', last200Chars)
  console.log('Contém <<END_REPORT>>:', hasStopMarker)
  if (!hasStopMarker) {
    console.warn('⚠️ STOP_MARKER_NOT_FOUND: O texto NÃO contém <<END_REPORT>>')
  }
  console.log('==============================================')

  if (!rawContent) {
    console.error('Resposta vazia da OpenAI. Data recebida:', JSON.stringify(data).substring(0, 500))
    throw new Error('Resposta vazia da OpenAI')
  }

  // Verificar se a resposta foi cortada (finish_reason = 'length')
  // NÃO fazer retry automático - retornar erro amigável
  if (finishReason === 'length') {
    console.error('===== TRUNCATION DETECTADO =====')
    console.error('finish_reason: length')
    console.error('completion_tokens:', data.usage?.completion_tokens)
    console.error('max_tokens configurado:', maxTokens)
    console.error('Tamanho do conteúdo recebido:', contentLength, 'caracteres')
    console.error('================================')

    // Erro amigável sem retry
    const errorMsg = `Relatório truncado: a IA gerou ${data.usage?.completion_tokens} tokens mas o limite é ${maxTokens}. ` +
      `Aumente o max_tokens nas configurações do prompt para pelo menos 8000 (recomendado: 16000).`
    throw new Error(`TRUNCATED_NO_RETRY: ${errorMsg}`)
  }

  try {
    const parsed = parseAIResponse(rawContent)

    // Verificar se o report_markdown está completo
    if (parsed.report_markdown) {
      console.log(`Report markdown gerado: ${parsed.report_markdown.length} caracteres`)
      if (parsed.report_markdown.length < 6000) {
        console.warn(`⚠️ Relatório pode estar incompleto: ${parsed.report_markdown.length} caracteres (esperado mínimo: 6000)`)
      }
    }

    return {
      report_markdown: parsed.report_markdown,
      insights: parsed.insights,
      token_usage: data.usage,
    }
  } catch (parseError: any) {
    console.error('===== ERRO DE PARSING =====')
    console.error('Mensagem:', parseError.message)
    console.error('Conteúdo completo que falhou no parse:')
    console.error(rawContent)
    console.error('===========================')
    throw new Error(`Erro ao processar resposta da IA: ${parseError.message}`)
  }
}

function parseAIResponse(content: string): AIReportResponse {
  console.log('[parseAIResponse] Iniciando parsing. Tamanho do conteúdo:', content.length)

  // ===== PASSO 1: Limpar conteúdo =====
  let cleanedContent = content

  // Se existir <<END_REPORT>>, cortar tudo depois
  const endReportIndex = cleanedContent.indexOf('<<END_REPORT>>')
  if (endReportIndex !== -1) {
    console.log('[parseAIResponse] Encontrado <<END_REPORT>> na posição', endReportIndex)
    cleanedContent = cleanedContent.substring(0, endReportIndex).trim()
    console.log('[parseAIResponse] Conteúdo após corte:', cleanedContent.length, 'caracteres')
  }

  // Remover markdown code blocks se existirem
  const codeBlockMatch = cleanedContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (codeBlockMatch) {
    console.log('[parseAIResponse] Removendo code blocks do markdown')
    cleanedContent = codeBlockMatch[1].trim()
  }

  // ===== PASSO 2: Extrair JSON do primeiro { ao último } =====
  const firstBrace = cleanedContent.indexOf('{')
  const lastBrace = cleanedContent.lastIndexOf('}')

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    console.error('[parseAIResponse] ERRO: Não encontrou estrutura JSON válida')
    console.error('[parseAIResponse] firstBrace:', firstBrace, 'lastBrace:', lastBrace)
    console.error('[parseAIResponse] Conteúdo limpo:', cleanedContent.substring(0, 500))
    throw new Error(`JSON não encontrado na resposta. Conteúdo não contém { } válidos.`)
  }

  const jsonStr = cleanedContent.substring(firstBrace, lastBrace + 1)
  console.log('[parseAIResponse] JSON extraído. Tamanho:', jsonStr.length)
  console.log('[parseAIResponse] Início do JSON:', jsonStr.substring(0, 200))
  console.log('[parseAIResponse] Final do JSON:', jsonStr.substring(Math.max(0, jsonStr.length - 200)))

  // ===== PASSO 3: Parse do JSON =====
  let parsed: any
  try {
    parsed = JSON.parse(jsonStr)
    console.log('[parseAIResponse] JSON.parse bem-sucedido')
    console.log('[parseAIResponse] Campos encontrados:', Object.keys(parsed).join(', '))
  } catch (parseError: any) {
    console.error('[parseAIResponse] ERRO no JSON.parse:', parseError.message)
    console.error('[parseAIResponse] jsonStr que falhou:')
    console.error(jsonStr)
    throw new Error(`Falha no JSON.parse: ${parseError.message}. Verifique os logs para ver o jsonStr.`)
  }

  // ===== PASSO 4: Validar e corrigir estrutura =====
  const result: AIReportResponse = {
    report_markdown: parsed.report_markdown || parsed.report || '',
    insights: correctInsightsStructure(parsed.insights || {}),
  }

  if (!result.report_markdown) {
    console.error('[parseAIResponse] ERRO: report_markdown está vazio')
    console.error('[parseAIResponse] Campos no parsed:', Object.keys(parsed).join(', '))
    throw new Error('Campo report_markdown está vazio ou não existe na resposta.')
  }

  console.log('[parseAIResponse] Parsing concluído com sucesso')
  console.log('[parseAIResponse] report_markdown:', result.report_markdown.length, 'caracteres')
  console.log('[parseAIResponse] insights.score:', JSON.stringify(result.insights.score))

  return result
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
  console.log(`[generateSectionReportWithRetry] Iniciando para seção: ${sectionCode}`)

  try {
    const result = await generateSectionReport(sectionCode, snapshot, options)
    console.log(`[generateSectionReportWithRetry] Sucesso na primeira tentativa`)
    return result
  } catch (error: any) {
    console.error(`[generateSectionReportWithRetry] Primeira tentativa falhou: ${error.message}`)

    // NÃO fazer retry se for erro de truncation - é um problema de configuração
    if (error.message.includes('TRUNCATED_NO_RETRY')) {
      console.error('[generateSectionReportWithRetry] Erro de truncation - NÃO fazendo retry')
      // Extrair mensagem amigável
      const friendlyMsg = error.message.replace('TRUNCATED_NO_RETRY: ', '')
      throw new Error(friendlyMsg)
    }

    // Para outros erros, tentar novamente UMA vez
    console.warn('[generateSectionReportWithRetry] Tentando novamente (retry 1/1)...')

    try {
      const result = await generateSectionReport(sectionCode, snapshot, options)
      console.log(`[generateSectionReportWithRetry] Sucesso no retry`)
      return result
    } catch (retryError: any) {
      console.error(`[generateSectionReportWithRetry] Retry também falhou: ${retryError.message}`)

      // Se for truncation no retry, não propagar como "Falha após retry"
      if (retryError.message.includes('TRUNCATED_NO_RETRY')) {
        const friendlyMsg = retryError.message.replace('TRUNCATED_NO_RETRY: ', '')
        throw new Error(friendlyMsg)
      }

      throw new Error(`Falha após retry: ${retryError.message}`)
    }
  }
}



