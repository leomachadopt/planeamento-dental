import type { SectionSnapshot } from '@/services/snapshotBuilder'

/**
 * Sistema de prompts para geração de relatórios por seção via IA
 */

export function getSystemPrompt(tone: string): string {
  const toneMap = {
    formal: 'Você é um consultor de gestão estratégica especializado em clínicas de saúde. Use linguagem formal, técnica e objetiva. Seja preciso e baseie todas as conclusões nos dados fornecidos.',
    informal: 'Você é um mentor de negócios que fala de forma acessível e direta. Use linguagem informal e próxima, evitando jargões excessivos. Seja prático e baseie recomendações nos dados fornecidos.',
    intermediario: 'Você é um consultor experiente que equilibra profissionalismo com clareza. Use linguagem clara, mas profissional. Seja objetivo e baseie análises nos dados fornecidos.',
  }

  return toneMap[tone as keyof typeof toneMap] || toneMap.intermediario
}

// Instruções específicas por seção
const SECTION_INSTRUCTIONS: Record<string, string> = {
  IDENTITY: `
Analise a IDENTIDADE ESTRATÉGICA da clínica com foco em:

1. **Propósito e Razão de Existir**: Avalie se o propósito está claro, diferenciado e alinhado com a proposta de valor.

2. **Valores Inegociáveis**: Verifique se os valores são específicos, acionáveis e realmente inegociáveis (não genéricos).

3. **Posicionamento de Preço**: Analise a coerência entre o posicionamento de preço escolhido e a proposta de valor oferecida.

4. **Segmentos de Cliente**: Avalie se os segmentos estão bem definidos, priorizados e se há propostas de valor específicas para cada um.

5. **Propostas de Valor**: Verifique se as propostas são diferenciadas, defensáveis e conectadas aos segmentos alvo.

**Identifique contradições**: Por exemplo, se o posicionamento é "premium" mas não há propostas de valor que justifiquem preço alto, ou se há segmentos sem propostas específicas.
  `,

  MARKET: `
Analise o MERCADO e CONCORRÊNCIA com foco em:

1. **Intensidade Competitiva**: Avalie o nível de competição no mercado local e os fatores que a determinam.

2. **Diferenciais Defensáveis**: Identifique quais diferenciais da clínica são realmente defensáveis e difíceis de copiar.

3. **Riscos de Guerra de Preços**: Avalie a vulnerabilidade da clínica a pressões de preço dos concorrentes.

4. **Oportunidades de Posicionamento**: Identifique gaps no mercado onde a clínica pode se posicionar de forma única.

5. **Análise de Concorrentes**: Compare a clínica com concorrentes diretos e indiretos, identificando pontos fortes e fracos relativos.
  `,

  OFFER: `
Analise a OFERTA DE SERVIÇOS com foco em:

1. **Portfólio de Serviços**: Avalie se o portfólio está alinhado com a identidade estratégica e os segmentos de cliente.

2. **Precificação**: Verifique se os preços estão coerentes com o posicionamento e se há serviços flagship bem definidos.

3. **Estrutura de Custos**: Analise a viabilidade econômica dos serviços oferecidos.

4. **Diferenciação**: Identifique quais serviços realmente diferenciam a clínica no mercado.
  `,

  OPERATIONS: `
Analise as OPERAÇÕES com foco em:

1. **Capacidade Operacional**: Avalie se a capacidade (equipe, equipamentos, salas) está alinhada com a demanda e objetivos estratégicos.

2. **Estrutura de Equipe**: Verifique se a composição da equipe suporta a proposta de valor e os serviços oferecidos.

3. **Gargalos Operacionais**: Identifique limitações que podem impedir o crescimento ou a entrega da proposta de valor.

4. **Eficiência**: Avalie oportunidades de melhoria operacional.
  `,

  STRATEGY: `
Analise a ESTRATÉGIA com foco em:

1. **Escolhas Estratégicas**: Avalie se as escolhas estratégicas são claras, coerentes e priorizadas.

2. **Alinhamento**: Verifique se a estratégia está alinhada com identidade, mercado e operações.

3. **Trade-offs**: Identifique os trade-offs conscientes e se estão bem fundamentados.

4. **Viabilidade**: Avalie se a estratégia é viável dados os recursos e capacidades atuais.
  `,

  PLAN: `
Analise o PLANO com foco em:

1. **Iniciativas Prioritárias**: Avalie se as iniciativas estão bem definidas, priorizadas e com responsáveis claros.

2. **Dependências**: Identifique dependências entre iniciativas e riscos de bloqueios.

3. **Prazos e Recursos**: Verifique se os prazos são realistas e se há recursos suficientes.

4. **Executabilidade**: Avalie se o plano é executável e se há clareza sobre próximos passos.
  `,

  BUSINESS_MODEL: `
Analise o MODELO DE NEGÓCIO com foco em:

1. **Criação de Valor**: Como a clínica cria valor para os pacientes.

2. **Entrega de Valor**: Como o valor é entregue aos pacientes.

3. **Captura de Valor**: Como a clínica captura valor (receita, margem).

4. **Sustentabilidade**: Se o modelo é sustentável e escalável.
  `,

  FINAL_REPORT: `
Consolide todas as seções anteriores em um RELATÓRIO FINAL que:

1. Sintetize os principais achados de cada seção.

2. Identifique temas transversais e conexões entre seções.

3. Destaque contradições ou inconsistências entre seções.

4. Forneça uma visão integrada do dossiê completo.
  `,
}

// Formato de saída esperado
const OUTPUT_FORMAT = `
Você DEVE retornar um JSON válido com a seguinte estrutura EXATA:

{
  "report_markdown": "# Relatório da Seção [Nome da Seção]\\n\\n[Conteúdo completo em Markdown]",
  "insights": {
    "score": {
      "clarity": 0-10,
      "consistency": 0-10,
      "completeness": 0-10,
      "impact_potential": 0-10
    },
    "alerts": [
      {
        "severity": "high|medium|low",
        "title": "Título do alerta",
        "detail": "Descrição detalhada",
        "evidence": ["question_code ou referência a entidade"]
      }
    ],
    "recommendations": [
      {
        "priority": 1-5,
        "title": "Título da recomendação",
        "detail": "Descrição detalhada",
        "effort": "low|medium|high",
        "expected_impact": "low|medium|high"
      }
    ],
    "missing_data": [
      {
        "item": "O que está faltando",
        "why_it_matters": "Por que isso importa",
        "how_to_fill": "Como preencher"
      }
    ],
    "contradictions": [
      {
        "title": "Título da contradição",
        "detail": "Descrição detalhada",
        "evidence": ["referências aos dados"]
      }
    ],
    "tags": ["tag1", "tag2"]
  }
}

IMPORTANTE:
- O report_markdown deve ser completo e descritivo, incluindo:
  * Resumo executivo (5-8 linhas)
  * O que está bem definido (bullet points)
  * Lacunas relevantes (o que falta e por que importa)
  * Riscos e contradições (com referências aos dados)
  * Recomendações práticas (priorizadas, com "por quê")
  * Checklist de melhoria (itens objetivos)
  * Pontuação (0-10) para clareza, consistência, completude, potencial de impacto

- O insights JSON deve ser válido e parseável sem ambiguidades.
- Todos os campos são obrigatórios (arrays podem estar vazios).
`

/**
 * Constrói o prompt completo para geração de relatório de uma seção
 */
export function buildSectionReportPrompt(
  sectionCode: string,
  snapshot: SectionSnapshot,
  tone: string = 'intermediario',
): string {
  const sectionInstruction = SECTION_INSTRUCTIONS[sectionCode] || `
Analise a seção ${sectionCode} com base nos dados fornecidos.
Identifique pontos fortes, lacunas, riscos e oportunidades.
  `

  // Formatar snapshot de forma legível
  const snapshotFormatted = formatSnapshotForPrompt(snapshot)

  return `
${sectionInstruction}

**DADOS DA CLÍNICA E DO DOSSIÊ:**

Clínica: ${snapshot.clinic.name} (ID: ${snapshot.clinic.id})
Dossiê: ${snapshot.dossier.title}
Data de referência: ${snapshot.dossier.baseline_date || 'Não definida'}

**SEÇÃO:** ${snapshot.section.name}
${snapshot.section.description ? `Descrição: ${snapshot.section.description}` : ''}

**COMPLETUDE DA SEÇÃO:** ${snapshot.completeness.percent}%
${snapshot.completeness.missing_items.length > 0 ? `Itens faltantes: ${snapshot.completeness.missing_items.join(', ')}` : ''}

**RESPOSTAS DO QUESTIONÁRIO:**

${snapshot.answers.map((a) => `
**${a.question_text}** (${a.question_code})
${a.required ? '[OBRIGATÓRIO]' : '[OPCIONAL]'}
Resposta: ${formatAnswerValue(a.value_normalized)}
${a.required && !a.value_normalized ? '⚠️ NÃO PREENCHIDO' : ''}
`).join('\n')}

**ENTIDADES ESTRUTURADAS:**

${Object.entries(snapshot.entities)
  .map(([key, values]) => {
    if (!values || values.length === 0) return `**${key}**: Nenhum cadastrado`
    return `**${key}** (${values.length} item(s)):\n${values.map((v: any) => `- ${formatEntityValue(v)}`).join('\n')}`
  })
  .join('\n\n')}

**FLAGS DE QUALIDADE DE DADOS:**

${snapshot.data_quality_flags.length > 0
  ? snapshot.data_quality_flags.map((flag) => `⚠️ ${flag}`).join('\n')
  : 'Nenhum flag detectado'}

---

${OUTPUT_FORMAT}

Gere o relatório completo e os insights estruturados baseados EXCLUSIVAMENTE nos dados fornecidos acima.
Seja específico, cite dados concretos e evite generalizações.
  `.trim()
}

/**
 * Formata o valor de uma resposta para exibição no prompt
 */
function formatAnswerValue(value: any): string {
  if (value === null || value === undefined || value === '') {
    return '[Não preenchido]'
  }

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : '[Vazio]'
    }
    if (value.formatted) {
      return value.formatted
    }
    return JSON.stringify(value)
  }

  return String(value)
}

/**
 * Formata uma entidade para exibição no prompt
 */
function formatEntityValue(entity: any): string {
  if (entity.name) return entity.name
  if (entity.title) return entity.title
  return JSON.stringify(entity)
}

/**
 * Formata o snapshot completo para o prompt
 */
function formatSnapshotForPrompt(snapshot: SectionSnapshot): string {
  return JSON.stringify(snapshot, null, 2)
}

/**
 * Constrói o prompt para geração do Relatório Final consolidado
 */
export function buildFinalReportPrompt(
  snapshot: any, // FinalSnapshot
  tone: string = 'intermediario',
): string {
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

${snapshot.sections.map((section: any) => {
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
${section.report_markdown ? `\nResumo do relatório:\n${section.report_markdown.substring(0, 500)}...` : ''}
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

