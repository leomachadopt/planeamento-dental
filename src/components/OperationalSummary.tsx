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
          <Section title="Serviços" content={answers.services} />
          <Section
            title="Estrutura Física"
            content={answers.infrastructure}
            extra={
              answers.working_hours
                ? `Funcionamento: ${answers.working_hours}`
                : undefined
            }
          />
          <Section title="Equipe" content={answers.team_composition} />
          <Section
            title="Jornada do Paciente"
            content={answers.patient_management}
          />

          <section className="space-y-3">
            <SectionHeader title="Processos Internos" />
            <div className="pl-4 border-l-2 border-slate-200 space-y-4">
              <div className="bg-green-50 p-3 rounded-md border border-green-100">
                <span className="text-xs font-bold text-green-700 uppercase mb-1 block">
                  O que funciona bem
                </span>
                <p className="text-green-900">
                  {answers.processes_well_defined}
                </p>
              </div>
              <div className="bg-red-50 p-3 rounded-md border border-red-100">
                <span className="text-xs font-bold text-red-700 uppercase mb-1 block">
                  Pontos de Atenção
                </span>
                <p className="text-red-900">{answers.processes_disorganized}</p>
              </div>
            </div>
          </section>

          <Section
            title="Gestão Financeira"
            content={answers.financial_management}
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
  content,
  extra,
}: {
  title: string
  content: string
  extra?: string
}) {
  return (
    <section className="space-y-3">
      <SectionHeader title={title} />
      <div className="text-slate-700 leading-relaxed pl-4 border-l-2 border-slate-200 space-y-2">
        <p>{content}</p>
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
