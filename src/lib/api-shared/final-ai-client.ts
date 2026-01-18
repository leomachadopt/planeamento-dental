// Versão server-side do AI client para Relatório Final
// Nota: getSystemPrompt e buildFinalReportPrompt precisam ser acessados via import dinâmico
// ou duplicados aqui. Por enquanto, vamos duplicar a lógica necessária.
import type { FinalSnapshot } from './finalSnapshotBuilder'

// Duplicar getSystemPrompt aqui para evitar problemas de import
function getSystemPrompt(tone: string): string {
  const toneMap = {
    formal: 'Você é um consultor de gestão estratégica especializado em clínicas de saúde. Use linguagem formal, técnica e objetiva. Seja preciso e baseie todas as conclusões nos dados fornecidos.',
    informal: 'Você é um mentor de negócios que fala de forma acessível e direta. Use linguagem informal e próxima, evitando jargões excessivos. Seja prático e baseie recomendações nos dados fornecidos.',
    intermediario: 'Você é um consultor experiente que equilibra profissionalismo com clareza. Use linguagem clara, mas profissional. Seja objetivo e baseie análises nos dados fornecidos.',
  }
  return toneMap[tone as keyof typeof toneMap] || toneMap.intermediario
}

// Duplicar buildFinalReportPrompt aqui (versão completa do section-prompts.ts)
function buildFinalReportPrompt(snapshot: FinalSnapshot, tone: string = 'intermediario'): string {
  const finalReportInstruction = `
Você é um consultor sênior de gestão estratégica que recebeu todos os relatórios setoriais de uma clínica de saúde.
Sua missão é escrever o PARECER FINAL EXECUTIVO para o dono da clínica e/ou investidores.

Este documento será o documento estratégico oficial do negócio, consolidando todas as análises setoriais em uma narrativa única, clara e acionável.

**CONTEXTO:**
Você recebeu relatórios detalhados de cada área estratégica da clínica. Algumas áreas podem estar completas, outras podem ter lacunas.
Sua tarefa é:
1. Consolidar os achados em uma narrativa executiva única
2. Identificar as 3-7 prioridades estratégicas mais importantes
3. Mapear riscos críticos e oportunidades
4. Criar um roadmap de alto nível para os próximos 12-24 meses
5. Ser claro sobre o que NÃO fazer (kill list)

**ESTRUTURA OBRIGATÓRIA DO RELATÓRIO:**

1. **CAPA**
   - Nome da clínica: ${snapshot.clinic.name}
   - Nome do dossiê: ${snapshot.dossier.title}
   - Data: ${new Date().toLocaleDateString('pt-PT')}
   - Subtítulo: "Relatório Estratégico Consolidado"

2. **SUMÁRIO EXECUTIVO** (1-2 páginas equivalentes)
   - Diagnóstico geral da situação atual
   - 3-5 grandes conclusões principais
   - Visão geral do estado de saúde do negócio

3. **MAPA DE SAÚDE DO NEGÓCIO**
   - Visão geral por área (Identidade, Mercado, Oferta, Operações, Estratégia, Plano)
   - Pontos fortes e fracos de cada área
   - Scores médios de clareza, consistência, completude e potencial de impacto

4. **PRINCIPAIS RISCOS ESTRATÉGICOS**
   - Lista priorizada de riscos
   - Impacto de cada risco e por que são perigosos
   - Seções afetadas por cada risco

5. **PRINCIPAIS OPORTUNIDADES**
   - Oportunidades identificadas
   - Potencial de impacto
   - Esforço necessário

6. **AS 3-7 PRIORIDADES ESTRATÉGICAS**
   Para cada prioridade, incluir:
   - Contexto e situação atual
   - Por que é prioridade
   - Impacto esperado (alto/médio/baixo)
   - Esforço necessário (alto/médio/baixo)
   - Racional por trás da priorização

7. **ROADMAP DE ALTO NÍVEL (12-24 MESES)**
   - Fases ou ondas de implementação
   - O que vem antes do quê (dependências)
   - Marcos principais
   - Timeline aproximada

8. **O QUE NÃO FAZER**
   - Cortes estratégicos necessários
   - Focos a abandonar
   - Renúncias estratégicas conscientes
   - Atividades que não agregam valor

9. **APÊNDICE**
   - Resumo executivo de cada seção analisada
   - Referências aos relatórios setoriais completos

**DADOS CONSOLIDADOS:**

Clínica: ${snapshot.clinic.name}
Dossiê: ${snapshot.dossier.title}
Data de referência: ${snapshot.dossier.baseline_date || 'Não definida'}

**MÉTRICAS GLOBAIS:**

Scores Médios:
- Clareza: ${snapshot.global_metrics.average_scores.clarity.toFixed(1)}/10
- Consistência: ${snapshot.global_metrics.average_scores.consistency.toFixed(1)}/10
- Completude: ${snapshot.global_metrics.average_scores.completeness.toFixed(1)}/10
- Potencial de Impacto: ${snapshot.global_metrics.average_scores.impact_potential.toFixed(1)}/10

Alertas:
- Alta severidade: ${snapshot.global_metrics.high_severity_alerts}
- Média severidade: ${snapshot.global_metrics.medium_severity_alerts}
- Baixa severidade: ${snapshot.global_metrics.low_severity_alerts}

Total de recomendações: ${snapshot.global_metrics.total_recommendations}

**RELAÇÃO DE SEÇÕES:**

${snapshot.sections.map((section) => {
  const status = section.has_report
    ? section.is_stale
      ? '⚠️ DESATUALIZADO'
      : '✅ ATUALIZADO'
    : '❌ NÃO GERADO'
  return `
**${section.section_name}** (${section.section_code}) - ${status}
${section.has_report ? `Scores: C=${section.scores?.clarity || 0}/10, Co=${section.scores?.consistency || 0}/10, Cp=${section.scores?.completeness || 0}/10, I=${section.scores?.impact_potential || 0}/10` : 'Sem relatório disponível'}
${section.alerts && section.alerts.length > 0 ? `Alertas: ${section.alerts.length} (${section.alerts.filter((a: any) => a.severity === 'high').length} alta, ${section.alerts.filter((a: any) => a.severity === 'medium').length} média, ${section.alerts.filter((a: any) => a.severity === 'low').length} baixa)` : ''}
${section.recommendations && section.recommendations.length > 0 ? `Recomendações: ${section.recommendations.length}` : ''}
${section.report_markdown ? `\nConteúdo completo do relatório:\n${section.report_markdown}` : ''}
`
}).join('\n')}

${snapshot.missing_sections.length > 0 ? `\n⚠️ **SEÇÕES SEM RELATÓRIO:** ${snapshot.missing_sections.join(', ')}\nExplique no relatório que essas áreas não foram analisadas e por que isso importa.` : ''}

${snapshot.stale_sections.length > 0 ? `\n⚠️ **SEÇÕES DESATUALIZADAS:** ${snapshot.stale_sections.join(', ')}\nOs dados dessas seções foram alterados após a geração dos relatórios.` : ''}

**TOP RECOMENDAÇÕES (agrupadas):**

${snapshot.global_metrics.top_recommendations.slice(0, 10).map((rec: any, idx: number) => 
  `${idx + 1}. ${rec.title} (Prioridade: ${rec.priority}, Mencionada ${rec.frequency}x)`
).join('\n')}

---

**FORMATO DE SAÍDA ESPERADO:**

Você DEVE retornar um JSON válido com a seguinte estrutura EXATA:

{
  "report_markdown": "# Relatório Estratégico Consolidado\\n\\n[Conteúdo completo em Markdown seguindo a estrutura obrigatória acima]",
  "insights": {
    "global_score": {
      "clarity": 0-10,
      "consistency": 0-10,
      "completeness": 0-10,
      "impact_potential": 0-10
    },
    "top_priorities": [
      {
        "rank": 1-7,
        "title": "Título da prioridade",
        "rationale": "Por que é prioridade",
        "expected_impact": "high|medium|low",
        "effort": "high|medium|low"
      }
    ],
    "critical_risks": [
      {
        "severity": "high|medium|low",
        "title": "Título do risco",
        "detail": "Descrição detalhada",
        "affected_sections": ["IDENTITY", "MARKET", ...]
      }
    ],
    "key_opportunities": [
      {
        "title": "Título da oportunidade",
        "detail": "Descrição",
        "potential_impact": "high|medium|low",
        "effort_required": "high|medium|low"
      }
    ],
    "strategic_focus": ["foco 1", "foco 2", ...],
    "kill_list": ["coisa a parar de fazer 1", "coisa a parar de fazer 2", ...],
    "missing_sections": ["seção sem relatório 1", ...]
  }
}

**INSTRUÇÕES IMPORTANTES:**

- O report_markdown deve seguir EXATAMENTE a estrutura obrigatória listada acima
- Seja específico e cite dados concretos dos relatórios setoriais
- Priorize clareza e acionabilidade sobre complexidade
- Identifique contradições entre seções e resolva-as
- Seja honesto sobre lacunas (seções faltantes)
- O relatório deve ser útil tanto para o dono da clínica quanto para investidores
- Use linguagem ${tone === 'formal' ? 'formal e técnica' : tone === 'informal' ? 'acessível e direta' : 'clara e profissional'}
- O documento deve ter entre 15-25 páginas equivalentes quando impresso

Gere o relatório final completo e os insights estruturados baseados EXCLUSIVAMENTE nos dados fornecidos acima.
  `.trim()

  return finalReportInstruction
}

export interface FinalReportInsights {
  global_score: {
    clarity: number
    consistency: number
    completeness: number
    impact_potential: number
  }
  top_priorities: Array<{
    rank: number
    title: string
    rationale: string
    expected_impact: 'high' | 'medium' | 'low'
    effort: 'high' | 'medium' | 'low'
  }>
  critical_risks: Array<{
    severity: 'high' | 'medium' | 'low'
    title: string
    detail: string
    affected_sections: string[]
  }>
  key_opportunities: Array<{
    title: string
    detail: string
    potential_impact: 'high' | 'medium' | 'low'
    effort_required: 'high' | 'medium' | 'low'
  }>
  strategic_focus: string[]
  kill_list: string[]
  missing_sections: string[]
}

export interface FinalReportResponse {
  report_markdown: string
  insights: FinalReportInsights
}

export interface GenerateOptions {
  apiKey: string
  model?: string
  temperature?: number
  promptVersion?: string
  tone?: string
}

const DEFAULT_MODEL = 'gpt-4o-2024-08-06' // Suporta até 16K tokens de output
const DEFAULT_TEMPERATURE = 0.7
const DEFAULT_TONE = 'intermediario'

export async function generateFinalReport(
  snapshot: FinalSnapshot,
  options: GenerateOptions,
): Promise<{
  report_markdown: string
  insights: FinalReportInsights
  token_usage?: any
}> {
  const {
    apiKey,
    model = DEFAULT_MODEL,
    temperature = DEFAULT_TEMPERATURE,
    tone = DEFAULT_TONE,
  } = options

  const systemPrompt = getSystemPrompt(tone)
  const userPrompt = buildFinalReportPrompt(snapshot, tone)

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
      max_tokens: 16384, // Limite máximo do gpt-4o-2024-08-06 para relatórios completos
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
    throw new Error(`Erro na API OpenAI: ${error.error?.message || response.statusText}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error('Resposta vazia da OpenAI')
  }

  const parsed = parseAIResponse(content)

  return {
    report_markdown: parsed.report_markdown,
    insights: parsed.insights,
    token_usage: data.usage,
  }
}

function parseAIResponse(content: string): FinalReportResponse {
  try {
    const parsed = JSON.parse(content)
    if (validateAIResponse(parsed)) {
      return parsed
    }
  } catch (error) {
    // Tentar extrair JSON
  }

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
    // Falha
  }

  try {
    const parsed = JSON.parse(content)
    const corrected = {
      report_markdown: parsed.report_markdown || parsed.report || '# Relatório Final\n\nErro ao processar resposta.',
      insights: correctInsightsStructure(parsed.insights || parsed),
    }
    if (validateAIResponse(corrected)) {
      return corrected
    }
  } catch (error) {
    // Falha
  }

  throw new Error('Não foi possível parsear a resposta da IA. Formato inválido.')
}

function validateAIResponse(data: any): data is FinalReportResponse {
  if (!data || typeof data !== 'object') return false
  if (!data.report_markdown || typeof data.report_markdown !== 'string') return false
  if (!data.insights || typeof data.insights !== 'object') return false

  const insights = data.insights
  if (!insights.global_score || typeof insights.global_score !== 'object') return false
  if (typeof insights.global_score.clarity !== 'number') return false
  if (typeof insights.global_score.consistency !== 'number') return false
  if (typeof insights.global_score.completeness !== 'number') return false
  if (typeof insights.global_score.impact_potential !== 'number') return false

  if (!Array.isArray(insights.top_priorities)) return false
  if (!Array.isArray(insights.critical_risks)) return false
  if (!Array.isArray(insights.key_opportunities)) return false
  if (!Array.isArray(insights.strategic_focus)) return false
  if (!Array.isArray(insights.kill_list)) return false
  if (!Array.isArray(insights.missing_sections)) return false

  return true
}

function correctInsightsStructure(insights: any): FinalReportInsights {
  return {
    global_score: {
      clarity: insights.global_score?.clarity ?? insights.clarity ?? 5,
      consistency: insights.global_score?.consistency ?? insights.consistency ?? 5,
      completeness: insights.global_score?.completeness ?? insights.completeness ?? 5,
      impact_potential: insights.global_score?.impact_potential ?? insights.impact_potential ?? 5,
    },
    top_priorities: Array.isArray(insights.top_priorities) ? insights.top_priorities : [],
    critical_risks: Array.isArray(insights.critical_risks) ? insights.critical_risks : [],
    key_opportunities: Array.isArray(insights.key_opportunities) ? insights.key_opportunities : [],
    strategic_focus: Array.isArray(insights.strategic_focus) ? insights.strategic_focus : [],
    kill_list: Array.isArray(insights.kill_list) ? insights.kill_list : [],
    missing_sections: Array.isArray(insights.missing_sections) ? insights.missing_sections : [],
  }
}

export async function generateFinalReportWithRetry(
  snapshot: FinalSnapshot,
  options: GenerateOptions,
): Promise<{
  report_markdown: string
  insights: FinalReportInsights
  token_usage?: any
}> {
  try {
    return await generateFinalReport(snapshot, options)
  } catch (error: any) {
    console.warn('Primeira tentativa falhou, tentando novamente...', error.message)
    try {
      return await generateFinalReport(snapshot, options)
    } catch (retryError: any) {
      throw new Error(`Falha após retry: ${retryError.message}`)
    }
  }
}

