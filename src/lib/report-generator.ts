import {
  StrategyState,
  Report1,
  Report2,
  SWOT,
} from '@/stores/useStrategyStore'

export const generateDiagnosticReport = (state: StrategyState): Report1 => {
  const { config, op, market, vision } = {
    config: state.clinicConfig,
    op: state.operationalAssessment,
    market: state.marketAssessment,
    vision: state.managerVision,
  }

  const tone = config.tom_linguagem || 'intermediario'

  // Tone helpers
  const prefixes = {
    formal: {
      intro: 'A presente análise tem como objetivo...',
      context: 'Conforme os dados coletados...',
      swot: 'A matriz SWOT evidencia...',
      conclusion: 'Conclui-se que o cenário atual...',
    },
    informal: {
      intro: 'Vamos dar uma olhada no diagnóstico da clínica...',
      context: 'Aqui está o que levantamos sobre o negócio...',
      swot: 'Separamos os pontos fortes e fracos...',
      conclusion: 'O que tudo isso quer dizer é...',
    },
    intermediario: {
      intro: 'Este relatório apresenta o diagnóstico situacional...',
      context: 'Com base nas informações da clínica...',
      swot: 'A análise SWOT destaca os seguintes pontos...',
      conclusion: 'Em resumo, identificamos que...',
    },
  }

  const p = prefixes[tone as keyof typeof prefixes] || prefixes.intermediario

  // 1. Executive Summary
  const executiveSummary = `${p.intro} O objetivo estratégico para 2026 é "${config.objetivo_geral_2026 || 'crescimento sustentável'}". Identificamos que a clínica está em estágio "${config.estagio_clinica || 'de operação'}" e enfrenta desafios relacionados a "${vision.problems[0] || 'gestão interna'}".`

  // 2. Business Context
  const businessContext = `A ${config.nome_clinica || 'Clínica'}, localizada em ${config.localizacao || 'local não informado'}, atua no segmento ${config.tipo_clinica} com foco no público ${config.publico_principal}. A gestão é composta por ${config.gestores_principais}.`

  // 3. Operation Analysis
  const operationAnalysis = `A operação conta com uma equipe de ${op.team_composition || 'profissionais diversos'} e estrutura física composta por ${op.infrastructure}. Os processos bem definidos incluem "${op.processes_well_defined}", enquanto os gargalos principais estão em "${op.processes_disorganized}". A gestão financeira é descrita como: ${op.financial_management}.`

  // 4. Market Analysis
  const marketAnalysis = `O mercado local é descrito como: ${market.marketDescription}. Os principais competidores identificados são ${market.competitors}. A clínica se diferencia por "${market.clinicStrengths}", mas enfrenta concorrência forte em "${market.competitorStrengths}". Os canais de aquisição principais são ${market.acquisitionChannels}.`

  // 5. SWOT Construction
  const swot: SWOT = {
    strengths: [
      op.processes_well_defined,
      market.clinicStrengths,
      market.patientCompliments,
    ].filter((i) => i.length > 3),
    weaknesses: [
      op.processes_disorganized,
      market.patientComplaints,
      market.patientLoss ? `Perda de pacientes: ${market.patientLoss}` : '',
      vision.problems[0],
    ].filter((i) => i.length > 3),
    opportunities: vision.opportunities.filter((i) => i.length > 3),
    threats: [
      market.competitorStrengths,
      vision.problems[1] || '',
      vision.problems[2] || '',
    ].filter((i) => i.length > 3),
  }

  // 6. Insights & Risks
  const insightsRisks = [
    `Risco Crítico: ${vision.problems[0] || 'Não identificado'}`,
    `Oportunidade Imediata: ${vision.opportunities[0] || 'Não identificada'}`,
    `Atenção Financeira: Nota ${vision.ratings.financial.score}/10 - ${vision.ratings.financial.justification}`,
    `Experiência do Paciente: Nota ${vision.ratings.satisfaction.score}/10 - ${vision.ratings.satisfaction.justification}`,
  ]

  return {
    generatedAt: new Date().toISOString(),
    executiveSummary,
    businessContext,
    operationAnalysis,
    marketAnalysis,
    swot,
    insightsRisks,
  }
}

export const generateStrategicDirectionReport = (
  state: StrategyState,
): Report2 => {
  const { identity, managerVision, diagnosis, jtbd, okrs, clinicConfig } = state
  const tone = clinicConfig.tom_linguagem || 'intermediario'

  // Helper for tone
  const t = (formal: string, informal: string) =>
    tone === 'formal' ? formal : tone === 'informal' ? informal : formal // Default to formal-ish for intermediate usually better in reports

  // 1. Mission
  const mission =
    identity.reason ||
    'Proporcionar saúde e bem-estar através de um atendimento de excelência.'

  // 2. Vision 2026
  const vision =
    managerVision.vision2026 ||
    identity.recognitionGoal ||
    'Ser referência regional em qualidade assistencial e inovação até o final de 2026.'

  // 3. Values (Split by commas or newlines if string, usually input as comma separated)
  const valuesRaw = identity.values || 'Ética, Humanização, Excelência'
  const values = valuesRaw
    .split(/[,;.]/)
    .map((v) => v.trim())
    .filter((v) => v.length > 2)

  // 4. Strategic Principles (Rumelt)
  const strategicPrinciples = [
    `Diagnóstico: ${diagnosis.rumelt.challenge || 'Enfrentar a competitividade com diferenciação.'}`,
    `Política Orientadora: ${diagnosis.rumelt.policy || 'Focar na experiência do paciente.'}`,
    `Ação Coerente: Implementar processos que garantam a entrega da proposta de valor.`,
  ]

  // 5. Value Proposition (JTBD)
  const valueProposition =
    jtbd.length > 0
      ? `Ajudar o paciente a "${jtbd[0].job}" através de "${jtbd[0].solution}".`
      : 'Oferecer tratamentos que resolvam as dores funcionais e emocionais dos pacientes com agilidade.'

  // 6. Value Chain
  const valueChain = t(
    '1. Atração (Marketing Ético) → 2. Agendamento Eficiente → 3. Acolhimento na Recepção → 4. Atendimento Clínico de Excelência → 5. Pós-Consulta Ativo → 6. Fidelização e Indicação.',
    'Atrair gente certa → Agendar rápido → Receber bem → Tratar com carinho → Acompanhar depois → Virar fã.',
  )

  // 7. Competitive Positioning (Porter)
  let positioningText = ''
  if (identity.pricePositioning === 'Premium') {
    positioningText =
      'Diferenciação por Qualidade e Exclusividade. Foco em alto valor agregado e baixa sensibilidade a preço.'
  } else if (identity.pricePositioning === 'Acessível') {
    positioningText =
      'Liderança em Custo/Acesso. Foco em volume, eficiência operacional e acessibilidade.'
  } else {
    positioningText =
      'Focalização/Nicho. Equilíbrio entre qualidade técnica e preço justo para o público-alvo específico.'
  }
  const competitivePositioning = `${positioningText} (Foco estratégico: ${identity.strategyFocus || 'Crescimento'})`

  // 8. BSC Objectives
  // Map existing OKRs or generate defaults
  const bscObjectives = {
    financial: okrs
      .filter((o) => o.perspective === 'Financeira')
      .map((o) => o.objective),
    customers: okrs
      .filter((o) => o.perspective === 'Clientes')
      .map((o) => o.objective),
    processes: okrs
      .filter((o) => o.perspective === 'Processos')
      .map((o) => o.objective),
    learning: okrs
      .filter((o) => o.perspective === 'Aprendizado')
      .map((o) => o.objective),
  }

  // Fill empty with defaults if needed
  if (bscObjectives.financial.length === 0)
    bscObjectives.financial.push(
      'Garantir margem de lucro saudável',
      'Aumentar ticket médio',
    )
  if (bscObjectives.customers.length === 0)
    bscObjectives.customers.push(
      'Aumentar satisfação (NPS)',
      'Fidelizar base de pacientes',
    )
  if (bscObjectives.processes.length === 0)
    bscObjectives.processes.push(
      'Digitalizar jornada do paciente',
      'Otimizar tempo de agenda',
    )
  if (bscObjectives.learning.length === 0)
    bscObjectives.learning.push(
      'Capacitar equipe de atendimento',
      'Implementar cultura de dados',
    )

  // 9. Strategic Map Text
  const strategicMapText = t(
    `Para atingir os objetivos Financeiros de "${bscObjectives.financial[0]}", precisamos encantar os Clientes com "${bscObjectives.customers[0]}". Isso só será possível se ajustarmos os Processos Internos para "${bscObjectives.processes[0]}", o que depende diretamente de Aprendizado e Crescimento para "${bscObjectives.learning[0]}".`,
    `Se a gente quer grana (${bscObjectives.financial[0]}), o paciente tem que estar feliz (${bscObjectives.customers[0]}). Pra isso, a casa tem que estar arrumada (${bscObjectives.processes[0]}) e o time treinado (${bscObjectives.learning[0]}).`,
  )

  return {
    generatedAt: new Date().toISOString(),
    mission,
    vision,
    values,
    strategicPrinciples,
    valueProposition,
    valueChain,
    competitivePositioning,
    bscObjectives,
    strategicMapText,
  }
}
