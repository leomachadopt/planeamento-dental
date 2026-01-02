import { useState, useEffect } from 'react'
import { useStrategyStore, ConfigInicial } from '@/stores/useStrategyStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Rocket,
  Settings2,
  ChevronLeft,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface QuestionOption {
  value: string
  label: string
  description?: string
}

interface Question {
  key: keyof ConfigInicial
  title: string
  description: string
  type: 'text' | 'select' | 'composite' | 'radio'
  options?: (string | QuestionOption)[]
  placeholder?: string
  allowOther?: boolean
}

const QUESTIONS: Question[] = [
  {
    key: 'tipo_clinica',
    title: 'Qual é o tipo da sua clínica?',
    description: 'Selecione a categoria que melhor representa sua atuação.',
    type: 'select',
    allowOther: true,
    options: [
      'Fisioterapia',
      'Odontologia',
      'Clínica Geral',
      'Psicologia',
      'Nutrição',
      'Estética',
      'Pilates',
      'Multidisciplinar',
      'Outro',
    ],
    placeholder: 'Selecione o tipo...',
  },
  {
    key: 'nome_clinica',
    title: 'Qual é o nome da sua clínica?',
    description: 'Como ela é conhecida no mercado.',
    type: 'text',
    placeholder: 'Nome da clínica...',
  },
  {
    key: 'localizacao',
    title: 'Onde a clínica está localizada?',
    description: 'Cidade, Estado e/ou País.',
    type: 'text',
    placeholder: 'Ex: São Paulo, SP',
  },
  {
    key: 'publico_principal',
    title: 'Quem é o seu público principal?',
    description: 'Selecione o perfil predominante dos seus pacientes.',
    type: 'select',
    allowOther: true,
    options: [
      'Reabilitação',
      'Atletas',
      'Idosos',
      'Crianças',
      'Saúde da Mulher',
      'Outro',
    ],
    placeholder: 'Selecione o público...',
  },
  {
    key: 'estagio_clinica',
    title: 'Em qual estágio de negócio a clínica se encontra?',
    description: 'Selecione a opção que melhor descreve o momento atual.',
    type: 'select',
    allowOther: true,
    options: [
      'Iniciante',
      'Em Crescimento',
      'Consolidada',
      'Em Crise',
      'Outro',
    ],
    placeholder: 'Selecione o estágio...',
  },
  {
    key: 'gestores_principais',
    title: 'Estrutura de Gestão',
    description:
      'Quantos gestores participam da estratégia e quais seus cargos?',
    type: 'composite',
  },
  {
    key: 'objetivo_geral_2026',
    title: 'Qual é o principal objetivo estratégico para 2026?',
    description:
      'O que seria um grande sucesso se alcançado até o final do ano?',
    type: 'select',
    allowOther: true,
    options: [
      'Crescer faturamento',
      'Organizar processos',
      'Expandir unidades',
      'Melhorar experiência do paciente',
      'Aumentar lucro',
      'Outro',
    ],
    placeholder: 'Selecione o objetivo...',
  },
  {
    key: 'tamanho_relatorio',
    title: 'Qual a profundidade desejada para o relatório estratégico?',
    description: 'Escolha o nível de detalhamento do output final.',
    type: 'radio',
    options: [
      {
        value: 'resumido_20',
        label: 'Resumido (20 páginas)',
        description: 'Foco em ação rápida',
      },
      {
        value: 'detalhado_40',
        label: 'Detalhado (40 páginas)',
        description: 'Análise profunda',
      },
    ],
  },
  {
    key: 'tom_linguagem',
    title: 'Qual o tom de linguagem preferido para os relatórios?',
    description: 'Como a consultoria deve se comunicar com sua equipe.',
    type: 'radio',
    options: [
      {
        value: 'formal',
        label: 'Formal',
        description: 'Corporativo e técnico',
      },
      {
        value: 'intermediario',
        label: 'Intermediário',
        description: 'Profissional mas acessível',
      },
      {
        value: 'informal',
        label: 'Informal',
        description: 'Próximo e motivacional',
      },
    ],
  },
]

export default function SetupWizard() {
  const { setConfigInicial, config_inicial: savedConfig } = useStrategyStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<ConfigInicial>>(savedConfig)
  const [isCompleted, setIsCompleted] = useState(false)

  // Custom state for composite step (Management)
  const [managerCount, setManagerCount] = useState('')
  const [managerRoles, setManagerRoles] = useState('')

  const currentQuestion = QUESTIONS[currentStep]

  // Initialize custom fields if data exists
  useEffect(() => {
    if (
      currentQuestion.key === 'gestores_principais' &&
      savedConfig.gestores_principais
    ) {
      if (savedConfig.gestores_principais.includes('gestores:')) {
        const [countPart, rolesPart] =
          savedConfig.gestores_principais.split('gestores:')
        const count = countPart.trim()
        setManagerCount(
          ['1', '2-3', '4+'].includes(count) ? count : '1', // fallback to valid option if mismatch
        )
        setManagerRoles(rolesPart.trim())
      } else {
        // Legacy or unexpected format handling
        setManagerRoles(savedConfig.gestores_principais)
      }
    }
  }, [currentQuestion.key, savedConfig.gestores_principais])

  const handleNext = () => {
    // Handling Composite Question
    if (currentQuestion.key === 'gestores_principais') {
      if (!managerCount) {
        toast.error('Por favor, selecione a quantidade de gestores.')
        return
      }
      // Save composite string - roles are optional
      const compositeValue = `${managerCount} gestores:${managerRoles ? ` ${managerRoles}` : ''}`
      setAnswers((prev) => ({ ...prev, gestores_principais: compositeValue }))

      if (currentStep < QUESTIONS.length - 1) {
        setCurrentStep((prev) => prev + 1)
        return
      }
    }

    // Validation for normal questions
    const key = currentQuestion.key
    if (key !== 'gestores_principais') {
      const value = answers[key]
      if (!value || (typeof value === 'string' && !value.trim())) {
        toast.error('Por favor, preencha o campo para continuar.')
        return
      }
    }

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      setIsCompleted(true)
      // Final save
      const finalConfig = {
        ...answers,
        gestores_principais:
          currentQuestion.key === 'gestores_principais'
            ? `${managerCount} gestores:${managerRoles ? ` ${managerRoles}` : ''}`
            : answers.gestores_principais || '',
      } as ConfigInicial

      setConfigInicial(finalConfig)
      toast.success('Configuração concluída com sucesso!')
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleInputChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.key]: value,
    }))
  }

  const handleSelectChange = (value: string) => {
    handleInputChange(value === 'Outro' ? '' : value)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Prevent submit if it's a textarea or if inside a select that captures enter
      if (
        document.activeElement?.tagName !== 'TEXTAREA' &&
        currentQuestion.type !== 'select'
      ) {
        handleNext()
      }
    }
  }

  // Logic to determine if "Outro" is selected in the UI
  const getCurrentSelectValue = () => {
    const val = answers[currentQuestion.key] as string
    if (!val) return ''

    const options = currentQuestion.options?.map((opt) =>
      typeof opt === 'string' ? opt : opt.value,
    )

    if (options?.includes(val)) return val
    if (currentQuestion.allowOther && val) return 'Outro'
    return ''
  }

  const isOtherSelected = getCurrentSelectValue() === 'Outro'
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in p-4">
        <div className="bg-green-100 p-4 rounded-full mb-6">
          <CheckCircle2 className="size-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">
          Configuração Finalizada!
        </h1>
        <p className="text-slate-500 mb-8 text-center max-w-md">
          Seus dados foram salvos e o sistema está pronto para gerar insights
          personalizados para o ciclo 2026.
        </p>

        <Card className="w-full max-w-2xl bg-slate-50 border-slate-200 shadow-inner overflow-hidden">
          <CardHeader className="bg-slate-100 border-b border-slate-200">
            <CardTitle className="text-sm font-mono text-slate-500 uppercase">
              Output JSON gerado (config_inicial)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <pre className="p-4 overflow-auto text-xs sm:text-sm font-mono text-slate-700 bg-slate-50 max-h-[400px]">
              {JSON.stringify(answers, null, 2)}
            </pre>
          </CardContent>
          <CardFooter className="p-4 border-t border-slate-200 bg-white justify-between">
            <Button variant="outline" onClick={() => setIsCompleted(false)}>
              Editar Respostas
            </Button>
            <Button onClick={() => (window.location.href = '/')}>
              Ir para Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto py-10 px-4 min-h-[80vh] flex flex-col justify-center">
      <div className="mb-8 space-y-2">
        <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
          <span className="font-medium text-teal-600">
            Configuração Inicial
          </span>
          <span>
            Passo {currentStep + 1} de {QUESTIONS.length}
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card className="border-t-4 border-t-teal-500 shadow-lg animate-fade-in-up transition-all duration-300">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-teal-100 p-2 rounded-lg">
              {currentStep < 3 && (
                <Settings2 className="size-5 text-teal-700" />
              )}
              {currentStep >= 3 && currentStep < 6 && (
                <MessageSquare className="size-5 text-teal-700" />
              )}
              {currentStep >= 6 && <Rocket className="size-5 text-teal-700" />}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              {currentStep < 3
                ? 'Identidade'
                : currentStep < 6
                  ? 'Contexto de Mercado'
                  : 'Direcionamento Estratégico'}
            </span>
          </div>
          <CardTitle className="text-2xl sm:text-3xl text-slate-800">
            {currentQuestion.title}
          </CardTitle>
          <CardDescription className="text-base sm:text-lg">
            {currentQuestion.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-8">
          <div className="space-y-4">
            {/* TEXT INPUT */}
            {currentQuestion.type === 'text' && (
              <Input
                autoFocus
                value={
                  (answers[
                    currentQuestion.key as keyof ConfigInicial
                  ] as string) || ''
                }
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={currentQuestion.placeholder}
                className="text-lg h-12"
              />
            )}

            {/* SELECT INPUT */}
            {currentQuestion.type === 'select' && (
              <div className="space-y-4">
                <Select
                  value={getCurrentSelectValue()}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue placeholder={currentQuestion.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {currentQuestion.options?.map((opt) => {
                      const value = typeof opt === 'string' ? opt : opt.value
                      const label = typeof opt === 'string' ? opt : opt.label
                      return (
                        <SelectItem
                          key={value}
                          value={value}
                          className="text-base py-3"
                        >
                          {label}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>

                {isOtherSelected && (
                  <div className="animate-fade-in-down space-y-2">
                    <Label className="text-sm text-slate-500">
                      Especifique a opção "Outro":
                    </Label>
                    <Input
                      autoFocus
                      value={
                        (answers[
                          currentQuestion.key as keyof ConfigInicial
                        ] as string) || ''
                      }
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Digite sua resposta específica..."
                      className="text-lg h-12 border-teal-200 focus-visible:ring-teal-500"
                    />
                  </div>
                )}
              </div>
            )}

            {/* COMPOSITE INPUT (GESTORES) */}
            {currentQuestion.type === 'composite' && (
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label className="text-base">
                    Número de Gestores Principais
                  </Label>
                  <Select value={managerCount} onValueChange={setManagerCount}>
                    <SelectTrigger className="h-12 text-lg">
                      <SelectValue placeholder="Selecione a quantidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Gestor</SelectItem>
                      <SelectItem value="2-3">2 a 3 Gestores</SelectItem>
                      <SelectItem value="4+">4 ou mais Gestores</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-base">
                    Quais são os cargos?{' '}
                    <span className="text-slate-400 font-normal text-sm">
                      (Opcional)
                    </span>
                  </Label>
                  <Input
                    value={managerRoles}
                    onChange={(e) => setManagerRoles(e.target.value)}
                    placeholder="Ex: Diretor Técnico e Gerente Financeiro"
                    className="h-12 text-lg"
                  />
                </div>
              </div>
            )}

            {/* RADIO INPUT */}
            {currentQuestion.type === 'radio' && (
              <RadioGroup
                value={
                  (answers[
                    currentQuestion.key as keyof ConfigInicial
                  ] as string) || ''
                }
                onValueChange={handleInputChange}
                className="grid gap-3"
              >
                {currentQuestion.options?.map((opt) => {
                  const value = typeof opt === 'string' ? opt : opt.value
                  const label = typeof opt === 'string' ? opt : opt.label
                  const desc = typeof opt === 'object' ? opt.description : null

                  return (
                    <div
                      key={value}
                      className={cn(
                        'flex items-center space-x-3 space-y-0 rounded-lg border p-4 cursor-pointer hover:bg-slate-50 transition-colors',
                        answers[currentQuestion.key as keyof ConfigInicial] ===
                          value
                          ? 'border-teal-500 bg-teal-50 shadow-sm ring-1 ring-teal-500/20'
                          : 'border-slate-200',
                      )}
                      onClick={() => handleInputChange(value)}
                    >
                      <RadioGroupItem value={value} id={value} />
                      <Label
                        htmlFor={value}
                        className="flex-1 cursor-pointer text-base font-medium text-slate-700"
                      >
                        <div className="font-semibold">{label}</div>
                        {desc && (
                          <div className="text-sm font-normal text-slate-500 mt-1">
                            {desc}
                          </div>
                        )}
                      </Label>
                    </div>
                  )
                })}
              </RadioGroup>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-slate-50/50 p-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className={cn('text-slate-500', currentStep === 0 && 'invisible')}
          >
            <ChevronLeft className="mr-2 size-4" /> Voltar
          </Button>

          <Button
            onClick={handleNext}
            size="lg"
            className="bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-200/50 pl-6 pr-4"
          >
            {currentStep === QUESTIONS.length - 1 ? 'Finalizar' : 'Próximo'}
            <ChevronRight className="ml-2 size-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
