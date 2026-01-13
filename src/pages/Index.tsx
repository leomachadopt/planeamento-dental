import { useStrategyStore } from '@/stores/useStrategyStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, AlertCircle, FileText, Target, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Index() {
  const {
    diagnosis,
    relatorio_1,
    relatorio_2,
    relatorio_3,
    relatorio_4,
    relatorio_5,
    relatorio_final,
  } = useStrategyStore()

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Centro de Documentação 2026
          </h1>
          <p className="text-slate-500 mt-1 max-w-2xl">
            Navegue pelos relatórios gerados (Diagnóstico, Estratégia, Plano
            Tático, Plano Operacional e Relatório Final) que sustentam a
            execução do planejamento estratégico da clínica.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800">
            <Link to="/relatorio-final">Imprimir Documento Completo</Link>
          </Button>
          <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-200/50">
            <Link to="/configuracao">Iniciar / Revisar Planejamento</Link>
          </Button>
        </div>
      </div>

      {/* Destaque do Desafio Central */}
      <Card className="shadow-sm border-teal-100 bg-gradient-to-br from-white to-slate-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <AlertCircle className="size-5 text-teal-600" />
            Desafio Estratégico Central (Rumelt)
          </CardTitle>
          <CardDescription>
            Síntese do problema central que orienta todo o planejamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600 leading-relaxed italic">
            {diagnosis.rumelt.challenge
              ? `"${diagnosis.rumelt.challenge}"`
              : 'O desafio ainda não foi definido. Preencha o módulo de Diagnóstico para registrar o problema central.'}
          </p>
          {diagnosis.rumelt.policy && (
            <p className="text-sm text-teal-900 bg-teal-50 border border-teal-100 rounded-lg p-3">
              <span className="font-semibold">Política Orientadora: </span>
              {diagnosis.rumelt.policy}
            </p>
          )}
          <div className="flex justify-end">
            <Button variant="link" asChild className="text-teal-600 p-0 h-auto">
              <Link to="/diagnostico" className="flex items-center gap-1">
                Revisar Diagnóstico <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hub de Relatórios */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5 text-slate-600" />
              Relatório 1 – Diagnóstico Situacional
            </CardTitle>
            <CardDescription>
              Consolida os módulos 2A, 2B e 2C em um diagnóstico estruturado.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              {relatorio_1
                ? `Gerado em ${new Date(relatorio_1.generatedAt).toLocaleDateString()}`
                : 'Ainda não gerado.'}
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/diagnostico">
                {relatorio_1 ? 'Ver / Regerar' : 'Gerar com IA'}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-5 text-slate-600" />
              Relatório 2 – Direcionamento Estratégico
            </CardTitle>
            <CardDescription>
              Missão, visão, valores e mapa estratégico da clínica.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              {relatorio_2
                ? `Gerado em ${new Date(relatorio_2.generatedAt).toLocaleDateString()}`
                : 'Ainda não gerado.'}
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/estrategia">
                {relatorio_2 ? 'Ver / Regerar' : 'Gerar com IA'}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-5 text-slate-600" />
              Relatório 3 – Análise Avançada
            </CardTitle>
            <CardDescription>
              PESTEL, Porters, Blue Ocean e trade-offs estratégicos.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              {relatorio_3
                ? `Gerado em ${new Date(relatorio_3.generatedAt).toLocaleDateString()}`
                : 'Ainda não gerado.'}
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/analise-avancada">
                {relatorio_3 ? 'Ver / Regerar' : 'Gerar com IA'}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5 text-slate-600" />
              Relatório 4 – Plano Tático (OKRs)
            </CardTitle>
            <CardDescription>
              Objetivos, OKRs e iniciativas recomendadas para execução.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              {relatorio_4
                ? `Gerado em ${new Date(relatorio_4.generatedAt).toLocaleDateString()}`
                : 'Ainda não gerado.'}
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/plano-tatico">
                {relatorio_4 ? 'Ver / Regerar' : 'Gerar com IA'}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5 text-slate-600" />
              Relatório 5 – Plano Operacional
            </CardTitle>
            <CardDescription>
              Rotinas, POPs, checklists e calendário operacional para 2026.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              {relatorio_5
                ? `Gerado em ${new Date(relatorio_5.generatedAt).toLocaleDateString()}`
                : 'Ainda não gerado.'}
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/plano-operacional">
                {relatorio_5 ? 'Ver / Regerar' : 'Gerar com IA'}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-5 text-slate-600" />
              Relatório Final Integrado
            </CardTitle>
            <CardDescription>
              Documento executivo que consolida todos os relatórios anteriores.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              {relatorio_final
                ? `Gerado em ${new Date(relatorio_final.generatedAt).toLocaleDateString()}`
                : 'Ainda não gerado.'}
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/relatorio-final">
                {relatorio_final ? 'Ver / Regerar' : 'Gerar com IA'}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 border-slate-200 bg-slate-50">
        <CardHeader>
          <CardTitle>Importante</CardTitle>
          <CardDescription>
            Este aplicativo foca na documentação estruturada do planejamento.
            O acompanhamento contínuo de métricas, KPIs e resultados deve ser
            realizado em seu sistema de monitorização de performance.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
