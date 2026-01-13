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
  Award,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  Lightbulb,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

type QuestionKey = keyof IIdentityState

interface Question {
  key: QuestionKey
  title: string
  subtitle: string
  placeholder?: string
  type: 'text' | 'textarea' | 'radio'
  icon: any
  options?: { value: string; label: string; description?: string }[]
  guidance?: string
}

const QUESTIONS: Question[] = [
  {
    key: 'reason',
    title: 'Razão de Existir (Propósito)',
    subtitle:
      'Em uma única frase, por que a clínica existe além do lucro? Qual impacto ela busca gerar na vida dos pacientes?',
    placeholder:
      'Ajudar pessoas com dor crônica a retomarem qualidade de vida por meio de um cuidado humano, contínuo e baseado em evidência.',
    type: 'textarea',
    icon: Fingerprint,
    guidance:
      'Pense no paciente, não na clínica. Evite palavras genéricas como "qualidade" ou "excelência" sem contexto.',
  },
  {
    key: 'recognitionGoal',
    title: 'Identidade Futura (Reconhecimento)',
    subtitle:
      'Em até 3 anos, como você quer que a clínica seja reconhecida pelo mercado?',
    placeholder:
      'Ser reconhecida como a principal clínica de reabilitação esportiva para corredores amadores da região, sendo preferida a clínicas generalistas.',
    type: 'textarea',
    icon: Award,
    guidance:
      'Para quem? Em relação a quais concorrentes? Por qual diferencial principal?',
  },
  {
    key: 'values',
    title: 'Valores Inegociáveis',
    subtitle:
      'Quais valores são inegociáveis na clínica? O que nunca será tolerado, mesmo que gere lucro?',
    placeholder:
      'Ética acima de resultados, respeito ao paciente, pontualidade, comunicação clara, responsabilidade clínica.',
    type: 'textarea',
    icon: FileText,
    guidance:
      'Liste entre 3 e 5 valores. Pense em decisões difíceis do dia a dia.',
  },
  {
    key: 'priorityAudience',
    title: 'Público Prioritário (2026)',
    subtitle:
      'Qual é o tipo de paciente que a clínica quer priorizar em 2026?',
    placeholder:
      'Adultos entre 35 e 55 anos, ativos ou ex-atletas, com dores musculoesqueléticas recorrentes, que valorizam explicação, continuidade e estão dispostos a investir em tratamento de médio e longo prazo.',
    type: 'textarea',
    icon: Users,
    guidance:
      'Não descreva "todos". Pense em quem mais se beneficia da sua proposta. Pense em quem você quer atrair (não só quem aparece).',
  },
  {
    key: 'pricePositioning',
    title: 'Posicionamento de Preço',
    subtitle:
      'Como a clínica escolhe se posicionar em relação ao preço médio do mercado local?',
    type: 'radio',
    icon: DollarSign,
    options: [
      {
        value: 'Mais acessível',
        label: 'Mais acessível (foco em custo-benefício)',
        description: 'Foco em custo-benefício e entrada facilitada.',
      },
      {
        value: 'Intermediário',
        label: 'Intermediário (equilíbrio preço x valor)',
        description: 'Equilíbrio entre qualidade e preço de mercado.',
      },
      {
        value: 'Premium / exclusivo',
        label: 'Premium / exclusivo (alto valor agregado)',
        description: 'Alto valor agregado, ticket alto e exclusividade.',
      },
    ],
  },
  {
    key: 'strategyFocus',
    title: 'Foco do Crescimento',
    subtitle:
      'Qual será o principal motor de crescimento da clínica neste ciclo?',
    type: 'radio',
    icon: TrendingUp,
    options: [
      {
        value: 'Mais pacientes',
        label: 'Mais pacientes (volume)',
        description: 'Giro rápido, agenda cheia, processos padronizados.',
      },
      {
        value: 'Mais valor por paciente',
        label: 'Mais valor por paciente (ticket médio maior)',
        description:
          'Menos pacientes, tratamentos complexos e relacionamento profundo.',
      },
    ],
  },
]

export default function Identity() {
  const { identity, updateIdentity, config_inicial, relatorio_1 } =
    useStrategyStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [localData, setLocalData] = useState<IIdentityState>({
    ...identity,
    strategyFocusComplement: identity.strategyFocusComplement || '',
  })
  const [isCompleted, setIsCompleted] = useState(false)

  const currentQuestion = QUESTIONS[currentStep]
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100

  // Safe Property Access & Fallbacks
  const getClinicName = () => config_inicial?.nome_clinica || 'Sua Clínica'
  const getTone = () => config_inicial?.tom_linguagem || 'intermediario'
  const isFormal = getTone() === 'formal'

  const handleNext = () => {
    const value = localData[currentQuestion.key]
    
    // Validação específica para cada passo
    if (currentQuestion.key === 'strategyFocus') {
      if (!value || value.trim() === '') {
        toast.error('Por favor, selecione o foco de crescimento.')
        return
      }
      if (!localData.strategyFocusComplement || localData.strategyFocusComplement.trim() === '') {
        toast.error('Por favor, preencha o que precisará mudar na clínica para sustentar essa escolha.')
        return
      }
    } else {
      if (!value || value.trim() === '') {
        toast.error('Por favor, responda a pergunta para continuar.')
        return
      }
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
      strategyFocusComplement,
    } = localData

    const name = getClinicName()

    if (isFormal) {
      return (
        <>
          <p>
            A <strong>identidade organizacional</strong> da {name} fundamenta-se
            no propósito de <em>"{reason}"</em>. Projetamos, para o horizonte de
            três anos, consolidar nossa reputação como:{' '}
            <em>"{recognitionGoal}"</em>.
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
            {strategyFocusComplement && (
              <> Para sustentar essa escolha, será necessário: <em>{strategyFocusComplement}</em>.</>
            )}
          </p>
        </>
      )
    }

    // Default / Intermediate tone
    return (
      <>
        <p>
          A {name} existe para <em>"{reason}"</em>. Daqui a 3 anos, queremos ser
          reconhecidos por: <em>"{recognitionGoal}"</em>.
        </p>
        <p className="mt-4">
          Nossos valores inegociáveis são: <em>{values}</em>. Em 2026, nosso
          foco total será no público: <strong>{priorityAudience}</strong>.
        </p>
        <p className="mt-4">
          Para vencer no mercado, escolhemos ser uma opção{' '}
          <strong>{pricePositioning}</strong>, com uma estratégia de crescimento
          baseada em <strong>{strategyFocus}</strong>.
          {strategyFocusComplement && (
            <> Para sustentar essa escolha, precisaremos: <em>{strategyFocusComplement}</em>.</>
          )}
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
            3A – Identidade Estratégica
          </h1>
          <p className="text-slate-500 max-w-lg">
            Fundação estratégica: quem somos, para quem existimos e qual identidade vamos sustentar.
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
                  Documento consolidado de posicionamento estratégico.
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
                Ir para Estratégia (3B) <ArrowRight className="ml-2 size-4" />
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
              Módulo 3A &bull; Fundação estratégica da {getClinicName()}
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
              <strong>"{relatorio_1.swot.strengths[0] || 'N/A'}"</strong> e o
              principal problema a resolver é:{' '}
              <strong>"{relatorio_1.swot.weaknesses[0] || 'N/A'}"</strong>.
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
                    💡 Orientação:
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
              <div className="space-y-4">
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
                
                {/* Nota fixa para posicionamento de preço */}
                {currentQuestion.key === 'pricePositioning' && localData.pricePositioning && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <strong>Nota:</strong> Essa decisão impacta diretamente processos, marketing, equipe e margem.
                    </p>
                  </div>
                )}

                {/* Campo complemento obrigatório para foco de crescimento */}
                {currentQuestion.key === 'strategyFocus' && localData.strategyFocus && (
                  <div className="mt-4 space-y-2">
                    <Label className="text-base font-semibold">
                      O que precisará mudar na clínica para sustentar essa escolha?
                    </Label>
                    <Textarea
                      value={localData.strategyFocusComplement}
                      onChange={(e) =>
                        setLocalData({
                          ...localData,
                          strategyFocusComplement: e.target.value,
                        })
                      }
                      placeholder="Ex: Padronizar processos, melhorar agenda, reduzir dependência do gestor e investir em treinamento da equipe."
                      className="min-h-[100px] border-slate-300 focus-visible:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
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
