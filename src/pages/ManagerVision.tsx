import { useState } from 'react'
import {
  useStrategyStore,
  ManagerVision as IManagerVision,
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
  { id: 'problems', title: 'Problemas de Gestão', icon: AlertTriangle },
  { id: 'opportunities', title: 'Oportunidades', icon: Lightbulb },
  { id: 'vision', title: 'Visão 2026', icon: Eye },
  { id: 'goals', title: 'Metas e KPIs', icon: Goal },
  { id: 'rating_processes', title: 'Processos Internos', icon: Activity },
  { id: 'rating_financial', title: 'Organização Financeira', icon: DollarSign },
  { id: 'rating_satisfaction', title: 'Satisfação dos Pacientes', icon: Heart },
]

export default function ManagerVision() {
  const { managerVision, updateManagerVision, clinicConfig } =
    useStrategyStore()

  const [currentStep, setCurrentStep] = useState(0)
  const [localData, setLocalData] = useState<IManagerVision>(managerVision)
  const [isCompleted, setIsCompleted] = useState(false)

  const currentStepData = STEPS[currentStep]
  const progress = ((currentStep + 1) / STEPS.length) * 100

  const handleNext = () => {
    // Basic validation based on current step
    if (currentStepData.id === 'problems') {
      if (localData.problems.some((p) => !p.trim())) {
        toast.error('Por favor, liste 3 problemas principais.')
        return
      }
    }
    if (currentStepData.id === 'opportunities') {
      if (localData.opportunities.some((o) => !o.trim())) {
        toast.error('Por favor, liste 3 oportunidades principais.')
        return
      }
    }
    if (currentStepData.id === 'vision') {
      if (!localData.vision2026.trim()) {
        toast.error('A visão para 2026 é obrigatória.')
        return
      }
    }
    if (currentStepData.id === 'rating_processes') {
      if (!localData.ratings.processes.justification.trim()) {
        toast.error('Por favor, justifique sua nota.')
        return
      }
    }
    if (currentStepData.id === 'rating_financial') {
      if (!localData.ratings.financial.justification.trim()) {
        toast.error('Por favor, justifique sua nota.')
        return
      }
    }
    if (currentStepData.id === 'rating_satisfaction') {
      if (!localData.ratings.satisfaction.justification.trim()) {
        toast.error('Por favor, justifique sua nota.')
        return
      }
    }

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

  const updateProblem = (index: number, value: string) => {
    const newProblems = [...localData.problems]
    newProblems[index] = value
    setLocalData({ ...localData, problems: newProblems })
  }

  const updateOpportunity = (index: number, value: string) => {
    const newOpps = [...localData.opportunities]
    newOpps[index] = value
    setLocalData({ ...localData, opportunities: newOpps })
  }

  const updateGoal = (field: keyof typeof localData.goals, value: string) => {
    setLocalData({
      ...localData,
      goals: { ...localData.goals, [field]: value },
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

  if (isCompleted) {
    return (
      <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-10">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-purple-100 p-3 rounded-full">
            <Eye className="size-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            2C – Visão do Gestor, Problemas e Oportunidades
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
            <div className="grid md:grid-cols-2 gap-8">
              {/* Problemas Principais */}
              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-red-700 uppercase text-xs tracking-wider flex items-center gap-2">
                  <AlertTriangle className="size-4" /> problemas principais
                </h3>
                <ul className="space-y-2">
                  {localData.problems.map((p, i) => (
                    <li
                      key={i}
                      className="bg-red-50 p-3 rounded border border-red-100 text-slate-700 text-sm flex gap-2"
                    >
                      <span className="font-bold text-red-400">{i + 1}.</span>{' '}
                      {p}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Oportunidades Principais */}
              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-teal-700 uppercase text-xs tracking-wider flex items-center gap-2">
                  <Lightbulb className="size-4" /> oportunidades principais
                </h3>
                <ul className="space-y-2">
                  {localData.opportunities.map((o, i) => (
                    <li
                      key={i}
                      className="bg-teal-50 p-3 rounded border border-teal-100 text-slate-700 text-sm flex gap-2"
                    >
                      <span className="font-bold text-teal-400">{i + 1}.</span>{' '}
                      {o}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <Separator className="my-6" />

            {/* Visão 2026 */}
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-800 uppercase text-xs tracking-wider flex items-center gap-2">
                <Eye className="size-4" /> visão desejada para 2026
              </h3>
              <p className="text-slate-700 leading-relaxed p-4 bg-slate-50 rounded-lg border border-slate-200 italic">
                "{localData.vision2026}"
              </p>
            </section>

            {/* Metas Mencionadas */}
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-800 uppercase text-xs tracking-wider flex items-center gap-2">
                <Goal className="size-4" /> metas mencionadas
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 block mb-1">
                    Faturamento
                  </span>
                  <span className="font-bold text-slate-800">
                    {localData.goals.revenue || '-'}
                  </span>
                </div>
                <div className="p-4 rounded-lg border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 block mb-1">
                    Ocupação
                  </span>
                  <span className="font-bold text-slate-800">
                    {localData.goals.occupancy || '-'}
                  </span>
                </div>
                <div className="p-4 rounded-lg border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 block mb-1">
                    NPS Alvo
                  </span>
                  <span className="font-bold text-slate-800">
                    {localData.goals.nps || '-'}
                  </span>
                </div>
                <div className="p-4 rounded-lg border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 block mb-1">
                    Outros
                  </span>
                  <span
                    className="font-bold text-slate-800 text-xs truncate"
                    title={localData.goals.other}
                  >
                    {localData.goals.other || '-'}
                  </span>
                </div>
              </div>
            </section>

            {/* Percepções */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 uppercase text-xs tracking-wider flex items-center gap-2">
                <Activity className="size-4" /> percepções de organização e
                satisfação
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: 'Processos Internos',
                    data: localData.ratings.processes,
                    color: 'bg-blue-500',
                  },
                  {
                    label: 'Organização Financeira',
                    data: localData.ratings.financial,
                    color: 'bg-green-500',
                  },
                  {
                    label: 'Satisfação dos Pacientes',
                    data: localData.ratings.satisfaction,
                    color: 'bg-purple-500',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col md:flex-row gap-4 items-start md:items-center p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-full md:w-48 shrink-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">
                          {item.label}
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          {item.data.score}/10
                        </span>
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
            <Button
              asChild
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
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
    <div className="container max-w-3xl mx-auto py-10 px-4 min-h-[80vh] flex flex-col justify-center animate-fade-in-up">
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">
              Visão do Gestor
            </h1>
            <p className="text-sm text-slate-500">
              Módulo 2C &bull; Alinhamento estratégico e objetivos
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
            <div className="space-y-2">
              <CardTitle className="text-2xl text-slate-800 leading-tight">
                {currentStepData.title}
              </CardTitle>
              <CardDescription className="text-base text-slate-600">
                Responda com sinceridade para calibrar o planejamento
                estratégico.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 pb-8">
          {currentStepData.id === 'problems' && (
            <div className="space-y-4">
              <Label>Quais são os 3 maiores problemas de gestão hoje?</Label>
              {localData.problems.map((problem, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="font-bold text-slate-400 w-6">
                    {idx + 1}.
                  </span>
                  <Input
                    value={problem}
                    onChange={(e) => updateProblem(idx, e.target.value)}
                    placeholder={`Problema ${idx + 1}...`}
                    autoFocus={idx === 0}
                  />
                </div>
              ))}
            </div>
          )}

          {currentStepData.id === 'opportunities' && (
            <div className="space-y-4">
              <Label>
                Quais são as 3 maiores oportunidades para os próximos 12-24
                meses?
              </Label>
              {localData.opportunities.map((opp, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="font-bold text-slate-400 w-6">
                    {idx + 1}.
                  </span>
                  <Input
                    value={opp}
                    onChange={(e) => updateOpportunity(idx, e.target.value)}
                    placeholder={`Oportunidade ${idx + 1}...`}
                    autoFocus={idx === 0}
                  />
                </div>
              ))}
            </div>
          )}

          {currentStepData.id === 'vision' && (
            <div className="space-y-4">
              <Label>
                Como você descreve o estado desejado da clínica em Dezembro de
                2026?
              </Label>
              <Textarea
                value={localData.vision2026}
                onChange={(e) =>
                  setLocalData({ ...localData, vision2026: e.target.value })
                }
                placeholder="Descreva o tamanho, reconhecimento, equipe, estrutura..."
                className="min-h-[150px]"
                autoFocus
              />
            </div>
          )}

          {currentStepData.id === 'goals' && (
            <div className="space-y-6">
              <Label>Defina os KPIs principais para o sucesso:</Label>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 uppercase">
                    Meta de Faturamento Mensal
                  </Label>
                  <Input
                    value={localData.goals.revenue}
                    onChange={(e) => updateGoal('revenue', e.target.value)}
                    placeholder="Ex: R$ 200.000"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 uppercase">
                    Taxa de Ocupação Alvo
                  </Label>
                  <Input
                    value={localData.goals.occupancy}
                    onChange={(e) => updateGoal('occupancy', e.target.value)}
                    placeholder="Ex: 85%"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 uppercase">
                    NPS (Satisfação) Alvo
                  </Label>
                  <Input
                    value={localData.goals.nps}
                    onChange={(e) => updateGoal('nps', e.target.value)}
                    placeholder="Ex: 80"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 uppercase">
                    Outra Meta Importante
                  </Label>
                  <Input
                    value={localData.goals.other}
                    onChange={(e) => updateGoal('other', e.target.value)}
                    placeholder="Ex: Abrir filial X"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStepData.id.startsWith('rating_') && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base">
                    De 0 a 10, como você avalia: {currentStepData.title}?
                  </Label>
                  <span className="text-2xl font-bold text-purple-600">
                    {
                      localData.ratings[
                        currentStepData.id.replace(
                          'rating_',
                          '',
                        ) as keyof typeof localData.ratings
                      ].score
                    }
                  </span>
                </div>
                <Slider
                  value={[
                    localData.ratings[
                      currentStepData.id.replace(
                        'rating_',
                        '',
                      ) as keyof typeof localData.ratings
                    ].score,
                  ]}
                  min={0}
                  max={10}
                  step={1}
                  onValueChange={(vals) =>
                    updateRating(
                      currentStepData.id.replace(
                        'rating_',
                        '',
                      ) as keyof typeof localData.ratings,
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
                <Textarea
                  value={
                    localData.ratings[
                      currentStepData.id.replace(
                        'rating_',
                        '',
                      ) as keyof typeof localData.ratings
                    ].justification
                  }
                  onChange={(e) =>
                    updateRating(
                      currentStepData.id.replace(
                        'rating_',
                        '',
                      ) as keyof typeof localData.ratings,
                      'justification',
                      e.target.value,
                    )
                  }
                  placeholder="Por que essa nota? O que falta para ser 10?"
                  className="min-h-[100px]"
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
