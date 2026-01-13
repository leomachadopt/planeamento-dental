import { StrategyState } from '@/stores/useStrategyStore'

/**
 * Sistema de prompts para geração de relatórios com OpenAI
 */

export const getSystemPrompt = (tone: string) => {
  const toneMap = {
    formal: 'Você é um consultor de gestão estratégica especializado em clínicas de saúde. Use linguagem formal, técnica e objetiva.',
    informal: 'Você é um mentor de negócios que fala de forma acessível e direta. Use linguagem informal e próxima, evitando jargões excessivos.',
    intermediario: 'Você é um consultor experiente que equilibra profissionalismo com clareza. Use linguagem clara, mas profissional.',
  }

  return toneMap[tone as keyof typeof toneMap] || toneMap.intermediario
}

export const buildDiagnosticPrompt = (state: StrategyState): string => {
  const { config_inicial, operationalAssessment, marketAssessment, managerVision } = state

  return `
Gere um relatório de DIAGNÓSTICO SITUACIONAL completo para uma clínica de saúde com base nos seguintes dados:

**CONFIGURAÇÃO DA CLÍNICA:**
- Nome: ${config_inicial.nome_clinica}
- Tipo: ${config_inicial.tipo_clinica}
- Localização: ${config_inicial.localizacao}
- Público-alvo: ${config_inicial.publico_principal}
- Estágio atual: ${config_inicial.estagio_clinica}
- Gestores: ${config_inicial.gestores_principais}
- Objetivo para 2026: ${config_inicial.objetivo_geral_2026}

**AVALIAÇÃO OPERACIONAL (Módulo 2A - Entrevista Operacional):**

IMPORTANTE: Analise as respostas abaixo como um diagnóstico operacional real, não como um questionário descritivo.

1. Serviços que sustentam a operação:
${operationalAssessment.services}

2. Capacidade física vs uso real:
${operationalAssessment.infrastructure}

3. Dependência da equipa:
${operationalAssessment.team_composition}

4. Horário vs comportamento do paciente:
${operationalAssessment.working_hours}

5. Maturidade do agendamento:
${operationalAssessment.patient_management}

6. Controle financeiro prático:
${operationalAssessment.financial_management}

7. O que funciona bem (vantagem operacional):
${operationalAssessment.processes_well_defined}

8. Onde a operação trava crescimento:
${operationalAssessment.processes_disorganized}

**INSTRUÇÕES PARA ANÁLISE OPERACIONAL:**
Você é um consultor sênior de operações em saúde. Identifique:
- Gargalos ocultos
- Riscos operacionais
- Desperdícios de capacidade
- Oportunidades de ganho rápido (quick wins)
- Limitações estruturais que impactam estratégia e crescimento

Conecte explicitamente essas conclusões com:
- Objetivos estratégicos de 2026
- Plano tático
- Plano operacional

Evite recomendações genéricas. Todas as sugestões devem citar diretamente elementos descritos pela clínica.

**AVALIAÇÃO DE MERCADO (Módulo 2B - Análise de Mercado Estratégica):**

IMPORTANTE: Você é um estrategista especializado em posicionamento competitivo para clínicas de saúde.
Analise as respostas abaixo para identificar intensidade competitiva real, critérios de decisão do paciente,
vantagens estruturais dos concorrentes, diferenciais defensáveis da clínica, riscos de guerra de preços,
e oportunidades de posicionamento claro (onde competir e onde NÃO competir).

1. Tipo de mercado:
${marketAssessment.marketDescription}

2. Quem realmente disputa o mesmo paciente:
${marketAssessment.competitors}

3. Critério de escolha do paciente:
${marketAssessment.clinicStrengths}

4. Onde os concorrentes são estruturalmente melhores:
${marketAssessment.competitorStrengths}

5. Como a demanda chega até você (qualidade do canal):
${marketAssessment.acquisitionChannels}

6. Dor recorrente do mercado:
${marketAssessment.patientComplaints}

7. Motivos reais de fidelização:
${marketAssessment.patientCompliments}

8. Perdas competitivas (aprendizado estratégico):
${marketAssessment.patientLoss}

**INSTRUÇÕES PARA ANÁLISE DE MERCADO:**
Conecte essas conclusões com:
- A estratégia geral de 2026
- Objetivos estratégicos definidos
- Decisões de marketing, precificação e serviços

Evite recomendações genéricas.
Toda conclusão deve estar ancorada nas respostas fornecidas.

**VISÃO DO GESTOR (Módulo 2C - Diagnóstico Estratégico):**

IMPORTANTE: Analise as respostas abaixo como diagnóstico real de liderança, ambição estratégica explícita,
trade-offs conscientes e critérios de sucesso claros. Base conceitual: Richard Rumelt (Good Strategy / Bad Strategy),
OKRs, Balanced Scorecard, Strategic Narrative, Constraints-based strategy.

1. DORES REAIS DE GESTÃO (3 problemas principais):
${managerVision.problems.map((p, i) => `
Problema ${i + 1}:
- Descrição: ${p.description}
- Impacto: ${p.impact.join(', ')}
- Desde quando: ${p.sinceWhen}
- Causa raiz: ${p.rootCause}
`).join('\n')}

2. OPORTUNIDADES E ALAVANCAS ESTRATÉGICAS (3 oportunidades):
${managerVision.opportunities.map((o, i) => `
Oportunidade ${i + 1}:
- Descrição: ${o.description}
- Depende de: ${o.dependsOn.join(', ')}
- Risco principal: ${o.risk}
- Trade-off (dizer "não" a): ${o.tradeOff}
`).join('\n')}

3. VISÃO 2026 (Estado futuro concreto):
Financeiro:
- Faturamento mensal: ${managerVision.vision2026.financial.monthlyRevenue}
- Margem: ${managerVision.vision2026.financial.margin}
- Dependência do gestor: ${managerVision.vision2026.financial.ownerDependency}

Mercado:
- Conhecida por: ${managerVision.vision2026.market.knownFor}
- Escolhida por: ${managerVision.vision2026.market.chosenFor}

Operação:
- Agenda: ${managerVision.vision2026.operation.scheduleStatus}
- Padronização: ${managerVision.vision2026.operation.processStandardization}

Pessoas:
- Perfil da equipe: ${managerVision.vision2026.people.teamProfile}
- Rotatividade: ${managerVision.vision2026.people.turnover}
- Autonomia: ${managerVision.vision2026.people.autonomy}

4. MÉTRICAS QUE REALMENTE IMPORTAM (KPIs):
Financeiros:
- Faturamento mensal: ${managerVision.kpis.financial.monthlyRevenue}
- Margem: ${managerVision.kpis.financial.margin}%
- Ticket médio: ${managerVision.kpis.financial.averageTicket}

Operacionais:
- Taxa de ocupação: ${managerVision.kpis.operational.occupancyRate}
- Tempo de espera: ${managerVision.kpis.operational.waitTime}
- Taxa de faltas: ${managerVision.kpis.operational.noShowRate}%

Experiência:
- NPS: ${managerVision.kpis.experience.nps}
- Taxa de retorno: ${managerVision.kpis.experience.returnRate}%
- Indicação: ${managerVision.kpis.experience.referralRate}%

Pessoas:
- Turnover máximo: ${managerVision.kpis.people.maxTurnover}%
- Dependência do dono: ${managerVision.kpis.people.ownerDependency}/10

5. PERCEPÇÕES DE MATURIDADE:
- Processos Internos (0-10): ${managerVision.ratings.processes.score} - ${managerVision.ratings.processes.justification}
- Organização Financeira (0-10): ${managerVision.ratings.financial.score} - ${managerVision.ratings.financial.justification}
- Satisfação dos Pacientes (0-10): ${managerVision.ratings.satisfaction.score} - ${managerVision.ratings.satisfaction.justification}

**INSTRUÇÕES PARA ANÁLISE:**
Com essas informações, a IA deve conseguir:
- Construir diagnóstico estratégico real
- Gerar objetivos coerentes
- Criar OKRs conectados à realidade
- Evitar relatórios genéricos
- Identificar trade-offs estratégicos explícitos
- Conectar visão, métricas e realidade operacional

${config_inicial.tamanho_relatorio === 'detalhado_40' ? 'Gere um relatório DETALHADO (aprox. 40 páginas de conteúdo).' : 'Gere um relatório RESUMIDO (aprox. 20 páginas de conteúdo).'}

Retorne um JSON com a seguinte estrutura:
{
  "executiveSummary": "Resumo executivo...",
  "businessContext": "Contexto do negócio...",
  "operationAnalysis": "Análise operacional detalhada...",
  "marketAnalysis": "Análise de mercado detalhada...",
  "swot": {
    "strengths": ["força 1", "força 2", ...],
    "weaknesses": ["fraqueza 1", "fraqueza 2", ...],
    "opportunities": ["oportunidade 1", "oportunidade 2", ...],
    "threats": ["ameaça 1", "ameaça 2", ...]
  },
  "insightsRisks": ["insight 1", "insight 2", ...]
}
`
}

export const buildStrategicPrompt = (state: StrategyState): string => {
  const { config_inicial, identity, managerVision, diagnosis } = state

  return `
Gere um relatório de DIRECIONAMENTO ESTRATÉGICO completo para uma clínica de saúde com base nos seguintes dados:

**CONFIGURAÇÃO DA CLÍNICA:**
- Nome: ${config_inicial.nome_clinica}
- Objetivo 2026: ${config_inicial.objetivo_geral_2026}

**IDENTIDADE ESTRATÉGICA (Módulo 3A - Fundação Estratégica):**

IMPORTANTE: Você é um consultor estratégico especializado em clínicas de saúde.
Analise as respostas do Módulo 3A (Identidade Estratégica) e gere:
- Um resumo claro da identidade estratégica da clínica
- O perfil do paciente prioritário
- O posicionamento desejado no mercado
- As implicações estratégicas das escolhas de preço e crescimento

Não faça análises profundas ainda. Não gere plano de ação. Não proponha métricas.
Este módulo serve como base conceitual para o Módulo 3B (Estratégia).

1. RAZÃO DE EXISTIR (Propósito):
${identity.reason}

2. IDENTIDADE FUTURA (Reconhecimento em até 3 anos):
${identity.recognitionGoal}

3. VALORES INEGOCIÁVEIS:
${identity.values}

4. PÚBLICO PRIORITÁRIO (2026):
${identity.priorityAudience}

5. POSICIONAMENTO DE PREÇO:
${identity.pricePositioning}

6. FOCO DO CRESCIMENTO:
${identity.strategyFocus}
${identity.strategyFocusComplement ? `\nO que precisará mudar: ${identity.strategyFocusComplement}` : ''}

**VISÃO DO GESTOR:**
- Visão 2026: ${managerVision.vision2026}

**DIAGNÓSTICO:**
- Desafio principal (Rumelt): ${diagnosis.rumelt.challenge}
- Política orientadora (Rumelt): ${diagnosis.rumelt.policy}

${config_inicial.tamanho_relatorio === 'detalhado_40' ? 'Gere um relatório DETALHADO (aprox. 40 páginas de conteúdo).' : 'Gere um relatório RESUMIDO (aprox. 20 páginas de conteúdo).'}

Retorne um JSON com a seguinte estrutura:
{
  "mission": "Missão da clínica...",
  "vision": "Visão 2026...",
  "values": ["valor 1", "valor 2", ...],
  "strategicPrinciples": ["princípio 1", "princípio 2", ...],
  "valueProposition": "Proposta de valor...",
  "valueChain": "Cadeia de valor...",
  "competitivePositioning": "Posicionamento competitivo...",
  "bscObjectives": {
    "financial": ["objetivo 1", "objetivo 2"],
    "customers": ["objetivo 1", "objetivo 2"],
    "processes": ["objetivo 1", "objetivo 2"],
    "learning": ["objetivo 1", "objetivo 2"]
  },
  "strategicMapText": "Texto explicativo do mapa estratégico..."
}
`
}

export const buildAdvancedPrompt = (state: StrategyState): string => {
  const { diagnosis, blueOcean, jtbd, marketAssessment, managerVision } = state

  return `
Gere um relatório de ANÁLISE ESTRATÉGICA AVANÇADA para uma clínica de saúde com base nos seguintes dados:

**ANÁLISE DE PORTER:**
- Rivalidade: ${diagnosis.porter.rivalry}
- Novos entrantes: ${diagnosis.porter.newEntrants}
- Substitutos: ${diagnosis.porter.substitutes}
- Poder dos compradores: ${diagnosis.porter.buyers}
- Poder dos fornecedores: ${diagnosis.porter.suppliers}

**DIAGNÓSTICO DE RUMELT:**
- Desafio: ${diagnosis.rumelt.challenge}
- Obstáculos: ${diagnosis.rumelt.obstacles}
- Política: ${diagnosis.rumelt.policy}

**BLUE OCEAN:**
- Eliminar: ${blueOcean.eliminate.join(', ')}
- Reduzir: ${blueOcean.reduce.join(', ')}
- Elevar: ${blueOcean.raise.join(', ')}
- Criar: ${blueOcean.create.join(', ')}

**JOBS TO BE DONE:**
${jtbd.map(j => `- ${j.job} (${j.type}): ${j.solution}`).join('\n')}

**CONTEXTO DE MERCADO:**
- Reclamações: ${marketAssessment.patientComplaints}
- Elogios: ${marketAssessment.patientCompliments}

Retorne um JSON com a seguinte estrutura:
{
  "portersForces": {
    "rivalry": "Análise...",
    "entrants": "Análise...",
    "substitutes": "Análise...",
    "buyerPower": "Análise...",
    "supplierPower": "Análise..."
  },
  "pestel": {
    "political": "Análise...",
    "economic": "Análise...",
    "social": "Análise...",
    "technological": "Análise...",
    "ecological": "Análise...",
    "legal": "Análise..."
  },
  "crossedSwot": {
    "fo": ["estratégia FO 1", ...],
    "fa": ["estratégia FA 1", ...],
    "do": ["estratégia DO 1", ...],
    "da": ["estratégia DA 1", ...]
  },
  "jtbd": ["job 1", "job 2", ...],
  "valueCanvas": {
    "customerJobs": ["job 1", ...],
    "pains": ["dor 1", ...],
    "gains": ["ganho 1", ...],
    "painRelievers": ["aliviador 1", ...],
    "gainCreators": ["criador 1", ...]
  },
  "blueOcean": {
    "eliminate": ["item 1", ...],
    "reduce": ["item 1", ...],
    "raise": ["item 1", ...],
    "create": ["item 1", ...]
  },
  "guidingPolicies": ["política 1", "política 2", ...],
  "tradeOffs": ["trade-off 1", "trade-off 2", ...]
}
`
}

export const buildTacticalPrompt = (state: StrategyState): string => {
  const { managerVision, blueOcean, diagnosis, config_inicial } = state

  return `
Gere um relatório de PLANO TÁTICO (OKRs e Iniciativas) para uma clínica de saúde com base nos seguintes dados:

**METAS DO GESTOR:**
- Faturamento: ${managerVision.goals.revenue}
- Ocupação: ${managerVision.goals.occupancy}
- NPS: ${managerVision.goals.nps}
- Outras: ${managerVision.goals.other}

**ESTRATÉGIA (BLUE OCEAN):**
- Criar: ${blueOcean.create.join(', ')}
- Eliminar: ${blueOcean.eliminate.join(', ')}

**DIAGNÓSTICO:**
- Política orientadora: ${diagnosis.rumelt.policy}

Gere 4-6 OKRs balanceados nas perspectivas BSC (Financeira, Clientes, Processos, Aprendizado).
Cada OKR deve ter 2-4 Key Results mensuráveis.
Gere também 8-15 iniciativas estratégicas priorizadas.

Retorne um JSON com a seguinte estrutura:
{
  "okrs": [
    {
      "id": "okr1",
      "objective": "Objetivo...",
      "area": "Financeiro|Clientes|Processos|Pessoas",
      "krs": ["KR 1", "KR 2", ...]
    }
  ],
  "kpis": {
    "finance": ["KPI 1", ...],
    "clients": ["KPI 1", ...],
    "processes": ["KPI 1", ...],
    "people": ["KPI 1", ...],
    "marketing": ["KPI 1", ...]
  },
  "initiatives": [
    {
      "id": "init1",
      "title": "Título...",
      "relatedObjective": "Objetivo relacionado",
      "priority": "Alta|Média|Baixa",
      "impact": "Alto|Médio|Baixo",
      "effort": "Alto|Médio|Baixo",
      "quarter": "Q1|Q2|Q3|Q4"
    }
  ]
}
`
}

export const buildOperationalPrompt = (state: StrategyState): string => {
  const { config_inicial } = state

  return `
Gere um relatório de PLANO OPERACIONAL completo para ${config_inicial.nome_clinica}, incluindo:

1. **ROTINAS OPERACIONAIS** por área (Recepção, Atendimento, Administrativo, Marketing)
   - Rotinas diárias, semanais e mensais

2. **SOPs (Procedimentos Operacionais Padrão)**
   - Pelo menos 4 SOPs críticos para a operação

3. **CHECKLISTS**
   - Abertura, fechamento, preparação

4. **CALENDÁRIO 2026**
   - Temas mensais (Janeiro Branco, Outubro Rosa, etc.)
   - Eventos e ações planejadas

Retorne um JSON com a seguinte estrutura:
{
  "routines": [
    {
      "area": "Nome da área",
      "routines": [
        {
          "frequency": "Diária|Semanal|Mensal",
          "tasks": ["tarefa 1", "tarefa 2", ...]
        }
      ]
    }
  ],
  "sops": [
    {
      "id": "sop1",
      "title": "Título do SOP",
      "objective": "Objetivo...",
      "responsible": "Responsável",
      "steps": ["passo 1", "passo 2", ...]
    }
  ],
  "checklists": [
    {
      "id": "chk1",
      "title": "Título do checklist",
      "items": ["item 1", "item 2", ...]
    }
  ],
  "calendar": [
    {
      "month": "Janeiro",
      "theme": "Tema do mês",
      "events": ["evento 1", "evento 2", ...]
    }
  ]
}
`
}

export const buildFinalPrompt = (state: StrategyState): string => {
  const { config_inicial } = state

  return `
Gere o RELATÓRIO FINAL CONSOLIDADO de planejamento estratégico 2026 para ${config_inicial.nome_clinica}.

Este relatório deve consolidar TODOS os relatórios anteriores em um documento executivo completo.

Inclua:
- Capa com título e nome da clínica
- Introdução (contexto, objetivos, metodologia)
- Parte 1: Diagnóstico (resumo executivo e SWOT)
- Parte 2: Estratégia (missão, visão, valores, mapa estratégico)
- Parte 3: Análise Avançada (políticas orientadoras, Blue Ocean)
- Parte 4: Tático (OKRs e iniciativas)
- Parte 5: Operacional (rotinas e calendário)
- Conclusão (fechamento e próximos passos)

Tom: ${config_inicial.tom_linguagem}
Tamanho: ${config_inicial.tamanho_relatorio === 'detalhado_40' ? 'DETALHADO' : 'RESUMIDO'}

Retorne um JSON com estrutura completa do relatório final.
`
}
