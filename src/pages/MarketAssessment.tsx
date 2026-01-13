import { useState } from 'react'
import {
  useStrategyStore,
  MarketAssessment as IMarketAssessment,
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
  ChevronRight,
  Globe,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Users,
  Target,
} from 'lucide-react'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const MIN_CHAR_LENGTH = 15

type QuestionKey = keyof IMarketAssessment

interface Question {
  key: QuestionKey
  title: string
  subtitle: string
  placeholder: string
  guidance?: string
}

export default function MarketAssessment() {
  const { marketAssessment, updateMarketAssessment, config_inicial } =
    useStrategyStore()

  const [currentStep, setCurrentStep] = useState(0)
  const [localAnswers, setLocalAnswers] =
    useState<IMarketAssessment>(marketAssessment)
  const [isCompleted, setIsCompleted] = useState(false)
  const [vagueAnswerWarning, setVagueAnswerWarning] = useState(false)

  // Safe access to configuration with fallbacks
  const getClinicName = () => config_inicial?.nome_clinica || 'sua clínica'
  const getClinicLocation = () => config_inicial?.localizacao || 'sua região'

  const QUESTIONS: Question[] = [
    {
      key: 'marketDescription',
      title: 'Que tipo de mercado você enfrenta hoje?',
      subtitle:
        'Escolha a descrição que mais se aproxima da realidade, mesmo que não seja perfeita.',
      placeholder:
        'Mercado saturado, com muitas clínicas generalistas.\nPacientes com forte sensibilidade a preço.\nPouca diferenciação real entre concorrentes.',
      guidance:
        'Descreva em poucas linhas, pensando em: excesso ou falta de clínicas; disputa por preço ou por valor; comportamento do paciente.',
    },
    {
      key: 'competitors',
      title: 'Quem disputa exatamente o mesmo tipo de paciente que você?',
      subtitle: 'Não liste todas as clínicas — liste quem rouba seu paciente.',
      placeholder:
        'Rede popular focada em preço.\nConsultório premium de implantes.\nClínica que aceita mais convênios.',
      guidance:
        'Informe: nome ou tipo; se competem por preço, conveniência ou especialização.',
    },
    {
      key: 'clinicStrengths',
      title: 'Por que um paciente escolhe você e não o concorrente?',
      subtitle:
        'Pense na decisão do paciente, não na sua opinião interna.',
      placeholder:
        'Escolhem quando valorizam explicação e confiança.\nPerdemos quando o foco é preço baixo.',
      guidance:
        'Complete frases como: "Pacientes nos escolhem quando…"; "Perdemos pacientes quando…"',
    },
    {
      key: 'competitorStrengths',
      title: 'Onde os concorrentes têm vantagem difícil de copiar?',
      subtitle: 'Ignore detalhes pequenos. Foque em vantagens estruturais.',
      placeholder:
        'Rede tem escala e preços agressivos.\nConcorrente premium tem marca forte e marketing constante.',
      guidance:
        'Exemplos: localização; escala; marca; investimento contínuo.',
    },
    {
      key: 'acquisitionChannels',
      title: 'Quais canais trazem pacientes MAIS QUALIFICADOS?',
      subtitle: 'Não é volume. É qualidade e conversão.',
      placeholder:
        'Indicação traz pacientes mais decididos.\nInstagram gera curiosos e pedidos de preço.\nGoogle traz urgências.',
      guidance:
        'Diferencie: volume alto / baixa conversão; volume menor / maior valor.',
    },
    {
      key: 'patientComplaints',
      title: 'O que os pacientes mais reclamam das clínicas da região?',
      subtitle: 'Inclua concorrentes, não só você.',
      placeholder:
        'Reclamações frequentes sobre atrasos.\nFalta de clareza nos valores.\nDificuldade em falar com a recepção.',
      guidance:
        'Pense em: atrasos; dificuldade de agendamento; falta de clareza em orçamento.',
    },
    {
      key: 'patientCompliments',
      title: 'Por que pacientes voltam e indicam sua clínica?',
      subtitle: 'Se tivesse que escolher 1 motivo principal, qual seria?',
      placeholder:
        'Confiança no médico.\nExplicação clara.\nAtendimento humano.',
    },
    {
      key: 'patientLoss',
      title: 'Quando você perde pacientes, o que geralmente pesa mais?',
      subtitle: 'Preço, conveniência, convênio ou percepção de valor?',
      placeholder:
        'Preço.\nConvênios.\nHorários mais flexíveis do concorrente.',
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
        description: 'Detalhes ajudam na análise estratégica.',
        duration: 3000,
      })
      return
    }

    setVagueAnswerWarning(false)
    updateMarketAssessment({ [currentQuestion.key]: currentAnswer })

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      setIsCompleted(true)
      toast.success('Análise de Mercado concluída!')
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
          <div className="bg-blue-100 p-3 rounded-full">
            <Globe className="size-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            2B – Análise de Mercado
          </h1>
          <p className="text-slate-500 max-w-lg">
            Mapeamento estratégico do ambiente competitivo e posicionamento
            defensável para {getClinicName()}.
          </p>
        </div>

        <Card className="border-t-4 border-t-blue-500 shadow-lg">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl text-slate-800">
                  Inteligência de Mercado Estratégica
                </CardTitle>
                <CardDescription>
                  Onde a clínica pode (e não pode) competir em 2026.
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-white">
                Status: Analisado
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <Section
              title="1. Tipo de mercado"
              subtitle="Que tipo de mercado você enfrenta hoje?"
              content={localAnswers.marketDescription}
            />
            <Section
              title="2. Quem realmente disputa o mesmo paciente"
              subtitle="Quem disputa exatamente o mesmo tipo de paciente que você?"
              content={localAnswers.competitors}
            />
            <Section
              title="3. Critério de escolha do paciente"
              subtitle="Por que um paciente escolhe você e não o concorrente?"
              content={localAnswers.clinicStrengths}
            />
            <Section
              title="4. Onde os concorrentes são estruturalmente melhores"
              subtitle="Onde os concorrentes têm vantagem difícil de copiar?"
              content={localAnswers.competitorStrengths}
              variant="warning"
            />
            <Section
              title="5. Como a demanda chega até você (qualidade do canal)"
              subtitle="Quais canais trazem pacientes MAIS QUALIFICADOS?"
              content={localAnswers.acquisitionChannels}
            />
            <Section
              title="6. Dor recorrente do mercado"
              subtitle="O que os pacientes mais reclamam das clínicas da região?"
              content={localAnswers.patientComplaints}
              variant="warning"
            />
            <Section
              title="7. Motivos reais de fidelização"
              subtitle="Por que pacientes voltam e indicam sua clínica?"
              content={localAnswers.patientCompliments}
              variant="success"
            />
            <Section
              title="8. Perdas competitivas (aprendizado estratégico)"
              subtitle="Quando você perde pacientes, o que geralmente pesa mais?"
              content={localAnswers.patientLoss}
              variant="warning"
            />
          </CardContent>
          <CardFooter className="bg-slate-50 border-t border-slate-100 p-6 flex justify-between">
            <Button variant="outline" onClick={() => setIsCompleted(false)}>
              Revisar Respostas
            </Button>
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Link to="/diagnostico">
                Ir para Diagnóstico (Rumelt){' '}
                <ArrowRight className="ml-2 size-4" />
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
              Análise de Mercado
            </h1>
            <p className="text-sm text-slate-500">
              Módulo 2B &bull; Posicionamento competitivo de {getClinicName()}
            </p>
          </div>
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Passo {currentStep + 1} de {QUESTIONS.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="border-t-4 border-t-blue-500 shadow-md transition-all duration-300">
        <CardHeader className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-xl mt-1 shrink-0">
              <Globe className="size-6 text-blue-700" />
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
                    : 'border-slate-200 focus-visible:ring-blue-500',
                )}
              />
              {vagueAnswerWarning && (
                <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-amber-600 font-medium animate-pulse">
                  <AlertCircle className="size-3" />
                  Tente ser mais detalhista.
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
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200/50',
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

function Section({
  title,
  subtitle,
  content,
  variant = 'default',
}: {
  title: string
  subtitle?: string
  content: string
  variant?: 'default' | 'success' | 'warning'
}) {
  const variantStyles = {
    default: 'border-slate-200 bg-white',
    success: 'border-green-200 bg-green-50/30',
    warning: 'border-amber-200 bg-amber-50/30',
  }

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
          <div className="size-2 bg-blue-500 rounded-full" />
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-1 ml-6">{subtitle}</p>
        )}
      </div>
      <div
        className={cn(
          'text-slate-700 leading-relaxed pl-4 border-l-2 space-y-2 p-3 rounded-r-md whitespace-pre-line',
          variantStyles[variant],
        )}
      >
        <p>{content}</p>
      </div>
    </section>
  )
}
