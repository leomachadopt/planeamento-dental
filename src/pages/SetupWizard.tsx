import { useState } from 'react'
import { useStrategyStore, ClinicConfig } from '@/stores/useStrategyStore'
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
import { Textarea } from '@/components/ui/textarea'
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
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const QUESTIONS = [
  {
    key: 'tipo_clinica',
    title: 'Qual é o tipo da sua clínica?',
    description:
      'Ex: Fisioterapia, Odontologia, Dermatologia, Multidisciplinar.',
    type: 'text',
    placeholder: 'Digite o tipo da clínica...',
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
    description:
      'Descreva brevemente o perfil dos seus pacientes (Ex: Atletas, Idosos, Classe A/B).',
    type: 'text',
    placeholder: 'Descreva seu público alvo...',
  },
  {
    key: 'estagio_clinica',
    title: 'Em qual estágio de negócio a clínica se encontra?',
    description: 'Selecione a opção que melhor descreve o momento atual.',
    type: 'select',
    options: [
      'Iniciante',
      'Em Crescimento',
      'Consolidada',
      'Em Crise',
      'Outro',
    ],
  },
  {
    key: 'gestores_principais',
    title: 'Quantos gestores participam da estratégia e quais seus cargos?',
    description: 'Ex: 2 gestores (Diretor Clínico e Gerente Administrativo).',
    type: 'text',
    placeholder: 'Descreva a estrutura de gestão...',
  },
  {
    key: 'objetivo_geral_2026',
    title: 'Qual é o principal objetivo estratégico para 2026?',
    description:
      'O que seria um grande sucesso se alcançado até o final do ano?',
    type: 'textarea',
    placeholder:
      'Ex: Dobrar o faturamento, abrir nova unidade, digitalizar processos...',
  },
  {
    key: 'tamanho_relatorio',
    title: 'Qual a profundidade desejada para o relatório estratégico?',
    description: 'Escolha o nível de detalhamento do output final.',
    type: 'radio',
    options: [
      {
        value: 'resumido_20',
        label: 'Resumido (~20 páginas) - Foco em ação rápida',
      },
      {
        value: 'detalhado_40',
        label: 'Detalhado (~40 páginas) - Análise profunda',
      },
    ],
  },
  {
    key: 'tom_linguagem',
    title: 'Qual o tom de linguagem preferido para os relatórios?',
    description: 'Como a consultoria deve se comunicar com sua equipe.',
    type: 'radio',
    options: [
      { value: 'formal', label: 'Formal - Corporativo e técnico' },
      {
        value: 'intermediario',
        label: 'Intermediário - Profissional mas acessível',
      },
      { value: 'informal', label: 'Informal - Próximo e motivacional' },
    ],
  },
]

export default function SetupWizard() {
  const { setClinicConfig, clinicConfig: savedConfig } = useStrategyStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<ClinicConfig>>(savedConfig)
  const [isCompleted, setIsCompleted] = useState(false)

  const currentQuestion = QUESTIONS[currentStep]

  const handleNext = () => {
    const key = currentQuestion.key as keyof ClinicConfig
    const value = answers[key]

    if (!value) {
      toast.error('Por favor, preencha o campo para continuar.')
      return
    }

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      setIsCompleted(true)
      setClinicConfig(answers as ClinicConfig)
      toast.success('Configuração concluída com sucesso!')
    }
  }

  const handleInputChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.key]: value,
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentQuestion.type !== 'textarea') {
      handleNext()
    }
  }

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
              Output JSON gerado
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

      <Card className="border-t-4 border-t-teal-500 shadow-lg animate-fade-in-up">
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
            {currentQuestion.type === 'text' && (
              <Input
                autoFocus
                value={
                  (answers[
                    currentQuestion.key as keyof ClinicConfig
                  ] as string) || ''
                }
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={currentQuestion.placeholder}
                className="text-lg h-12"
              />
            )}

            {currentQuestion.type === 'textarea' && (
              <Textarea
                autoFocus
                value={
                  (answers[
                    currentQuestion.key as keyof ClinicConfig
                  ] as string) || ''
                }
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="text-base min-h-[120px] resize-none"
              />
            )}

            {currentQuestion.type === 'select' && (
              <Select
                value={
                  (answers[
                    currentQuestion.key as keyof ClinicConfig
                  ] as string) || ''
                }
                onValueChange={handleInputChange}
              >
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  {currentQuestion.options?.map((opt: any) => (
                    <SelectItem
                      key={opt}
                      value={opt}
                      className="text-base py-3"
                    >
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {currentQuestion.type === 'radio' && (
              <RadioGroup
                value={
                  (answers[
                    currentQuestion.key as keyof ClinicConfig
                  ] as string) || ''
                }
                onValueChange={handleInputChange}
                className="grid gap-3"
              >
                {currentQuestion.options?.map((opt: any) => (
                  <div
                    key={opt.value}
                    className={cn(
                      'flex items-center space-x-3 space-y-0 rounded-lg border p-4 cursor-pointer hover:bg-slate-50 transition-colors',
                      answers[currentQuestion.key as keyof ClinicConfig] ===
                        opt.value
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-slate-200',
                    )}
                  >
                    <RadioGroupItem value={opt.value} id={opt.value} />
                    <Label
                      htmlFor={opt.value}
                      className="flex-1 cursor-pointer text-base font-medium text-slate-700"
                    >
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-slate-50/50 p-6">
          <div className="text-xs text-slate-400">
            Pressione <strong>Enter</strong> para continuar
          </div>
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
