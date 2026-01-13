/**
 * Serviço de geração de relatórios usando OpenAI
 *
 * Este serviço NÃO deve ser usado diretamente no frontend.
 * Deve ser chamado apenas através da API route (/api/reports/generate)
 * pois a chave da OpenAI não deve ser exposta no cliente.
 */

import {
  getSystemPrompt,
  buildDiagnosticPrompt,
  buildStrategicPrompt,
  buildAdvancedPrompt,
  buildTacticalPrompt,
  buildOperationalPrompt,
  buildFinalPrompt,
} from './prompts'
import type { StrategyState } from '@/stores/useStrategyStore'

export type ReportType =
  | 'diagnostic'
  | 'strategic'
  | 'advanced'
  | 'tactical'
  | 'operational'
  | 'final'

interface GenerateReportOptions {
  reportType: ReportType
  state: StrategyState
  apiKey: string
}

/**
 * Gera um relatório usando a API da OpenAI
 */
export async function generateReportWithAI({
  reportType,
  state,
  apiKey,
}: GenerateReportOptions): Promise<any> {
  const tone = state.config_inicial.tom_linguagem || 'intermediario'
  const systemPrompt = getSystemPrompt(tone)

  // Selecionar o prompt correto baseado no tipo de relatório
  let userPrompt = ''
  switch (reportType) {
    case 'diagnostic':
      userPrompt = buildDiagnosticPrompt(state)
      break
    case 'strategic':
      userPrompt = buildStrategicPrompt(state)
      break
    case 'advanced':
      userPrompt = buildAdvancedPrompt(state)
      break
    case 'tactical':
      userPrompt = buildTacticalPrompt(state)
      break
    case 'operational':
      userPrompt = buildOperationalPrompt(state)
      break
    case 'final':
      userPrompt = buildFinalPrompt(state)
      break
    default:
      throw new Error(`Tipo de relatório inválido: ${reportType}`)
  }

  try {
    // Fazer chamada à API da OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
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
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(
        `Erro na API OpenAI: ${error.error?.message || response.statusText}`,
      )
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('Resposta vazia da OpenAI')
    }

    // Parse do JSON retornado
    const reportData = JSON.parse(content)

    // Adicionar timestamp
    reportData.generatedAt = new Date().toISOString()

    return reportData
  } catch (error: any) {
    console.error('Erro ao gerar relatório com OpenAI:', error)
    throw new Error(`Falha na geração do relatório: ${error.message}`)
  }
}

/**
 * Valida se um relatório gerado tem a estrutura esperada
 */
export function validateReportStructure(
  reportType: ReportType,
  data: any,
): boolean {
  if (!data || typeof data !== 'object') return false

  switch (reportType) {
    case 'diagnostic':
      return !!(
        data.executiveSummary &&
        data.businessContext &&
        data.operationAnalysis &&
        data.marketAnalysis &&
        data.swot &&
        data.insightsRisks
      )
    case 'strategic':
      return !!(
        data.mission &&
        data.vision &&
        data.values &&
        data.strategicPrinciples &&
        data.valueProposition &&
        data.valueChain &&
        data.competitivePositioning &&
        data.bscObjectives &&
        data.strategicMapText
      )
    case 'advanced':
      return !!(
        data.portersForces &&
        data.pestel &&
        data.crossedSwot &&
        data.jtbd &&
        data.valueCanvas &&
        data.blueOcean &&
        data.guidingPolicies &&
        data.tradeOffs
      )
    case 'tactical':
      return !!(data.okrs && data.kpis && data.initiatives)
    case 'operational':
      return !!(data.routines && data.sops && data.checklists && data.calendar)
    case 'final':
      return !!(
        data.cover &&
        data.introduction &&
        data.part1_diagnosis &&
        data.part2_strategy &&
        data.part3_advanced &&
        data.part4_tactical &&
        data.part5_operational &&
        data.conclusion
      )
    default:
      return false
  }
}
