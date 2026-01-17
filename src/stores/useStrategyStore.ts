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
  // Passo 1: Serviços que sustentam a operação
  services: string
  // Passo 2: Capacidade física vs uso real
  infrastructure: string
  // Passo 3: Dependência da equipa
  team_composition: string
  // Passo 4: Horário vs comportamento do paciente
  working_hours: string
  // Passo 5: Maturidade do agendamento
  patient_management: string
  // Passo 6: Controle financeiro prático
  financial_management: string
  // Passo 7: O que funciona bem (vantagem operacional)
  processes_well_defined: string
  // Passo 8: Onde a operação trava crescimento
  processes_disorganized: string
}

export interface MarketAssessment {
  // Passo 1: Tipo de mercado (não descrição genérica)
  marketDescription: string
  // Passo 2: Quem realmente disputa o MESMO paciente
  competitors: string
  // Passo 3: Critério de escolha do paciente
  clinicStrengths: string
  // Passo 4: Onde os concorrentes são estruturalmente melhores
  competitorStrengths: string
  // Passo 5: Como a demanda chega até você (qualidade do canal)
  acquisitionChannels: string
  // Passo 6: Dor recorrente do mercado (não da clínica)
  patientComplaints: string
  // Passo 7: Motivos reais de fidelização
  patientCompliments: string
  // Passo 8: Perdas competitivas (aprendizado estratégico)
  patientLoss: string
}

export interface ProblemDetail {
  description: string
  impact: ('Financeiro' | 'Operacional' | 'Pessoas' | 'Experiência do paciente')[]
  sinceWhen: string
  rootCause: string
}

export interface OpportunityDetail {
  description: string
  dependsOn: ('Marketing' | 'Operação' | 'Pessoas' | 'Tecnologia' | 'Posicionamento de mercado')[]
  risk: string
  tradeOff: string
}

export interface Vision2026 {
  financial: {
    monthlyRevenue: string
    margin: string
    ownerDependency: string
  }
  market: {
    knownFor: string
    chosenFor: string
  }
  operation: {
    scheduleStatus: string
    processStandardization: string
  }
  people: {
    teamProfile: string
    turnover: string
    autonomy: string
  }
}

export interface KPIs {
  financial: {
    monthlyRevenue: string
    margin: string
    averageTicket: string
  }
  operational: {
    occupancyRate: string
    waitTime: string
    noShowRate: string
  }
  experience: {
    nps: string
    returnRate: string
    referralRate: string
  }
  people: {
    maxTurnover: string
    ownerDependency: string
  }
}

export interface ManagerVision {
  // Passo 1: Dores reais de gestão (3 problemas com detalhes)
  problems: ProblemDetail[]
  // Passo 2: Oportunidades e alavancas estratégicas (3 oportunidades com detalhes)
  opportunities: OpportunityDetail[]
  // Passo 3: Visão 2026 (estado futuro concreto)
  vision2026: Vision2026
  // Passo 4: Métricas que realmente importam
  kpis: KPIs
  // Passo 5: Processos internos (maturidade real)
  ratings: {
    processes: { score: number; justification: string }
    financial: { score: number; justification: string }
    satisfaction: { score: number; justification: string }
  }
  // Campos legados para compatibilidade (serão preenchidos automaticamente)
  goals: {
    revenue: string
    occupancy: string
    nps: string
    other: string
  }
}

export interface IdentityState {
  // Passo 1: Razão de existir (propósito)
  reason: string
  // Passo 2: Identidade futura (reconhecimento)
  recognitionGoal: string
  // Passo 3: Valores inegociáveis
  values: string
  // Passo 4: Público prioritário (2026)
  priorityAudience: string
  // Passo 5: Posicionamento de preço
  pricePositioning: string
  // Passo 6: Foco do crescimento
  strategyFocus: string
  // Complemento obrigatório do foco de crescimento
  strategyFocusComplement: string
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
  hasUnsavedChanges: boolean

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

  // Report generation with AI
  isGeneratingReport: boolean
  generateDiagnosticReport: () => Promise<void>
  generateStrategicReport: () => Promise<void>
  generateAdvancedReport: () => Promise<void>
  generateTacticalReport: () => Promise<void>
  generateOperationalReport: () => Promise<void>
  generateFinalReport: () => Promise<void>
}

// Debounce timer for auto-save
let saveTimeout: NodeJS.Timeout | null = null

// Debounced save function
const debouncedSave = () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  saveTimeout = setTimeout(async () => {
    const state = useStrategyStore.getState()
    console.log('🕒 Auto-save timer triggered', {
      hasClinicId: !!state.currentClinicId,
      hasUnsavedChanges: state.hasUnsavedChanges,
      isSaving: state.isSaving,
    })
    if (state.currentClinicId && state.hasUnsavedChanges && !state.isSaving) {
      console.log('💾 Auto-saving data...')
      await state.saveClinicData()
    }
  }, 2000) // Wait 2 seconds after last change
}

export const useStrategyStore = create<StrategyState>((set, get) => ({
  // Database state
  currentClinicId: null,
  isLoading: false,
  isSaving: false,
  isGeneratingReport: false,
  hasUnsavedChanges: false,

  clinicName: '',
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
      rivalry: '',
      newEntrants: '',
      substitutes: '',
      buyers: '',
      suppliers: '',
    },
    rumelt: {
      challenge: '',
      obstacles: '',
      policy: '',
    },
  },
  blueOcean: {
    eliminate: [],
    reduce: [],
    raise: [],
    create: [],
  },
  jtbd: [],
  okrs: [],
  actions: [],
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
    problems: [
      { description: '', impact: [], sinceWhen: '', rootCause: '' },
      { description: '', impact: [], sinceWhen: '', rootCause: '' },
      { description: '', impact: [], sinceWhen: '', rootCause: '' },
    ],
    opportunities: [
      { description: '', dependsOn: [], risk: '', tradeOff: '' },
      { description: '', dependsOn: [], risk: '', tradeOff: '' },
      { description: '', dependsOn: [], risk: '', tradeOff: '' },
    ],
    vision2026: {
      financial: { monthlyRevenue: '', margin: '', ownerDependency: '' },
      market: { knownFor: '', chosenFor: '' },
      operation: { scheduleStatus: '', processStandardization: '' },
      people: { teamProfile: '', turnover: '', autonomy: '' },
    },
    kpis: {
      financial: { monthlyRevenue: '', margin: '', averageTicket: '' },
      operational: { occupancyRate: '', waitTime: '', noShowRate: '' },
      experience: { nps: '', returnRate: '', referralRate: '' },
      people: { maxTurnover: '', ownerDependency: '' },
    },
    ratings: {
      processes: { score: 5, justification: '' },
      financial: { score: 5, justification: '' },
      satisfaction: { score: 5, justification: '' },
    },
    goals: {
      revenue: '',
      occupancy: '',
      nps: '',
      other: '',
    },
  },
  identity: {
    reason: '',
    recognitionGoal: '',
    values: '',
    priorityAudience: '',
    pricePositioning: '',
    strategyFocus: '',
    strategyFocusComplement: '',
  },
  relatorio_1: null,
  relatorio_2: null,
  relatorio_3: null,
  relatorio_4: null,
  relatorio_5: null,
  relatorio_final: null,

  setConfigInicial: (config) => {
    console.log('📝 setConfigInicial called', config)
    set(() => ({
      config_inicial: config,
      clinicName: config.nome_clinica,
      hasUnsavedChanges: true,
    }))
    // Auto-save with debounce
    debouncedSave()
  },
  updateRumelt: (data) => {
    set((state) => ({
      diagnosis: {
        ...state.diagnosis,
        rumelt: { ...state.diagnosis.rumelt, ...data },
      },
      hasUnsavedChanges: true,
    }))
    debouncedSave()
  },
  addBlueOceanItem: (category, item) => {
    set((state) => ({
      blueOcean: {
        ...state.blueOcean,
        [category]: [...state.blueOcean[category], item],
      },
      hasUnsavedChanges: true,
    }))
    debouncedSave()
  },
  removeBlueOceanItem: (category, index) => {
    set((state) => ({
      blueOcean: {
        ...state.blueOcean,
        [category]: state.blueOcean[category].filter((_, i) => i !== index),
      },
      hasUnsavedChanges: true,
    }))
    debouncedSave()
  },
  addOKR: (okr) => {
    set((state) => ({ okrs: [...state.okrs, okr], hasUnsavedChanges: true }))
    debouncedSave()
  },
  addAction: (action) => {
    set((state) => ({
      actions: [...state.actions, action],
      hasUnsavedChanges: true,
    }))
    debouncedSave()
  },
  updateActionStatus: (id, status) => {
    set((state) => ({
      actions: state.actions.map((a) => (a.id === id ? { ...a, status } : a)),
      hasUnsavedChanges: true,
    }))
    debouncedSave()
  },
  updateOperationalAssessment: (data) => {
    console.log('📝 updateOperationalAssessment called', data)
    set((state) => ({
      operationalAssessment: { ...state.operationalAssessment, ...data },
      hasUnsavedChanges: true,
    }))
    debouncedSave()
  },
  updateMarketAssessment: (data) => {
    set((state) => ({
      marketAssessment: { ...state.marketAssessment, ...data },
      hasUnsavedChanges: true,
    }))
    debouncedSave()
  },
  updateManagerVision: (data) => {
    set((state) => ({
      managerVision: { ...state.managerVision, ...data },
      hasUnsavedChanges: true,
    }))
    debouncedSave()
  },
  updateIdentity: (data) => {
    set((state) => ({
      identity: { ...state.identity, ...data },
      hasUnsavedChanges: true,
    }))
    debouncedSave()
  },
  setRelatorio1: (report) => set(() => ({ relatorio_1: report })),
  setRelatorio2: (report) => set(() => ({ relatorio_2: report })),
  setRelatorio3: (report) => set(() => ({ relatorio_3: report })),
  setRelatorio4: (report) => set(() => ({ relatorio_4: report })),
  setRelatorio5: (report) => set(() => ({ relatorio_5: report })),
  setRelatorioFinal: (report) => set(() => ({ relatorio_final: report })),

  // Database actions
  setCurrentClinicId: (clinicId) => {
    set({ currentClinicId: clinicId })
    // Persist to localStorage (apenas no browser)
    if (typeof window !== 'undefined') {
      if (clinicId) {
        localStorage.setItem('currentClinicId', clinicId)
      } else {
        localStorage.removeItem('currentClinicId')
      }
    }
  },

  loadClinicData: async (clinicId: string) => {
    set({ isLoading: true })
    try {
      const data = await api.getClinic(clinicId)

      set({
        ...data,
        currentClinicId: clinicId,
        isLoading: false,
        hasUnsavedChanges: false,
      })

      // Persist to localStorage (apenas no browser)
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentClinicId', clinicId)
      }

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
      console.warn('⚠️ Tentativa de salvar sem clínica selecionada')
      toast.error('Nenhuma clínica selecionada')
      return
    }

    console.log('💾 Saving clinic data...', state.currentClinicId)
    set({ isSaving: true })
    try {
      await api.saveClinicData(state.currentClinicId, state)
      console.log('✅ Dados salvos com sucesso!')
      set({ isSaving: false, hasUnsavedChanges: false })
      toast.success('Dados salvos automaticamente!', { duration: 2000 })
    } catch (error) {
      console.error('❌ Erro ao salvar dados:', error)
      toast.error('Erro ao salvar dados')
      set({ isSaving: false })
    }
  },

  createNewClinic: async (clinicName: string) => {
    try {
      const { id } = await api.createClinic(clinicName)
      set({ currentClinicId: id, clinicName: clinicName })
      // Persist to localStorage
      localStorage.setItem('currentClinicId', id)
      toast.success('Clínica criada com sucesso!')
      return id
    } catch (error) {
      console.error('Erro ao criar clínica:', error)
      toast.error('Erro ao criar clínica')
      throw error
    }
  },

  // Report generation
  generateDiagnosticReport: async () => {
    const state = get()
    if (!state.currentClinicId) {
      toast.error('Nenhuma clínica selecionada')
      return
    }

    set({ isGeneratingReport: true })
    try {
      toast.info('Gerando relatório de diagnóstico com IA...')
      const response = await api.generateReport(
        state.currentClinicId,
        'diagnostic',
        state,
      )
      set({ relatorio_1: response.data })
      toast.success('Relatório de diagnóstico gerado com sucesso!')
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error)
      toast.error(error.message || 'Erro ao gerar relatório')
    } finally {
      set({ isGeneratingReport: false })
    }
  },

  generateStrategicReport: async () => {
    const state = get()
    if (!state.currentClinicId) {
      toast.error('Nenhuma clínica selecionada')
      return
    }

    set({ isGeneratingReport: true })
    try {
      toast.info('Gerando relatório estratégico com IA...')
      const response = await api.generateReport(
        state.currentClinicId,
        'strategic',
        state,
      )
      set({ relatorio_2: response.data })
      toast.success('Relatório estratégico gerado com sucesso!')
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error)
      toast.error(error.message || 'Erro ao gerar relatório')
    } finally {
      set({ isGeneratingReport: false })
    }
  },

  generateAdvancedReport: async () => {
    const state = get()
    if (!state.currentClinicId) {
      toast.error('Nenhuma clínica selecionada')
      return
    }

    set({ isGeneratingReport: true })
    try {
      toast.info('Gerando análise estratégica avançada com IA...')
      const response = await api.generateReport(
        state.currentClinicId,
        'advanced',
        state,
      )
      set({ relatorio_3: response.data })
      toast.success('Análise avançada gerada com sucesso!')
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error)
      toast.error(error.message || 'Erro ao gerar relatório')
    } finally {
      set({ isGeneratingReport: false })
    }
  },

  generateTacticalReport: async () => {
    const state = get()
    if (!state.currentClinicId) {
      toast.error('Nenhuma clínica selecionada')
      return
    }

    set({ isGeneratingReport: true })
    try {
      toast.info('Gerando plano tático com IA...')
      const response = await api.generateReport(
        state.currentClinicId,
        'tactical',
        state,
      )
      set({ relatorio_4: response.data })
      toast.success('Plano tático gerado com sucesso!')
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error)
      toast.error(error.message || 'Erro ao gerar relatório')
    } finally {
      set({ isGeneratingReport: false })
    }
  },

  generateOperationalReport: async () => {
    const state = get()
    if (!state.currentClinicId) {
      toast.error('Nenhuma clínica selecionada')
      return
    }

    set({ isGeneratingReport: true })
    try {
      toast.info('Gerando plano operacional com IA...')
      const response = await api.generateReport(
        state.currentClinicId,
        'operational',
        state,
      )
      set({ relatorio_5: response.data })
      toast.success('Plano operacional gerado com sucesso!')
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error)
      toast.error(error.message || 'Erro ao gerar relatório')
    } finally {
      set({ isGeneratingReport: false })
    }
  },

  generateFinalReport: async () => {
    const state = get()
    if (!state.currentClinicId) {
      toast.error('Nenhuma clínica selecionada')
      return
    }

    set({ isGeneratingReport: true })
    try {
      toast.info('Gerando relatório final consolidado com IA...')
      const response = await api.generateReport(
        state.currentClinicId,
        'final',
        state,
      )
      set({ relatorio_final: response.data })
      toast.success('Relatório final gerado com sucesso!')
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error)
      toast.error(error.message || 'Erro ao gerar relatório')
    } finally {
      set({ isGeneratingReport: false })
    }
  },
}))
