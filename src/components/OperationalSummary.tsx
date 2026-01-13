import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardList } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OperationalAssessment as IOperationalAssessment } from '@/stores/useStrategyStore'
import { cn } from '@/lib/utils'

interface OperationalSummaryProps {
  answers: IOperationalAssessment
  clinicName: string
  onRevision: () => void
}

export function OperationalSummary({
  answers,
  clinicName,
  onRevision,
}: OperationalSummaryProps) {
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
              <CardDescription>Visão geral da {clinicName}.</CardDescription>
            </div>
            <Badge variant="outline" className="bg-white">
              Status: Mapeado
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <Section
            title="1. Serviços que sustentam a operação"
            subtitle="Quais serviços realmente sustentam o faturamento da clínica hoje?"
            content={answers.services}
          />
          <Section
            title="2. Capacidade física vs uso real"
            subtitle="A estrutura física é suficiente para a demanda atual?"
            content={answers.infrastructure}
          />
          <Section
            title="3. Dependência da equipa"
            subtitle="Quais funções são críticas para a operação não parar?"
            content={answers.team_composition}
          />
          <Section
            title="4. Horário vs comportamento do paciente"
            subtitle="Os horários atuais atendem bem o perfil dos seus pacientes?"
            content={answers.working_hours}
          />
          <Section
            title="5. Maturidade do agendamento"
            subtitle="Quão organizado é o processo de agendamento hoje?"
            content={answers.patient_management}
          />
          <Section
            title="6. Controle financeiro prático"
            subtitle="Você consegue responder essas perguntas hoje sem esforço?"
            content={answers.financial_management}
          />
          <Section
            title="7. O que funciona bem (vantagem operacional)"
            subtitle="O que funciona melhor que a média das clínicas semelhantes?"
            content={answers.processes_well_defined}
            variant="success"
          />
          <Section
            title="8. Onde a operação trava crescimento"
            subtitle="O que mais limita o crescimento hoje?"
            content={answers.processes_disorganized}
            variant="warning"
          />
        </CardContent>
        <CardFooter className="bg-slate-50 border-t border-slate-100 p-6 flex justify-between">
          <Button variant="outline" onClick={onRevision}>
            Revisar Respostas
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link to="/mercado">
              Ir para Mercado (2B) <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function Section({
  title,
  subtitle,
  content,
  extra,
  variant = 'default',
}: {
  title: string
  subtitle?: string
  content: string
  extra?: string
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
        <SectionHeader title={title} />
        {subtitle && (
          <p className="text-sm text-slate-500 mt-1 ml-6">{subtitle}</p>
        )}
      </div>
      <div
        className={cn(
          'text-slate-700 leading-relaxed pl-4 border-l-2 space-y-2 p-3 rounded-r-md',
          variantStyles[variant],
        )}
      >
        <p className="whitespace-pre-line">{content}</p>
        {extra && (
          <p className="text-sm text-slate-500 mt-2 font-medium">{extra}</p>
        )}
      </div>
    </section>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-lg font-semibold text-teal-800 flex items-center gap-2">
      <div className="size-2 bg-teal-500 rounded-full" />
      {title}
    </h3>
  )
}
