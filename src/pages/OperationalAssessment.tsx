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
  subtitle: string
  placeholder: string
  guidance?: string
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

  const QUESTIONS: Question[] = [
    {
      key: 'services',
      title: 'Quais serviços realmente sustentam o faturamento da clínica hoje?',
      subtitle: 'Liste apenas os serviços que geram volume ou margem relevante.',
      placeholder:
        'Implantes (alto valor, depende do Dr. João)\nOrtodontia fixa (alto volume)\nConsultas de avaliação',
      guidance:
        'Separe por linhas e, se possível, indique: se é serviço de alto volume ou alto valor; se depende de um profissional específico.',
    },
    {
      key: 'infrastructure',
      title: 'A estrutura física é suficiente para a demanda atual?',
      subtitle:
        'Pense em capacidade vs uso real, não só em descrição.',
      placeholder:
        '2 gabinetes, 1 sempre cheio e outro ocioso em alguns períodos.\nCBCT próprio, pouco usado.\nRecepção pequena nos horários de pico.',
      guidance:
        'Informe: nº de gabinetes; se ficam cheios, ociosos ou sobrecarregados; equipamentos críticos (ex: CBCT, scanner).',
    },
    {
      key: 'team_composition',
      title: 'Quais funções são críticas para a operação não parar?',
      subtitle: 'Identifique pessoas-chave e riscos operacionais.',
      placeholder:
        '1 rececionista centraliza agenda e confirmações (difícil substituir).\nImplantes dependem de 1 médico específico.\nFinanceiro concentrado no sócio.',
      guidance:
        'Cite: funções críticas; se existe substituição fácil ou não.',
    },
    {
      key: 'working_hours',
      title: 'Os horários atuais atendem bem o perfil dos seus pacientes?',
      subtitle:
        'Não descreva só horários — descreva problemas ou oportunidades.',
      placeholder:
        'Seg–Sex 9h–18h.\nMuita procura após 18h e sábado.\nTardes de terça costumam ficar vazias.',
      guidance:
        'Informe: horários; se há horários vazios ou lotados; pedidos frequentes não atendidos.',
    },
    {
      key: 'patient_management',
      title: 'Quão organizado é o processo de agendamento hoje?',
      subtitle: 'Descreva o nível de controle, não só a ferramenta.',
      placeholder:
        'Software simples.\nConfirmação manual via WhatsApp.\nNo-show frequente, sem indicador formal.',
      guidance:
        'Considere: confirmações; no-show; uso de indicadores.',
    },
    {
      key: 'financial_management',
      title: 'Você consegue responder essas perguntas hoje sem esforço?',
      subtitle: 'Se não, explique por quê.',
      placeholder:
        'Faturamento médio estimado.\nNão sei margem real.\nCustos altos com pessoal.',
      guidance:
        'Perguntas implícitas: Faturamento mensal médio? Margem aproximada? Custo fixo principal?',
    },
    {
      key: 'processes_well_defined',
      title:
        'O que funciona melhor que a média das clínicas semelhantes?',
      subtitle:
        'Pense em vantagem competitiva operacional, não elogios genéricos.',
      placeholder:
        'Atendimento inicial muito bem avaliado.\nOrganização clínica elogiada.\nTempo de espera baixo.',
    },
    {
      key: 'processes_disorganized',
      title: 'O que mais limita o crescimento hoje?',
      subtitle:
        'Se resolvesse apenas 1 coisa, qual faria mais diferença?',
      placeholder:
        'Agenda cheia, mas falta conversão.\nNo-show alto.\nDependência de um único médico.',
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
              Módulo 2A &bull; Diagnóstico operacional de {getClinicName()}
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
            <div className="space-y-2 flex-1">
              <CardTitle className="text-2xl text-slate-800 leading-tight">
                {currentQuestion.title}
              </CardTitle>
              <CardDescription className="text-base text-slate-600">
                {currentQuestion.subtitle}
              </CardDescription>
              {currentQuestion.guidance && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-600 font-medium mb-1">
                    💡 Campo guiado:
                  </p>
                  <p className="text-sm text-slate-500">
                    {currentQuestion.guidance}
                  </p>
                </div>
              )}
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
                  'text-base min-h-[180px] resize-none p-4 transition-colors font-mono text-sm',
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
