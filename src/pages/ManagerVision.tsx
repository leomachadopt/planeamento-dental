import { useState } from 'react'
import {
  useStrategyStore,
  ManagerVision as IManagerVision,
  ProblemDetail,
  OpportunityDetail,
} from '@/stores/useStrategyStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ArrowRight,
  ChevronRight,
  Eye,
  AlertTriangle,
  Lightbulb,
  Goal,
  Activity,
  DollarSign,
  Heart,
} from 'lucide-react'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 'problems', title: 'Dores Reais de Gestão', icon: AlertTriangle },
  { id: 'opportunities', title: 'Oportunidades e Alavancas', icon: Lightbulb },
  { id: 'vision', title: 'Visão 2026', icon: Eye },
  { id: 'kpis', title: 'Métricas que Importam', icon: Goal },
  { id: 'rating_processes', title: 'Processos Internos', icon: Activity },
  { id: 'rating_financial', title: 'Organização Financeira', icon: DollarSign },
  { id: 'rating_satisfaction', title: 'Satisfação dos Pacientes', icon: Heart },
]

const IMPACT_OPTIONS = ['Financeiro', 'Operacional', 'Pessoas', 'Experiência do paciente'] as const
const DEPENDS_ON_OPTIONS = ['Marketing', 'Operação', 'Pessoas', 'Tecnologia', 'Posicionamento de mercado'] as const

// Helper para inicializar dados vazios
const getEmptyProblem = (): ProblemDetail => ({
  description: '',
  impact: [],
  sinceWhen: '',
  rootCause: '',
})

const getEmptyOpportunity = (): OpportunityDetail => ({
  description: '',
  dependsOn: [],
  risk: '',
  tradeOff: '',
})

const getEmptyVision2026 = () => ({
  financial: { monthlyRevenue: '', margin: '', ownerDependency: '' },
  market: { knownFor: '', chosenFor: '' },
  operation: { scheduleStatus: '', processStandardization: '' },
  people: { teamProfile: '', turnover: '', autonomy: '' },
})

const getEmptyKPIs = () => ({
  financial: { monthlyRevenue: '', margin: '', averageTicket: '' },
  operational: { occupancyRate: '', waitTime: '', noShowRate: '' },
  experience: { nps: '', returnRate: '', referralRate: '' },
  people: { maxTurnover: '', ownerDependency: '' },
})

export default function ManagerVision() {
  const { managerVision, updateManagerVision, clinicConfig } = useStrategyStore()

  // Inicializar com dados existentes ou vazios
  const initializeData = (): IManagerVision => {
    const existing = managerVision
    return {
      problems: existing.problems?.length === 3 
        ? existing.problems 
        : [getEmptyProblem(), getEmptyProblem(), getEmptyProblem()],
      opportunities: existing.opportunities?.length === 3
        ? existing.opportunities
        : [getEmptyOpportunity(), getEmptyOpportunity(), getEmptyOpportunity()],
      vision2026: existing.vision2026 || getEmptyVision2026(),
      kpis: existing.kpis || getEmptyKPIs(),
      ratings: existing.ratings || {
        processes: { score: 5, justification: '' },
        financial: { score: 5, justification: '' },
        satisfaction: { score: 5, justification: '' },
      },
      goals: existing.goals || {
        revenue: '',
        occupancy: '',
        nps: '',
        other: '',
      },
    }
  }

  const [currentStep, setCurrentStep] = useState(0)
  const [localData, setLocalData] = useState<IManagerVision>(initializeData())
  const [isCompleted, setIsCompleted] = useState(false)

  const currentStepData = STEPS[currentStep]
  const progress = ((currentStep + 1) / STEPS.length) * 100

  const updateProblem = (index: number, field: keyof ProblemDetail, value: any) => {
    const newProblems = [...localData.problems]
    if (field === 'impact') {
      const impacts = newProblems[index].impact
      const impactValue = value as typeof IMPACT_OPTIONS[number]
      if (impacts.includes(impactValue)) {
        newProblems[index].impact = impacts.filter(i => i !== impactValue)
      } else {
        newProblems[index].impact = [...impacts, impactValue]
      }
    } else {
      newProblems[index] = { ...newProblems[index], [field]: value }
    }
    setLocalData({ ...localData, problems: newProblems })
  }

  const updateOpportunity = (index: number, field: keyof OpportunityDetail, value: any) => {
    const newOpps = [...localData.opportunities]
    if (field === 'dependsOn') {
      const depends = newOpps[index].dependsOn
      const dependsValue = value as typeof DEPENDS_ON_OPTIONS[number]
      if (depends.includes(dependsValue)) {
        newOpps[index].dependsOn = depends.filter(d => d !== dependsValue)
      } else {
        newOpps[index].dependsOn = [...depends, dependsValue]
      }
    } else {
      newOpps[index] = { ...newOpps[index], [field]: value }
    }
    setLocalData({ ...localData, opportunities: newOpps })
  }

  const updateVision2026 = (section: keyof typeof localData.vision2026, field: string, value: string) => {
    setLocalData({
      ...localData,
      vision2026: {
        ...localData.vision2026,
        [section]: {
          ...localData.vision2026[section],
          [field]: value,
        },
      },
    })
  }

  const updateKPIs = (section: keyof typeof localData.kpis, field: string, value: string) => {
    setLocalData({
      ...localData,
      kpis: {
        ...localData.kpis,
        [section]: {
          ...localData.kpis[section],
          [field]: value,
        },
      },
    })
  }

  const updateRating = (
    category: keyof typeof localData.ratings,
    field: 'score' | 'justification',
    value: any,
  ) => {
    setLocalData({
      ...localData,
      ratings: {
        ...localData.ratings,
        [category]: { ...localData.ratings[category], [field]: value },
      },
    })
  }

  const handleNext = () => {
    // Validações específicas por passo
    if (currentStepData.id === 'problems') {
      for (let i = 0; i < 3; i++) {
        const p = localData.problems[i]
        if (!p.description.trim()) {
          toast.error(`Preencha a descrição do problema ${i + 1}.`)
          return
        }
        if (p.impact.length === 0) {
          toast.error(`Selecione pelo menos um impacto para o problema ${i + 1}.`)
          return
        }
        if (!p.sinceWhen.trim()) {
          toast.error(`Informe desde quando existe o problema ${i + 1}.`)
          return
        }
        if (!p.rootCause.trim()) {
          toast.error(`Informe a causa raiz do problema ${i + 1}.`)
          return
        }
      }
    }

    if (currentStepData.id === 'opportunities') {
      for (let i = 0; i < 3; i++) {
        const o = localData.opportunities[i]
        if (!o.description.trim()) {
          toast.error(`Preencha a descrição da oportunidade ${i + 1}.`)
          return
        }
        if (o.dependsOn.length === 0) {
          toast.error(`Selecione pelo menos uma dependência para a oportunidade ${i + 1}.`)
          return
        }
        if (!o.risk.trim()) {
          toast.error(`Informe o risco da oportunidade ${i + 1}.`)
          return
        }
        if (!o.tradeOff.trim()) {
          toast.error(`Informe o trade-off da oportunidade ${i + 1}.`)
          return
        }
      }
    }

    if (currentStepData.id === 'vision') {
      const v = localData.vision2026
      if (!v.financial.monthlyRevenue.trim() || !v.market.knownFor.trim() || 
          !v.operation.scheduleStatus.trim() || !v.people.teamProfile.trim()) {
        toast.error('Preencha todos os blocos da visão 2026.')
        return
      }
    }

    if (currentStepData.id === 'kpis') {
      const k = localData.kpis
      if (!k.financial.monthlyRevenue.trim() || !k.operational.occupancyRate.trim() ||
          !k.experience.nps.trim() || !k.people.maxTurnover.trim()) {
        toast.error('Preencha pelo menos um KPI de cada bloco.')
        return
      }
    }

    if (currentStepData.id.startsWith('rating_')) {
      const category = currentStepData.id.replace('rating_', '') as keyof typeof localData.ratings
      if (!localData.ratings[category].justification.trim()) {
        toast.error('Por favor, justifique sua nota.')
        return
      }
    }

    // Sincronizar goals legados com kpis
    setLocalData({
      ...localData,
      goals: {
        revenue: localData.kpis.financial.monthlyRevenue,
        occupancy: localData.kpis.operational.occupancyRate,
        nps: localData.kpis.experience.nps,
        other: '',
      },
    })

    updateManagerVision(localData)

    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      setIsCompleted(true)
      toast.success('Visão do Gestor registrada com sucesso!')
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  if (isCompleted) {
    return (
      <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-10">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-purple-100 p-3 rounded-full">
            <Eye className="size-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            2C – Visão do Gestor
          </h1>
          <p className="text-slate-500 max-w-lg">
            Diagnóstico estratégico consolidado com base na visão da liderança
            da {clinicConfig.nome_clinica || 'clínica'}.
          </p>
        </div>

        <Card className="border-t-4 border-t-purple-500 shadow-lg">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl text-slate-800">
                  Resumo da Visão Estratégica
                </CardTitle>
                <CardDescription>
                  Alinhamento de expectativas e realidade.
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-white">
                Status: Definido
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Problemas */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-red-700 flex items-center gap-2">
                <AlertTriangle className="size-4" /> Dores Reais de Gestão
              </h3>
              <div className="space-y-4">
                {localData.problems.map((p, i) => (
                  <div key={i} className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <div className="font-semibold text-red-800 mb-2">Problema {i + 1}</div>
                    <p className="text-slate-700 mb-2">{p.description}</p>
                    <div className="text-sm text-slate-600 space-y-1">
                      <div><strong>Impacto:</strong> {p.impact.join(', ')}</div>
                      <div><strong>Desde quando:</strong> {p.sinceWhen}</div>
                      <div><strong>Causa raiz:</strong> {p.rootCause}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            {/* Oportunidades */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-teal-700 flex items-center gap-2">
                <Lightbulb className="size-4" /> Oportunidades e Alavancas Estratégicas
              </h3>
              <div className="space-y-4">
                {localData.opportunities.map((o, i) => (
                  <div key={i} className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                    <div className="font-semibold text-teal-800 mb-2">Oportunidade {i + 1}</div>
                    <p className="text-slate-700 mb-2">{o.description}</p>
                    <div className="text-sm text-slate-600 space-y-1">
                      <div><strong>Depende de:</strong> {o.dependsOn.join(', ')}</div>
                      <div><strong>Risco:</strong> {o.risk}</div>
                      <div><strong>Trade-off:</strong> {o.tradeOff}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            {/* Visão 2026 */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-700 flex items-center gap-2">
                <Eye className="size-4" /> Visão 2026
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Financeiro</h4>
                  <p className="text-sm text-slate-600">Faturamento: {localData.vision2026.financial.monthlyRevenue}</p>
                  <p className="text-sm text-slate-600">Margem: {localData.vision2026.financial.margin}</p>
                  <p className="text-sm text-slate-600">Dependência: {localData.vision2026.financial.ownerDependency}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Mercado</h4>
                  <p className="text-sm text-slate-600">Conhecida por: {localData.vision2026.market.knownFor}</p>
                  <p className="text-sm text-slate-600">Escolhida por: {localData.vision2026.market.chosenFor}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Operação</h4>
                  <p className="text-sm text-slate-600">Agenda: {localData.vision2026.operation.scheduleStatus}</p>
                  <p className="text-sm text-slate-600">Padronização: {localData.vision2026.operation.processStandardization}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Pessoas</h4>
                  <p className="text-sm text-slate-600">Perfil: {localData.vision2026.people.teamProfile}</p>
                  <p className="text-sm text-slate-600">Rotatividade: {localData.vision2026.people.turnover}</p>
                  <p className="text-sm text-slate-600">Autonomia: {localData.vision2026.people.autonomy}</p>
                </div>
              </div>
            </section>

            <Separator />

            {/* KPIs */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                <Goal className="size-4" /> Métricas que Importam
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Financeiros</h4>
                  <p className="text-sm text-slate-600">Faturamento: {localData.kpis.financial.monthlyRevenue}</p>
                  <p className="text-sm text-slate-600">Margem: {localData.kpis.financial.margin}%</p>
                  <p className="text-sm text-slate-600">Ticket médio: {localData.kpis.financial.averageTicket}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Operacionais</h4>
                  <p className="text-sm text-slate-600">Ocupação: {localData.kpis.operational.occupancyRate}</p>
                  <p className="text-sm text-slate-600">Tempo de espera: {localData.kpis.operational.waitTime}</p>
                  <p className="text-sm text-slate-600">Taxa de faltas: {localData.kpis.operational.noShowRate}%</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Experiência</h4>
                  <p className="text-sm text-slate-600">NPS: {localData.kpis.experience.nps}</p>
                  <p className="text-sm text-slate-600">Taxa de retorno: {localData.kpis.experience.returnRate}%</p>
                  <p className="text-sm text-slate-600">Indicação: {localData.kpis.experience.referralRate}%</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Pessoas</h4>
                  <p className="text-sm text-slate-600">Turnover máximo: {localData.kpis.people.maxTurnover}%</p>
                  <p className="text-sm text-slate-600">Dependência do dono: {localData.kpis.people.ownerDependency}/10</p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Ratings */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Activity className="size-4" /> Percepções de Organização
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Processos Internos', data: localData.ratings.processes, color: 'bg-blue-500' },
                  { label: 'Organização Financeira', data: localData.ratings.financial, color: 'bg-green-500' },
                  { label: 'Satisfação dos Pacientes', data: localData.ratings.satisfaction, color: 'bg-purple-500' },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-4 items-start md:items-center p-3 rounded-lg hover:bg-slate-50">
                    <div className="w-full md:w-48 shrink-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                        <span className="text-sm font-bold text-slate-900">{item.data.score}/10</span>
                      </div>
                      <Progress value={item.data.score * 10} className="h-2" />
                    </div>
                    <p className="text-sm text-slate-600 flex-1 pl-4 md:border-l border-slate-200 italic">
                      "{item.data.justification}"
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t border-slate-100 p-6 flex justify-between">
            <Button variant="outline" onClick={() => setIsCompleted(false)}>
              Editar Respostas
            </Button>
            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
              <Link to="/diagnostico">
                Ir para Diagnóstico <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4 min-h-[80vh] flex flex-col justify-center animate-fade-in-up">
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">Visão do Gestor</h1>
            <p className="text-sm text-slate-500">
              Módulo 2C &bull; Diagnóstico estratégico e alinhamento
            </p>
          </div>
          <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
            Passo {currentStep + 1} de {STEPS.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="border-t-4 border-t-purple-500 shadow-md transition-all duration-300">
        <CardHeader className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-purple-100 p-3 rounded-xl mt-1 shrink-0">
              <currentStepData.icon className="size-6 text-purple-700" />
            </div>
            <div className="space-y-2 flex-1">
              <CardTitle className="text-2xl text-slate-800 leading-tight">
                {currentStepData.title}
              </CardTitle>
              <CardDescription className="text-base text-slate-600">
                {currentStepData.id === 'problems' && 'Quais são hoje os 3 maiores problemas de gestão que, se não forem resolvidos, continuarão travando o crescimento?'}
                {currentStepData.id === 'opportunities' && 'Quais são as 3 maiores oportunidades reais de crescimento ou melhoria para os próximos 12–24 meses?'}
                {currentStepData.id === 'vision' && 'Imagine que estamos em Dezembro de 2026 e sua clínica foi um sucesso. Como isso é percebido na prática?'}
                {currentStepData.id === 'kpis' && 'Defina as métricas que realmente importam para o sucesso da clínica.'}
                {currentStepData.id === 'rating_processes' && 'De 0 a 10, qual o nível de maturidade dos processos internos hoje?'}
                {currentStepData.id === 'rating_financial' && 'De 0 a 10, quão preparada está a gestão financeira para sustentar crescimento?'}
                {currentStepData.id === 'rating_satisfaction' && 'De 0 a 10, como você avalia a satisfação real dos pacientes hoje?'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 pb-8">
          {/* PASSO 1: Problemas */}
          {currentStepData.id === 'problems' && (
            <div className="space-y-6">
              {localData.problems.map((problem, idx) => (
                <div key={idx} className="border rounded-lg p-4 space-y-4 bg-slate-50">
                  <div className="font-semibold text-slate-800">Problema {idx + 1}</div>
                  <div className="space-y-2">
                    <Label>Descreva o problema de forma concreta (não genérica)</Label>
                    <Textarea
                      value={problem.description}
                      onChange={(e) => updateProblem(idx, 'description', e.target.value)}
                      placeholder="Ex: Alta taxa de no-show sem processo de confirmação estruturado"
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Qual é o impacto direto desse problema?</Label>
                    <div className="flex flex-wrap gap-3">
                      {IMPACT_OPTIONS.map((opt) => (
                        <div key={opt} className="flex items-center space-x-2">
                          <Checkbox
                            checked={problem.impact.includes(opt)}
                            onCheckedChange={() => updateProblem(idx, 'impact', opt)}
                          />
                          <Label className="text-sm">{opt}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Desde quando esse problema existe?</Label>
                    <Input
                      value={problem.sinceWhen}
                      onChange={(e) => updateProblem(idx, 'sinceWhen', e.target.value)}
                      placeholder="Ex: Desde o início de 2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Na sua visão, qual é a causa raiz provável?</Label>
                    <Textarea
                      value={problem.rootCause}
                      onChange={(e) => updateProblem(idx, 'rootCause', e.target.value)}
                      placeholder="Ex: Falta de processo padronizado de confirmação"
                      className="min-h-[60px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PASSO 2: Oportunidades */}
          {currentStepData.id === 'opportunities' && (
            <div className="space-y-6">
              {localData.opportunities.map((opp, idx) => (
                <div key={idx} className="border rounded-lg p-4 space-y-4 bg-slate-50">
                  <div className="font-semibold text-slate-800">Oportunidade {idx + 1}</div>
                  <div className="space-y-2">
                    <Label>Descreva a oportunidade</Label>
                    <Textarea
                      value={opp.description}
                      onChange={(e) => updateOpportunity(idx, 'description', e.target.value)}
                      placeholder="Ex: Lançar serviço de harmonização orofacial"
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ela depende mais de quê?</Label>
                    <div className="flex flex-wrap gap-3">
                      {DEPENDS_ON_OPTIONS.map((opt) => (
                        <div key={opt} className="flex items-center space-x-2">
                          <Checkbox
                            checked={opp.dependsOn.includes(opt)}
                            onCheckedChange={() => updateOpportunity(idx, 'dependsOn', opt)}
                          />
                          <Label className="text-sm">{opt}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Qual é o risco principal se essa oportunidade não for bem executada?</Label>
                    <Textarea
                      value={opp.risk}
                      onChange={(e) => updateOpportunity(idx, 'risk', e.target.value)}
                      placeholder="Ex: Investimento sem retorno, perda de credibilidade"
                      className="min-h-[60px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Essa oportunidade exige dizer "não" a algo atual? O quê?</Label>
                    <Textarea
                      value={opp.tradeOff}
                      onChange={(e) => updateOpportunity(idx, 'tradeOff', e.target.value)}
                      placeholder="Ex: Reduzir foco em ortodontia para priorizar estética"
                      className="min-h-[60px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PASSO 3: Visão 2026 */}
          {currentStepData.id === 'vision' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4 border rounded-lg p-4 bg-blue-50">
                  <h4 className="font-semibold">Financeiro</h4>
                  <div className="space-y-2">
                    <Label className="text-sm">Faturamento mensal aproximado</Label>
                    <Input
                      value={localData.vision2026.financial.monthlyRevenue}
                      onChange={(e) => updateVision2026('financial', 'monthlyRevenue', e.target.value)}
                      placeholder="Ex: €50.000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Margem desejada</Label>
                    <Input
                      value={localData.vision2026.financial.margin}
                      onChange={(e) => updateVision2026('financial', 'margin', e.target.value)}
                      placeholder="Ex: 35%"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Dependência (ou não) do gestor no dia a dia</Label>
                    <Input
                      value={localData.vision2026.financial.ownerDependency}
                      onChange={(e) => updateVision2026('financial', 'ownerDependency', e.target.value)}
                      placeholder="Ex: Baixa, gestão delegada"
                    />
                  </div>
                </div>

                <div className="space-y-4 border rounded-lg p-4 bg-green-50">
                  <h4 className="font-semibold">Mercado</h4>
                  <div className="space-y-2">
                    <Label className="text-sm">Como a clínica é conhecida?</Label>
                    <Input
                      value={localData.vision2026.market.knownFor}
                      onChange={(e) => updateVision2026('market', 'knownFor', e.target.value)}
                      placeholder="Ex: Excelência em implantes"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Pelo quê ela é escolhida?</Label>
                    <Input
                      value={localData.vision2026.market.chosenFor}
                      onChange={(e) => updateVision2026('market', 'chosenFor', e.target.value)}
                      placeholder="Ex: Confiança e resultados"
                    />
                  </div>
                </div>

                <div className="space-y-4 border rounded-lg p-4 bg-purple-50">
                  <h4 className="font-semibold">Operação</h4>
                  <div className="space-y-2">
                    <Label className="text-sm">Agenda cheia ou equilibrada?</Label>
                    <Input
                      value={localData.vision2026.operation.scheduleStatus}
                      onChange={(e) => updateVision2026('operation', 'scheduleStatus', e.target.value)}
                      placeholder="Ex: Equilibrada, sem sobrecarga"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Nível de padronização dos processos</Label>
                    <Input
                      value={localData.vision2026.operation.processStandardization}
                      onChange={(e) => updateVision2026('operation', 'processStandardization', e.target.value)}
                      placeholder="Ex: Alto, com SOPs definidos"
                    />
                  </div>
                </div>

                <div className="space-y-4 border rounded-lg p-4 bg-amber-50">
                  <h4 className="font-semibold">Pessoas</h4>
                  <div className="space-y-2">
                    <Label className="text-sm">Perfil da equipe</Label>
                    <Input
                      value={localData.vision2026.people.teamProfile}
                      onChange={(e) => updateVision2026('people', 'teamProfile', e.target.value)}
                      placeholder="Ex: Equipa experiente e autônoma"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Rotatividade</Label>
                    <Input
                      value={localData.vision2026.people.turnover}
                      onChange={(e) => updateVision2026('people', 'turnover', e.target.value)}
                      placeholder="Ex: Baixa, menos de 10% ao ano"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Nível de autonomia</Label>
                    <Input
                      value={localData.vision2026.people.autonomy}
                      onChange={(e) => updateVision2026('people', 'autonomy', e.target.value)}
                      placeholder="Ex: Alto, decisões operacionais delegadas"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASSO 4: KPIs */}
          {currentStepData.id === 'kpis' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4 border rounded-lg p-4 bg-blue-50">
                  <h4 className="font-semibold">KPIs Financeiros</h4>
                  <div className="space-y-2">
                    <Label className="text-sm">Meta de faturamento mensal</Label>
                    <Input
                      value={localData.kpis.financial.monthlyRevenue}
                      onChange={(e) => updateKPIs('financial', 'monthlyRevenue', e.target.value)}
                      placeholder="Ex: €50.000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Meta de margem (%)</Label>
                    <Input
                      value={localData.kpis.financial.margin}
                      onChange={(e) => updateKPIs('financial', 'margin', e.target.value)}
                      placeholder="Ex: 35"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Ticket médio desejado</Label>
                    <Input
                      value={localData.kpis.financial.averageTicket}
                      onChange={(e) => updateKPIs('financial', 'averageTicket', e.target.value)}
                      placeholder="Ex: €150"
                    />
                  </div>
                </div>

                <div className="space-y-4 border rounded-lg p-4 bg-green-50">
                  <h4 className="font-semibold">KPIs Operacionais</h4>
                  <div className="space-y-2">
                    <Label className="text-sm">Taxa de ocupação ideal</Label>
                    <Input
                      value={localData.kpis.operational.occupancyRate}
                      onChange={(e) => updateKPIs('operational', 'occupancyRate', e.target.value)}
                      placeholder="Ex: 85%"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Tempo médio de espera aceitável</Label>
                    <Input
                      value={localData.kpis.operational.waitTime}
                      onChange={(e) => updateKPIs('operational', 'waitTime', e.target.value)}
                      placeholder="Ex: 10 minutos"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Taxa de faltas (%)</Label>
                    <Input
                      value={localData.kpis.operational.noShowRate}
                      onChange={(e) => updateKPIs('operational', 'noShowRate', e.target.value)}
                      placeholder="Ex: 5"
                    />
                  </div>
                </div>

                <div className="space-y-4 border rounded-lg p-4 bg-purple-50">
                  <h4 className="font-semibold">KPIs de Experiência</h4>
                  <div className="space-y-2">
                    <Label className="text-sm">NPS desejado</Label>
                    <Input
                      value={localData.kpis.experience.nps}
                      onChange={(e) => updateKPIs('experience', 'nps', e.target.value)}
                      placeholder="Ex: 80"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Taxa de retorno de pacientes</Label>
                    <Input
                      value={localData.kpis.experience.returnRate}
                      onChange={(e) => updateKPIs('experience', 'returnRate', e.target.value)}
                      placeholder="Ex: 70%"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Indicação (% novos pacientes por indicação)</Label>
                    <Input
                      value={localData.kpis.experience.referralRate}
                      onChange={(e) => updateKPIs('experience', 'referralRate', e.target.value)}
                      placeholder="Ex: 60"
                    />
                  </div>
                </div>

                <div className="space-y-4 border rounded-lg p-4 bg-amber-50">
                  <h4 className="font-semibold">KPIs de Pessoas</h4>
                  <div className="space-y-2">
                    <Label className="text-sm">Turnover máximo aceitável</Label>
                    <Input
                      value={localData.kpis.people.maxTurnover}
                      onChange={(e) => updateKPIs('people', 'maxTurnover', e.target.value)}
                      placeholder="Ex: 10%"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Grau de dependência do dono (0–10)</Label>
                    <Input
                      value={localData.kpis.people.ownerDependency}
                      onChange={(e) => updateKPIs('people', 'ownerDependency', e.target.value)}
                      placeholder="Ex: 3"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASSOS 5, 6, 7: Ratings */}
          {currentStepData.id.startsWith('rating_') && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base">
                    {currentStepData.id === 'rating_processes' && 'De 0 a 10, qual o nível de maturidade dos processos internos hoje?'}
                    {currentStepData.id === 'rating_financial' && 'De 0 a 10, quão preparada está a gestão financeira para sustentar crescimento?'}
                    {currentStepData.id === 'rating_satisfaction' && 'De 0 a 10, como você avalia a satisfação real dos pacientes hoje?'}
                  </Label>
                  <span className="text-2xl font-bold text-purple-600">
                    {localData.ratings[currentStepData.id.replace('rating_', '') as keyof typeof localData.ratings].score}
                  </span>
                </div>
                <Slider
                  value={[localData.ratings[currentStepData.id.replace('rating_', '') as keyof typeof localData.ratings].score]}
                  min={0}
                  max={10}
                  step={1}
                  onValueChange={(vals) =>
                    updateRating(
                      currentStepData.id.replace('rating_', '') as keyof typeof localData.ratings,
                      'score',
                      vals[0],
                    )
                  }
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-slate-400 px-1">
                  <span>Crítico (0)</span>
                  <span>Excelente (10)</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Justifique sua nota (obrigatório):</Label>
                {currentStepData.id === 'rating_processes' && (
                  <div className="space-y-3 p-3 bg-slate-50 rounded-lg mb-2">
                    <p className="text-sm text-slate-600 font-medium">Orientações:</p>
                    <ul className="text-sm text-slate-500 space-y-1 list-disc list-inside">
                      <li>Quais processos funcionam bem hoje?</li>
                      <li>Onde ocorrem erros, retrabalho ou improviso?</li>
                      <li>O que ainda depende demais de pessoas específicas?</li>
                    </ul>
                  </div>
                )}
                {currentStepData.id === 'rating_financial' && (
                  <div className="space-y-3 p-3 bg-slate-50 rounded-lg mb-2">
                    <p className="text-sm text-slate-600 font-medium">Orientações:</p>
                    <ul className="text-sm text-slate-500 space-y-1 list-disc list-inside">
                      <li>Você consegue prever o caixa com segurança?</li>
                      <li>Você sabe exatamente quais serviços são mais lucrativos?</li>
                      <li>Decisões são tomadas com dados ou sensação?</li>
                    </ul>
                  </div>
                )}
                {currentStepData.id === 'rating_satisfaction' && (
                  <div className="space-y-3 p-3 bg-slate-50 rounded-lg mb-2">
                    <p className="text-sm text-slate-600 font-medium">Orientações:</p>
                    <ul className="text-sm text-slate-500 space-y-1 list-disc list-inside">
                      <li>O que os pacientes mais elogiam?</li>
                      <li>Onde mais reclamam?</li>
                      <li>Você mede isso sistematicamente ou apenas informalmente?</li>
                    </ul>
                  </div>
                )}
                <Textarea
                  value={localData.ratings[currentStepData.id.replace('rating_', '') as keyof typeof localData.ratings].justification}
                  onChange={(e) =>
                    updateRating(
                      currentStepData.id.replace('rating_', '') as keyof typeof localData.ratings,
                      'justification',
                      e.target.value,
                    )
                  }
                  placeholder="Descreva sua justificativa..."
                  className="min-h-[120px]"
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-slate-50/50 p-6">
          <div className="flex gap-3 w-full justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className={cn(currentStep === 0 && 'invisible')}
            >
              Voltar
            </Button>
            <Button
              onClick={handleNext}
              className="bg-purple-600 hover:bg-purple-700 text-white min-w-[120px]"
            >
              {currentStep === STEPS.length - 1 ? 'Finalizar' : 'Próximo'}
              <ChevronRight className="ml-2 size-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
