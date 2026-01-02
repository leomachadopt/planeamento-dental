import { useState } from 'react'
import {
  useStrategyStore,
  OperationalAssessment as IOperationalAssessment,
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
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const MIN_CHAR_LENGTH = 15

type QuestionKey = keyof IOperationalAssessment

interface Question {
  key: QuestionKey
  title: string
  description: string
  placeholder: string
}

export default function OperationalAssessment() {
  const { operationalAssessment, updateOperationalAssessment, clinicConfig } =
    useStrategyStore()

  const [currentStep, setCurrentStep] = useState(0)
  const [localAnswers, setLocalAnswers] = useState<IOperationalAssessment>(
    operationalAssessment,
  )
  const [isCompleted, setIsCompleted] = useState(false)
  const [vagueAnswerWarning, setVagueAnswerWarning] = useState(false)

  // Dynamic context helper
  const getClinicName = () => clinicConfig.nome_clinica || 'sua clínica'
  const getClinicType = () => clinicConfig.tipo_clinica || 'saúde'

  const QUESTIONS: Question[] = [
    {
      key: 'services',
      title: 'Quais são os principais serviços oferecidos?',
      description: `Para ${getClinicName()}, liste os tratamentos, exames ou procedimentos que compõem o carro-chefe do faturamento.`,
      placeholder:
        'Ex: Consultas de cardiologia, Ecocardiograma, Teste Ergométrico...',
    },
    {
      key: 'infrastructure',
      title: 'Como é a estrutura física atual?',
      description:
        'Descreva salas de atendimento, recepção, equipamentos principais e acessibilidade.',
      placeholder:
        'Ex: 3 consultórios, 1 sala de exames, recepção para 10 pessoas...',
    },
    {
      key: 'team_composition',
      title: 'Qual é a composição da equipe?',
      description:
        'Quantidade e função de profissionais de saúde e equipe administrativa/apoio.',
      placeholder: 'Ex: 3 médicos sócios, 2 secretárias, 1 copeira...',
    },
    {
      key: 'working_hours',
      title: 'Quais são os horários de funcionamento?',
      description: 'Dias da semana e horários de abertura e fechamento.',
      placeholder: 'Ex: Seg a Sex das 08h às 18h, Sáb das 08h às 12h...',
    },
    {
      key: 'patient_management',
      title: 'Como é feito o agendamento e gestão de pacientes?',
      description:
        'Cite softwares utilizados, uso de planilhas ou agenda de papel.',
      placeholder:
        'Ex: Software XYZ para agenda e prontuário, confirmação via WhatsApp manual...',
    },
    {
      key: 'financial_management',
      title: 'Como é feita a gestão financeira?',
      description:
        'Controle de custos, faturamento, fluxo de caixa e indicadores acompanhados.',
      placeholder:
        'Ex: Planilha de Excel controlada pelo sócio, faturamento terceirizado...',
    },
    {
      key: 'processes_well_defined',
      title: 'Quais processos internos funcionam bem?',
      description: 'O que a equipe faz com excelência e sem erros frequentes?',
      placeholder:
        'Ex: O atendimento na recepção é muito elogiado, a limpeza é impecável...',
    },
    {
      key: 'processes_disorganized',
      title: 'Quais processos geram atrito ou retrabalho?',
      description: 'Onde estão os gargalos operacionais hoje?',
      placeholder:
        'Ex: Demora na confirmação de consultas, glosas de convênios, fila de espera...',
    },
  ]

  const currentQuestion = QUESTIONS[currentStep]
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100

  const handleInputChange = (value: string) => {
    setLocalAnswers((prev) => ({
      ...prev,
      [currentQuestion.key]: value,
    }))
    // Reset warning when user types
    if (vagueAnswerWarning && value.length >= MIN_CHAR_LENGTH) {
      setVagueAnswerWarning(false)
    }
  }

  const handleNext = () => {
    const currentAnswer = localAnswers[currentQuestion.key]

    if (!currentAnswer.trim()) {
      toast.error('Por favor, preencha o campo para continuar.')
      return
    }

    // Intelligent Interaction Check
    if (currentAnswer.length < MIN_CHAR_LENGTH && !vagueAnswerWarning) {
      setVagueAnswerWarning(true)
      toast.warning('Sua resposta parece curta.', {
        description:
          'Detalhes ajudam a IA a ser mais precisa. Clique em "Próximo" novamente se quiser manter assim.',
        duration: 4000,
      })
      return
    }

    setVagueAnswerWarning(false)
    updateOperationalAssessment({ [currentQuestion.key]: currentAnswer })

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      setIsCompleted(true)
      toast.success('Entrevista operacional concluída!')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleNext()
    }
  }

  if (isCompleted) {
    return (
      <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-10">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-green-100 p-3 rounded-full">
            <ClipboardList className="size-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            2A – Operação Atual da Clínica
          </h1>
          <p className="text-slate-500 max-w-lg">
            Diagnóstico operacional compilado com base na entrevista realizada.
            Este documento serve como base para identificar gargalos e
            oportunidades.
          </p>
        </div>

        <Card className="border-t-4 border-t-teal-500 shadow-lg">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl text-slate-800">
                  Resumo Operacional Estruturado
                </CardTitle>
                <CardDescription>
                  Visão geral da {getClinicName()}.
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-white">
                Status: Mapeado
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-teal-800 flex items-center gap-2">
                <div className="size-2 bg-teal-500 rounded-full" />
                Serviços
              </h3>
              <p className="text-slate-700 leading-relaxed pl-4 border-l-2 border-slate-200">
                {localAnswers.services}
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-teal-800 flex items-center gap-2">
                <div className="size-2 bg-teal-500 rounded-full" />
                Estrutura Física
              </h3>
              <div className="text-slate-700 leading-relaxed pl-4 border-l-2 border-slate-200 space-y-2">
                <p>{localAnswers.infrastructure}</p>
                {localAnswers.working_hours && (
                  <p className="text-sm text-slate-500 mt-2">
                    <span className="font-medium">Funcionamento:</span>{' '}
                    {localAnswers.working_hours}
                  </p>
                )}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-teal-800 flex items-center gap-2">
                <div className="size-2 bg-teal-500 rounded-full" />
                Equipe
              </h3>
              <p className="text-slate-700 leading-relaxed pl-4 border-l-2 border-slate-200">
                {localAnswers.team_composition}
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-teal-800 flex items-center gap-2">
                <div className="size-2 bg-teal-500 rounded-full" />
                Jornada do Paciente
              </h3>
              <p className="text-slate-700 leading-relaxed pl-4 border-l-2 border-slate-200">
                {localAnswers.patient_management}
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-teal-800 flex items-center gap-2">
                <div className="size-2 bg-teal-500 rounded-full" />
                Processos Internos
              </h3>
              <div className="pl-4 border-l-2 border-slate-200 space-y-4">
                <div className="bg-green-50 p-3 rounded-md border border-green-100">
                  <span className="text-xs font-bold text-green-700 uppercase mb-1 block">
                    O que funciona bem
                  </span>
                  <p className="text-green-900">
                    {localAnswers.processes_well_defined}
                  </p>
                </div>
                <div className="bg-red-50 p-3 rounded-md border border-red-100">
                  <span className="text-xs font-bold text-red-700 uppercase mb-1 block">
                    Pontos de Atenção
                  </span>
                  <p className="text-red-900">
                    {localAnswers.processes_disorganized}
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-teal-800 flex items-center gap-2">
                <div className="size-2 bg-teal-500 rounded-full" />
                Gestão Financeira
              </h3>
              <p className="text-slate-700 leading-relaxed pl-4 border-l-2 border-slate-200">
                {localAnswers.financial_management}
              </p>
            </section>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t border-slate-100 p-6 flex justify-between">
            <Button variant="outline" onClick={() => setIsCompleted(false)}>
              Revisar Respostas
            </Button>
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Link to="/mercado">
                Ir para Mercado (2B) <ArrowRight className="ml-2 size-4" />
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
              Entrevista Operacional
            </h1>
            <p className="text-sm text-slate-500">
              Módulo 2A &bull; Mapeamento de processos da {getClinicType()}
            </p>
          </div>
          <span className="text-sm font-medium text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
            Passo {currentStep + 1} de {QUESTIONS.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="border-t-4 border-t-teal-500 shadow-md transition-all duration-300">
        <CardHeader className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-teal-100 p-3 rounded-xl mt-1 shrink-0">
              <ClipboardList className="size-6 text-teal-700" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl text-slate-800 leading-tight">
                {currentQuestion.title}
              </CardTitle>
              <CardDescription className="text-base text-slate-600">
                {currentQuestion.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 pb-8">
          <div className="space-y-4">
            <div className="relative">
              <Textarea
                autoFocus
                value={localAnswers[currentQuestion.key]}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={currentQuestion.placeholder}
                className={cn(
                  'text-base min-h-[160px] resize-none p-4 transition-colors',
                  vagueAnswerWarning
                    ? 'border-amber-400 focus-visible:ring-amber-400 bg-amber-50/30'
                    : 'border-slate-200 focus-visible:ring-teal-500',
                )}
              />
              {vagueAnswerWarning && (
                <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-amber-600 font-medium animate-pulse">
                  <AlertCircle className="size-3" />
                  Pode nos contar mais detalhes?
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-slate-50/50 p-6">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="hidden sm:inline">
              Pressione <strong>Enter</strong> para avançar
            </span>
          </div>
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                variant="ghost"
                onClick={() => setCurrentStep((prev) => prev - 1)}
              >
                Voltar
              </Button>
            )}
            <Button
              onClick={handleNext}
              className={cn(
                'min-w-[140px] transition-all',
                vagueAnswerWarning
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-200/50',
              )}
            >
              {currentStep === QUESTIONS.length - 1 ? 'Finalizar' : 'Próximo'}
              <ChevronRight className="ml-2 size-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
