import { StrategyState, Report1, SWOT } from '@/stores/useStrategyStore'

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
