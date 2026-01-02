import {
  StrategyState,
  Report1,
  Report2,
  Report3,
  Report4,
  Report5,
  ReportFinal,
  SWOT,
} from '@/stores/useStrategyStore'

// Helper to determine tone and length settings
const getSettings = (state: StrategyState) => {
  const tone = state.config_inicial.tom_linguagem || 'intermediario'
  const length = state.config_inicial.tamanho_relatorio || 'resumido_20'
  const isFormal = tone === 'formal'
  const isDetailed = length === 'detalhado_40'
  return { tone, length, isFormal, isDetailed }
}

export const generateDiagnosticReport = (state: StrategyState): Report1 => {
  const { config, op, market, vision } = {
    config: state.config_inicial,
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
  const { identity, managerVision, diagnosis, jtbd, okrs, config_inicial } =
    state
  const tone = config_inicial.tom_linguagem || 'intermediario'

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

export const generateAdvancedStrategyReport = (
  state: StrategyState,
): Report3 => {
  const {
    diagnosis,
    blueOcean,
    jtbd,
    relatorio_1,
    config_inicial,
    managerVision,
    marketAssessment,
  } = state
  const tone = config_inicial.tom_linguagem || 'intermediario'

  // Tone helper
  const t = (formal: string, informal: string) =>
    tone === 'formal' || tone === 'intermediario' ? formal : informal

  // 1. Porter's 5 Forces (Data Persistence & Enhancement)
  const portersForces = {
    rivalry:
      diagnosis.porter.rivalry ||
      'Alta rivalidade, com pressão por preços e marketing agressivo na região.',
    entrants:
      diagnosis.porter.newEntrants ||
      'Ameaça moderada, dependente de barreiras como capital inicial e reputação.',
    substitutes:
      diagnosis.porter.substitutes ||
      'Terapias alternativas e automedicação representam risco constante.',
    buyerPower:
      diagnosis.porter.buyers ||
      'Alto poder dos pacientes devido à oferta abundante de opções e acesso à informação.',
    supplierPower:
      diagnosis.porter.suppliers ||
      'Poder concentrado em poucos fornecedores de tecnologia/equipamentos ou operadoras de saúde.',
  }

  // 2. PESTEL Analysis (Contextual Logic)
  // Generating based on generic trends if context is limited
  const pestel = {
    political:
      'Instabilidade nas políticas de saúde suplementar e possíveis reformas tributárias que impactam o setor de serviços médicos.',
    economic:
      'Inflação médica acima do IPCA pressiona custos operacionais; pacientes com menor renda disponível buscam custo-benefício.',
    social:
      'Envelhecimento da população aumenta demanda por tratamentos crônicos; valorização da medicina preventiva e bem-estar.',
    technological:
      'Telemedicina consolidada; uso de IA para diagnósticos; pacientes esperam agendamento e resultados 100% digitais.',
    ecological:
      'Crescente exigência por descarte correto de resíduos (ESG) e clínicas "paperless" (sustentabilidade).',
    legal:
      'Rigor na LGPD (proteção de dados de pacientes) e normas da ANVISA/Conselhos de Classe mais fiscalizadoras.',
  }

  // 3. Crossed SWOT (FO, FA, DO, DA)
  // Fallback to empty arrays if report 1 is missing
  const strengths = relatorio_1?.swot.strengths || []
  const weaknesses = relatorio_1?.swot.weaknesses || []
  const opportunities = relatorio_1?.swot.opportunities || []
  const threats = relatorio_1?.swot.threats || []

  // Helper to generate simple crossed strategies if data exists
  const crossedSwot = {
    fo:
      strengths.length > 0 && opportunities.length > 0
        ? [
            `Usar "${strengths[0]}" para capturar "${opportunities[0]}".`,
            `Expandir "${strengths[1] || strengths[0]}" aproveitando o crescimento de "${opportunities[1] || opportunities[0]}".`,
          ]
        : ['Desenvolver novos serviços premium para a base atual.'],
    fa:
      strengths.length > 0 && threats.length > 0
        ? [
            `Utilizar "${strengths[0]}" para blindar a clínica contra "${threats[0]}".`,
            `Focar em "${strengths[0]}" para reduzir o impacto da concorrência em "${threats[0]}".`,
          ]
        : ['Fortalecer o branding para reduzir sensibilidade a preço.'],
    do:
      weaknesses.length > 0 && opportunities.length > 0
        ? [
            `Melhorar "${weaknesses[0]}" para não perder a oportunidade de "${opportunities[0]}".`,
            `Investir em tecnologia para resolver "${weaknesses[0]}" e crescer.`,
          ]
        : ['Digitalizar processos para aproveitar demanda online.'],
    da:
      weaknesses.length > 0 && threats.length > 0
        ? [
            `Eliminar "${weaknesses[0]}" para evitar vulnerabilidade crítica frente a "${threats[0]}".`,
            'Estratégia de sobrevivência: cortar custos e focar no core business.',
          ]
        : ['Revisar estrutura de custos para enfrentar crises.'],
  }

  // 4. JTBD & Value Canvas
  // Expanding JTBD list
  const jtbdList = jtbd.map((j) => `${j.job} (${j.type})`)
  if (jtbdList.length < 5) {
    jtbdList.push(
      'Sentir segurança no diagnóstico (Emocional)',
      'Não perder tempo na sala de espera (Funcional)',
      'Ser atendido por um especialista renomado (Social)',
      'Ter facilidade de pagamento/reembolso (Funcional)',
    )
  }

  const valueCanvas = {
    customerJobs: jtbdList,
    pains: [
      managerVision.problems[0] || 'Atendimento demorado',
      marketAssessment.patientComplaints || 'Dificuldade de agendamento',
      'Preço alto sem percepção de valor',
      'Ambiente frio/hospitalar',
      'Falta de estacionamento',
    ],
    gains: [
      marketAssessment.patientCompliments || 'Atendimento humanizado',
      'Resultado rápido do tratamento',
      'Localização acessível',
      'Confiança técnica',
      'Tecnologia de ponta',
    ],
    painRelievers: [
      blueOcean.eliminate[0] || 'Digitalização de processos',
      diagnosis.rumelt.policy || 'Foco na experiência do paciente',
      'Protocolos de pontualidade',
      'Treinamento de empatia',
    ],
    gainCreators: [
      blueOcean.create[0] || 'Novos programas de fidelidade',
      blueOcean.raise[0] || 'Acompanhamento pós-consulta',
      'Investimento em equipamentos modernos',
      'Parcerias com outros especialistas',
    ],
  }

  // 5. Blue Ocean (Direct mapping)
  // Ensure we have some defaults if empty
  const ensureItems = (items: string[], defaults: string[]) =>
    items.length > 0 ? items : defaults

  const blueOceanFinal = {
    eliminate: ensureItems(blueOcean.eliminate, [
      'Burocracia de papel',
      'Procedimentos de baixa margem',
    ]),
    reduce: ensureItems(blueOcean.reduce, [
      'Tempo de espera',
      'Custos fixos desnecessários',
    ]),
    raise: ensureItems(blueOcean.raise, ['Nível de serviço', 'Digitalização']),
    create: ensureItems(blueOcean.create, [
      'Programa de prevenção',
      'Telemonitoramento',
    ]),
  }

  // 6. Guiding Policies (Rumelt)
  // Expanding the main policy into actionable sub-policies
  const basePolicy =
    diagnosis.rumelt.policy ||
    'Focar na diferenciação pela experiência do paciente.'
  const guidingPolicies = [
    `Política Mestra: ${basePolicy}`,
    'Priorizar a retenção de pacientes atuais sobre a aquisição agressiva (LTV > CAC).',
    'Adotar tecnologia apenas quando esta reduzir esforço do paciente ou custo operacional.',
    'Centralizar a comunicação em canais digitais assíncronos (WhatsApp/App) para agilidade.',
    'Não competir por preço em procedimentos commodities; focar em valor agregado.',
    'Empoderar a recepção para resolução de problemas em primeiro contato.',
  ]

  // 7. Strategic Trade-offs
  // Inferring what NOT to do based on the strategy
  const tradeOffs = [
    'NÃO atenderemos convênios que pagam abaixo do custo operacional mínimo.',
    'NÃO investiremos em marketing de massa (outdoor/rádio), focando apenas em digital segmentado.',
    `NÃO manteremos processos manuais na ${blueOceanFinal.eliminate[0] || 'recepção'}.`,
    'NÃO expandiremos a estrutura física antes de atingir 85% de ocupação na atual.',
    'Abriremos mão de pacientes que buscam apenas "menor preço" em favor dos que buscam "resolutividade".',
  ]

  return {
    generatedAt: new Date().toISOString(),
    portersForces,
    pestel,
    crossedSwot,
    jtbd: jtbdList,
    valueCanvas,
    blueOcean: blueOceanFinal,
    guidingPolicies,
    tradeOffs,
  }
}

export const generateTacticalPlanReport = (state: StrategyState): Report4 => {
  const { managerVision, okrs, actions, blueOcean, diagnosis } = state

  // 1. Generate OKRs
  // Based on BSC perspectives and Manager Vision
  const generatedOkrs = [
    {
      id: 'okr1',
      objective: 'Maximizar a eficiência e a saúde financeira',
      area: 'Financeiro',
      krs: [
        `Atingir faturamento mensal de ${managerVision.goals.revenue || 'R$ 150.000'}`,
        'Manter margem líquida acima de 25%',
        'Reduzir custos fixos em 10% via automação',
      ],
    },
    {
      id: 'okr2',
      objective: 'Oferecer a melhor experiência do paciente na região',
      area: 'Clientes',
      krs: [
        `Alcançar NPS de ${managerVision.goals.nps || '75'}`,
        `Taxa de ocupação de ${managerVision.goals.occupancy || '80%'}`,
        'Reduzir tempo de espera na recepção para < 10min',
      ],
    },
    {
      id: 'okr3',
      objective: 'Digitalizar e agilizar a operação interna',
      area: 'Processos',
      krs: [
        '100% dos agendamentos integrados ao CRM',
        'Implantar pesquisa de satisfação automatizada',
        'Reduzir taxa de no-show para < 5%',
      ],
    },
    {
      id: 'okr4',
      objective: 'Construir um time de alta performance',
      area: 'Pessoas',
      krs: [
        'Realizar treinamentos trimestrais com toda a equipe',
        'Implementar avaliação de desempenho semestral',
        'Manter turnover abaixo de 10%',
      ],
    },
  ]

  // Use existing OKRs if available to enrich or replace default ones logic could be complex,
  // here we keep the generated ones as suggestions for the report or append existing ones if unique.
  // For simplicity, we stick to the generated structure to ensure coverage.

  // 2. KPIs by Area
  const kpis = {
    finance: [
      'Faturamento Bruto',
      'Margem de Contribuição',
      'Ticket Médio',
      'EBITDA',
    ],
    clients: [
      'NPS (Net Promoter Score)',
      'CAC (Custo de Aquisição)',
      'LTV (Lifetime Value)',
      'Taxa de Retorno',
    ],
    processes: [
      'Taxa de Ocupação',
      'Tempo Médio de Atendimento',
      'Taxa de No-Show',
      'Absenteísmo',
    ],
    people: [
      'eNPS (Satisfação do Colaborador)',
      'Turnover',
      'Horas de Treinamento',
      'Produtividade por Colaborador',
    ],
    marketing: [
      'Leads Gerados',
      'Taxa de Conversão',
      'ROI de Campanhas',
      'Custo por Lead (CPL)',
    ],
  }

  // 3. Initiatives Mapping (BSC + Blue Ocean + Actions)
  const initiatives = []

  // Add Blue Ocean Initiatives
  blueOcean.create.forEach((item, idx) => {
    initiatives.push({
      id: `bo-create-${idx}`,
      title: `Criar: ${item}`,
      relatedObjective: 'Inovação e Crescimento',
      priority: 'Alta' as const,
      impact: 'Alto' as const,
      effort: 'Alto' as const,
      quarter: idx % 2 === 0 ? ('Q1' as const) : ('Q2' as const),
    })
  })

  blueOcean.eliminate.forEach((item, idx) => {
    initiatives.push({
      id: `bo-elim-${idx}`,
      title: `Eliminar: ${item}`,
      relatedObjective: 'Eficiência Operacional',
      priority: 'Média' as const,
      impact: 'Médio' as const,
      effort: 'Baixo' as const,
      quarter: 'Q1' as const,
    })
  })

  // Add existing actions
  actions.forEach((action) => {
    initiatives.push({
      id: action.id,
      title: action.title,
      relatedObjective: 'Execução Tática',
      priority: 'Alta' as const,
      impact: 'Médio' as const,
      effort: 'Médio' as const,
      quarter: 'Q1' as const, // Default to Q1 for existing actions
    })
  })

  // Add generic initiatives based on diagnosis if few actions exist
  if (initiatives.length < 5) {
    initiatives.push(
      {
        id: 'gen-1',
        title: 'Implementar pesquisa de NPS recorrente',
        relatedObjective: 'Excelência em Clientes',
        priority: 'Alta',
        impact: 'Alto',
        effort: 'Baixo',
        quarter: 'Q1',
      },
      {
        id: 'gen-2',
        title: 'Revisão de precificação de procedimentos',
        relatedObjective: 'Saúde Financeira',
        priority: 'Alta',
        impact: 'Alto',
        effort: 'Médio',
        quarter: 'Q2',
      },
      {
        id: 'gen-3',
        title: 'Treinamento de vendas para recepção',
        relatedObjective: 'Crescimento de Receita',
        priority: 'Média',
        impact: 'Alto',
        effort: 'Médio',
        quarter: 'Q2',
      },
    )
  }

  return {
    generatedAt: new Date().toISOString(),
    okrs: generatedOkrs,
    kpis,
    initiatives: initiatives.sort((a, b) => {
      const priorityOrder = { Alta: 3, Média: 2, Baixa: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }),
  }
}

export const generateOperationalPlanReport = (
  state: StrategyState,
): Report5 => {
  const { config_inicial } = state
  const clinicName = config_inicial.nome_clinica || 'a Clínica'

  // 1. Routines
  const routines = [
    {
      area: 'Recepção',
      routines: [
        {
          frequency: 'Diária' as const,
          tasks: [
            'Verificar agenda do dia seguinte e confirmar presenças via WhatsApp.',
            'Organizar prontuários e fichas dos pacientes agendados.',
            'Realizar abertura de caixa e conferência de troco.',
            'Responder mensagens pendentes no WhatsApp Business e redes sociais.',
            'Higienizar balcão e área de espera a cada 2 horas.',
          ],
        },
        {
          frequency: 'Semanal' as const,
          tasks: [
            'Revisar lista de espera e tentar encaixes.',
            'Solicitar reposição de material de escritório e café.',
            'Enviar lembretes de retorno para pacientes inativos há 6 meses.',
          ],
        },
        {
          frequency: 'Mensal' as const,
          tasks: [
            'Relatório de atendimentos realizados vs. cancelados (No-show).',
            'Treinamento rápido de script de vendas e atendimento.',
          ],
        },
      ],
    },
    {
      area: 'Atendimento Clínico',
      routines: [
        {
          frequency: 'Diária' as const,
          tasks: [
            'Revisar prontuários antes do início dos atendimentos.',
            'Evoluir prontuários imediatamente após cada consulta.',
            'Verificar estoque de insumos da sala de procedimentos.',
          ],
        },
        {
          frequency: 'Semanal' as const,
          tasks: [
            'Reunião de discussão de casos clínicos complexos.',
            'Esterilização e manutenção preventiva de equipamentos leves.',
          ],
        },
        {
          frequency: 'Mensal' as const,
          tasks: [
            'Revisão de protocolos assistenciais.',
            'Inventário de insumos médicos e medicamentos.',
          ],
        },
      ],
    },
    {
      area: 'Administrativo/Financeiro',
      routines: [
        {
          frequency: 'Diária' as const,
          tasks: [
            'Conciliação bancária dos recebimentos do dia anterior.',
            'Pagamento de contas vencendo no dia.',
            'Lançamento de notas fiscais no sistema.',
          ],
        },
        {
          frequency: 'Semanal' as const,
          tasks: [
            'Projeção de fluxo de caixa para a próxima semana.',
            'Faturamento de guias de convênio (se aplicável).',
            'Pagamento de fornecedores e prestadores.',
          ],
        },
        {
          frequency: 'Mensal' as const,
          tasks: [
            'Fechamento contábil e apuração de DRE.',
            'Pagamento da folha de pagamento e impostos.',
            'Reunião de resultados com a diretoria.',
          ],
        },
      ],
    },
    {
      area: 'Marketing',
      routines: [
        {
          frequency: 'Diária' as const,
          tasks: [
            'Repostar stories de pacientes e interagir com comentários.',
            'Captar fotos/vídeos do dia a dia da clínica (bastidores).',
          ],
        },
        {
          frequency: 'Semanal' as const,
          tasks: [
            'Planejar posts da semana seguinte (conteúdo educativo).',
            'Disparar e-mail marketing ou lista de transmissão com dicas de saúde.',
          ],
        },
        {
          frequency: 'Mensal' as const,
          tasks: [
            'Analisar métricas (ROI, CAC, novos seguidores).',
            'Planejar campanha sazonal do próximo mês.',
          ],
        },
      ],
    },
  ]

  // 2. SOPs (Standard Operating Procedures)
  const sops = [
    {
      id: 'sop1',
      title: 'Boas-vindas e Recepção',
      objective:
        'Garantir que todo paciente se sinta acolhido e orientado desde a entrada.',
      responsible: 'Recepção',
      steps: [
        'Cumprimentar o paciente pelo nome, com sorriso e contato visual ao entrar.',
        'Confirmar dados cadastrais rapidamente (endereço, telefone, convênio).',
        'Oferecer água, café ou wi-fi enquanto aguarda.',
        'Informar ao médico/especialista que o paciente chegou via sistema.',
        'Caso haja atraso > 10min, informar o paciente proativamente e pedir desculpas.',
      ],
    },
    {
      id: 'sop2',
      title: 'Agendamento e Confirmação',
      objective: 'Maximizar a ocupação da agenda e reduzir faltas.',
      responsible: 'Recepção',
      steps: [
        'Oferecer sempre duas opções de horário ("Temos terça às 10h ou quinta às 14h?").',
        'Registrar agendamento no sistema com nome completo e telefone.',
        'Enviar confirmação via WhatsApp 24h antes da consulta.',
        'Se o paciente não responder até 4h antes, ligar para confirmar.',
        'Em caso de cancelamento, acionar imediatamente a Lista de Espera.',
      ],
    },
    {
      id: 'sop3',
      title: 'Atendimento Clínico Padrão',
      objective:
        'Assegurar qualidade técnica e percepção de valor na consulta.',
      responsible: 'Corpo Clínico',
      steps: [
        'Chamar o paciente na porta ou recepção (evitar gritar).',
        'Realizar anamnese detalhada ouvindo as queixas sem interromper.',
        'Explicar o diagnóstico e tratamento em linguagem simples.',
        'Entregar receita/orientações impressas ou digitais legíveis.',
        'Acompanhar o paciente até a porta do consultório ao finalizar.',
      ],
    },
    {
      id: 'sop4',
      title: 'Pós-Venda e Fidelização',
      objective: 'Aumentar o retorno e indicação de pacientes.',
      responsible: 'CRC / Recepção',
      steps: [
        'Enviar mensagem de "Como você está?" 2 a 3 dias após o procedimento/consulta.',
        'Enviar pesquisa de satisfação (NPS) via link.',
        'Agendar o retorno preventivo no sistema antes do paciente sair (se possível).',
        'Enviar felicitações no dia do aniversário do paciente.',
      ],
    },
  ]

  // 3. Checklists
  const checklists = [
    {
      id: 'chk1',
      title: 'Abertura da Clínica',
      items: [
        'Destrancar portas e desligar alarme.',
        'Ligar luzes, ar-condicionado e som ambiente.',
        'Verificar limpeza da recepção e banheiros.',
        'Ligar computadores e abrir sistema de gestão.',
        'Preparar café e água para pacientes.',
        'Conferir agenda do dia impresso ou na tela.',
      ],
    },
    {
      id: 'chk2',
      title: 'Fechamento da Clínica',
      items: [
        'Conferir se todos os pacientes foram atendidos.',
        'Arquivar prontuários físicos utilizados.',
        'Realizar fechamento de caixa e guardar valores no cofre.',
        'Desligar equipamentos médicos, computadores e luzes.',
        'Verificar trancas de janelas e portas.',
        'Ligar alarme ao sair.',
      ],
    },
    {
      id: 'chk3',
      title: 'Preparação de Consultório',
      items: [
        'Higienizar maca/cadeira com álcool 70%.',
        'Trocar lençol de papel descartável.',
        'Verificar disponibilidade de luvas, máscaras e instrumentos.',
        'Testar funcionamento de equipamentos específicos.',
        'Organizar mesa do médico (canetas, receituários).',
      ],
    },
  ]

  // 4. 2026 Calendar
  const calendar = [
    {
      month: 'Janeiro',
      theme: 'Janeiro Branco (Saúde Mental)',
      events: [
        'Planejamento Anual com a Equipe',
        'Campanha: Comece o ano cuidando de você',
        'Revisão de contratos anuais',
      ],
    },
    {
      month: 'Fevereiro',
      theme: 'Prevenção e Check-up',
      events: [
        'Treinamento de Atendimento (SOPs)',
        'Ação de Carnaval: Kits de saúde',
        'Auditoria de estoques',
      ],
    },
    {
      month: 'Março',
      theme: 'Dia da Mulher / Março Lilás',
      events: [
        'Campanha Especial Mês da Mulher',
        'Fechamento do Trimestre (Q1) e Análise de OKRs',
        'Pesquisa de Clima Organizacional',
      ],
    },
    {
      month: 'Abril',
      theme: 'Dia Mundial da Saúde',
      events: [
        'Semana da Saúde: Palestras ou Lives',
        'Revisão de preços e tabela de serviços',
        'Treinamento Técnico para Corpo Clínico',
      ],
    },
    {
      month: 'Maio',
      theme: 'Mês das Mães',
      events: [
        'Campanha: Presenteie com Saúde',
        'Review de Processos de Atendimento',
        'Manutenção preventiva predial',
      ],
    },
    {
      month: 'Junho',
      theme: 'Junho Vermelho (Doação de Sangue)',
      events: [
        'Ação social comunitária',
        'Fechamento do Trimestre (Q2) e Análise de OKRs',
        'Festa Junina interna da equipe',
      ],
    },
    {
      month: 'Julho',
      theme: 'Julho Amarelo (Hepatites)',
      events: [
        'Campanha de Férias: Check-up para viagem',
        'Treinamento de Vendas para Recepção',
        'Feedback semestral individual',
      ],
    },
    {
      month: 'Agosto',
      theme: 'Agosto Dourado / Dia dos Pais',
      events: [
        'Campanha Saúde do Homem',
        'Revisão do planejamento estratégico',
        'Renegociação com fornecedores',
      ],
    },
    {
      month: 'Setembro',
      theme: 'Setembro Amarelo (Valorização da Vida)',
      events: [
        'Ações de conscientização',
        'Fechamento do Trimestre (Q3) e Análise de OKRs',
        'Planejamento da Black Friday (se aplicável)',
      ],
    },
    {
      month: 'Outubro',
      theme: 'Outubro Rosa (Saúde da Mulher)',
      events: [
        'Grande Campanha de Prevenção',
        'Decoração temática da clínica',
        'Evento para pacientes VIPs',
      ],
    },
    {
      month: 'Novembro',
      theme: 'Novembro Azul (Saúde do Homem)',
      events: [
        'Campanha focada em público masculino',
        'Black Friday: Condições especiais para tratamentos',
        'Definição de metas para o ano seguinte',
      ],
    },
    {
      month: 'Dezembro',
      theme: 'Dezembro Vermelho / Festas',
      events: [
        'Fechamento do Ano (Q4) e Celebração de Resultados',
        'Confraternização da equipe',
        'Recesso coletivo (se houver) e escalas',
      ],
    },
  ]

  return {
    generatedAt: new Date().toISOString(),
    routines,
    sops,
    checklists,
    calendar,
  }
}

export const generateFinalReport = (state: StrategyState): ReportFinal => {
  const { isFormal, isDetailed } = getSettings(state)
  const { config_inicial } = state

  // Ensure dependencies are generated if null (using live state)
  const r1 = state.relatorio_1 || generateDiagnosticReport(state)
  const r2 = state.relatorio_2 || generateStrategicDirectionReport(state)
  const r3 = state.relatorio_3 || generateAdvancedStrategyReport(state)
  const r4 = state.relatorio_4 || generateTacticalPlanReport(state)
  const r5 = state.relatorio_5 || generateOperationalPlanReport(state)

  const cover = {
    title: 'Planejamento Estratégico Integrado 2026',
    clinicName: config_inicial.nome_clinica || 'Sua Clínica',
    year: 2026,
    subtitle: isFormal
      ? 'Documento Oficial de Diretrizes e Ações'
      : 'Guia de Sucesso para o Próximo Ano',
  }

  const introduction = {
    context: isFormal
      ? 'Este documento consolida o planejamento estratégico da organização para o ciclo anual de 2026. Fundamentado em metodologias consagradas de gestão (BSC, SWOT, Rumelt, Oceano Azul), ele visa alinhar a visão da diretoria com a execução operacional.'
      : 'Bem-vindo ao mapa do sucesso da sua clínica para 2026! Juntamos aqui todas as análises, sonhos e planos práticos para garantir que todo o time esteja remando na mesma direção.',
    objectives: isFormal
      ? `O objetivo central é alcançar a meta de "${config_inicial.objetivo_geral_2026}", garantindo sustentabilidade financeira e excelência na experiência do paciente.`
      : `Nossa meta é clara: "${config_inicial.objetivo_geral_2026}". Vamos transformar esse sonho em realidade, dia após dia.`,
    methodology: isDetailed
      ? 'A metodologia aplicada seguiu cinco etapas: 1) Diagnóstico Situacional profundo (Análise Interna e Externa); 2) Definição de Identidade e Direcionamento (Missão, Visão, Valores); 3) Análise Estratégica Avançada (Trade-offs e Diferenciação); 4) Planejamento Tático (OKRs e KPIs); e 5) Planejamento Operacional (Rotinas e Processos).'
      : 'Utilizamos uma abordagem em 5 passos: Diagnóstico, Identidade, Estratégia, Tática e Operação.',
  }

  const part1_diagnosis = {
    summary: r1.executiveSummary,
    swot: r1.swot,
    mainProblem: state.diagnosis.rumelt.challenge,
  }

  const part2_strategy = {
    mission: r2.mission,
    vision: r2.vision,
    values: r2.values,
    mapSummary: r2.strategicMapText,
  }

  const part3_advanced = {
    policies: r3.guidingPolicies,
    blueOceanSummary: `Para sair da competição irrelevante, focaremos em ELIMINAR ${r3.blueOcean.eliminate.join(', ')} e CRIAR ${r3.blueOcean.create.join(', ')}.`,
  }

  const part4_tactical = {
    okrs: r4.okrs,
    initiatives: r4.initiatives,
  }

  const part5_operational = {
    routines: r5.routines,
    calendar: r5.calendar,
  }

  const conclusion = {
    closing: isFormal
      ? 'A execução disciplinada deste plano é fundamental para o êxito organizacional. Recomenda-se a revisão trimestral das metas e o acompanhamento mensal dos indicadores chave (KPIs).'
      : 'Agora é mão na massa! O plano é bom, mas o resultado vem da execução. Vamos acompanhar os números todo mês e celebrar cada vitória.',
    nextSteps: [
      'Divulgar a Missão e Visão para toda a equipe.',
      'Configurar o CRM e ferramentas de gestão.',
      'Iniciar as rotinas matinais (Daily) na recepção.',
      'Revisar os OKRs ao final do Q1 (Março).',
    ],
  }

  return {
    generatedAt: new Date().toISOString(),
    cover,
    introduction,
    part1_diagnosis,
    part2_strategy,
    part3_advanced,
    part4_tactical,
    part5_operational,
    conclusion,
  }
}
