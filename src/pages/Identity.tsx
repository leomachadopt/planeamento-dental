import { useState } from 'react'
import {
  useStrategyStore,
  IdentityState as IIdentityState,
} from '@/stores/useStrategyStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  ChevronRight,
  ChevronLeft,
  Fingerprint,
  Target,
  Award,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  Lightbulb,
} from 'lucide-react'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

type QuestionKey = keyof IIdentityState

interface Question {
  key: QuestionKey
  title: string
  description: string
  placeholder?: string
  type: 'text' | 'textarea' | 'radio'
  icon: any
  options?: { value: string; label: string; description?: string }[]
}

const QUESTIONS: Question[] = [
  {
    key: 'reason',
    title: 'Razão de Existir (Propósito)',
    description:
      'Em uma única frase, por que a clínica existe além do lucro? Qual impacto ela gera na vida das pessoas?',
    placeholder:
      'Ex: Proporcionar qualidade de vida através de uma reabilitação humanizada e acessível.',
    type: 'textarea',
    icon: Fingerprint,
  },
  {
    key: 'recognitionGoal',
    title: 'Meta de Reconhecimento (3 Anos)',
    description:
      'Como você quer que a clínica seja descrita pelos pacientes e mercado em 2029?',
    placeholder:
      'Ex: Ser referência regional em tratamento de coluna com tecnologia não-invasiva.',
    type: 'textarea',
    icon: Award,
  },
  {
    key: 'values',
    title: 'Valores Inegociáveis',
    description:
      'Quais princípios guiam suas decisões e comportamento da equipe? O que não toleram?',
    placeholder: 'Ex: Ética acima de tudo, pontualidade, escuta ativa...',
    type: 'textarea',
    icon: FileText,
  },
  {
    key: 'priorityAudience',
    title: 'Público Prioritário (2026)',
    description:
      'Quem é o cliente ideal que vamos focar nossos esforços de marketing e vendas neste ciclo?',
    placeholder:
      'Ex: Mulheres de 35-50 anos, praticantes de atividade física, classe B.',
    type: 'text',
    icon: Users,
  },
  {
    key: 'pricePositioning',
    title: 'Posicionamento de Preço',
    description:
      'Como a clínica se posiciona em relação à média do mercado local?',
    type: 'radio',
    icon: DollarSign,
    options: [
      {
        value: 'Acessível',
        label: 'Opção mais acessível',
        description: 'Foco em custo-benefício e entrada facilitada.',
      },
      {
        value: 'Intermediária',
        label: 'Opção intermediária',
        description: 'Equilíbrio entre qualidade e preço de mercado.',
      },
      {
        value: 'Premium',
        label: 'Opção mais premium/exclusiva',
        description: 'Alto valor agregado, ticket alto e exclusividade.',
      },
    ],
  },
  {
    key: 'strategyFocus',
    title: 'Foco da Estratégia de Crescimento',
    description: 'Qual será o motor principal de receita?',
    type: 'radio',
    icon: TrendingUp,
    options: [
      {
        value: 'Volume',
        label: 'Volume (muitos pacientes)',
        description: 'Giro rápido, agenda cheia, processos padronizados.',
      },
      {
        value: 'Alto Ticket',
        label: 'Maior valor por paciente (ticket médio alto)',
        description:
          'Menos pacientes, tratamentos complexos e relacionamento profundo.',
      },
    ],
  },
]

export default function Identity() {
  const { identity, updateIdentity, clinicConfig, relatorio_1 } =
    useStrategyStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [localData, setLocalData] = useState<IIdentityState>(identity)
  const [isCompleted, setIsCompleted] = useState(false)

  const currentQuestion = QUESTIONS[currentStep]
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100

  // Tone of voice helper
  const isFormal = clinicConfig.tom_linguagem === 'formal'

  const handleNext = () => {
    const value = localData[currentQuestion.key]
    if (!value || value.trim() === '') {
      toast.error('Por favor, responda a pergunta para continuar.')
      return
    }

    updateIdentity(localData)

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      setIsCompleted(true)
      toast.success('Identidade estratégica definida com sucesso!')
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleInputChange = (value: string) => {
    setLocalData((prev) => ({
      ...prev,
      [currentQuestion.key]: value,
    }))
  }

  const generateSummary = () => {
    const {
      reason,
      recognitionGoal,
      values,
      priorityAudience,
      pricePositioning,
      strategyFocus,
    } = localData

    if (isFormal) {
      return (
        <>
          <p>
            A <strong>identidade organizacional</strong> da{' '}
            {clinicConfig.nome_clinica} fundamenta-se no propósito de{' '}
            <em>"{reason}"</em>. Projetamos, para o horizonte de três anos,
            consolidar nossa reputação como: <em>"{recognitionGoal}"</em>.
          </p>
          <p className="mt-4">
            Nossa conduta é regida inegociavelmente pelos valores de{' '}
            <em>{values}</em>. Para o ciclo estratégico de 2026, direcionaremos
            nossos esforços para o segmento de{' '}
            <strong>{priorityAudience}</strong>.
          </p>
          <p className="mt-4">
            Estrategicamente, adotaremos um posicionamento de preço{' '}
            <strong>{pricePositioning}</strong>, sustentado por um modelo de
            crescimento focado em <strong>{strategyFocus}</strong>.
          </p>
        </>
      )
    }

    // Default / Intermediate tone
    return (
      <>
        <p>
          A {clinicConfig.nome_clinica} existe para <em>"{reason}"</em>. Daqui a
          3 anos, queremos ser reconhecidos por: <em>"{recognitionGoal}"</em>.
        </p>
        <p className="mt-4">
          Nossos valores inegociáveis são: <em>{values}</em>. Em 2026, nosso
          foco total será no público: <strong>{priorityAudience}</strong>.
        </p>
        <p className="mt-4">
          Para vencer no mercado, escolhemos ser uma opção{' '}
          <strong>{pricePositioning}</strong>, com uma estratégia de crescimento
          baseada em <strong>{strategyFocus}</strong>.
        </p>
      </>
    )
  }

  if (isCompleted) {
    return (
      <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-10">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-indigo-100 p-3 rounded-full">
            <Fingerprint className="size-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            3A – Identidade e Posicionamento Desejado
          </h1>
          <p className="text-slate-500 max-w-lg">
            Definição estratégica da marca e do rumo do negócio para o próximo
            ciclo.
          </p>
        </div>

        <Card className="border-t-4 border-t-indigo-500 shadow-lg">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl text-slate-800">
                  Manifesto de Identidade 2026
                </CardTitle>
                <CardDescription>
                  Documento consolidado de posicionamento.
                </CardDescription>
              </div>
              <Badge className="bg-indigo-600 hover:bg-indigo-700">
                Definido
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 text-slate-700 text-lg leading-relaxed">
            {generateSummary()}
          </CardContent>
          <CardFooter className="bg-slate-50 border-t border-slate-100 p-6 flex justify-between">
            <Button variant="outline" onClick={() => setIsCompleted(false)}>
              Revisar Respostas
            </Button>
            <Button
              asChild
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Link to="/estrategia">
                Ir para Estratégia (3B) <ChevronRight className="ml-2 size-4" />
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
              Identidade Estratégica
            </h1>
            <p className="text-sm text-slate-500">
              Módulo 3A &bull; Definindo quem somos e onde vamos jogar
            </p>
          </div>
          <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Passo {currentStep + 1} de {QUESTIONS.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {relatorio_1 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3 text-sm text-blue-900 animate-fade-in">
          <Lightbulb className="size-5 shrink-0 text-blue-600" />
          <div>
            <p className="font-semibold mb-1">Contexto do Diagnóstico:</p>
            <p>
              Lembre-se que sua análise SWOT apontou como principal força:{' '}
              <strong>"{relatorio_1.swot.strengths[0]}"</strong> e o principal
              problema a resolver é:{' '}
              <strong>"{relatorio_1.swot.weaknesses[0]}"</strong>.
            </p>
          </div>
        </div>
      )}

      <Card className="border-t-4 border-t-indigo-500 shadow-md transition-all duration-300">
        <CardHeader className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-indigo-100 p-3 rounded-xl mt-1 shrink-0">
              <currentQuestion.icon className="size-6 text-indigo-700" />
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
            {currentQuestion.type === 'textarea' && (
              <Textarea
                autoFocus
                value={localData[currentQuestion.key] as string}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="text-base min-h-[140px] border-slate-300 focus-visible:ring-indigo-500"
              />
            )}
            {currentQuestion.type === 'text' && (
              <Input
                autoFocus
                value={localData[currentQuestion.key] as string}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="text-lg h-12 border-slate-300 focus-visible:ring-indigo-500"
              />
            )}
            {currentQuestion.type === 'radio' && currentQuestion.options && (
              <RadioGroup
                value={localData[currentQuestion.key] as string}
                onValueChange={handleInputChange}
                className="grid gap-4"
              >
                {currentQuestion.options.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      'flex items-center space-x-3 space-y-0 rounded-lg border p-4 cursor-pointer hover:bg-slate-50 transition-colors',
                      localData[currentQuestion.key] === option.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200',
                    )}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label
                      htmlFor={option.value}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium text-slate-900 text-base">
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="text-slate-500 text-sm mt-1">
                          {option.description}
                        </div>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-slate-50/50 p-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className={cn(currentStep === 0 && 'invisible')}
          >
            <ChevronLeft className="mr-2 size-4" /> Voltar
          </Button>

          <Button
            onClick={handleNext}
            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]"
          >
            {currentStep === QUESTIONS.length - 1 ? 'Finalizar' : 'Próximo'}
            <ChevronRight className="ml-2 size-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
