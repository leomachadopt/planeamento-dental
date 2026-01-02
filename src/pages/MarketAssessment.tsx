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

const MIN_CHAR_LENGTH = 10

type QuestionKey = keyof IMarketAssessment

interface Question {
  key: QuestionKey
  title: string
  description: string
  placeholder: string
}

export default function MarketAssessment() {
  const { marketAssessment, updateMarketAssessment, clinicConfig } =
    useStrategyStore()

  const [currentStep, setCurrentStep] = useState(0)
  const [localAnswers, setLocalAnswers] =
    useState<IMarketAssessment>(marketAssessment)
  const [isCompleted, setIsCompleted] = useState(false)
  const [vagueAnswerWarning, setVagueAnswerWarning] = useState(false)

  const getClinicName = () => clinicConfig.nome_clinica || 'sua clínica'
  const getClinicLocation = () => clinicConfig.localizacao || 'sua região'

  const QUESTIONS: Question[] = [
    {
      key: 'marketDescription',
      title: 'Como você descreveria o mercado de saúde local?',
      description: `Analise a região de ${getClinicLocation()}. Há muita concorrência? O público é sensível a preço ou prioriza qualidade?`,
      placeholder:
        'Ex: Mercado saturado de clínicas populares, mas com pouca oferta premium...',
    },
    {
      key: 'competitors',
      title: 'Quem são os principais concorrentes diretos?',
      description:
        'Cite nomes ou tipos de estabelecimentos que disputam o mesmo paciente que você.',
      placeholder:
        'Ex: Clínica X, Rede Y e consultórios particulares do bairro...',
    },
    {
      key: 'clinicStrengths',
      title: `O que a ${getClinicName()} faz melhor que eles?`,
      description:
        'Quais são seus diferenciais competitivos reais? Atendimento, tecnologia, corpo clínico?',
      placeholder:
        'Ex: Nosso atendimento humanizado e a pontualidade nas consultas...',
    },
    {
      key: 'competitorStrengths',
      title: 'Em quais pontos os concorrentes são mais fortes?',
      description:
        'Seja honesto. Eles têm preço menor? Melhor localização? Mais marketing?',
      placeholder:
        'Ex: Eles possuem estacionamento próprio e investem muito em redes sociais...',
    },
    {
      key: 'acquisitionChannels',
      title: 'Como os pacientes chegam até a clínica hoje?',
      description:
        'Indicação (boca a boca), Instagram, Google, Convênios, Passantes?',
      placeholder: 'Ex: 70% indicações de outros pacientes, 30% Instagram...',
    },
    {
      key: 'patientComplaints',
      title: 'Quais são as principais queixas dos pacientes?',
      description:
        'O que eles reclamam na recepção ou nas pesquisas de satisfação?',
      placeholder:
        'Ex: Dificuldade para agendar por telefone, demora no atendimento...',
    },
    {
      key: 'patientCompliments',
      title: 'Quais são os principais elogios recebidos?',
      description: 'O que faz o paciente voltar e indicar a clínica?',
      placeholder: 'Ex: A atenção do médico e a limpeza do ambiente...',
    },
    {
      key: 'patientLoss',
      title: 'Você já perdeu pacientes para a concorrência?',
      description: 'Se sim, qual foi o motivo principal na sua visão?',
      placeholder:
        'Ex: Sim, principalmente por preço ou porque o concorrente aceita o convênio X...',
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
            2B – Mercado, Clientes e Concorrência
          </h1>
          <p className="text-slate-500 max-w-lg">
            Mapeamento estratégico do ambiente competitivo e percepção de valor
            dos pacientes da {getClinicName()}.
          </p>
        </div>

        <Card className="border-t-4 border-t-blue-500 shadow-lg">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl text-slate-800">
                  Relatório de Inteligência de Mercado
                </CardTitle>
                <CardDescription>
                  Visão consolidada dos fatores externos e internos.
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-white">
                Status: Analisado
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Visão de Mercado */}
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                <Globe className="size-4" />
                Visão de Mercado
              </h3>
              <p className="text-slate-700 leading-relaxed pl-6 border-l-2 border-slate-200">
                {localAnswers.marketDescription}
              </p>
            </section>

            {/* Concorrentes */}
            <div className="grid md:grid-cols-2 gap-6">
              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                  <Target className="size-4 text-red-500" />
                  Concorrentes Diretos
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 text-sm">
                  {localAnswers.competitors}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                  <Users className="size-4 text-teal-500" />
                  Canais de Aquisição
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 text-sm">
                  {localAnswers.acquisitionChannels}
                </div>
              </section>
            </div>

            {/* SWOT Simplificada (Forças e Fraquezas) */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                <div className="size-2 bg-blue-500 rounded-full" />
                Diferenciais Competitivos
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-green-200 bg-green-50/50 rounded-lg p-4">
                  <span className="text-xs font-bold text-green-700 uppercase mb-2 block flex items-center gap-1">
                    <ThumbsUp className="size-3" /> Forças da Clínica
                  </span>
                  <p className="text-slate-800 text-sm">
                    {localAnswers.clinicStrengths}
                  </p>
                </div>
                <div className="border border-red-200 bg-red-50/50 rounded-lg p-4">
                  <span className="text-xs font-bold text-red-700 uppercase mb-2 block flex items-center gap-1">
                    <AlertCircle className="size-3" /> Pontos Fracos vs.
                    Concorrência
                  </span>
                  <div className="text-slate-800 text-sm space-y-2">
                    <p>{localAnswers.competitorStrengths}</p>
                    {localAnswers.patientLoss && (
                      <div className="pt-2 mt-2 border-t border-red-200">
                        <span className="text-xs font-semibold text-red-600">
                          Motivo de Perda:
                        </span>{' '}
                        {localAnswers.patientLoss}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Percepção do Paciente */}
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                <div className="size-2 bg-blue-500 rounded-full" />
                Percepção dos Pacientes
              </h3>
              <div className="grid md:grid-cols-2 gap-4 pl-4 border-l-2 border-slate-200">
                <div>
                  <h4 className="font-medium text-green-700 text-sm mb-1 flex items-center gap-1">
                    <ThumbsUp className="size-3" /> Elogios Frequentes
                  </h4>
                  <p className="text-slate-600 text-sm">
                    {localAnswers.patientCompliments}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-amber-700 text-sm mb-1 flex items-center gap-1">
                    <ThumbsDown className="size-3" /> Reclamações Comuns
                  </h4>
                  <p className="text-slate-600 text-sm">
                    {localAnswers.patientComplaints}
                  </p>
                </div>
              </div>
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
              Módulo 2B &bull; Entendendo o ambiente externo da{' '}
              {getClinicName()}
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
