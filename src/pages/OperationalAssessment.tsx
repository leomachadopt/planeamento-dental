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
import { ChevronRight, ClipboardList, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { OperationalSummary } from '@/components/OperationalSummary'

const MIN_CHAR_LENGTH = 15

type QuestionKey = keyof IOperationalAssessment

interface Question {
  key: QuestionKey
  title: string
  description: string
  placeholder: string
}

export default function OperationalAssessment() {
  const { operationalAssessment, updateOperationalAssessment, config_inicial } =
    useStrategyStore()

  const [currentStep, setCurrentStep] = useState(0)
  const [localAnswers, setLocalAnswers] = useState<IOperationalAssessment>(
    operationalAssessment,
  )
  const [isCompleted, setIsCompleted] = useState(false)
  const [vagueAnswerWarning, setVagueAnswerWarning] = useState(false)

  // Dynamic context helper with safe access
  const getClinicName = () => config_inicial?.nome_clinica || 'sua clínica'
  const getClinicType = () => config_inicial?.tipo_clinica || 'saúde'

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
      <OperationalSummary
        answers={localAnswers}
        clinicName={getClinicName()}
        onRevision={() => setIsCompleted(false)}
      />
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
