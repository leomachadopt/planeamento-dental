import { create } from 'zustand'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export type ActionStatus = 'Plan' | 'Do' | 'Check' | 'Act'

export interface ActionItem {
  id: string
  title: string
  status: ActionStatus
  owner: string
  deadline: string
  okrId?: string
}

export interface KeyResult {
  id: string
  title: string
  target: number
  current: number
  unit: string
}

export interface OKR {
  id: string
  objective: string
  perspective: 'Financeira' | 'Clientes' | 'Processos' | 'Aprendizado'
  progress: number
  keyResults: KeyResult[]
}

export interface ConfigInicial {
  tipo_clinica: string
  nome_clinica: string
  localizacao: string
  publico_principal: string
  estagio_clinica:
    | 'Iniciante'
    | 'Em Crescimento'
    | 'Consolidada'
    | 'Em Crise'
    | 'Outro'
    | ''
  gestores_principais: string
  objetivo_geral_2026: string
  tamanho_relatorio: 'resumido_20' | 'detalhado_40' | ''
  tom_linguagem: 'formal' | 'informal' | 'intermediario' | ''
}

export interface OperationalAssessment {
  services: string
  infrastructure: string
  team_composition: string
  working_hours: string
  patient_management: string
  financial_management: string
  processes_well_defined: string
  processes_disorganized: string
}

export interface MarketAssessment {
  marketDescription: string
  competitors: string
  clinicStrengths: string
  competitorStrengths: string
  acquisitionChannels: string
  patientComplaints: string
  patientCompliments: string
  patientLoss: string
}

export interface ManagerVision {
  problems: string[]
  opportunities: string[]
  vision2026: string
  goals: {
    revenue: string
    occupancy: string
    nps: string
    other: string
  }
  ratings: {
    processes: { score: number; justification: string }
    financial: { score: number; justification: string }
    satisfaction: { score: number; justification: string }
  }
}

export interface IdentityState {
  reason: string
  recognitionGoal: string
  values: string
  priorityAudience: string
  pricePositioning: string
  strategyFocus: string
}

export interface SWOT {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

export interface Report1 {
  generatedAt: string
  executiveSummary: string
  businessContext: string
  operationAnalysis: string
  marketAnalysis: string
  swot: SWOT
  insightsRisks: string[]
}

export interface Report2 {
  generatedAt: string
  mission: string
  vision: string
  values: string[]
  strategicPrinciples: string[]
  valueProposition: string
  valueChain: string
  competitivePositioning: string
  bscObjectives: {
    financial: string[]
    customers: string[]
    processes: string[]
    learning: string[]
  }
  strategicMapText: string
}

export interface Report3 {
  generatedAt: string
  portersForces: {
    rivalry: string
    entrants: string
    substitutes: string
    buyerPower: string
    supplierPower: string
  }
  pestel: {
    political: string
    economic: string
    social: string
    technological: string
    ecological: string
    legal: string
  }
  crossedSwot: {
    fo: string[]
    fa: string[]
    do: string[]
    da: string[]
  }
  jtbd: string[]
  valueCanvas: {
    customerJobs: string[]
    pains: string[]
    gains: string[]
    painRelievers: string[]
    gainCreators: string[]
  }
  blueOcean: {
    eliminate: string[]
    reduce: string[]
    raise: string[]
    create: string[]
  }
  guidingPolicies: string[]
  tradeOffs: string[]
}

export interface Report4 {
  generatedAt: string
  okrs: {
    id: string
    objective: string
    area: string
    krs: string[]
  }[]
  kpis: {
    finance: string[]
    clients: string[]
    processes: string[]
    people: string[]
    marketing: string[]
  }
  initiatives: {
    id: string
    title: string
    relatedObjective: string
    priority: 'Alta' | 'Média' | 'Baixa'
    impact: 'Alto' | 'Médio' | 'Baixo'
    effort: 'Alto' | 'Médio' | 'Baixo'
    quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  }[]
}

export interface RoutineTask {
  frequency: 'Diária' | 'Semanal' | 'Mensal'
  tasks: string[]
}

export interface AreaRoutines {
  area: string
  routines: RoutineTask[]
}

export interface SOP {
  id: string
  title: string
  objective: string
  responsible: string
  steps: string[]
}

export interface Checklist {
  id: string
  title: string
  items: string[]
}

export interface CalendarMonth {
  month: string
  theme: string
  events: string[]
}

export interface Report5 {
  generatedAt: string
  routines: AreaRoutines[]
  sops: SOP[]
  checklists: Checklist[]
  calendar: CalendarMonth[]
}

export interface ReportFinal {
  generatedAt: string
  cover: {
    title: string
    clinicName: string
    year: number
    subtitle: string
  }
  introduction: {
    context: string
    objectives: string
    methodology: string
  }
  part1_diagnosis: {
    summary: string
    swot: SWOT
    mainProblem: string
  }
  part2_strategy: {
    mission: string
    vision: string
    values: string[]
    mapSummary: string
  }
  part3_advanced: {
    policies: string[]
    blueOceanSummary: string
  }
  part4_tactical: {
    okrs: Report4['okrs']
    initiatives: Report4['initiatives']
  }
  part5_operational: {
    routines: AreaRoutines[]
    calendar: CalendarMonth[]
  }
  conclusion: {
    closing: string
    nextSteps: string[]
  }
}

export interface StrategyState {
  // Database
  currentClinicId: string | null
  isLoading: boolean
  isSaving: boolean

  // Data
  clinicName: string
  config_inicial: ConfigInicial
  diagnosis: {
    porter: {
      rivalry: string
      newEntrants: string
      substitutes: string
      buyers: string
      suppliers: string
    }
    rumelt: {
      challenge: string
      obstacles: string
      policy: string
    }
  }
  blueOcean: {
    eliminate: string[]
    reduce: string[]
    raise: string[]
    create: string[]
  }
  jtbd: {
    id: string
    job: string
    type: 'Funcional' | 'Emocional' | 'Social'
    solution: string
  }[]
  okrs: OKR[]
  actions: ActionItem[]
  operationalAssessment: OperationalAssessment
  marketAssessment: MarketAssessment
  managerVision: ManagerVision
  identity: IdentityState
  relatorio_1: Report1 | null
  relatorio_2: Report2 | null
  relatorio_3: Report3 | null
  relatorio_4: Report4 | null
  relatorio_5: Report5 | null
  relatorio_final: ReportFinal | null

  // Actions
  setConfigInicial: (config: ConfigInicial) => void
  updateRumelt: (data: Partial<StrategyState['diagnosis']['rumelt']>) => void
  addBlueOceanItem: (
    category: 'eliminate' | 'reduce' | 'raise' | 'create',
    item: string,
  ) => void
  removeBlueOceanItem: (
    category: 'eliminate' | 'reduce' | 'raise' | 'create',
    index: number,
  ) => void
  addOKR: (okr: OKR) => void
  addAction: (action: ActionItem) => void
  updateActionStatus: (id: string, status: ActionStatus) => void
  updateOperationalAssessment: (data: Partial<OperationalAssessment>) => void
  updateMarketAssessment: (data: Partial<MarketAssessment>) => void
  updateManagerVision: (data: Partial<ManagerVision>) => void
  updateIdentity: (data: Partial<IdentityState>) => void
  setRelatorio1: (report: Report1) => void
  setRelatorio2: (report: Report2) => void
  setRelatorio3: (report: Report3) => void
  setRelatorio4: (report: Report4) => void
  setRelatorio5: (report: Report5) => void
  setRelatorioFinal: (report: ReportFinal) => void

  // Database actions
  setCurrentClinicId: (clinicId: string | null) => void
  loadClinicData: (clinicId: string) => Promise<void>
  saveClinicData: () => Promise<void>
  createNewClinic: (clinicName: string) => Promise<string>
}

export const useStrategyStore = create<StrategyState>((set, get) => ({
  // Database state
  currentClinicId: null,
  isLoading: false,
  isSaving: false,

  clinicName: 'Clínica Vida & Saúde',
  config_inicial: {
    tipo_clinica: '',
    nome_clinica: '',
    localizacao: '',
    publico_principal: '',
    estagio_clinica: '',
    gestores_principais: '',
    objetivo_geral_2026: '',
    tamanho_relatorio: '',
    tom_linguagem: '',
  },
  diagnosis: {
    porter: {
      rivalry: 'Alta concorrência de clínicas populares na região.',
      newEntrants: 'Barreiras de entrada médias (custo de equipamentos).',
      substitutes: 'Terapias holísticas e automedicação.',
      buyers: 'Pacientes exigem agendamento digital e rapidez.',
      suppliers: 'Fornecedores de insumos com preços voláteis.',
    },
    rumelt: {
      challenge:
        'Estagnação do crescimento devido à baixa fidelização de pacientes crônicos.',
      obstacles:
        'Processos manuais de agendamento, falta de pós-consulta estruturado.',
      policy:
        'Implementar uma jornada digital centrada no paciente, automatizando o relacionamento e criando programas de continuidade.',
    },
  },
  blueOcean: {
    eliminate: ['Papelada física na recepção', 'Tempo de espera > 15min'],
    reduce: [
      'Consultas de retorno presenciais desnecessárias (migrar para tele)',
    ],
    raise: ['Acompanhamento pós-consulta', 'Integração com wearables'],
    create: ["Programa de Fidelidade 'Saúde Premium'", 'Concierge de Saúde'],
  },
  jtbd: [
    {
      id: '1',
      job: 'Aliviar a dor nas costas rapidamente para voltar ao trabalho',
      type: 'Funcional',
      solution: "Protocolo 'Dor Zero' em 24h",
    },
    {
      id: '2',
      job: "Sentir-se cuidado e não apenas 'mais um número'",
      type: 'Emocional',
      solution: 'Atendimento personalizado e humanizado',
    },
  ],
  okrs: [
    {
      id: '1',
      objective: 'Garantir a Sustentabilidade Financeira',
      perspective: 'Financeira',
      progress: 65,
      keyResults: [
        {
          id: 'kr1',
          title: 'Aumentar faturamento recorrente',
          target: 100000,
          current: 65000,
          unit: 'R$',
        },
      ],
    },
    {
      id: '2',
      objective: 'Encantar o Paciente na Jornada Digital',
      perspective: 'Clientes',
      progress: 40,
      keyResults: [
        {
          id: 'kr2',
          title: 'Atingir NPS de 75',
          target: 75,
          current: 45,
          unit: 'pts',
        },
      ],
    },
  ],
  actions: [
    {
      id: '1',
      title: 'Implementar CRM de agendamento',
      status: 'Do',
      owner: 'Dr. Roberto',
      deadline: '2024-03-15',
      okrId: '2',
    },
    {
      id: '2',
      title: "Treinamento de recepcionistas em 'Hospitalidade'",
      status: 'Plan',
      owner: 'Ana (Gerente)',
      deadline: '2024-03-20',
      okrId: '2',
    },
    {
      id: '3',
      title: 'Revisar contratos de fornecedores',
      status: 'Check',
      owner: 'Financeiro',
      deadline: '2024-02-28',
      okrId: '1',
    },
  ],
  operationalAssessment: {
    services: '',
    infrastructure: '',
    team_composition: '',
    working_hours: '',
    patient_management: '',
    financial_management: '',
    processes_well_defined: '',
    processes_disorganized: '',
  },
  marketAssessment: {
    marketDescription: '',
    competitors: '',
    clinicStrengths: '',
    competitorStrengths: '',
    acquisitionChannels: '',
    patientComplaints: '',
    patientCompliments: '',
    patientLoss: '',
  },
  managerVision: {
    problems: ['', '', ''],
    opportunities: ['', '', ''],
    vision2026: '',
    goals: {
      revenue: '',
      occupancy: '',
      nps: '',
      other: '',
    },
    ratings: {
      processes: { score: 5, justification: '' },
      financial: { score: 5, justification: '' },
      satisfaction: { score: 5, justification: '' },
    },
  },
  identity: {
    reason: '',
    recognitionGoal: '',
    values: '',
    priorityAudience: '',
    pricePositioning: '',
    strategyFocus: '',
  },
  relatorio_1: null,
  relatorio_2: null,
  relatorio_3: null,
  relatorio_4: null,
  relatorio_5: null,
  relatorio_final: null,

  setConfigInicial: (config) =>
    set(() => ({ config_inicial: config, clinicName: config.nome_clinica })),
  updateRumelt: (data) =>
    set((state) => ({
      diagnosis: {
        ...state.diagnosis,
        rumelt: { ...state.diagnosis.rumelt, ...data },
      },
    })),
  addBlueOceanItem: (category, item) =>
    set((state) => ({
      blueOcean: {
        ...state.blueOcean,
        [category]: [...state.blueOcean[category], item],
      },
    })),
  removeBlueOceanItem: (category, index) =>
    set((state) => ({
      blueOcean: {
        ...state.blueOcean,
        [category]: state.blueOcean[category].filter((_, i) => i !== index),
      },
    })),
  addOKR: (okr) => set((state) => ({ okrs: [...state.okrs, okr] })),
  addAction: (action) =>
    set((state) => ({ actions: [...state.actions, action] })),
  updateActionStatus: (id, status) =>
    set((state) => ({
      actions: state.actions.map((a) => (a.id === id ? { ...a, status } : a)),
    })),
  updateOperationalAssessment: (data) =>
    set((state) => ({
      operationalAssessment: { ...state.operationalAssessment, ...data },
    })),
  updateMarketAssessment: (data) =>
    set((state) => ({
      marketAssessment: { ...state.marketAssessment, ...data },
    })),
  updateManagerVision: (data) =>
    set((state) => ({
      managerVision: { ...state.managerVision, ...data },
    })),
  updateIdentity: (data) =>
    set((state) => ({
      identity: { ...state.identity, ...data },
    })),
  setRelatorio1: (report) => set(() => ({ relatorio_1: report })),
  setRelatorio2: (report) => set(() => ({ relatorio_2: report })),
  setRelatorio3: (report) => set(() => ({ relatorio_3: report })),
  setRelatorio4: (report) => set(() => ({ relatorio_4: report })),
  setRelatorio5: (report) => set(() => ({ relatorio_5: report })),
  setRelatorioFinal: (report) => set(() => ({ relatorio_final: report })),

  // Database actions
  setCurrentClinicId: (clinicId) => set({ currentClinicId: clinicId }),

  loadClinicData: async (clinicId: string) => {
    set({ isLoading: true })
    try {
      const data = await api.getClinic(clinicId)

      set({
        ...data,
        currentClinicId: clinicId,
        isLoading: false,
      })

      toast.success('Dados carregados com sucesso!')
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados da clínica')
      set({ isLoading: false })
    }
  },

  saveClinicData: async () => {
    const state = get()
    if (!state.currentClinicId) {
      toast.error('Nenhuma clínica selecionada')
      return
    }

    set({ isSaving: true })
    try {
      await api.saveClinicData(state.currentClinicId, state)
      toast.success('Dados salvos com sucesso!')
      set({ isSaving: false })
    } catch (error) {
      console.error('Erro ao salvar dados:', error)
      toast.error('Erro ao salvar dados')
      set({ isSaving: false })
    }
  },

  createNewClinic: async (clinicName: string) => {
    try {
      const { id } = await api.createClinic(clinicName)
      set({ currentClinicId: id, clinicName: clinicName })
      toast.success('Clínica criada com sucesso!')
      return id
    } catch (error) {
      console.error('Erro ao criar clínica:', error)
      toast.error('Erro ao criar clínica')
      throw error
    }
  },
}))
