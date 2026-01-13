import { useState } from 'react'
import { useStrategyStore } from '@/stores/useStrategyStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BrainCircuit,
  RefreshCw,
  Printer,
  Shield,
  Globe,
  Shuffle,
  Target,
  UserCheck,
  Zap,
  Ban,
  Scale,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function AdvancedAnalysis() {
  const state = useStrategyStore()
  const { relatorio_3, isGeneratingReport, generateAdvancedReport } = state

  const handleGenerateReport = async () => {
    await generateAdvancedReport()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Análise Estratégica Avançada
        </h1>
        <p className="text-slate-500">
          Relatório 3: Consolidação de frameworks, cenários e trade-offs para
          2026.
        </p>
      </div>

      <Tabs defaultValue="report" className="w-full">
        <TabsList className="grid w-full md:w-[600px] grid-cols-3">
          <TabsTrigger value="report">Relatório Completo</TabsTrigger>
          <TabsTrigger value="matrices">Matrizes (SWOT/ERRC)</TabsTrigger>
          <TabsTrigger value="canvas">Value Canvas</TabsTrigger>
        </TabsList>

        <TabsContent value="report" className="mt-6 space-y-6">
          {!relatorio_3 ? (
            <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="bg-purple-100 p-4 rounded-full">
                  <BrainCircuit className="size-10 text-purple-600" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="text-xl font-semibold text-slate-900">
                    Gerar Análise Avançada
                  </h3>
                  <p className="text-slate-500">
                    Cruze dados dos relatórios anteriores para gerar Insights
                    Cross-SWOT, PESTEL e Políticas de Guia.
                  </p>
                </div>
                <Button
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport}
                  className="bg-purple-600 hover:bg-purple-700 text-white min-w-[200px]"
                >
                  {isGeneratingReport ? (
                    <>
                      <RefreshCw className="mr-2 size-4 animate-spin" />
                      Processando Dados...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 size-4" />
                      Gerar Relatório 3
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-purple-700 bg-purple-50"
                  >
                    Gerado em:{' '}
                    {new Date(relatorio_3.generatedAt).toLocaleDateString()}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    Relatório Avançado (Estratégico)
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                  >
                    <Printer className="mr-2 size-3" /> Imprimir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport}
                  >
                    <RefreshCw
                      className={cn(
                        'mr-2 size-3',
                        isGeneratingReport && 'animate-spin',
                      )}
                    />
                    Regerar
                  </Button>
                </div>
              </div>

              {/* 1. Porter & PESTEL Section */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-t-4 border-t-blue-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="size-5 text-blue-600" /> 5 Forças de
                      Porter
                    </CardTitle>
                    <CardDescription>
                      Análise de competitividade estrutural.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="space-y-1">
                      <span className="font-semibold text-blue-800">
                        Rivalidade:
                      </span>
                      <p className="text-slate-600">
                        {relatorio_3.portersForces.rivalry}
                      </p>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <span className="font-semibold text-blue-800">
                        Novos Entrantes:
                      </span>
                      <p className="text-slate-600">
                        {relatorio_3.portersForces.entrants}
                      </p>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <span className="font-semibold text-blue-800">
                        Substitutos:
                      </span>
                      <p className="text-slate-600">
                        {relatorio_3.portersForces.substitutes}
                      </p>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="font-semibold text-blue-800">
                          Poder Compradores:
                        </span>
                        <p className="text-slate-600">
                          {relatorio_3.portersForces.buyerPower}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="font-semibold text-blue-800">
                          Poder Fornecedores:
                        </span>
                        <p className="text-slate-600">
                          {relatorio_3.portersForces.supplierPower}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-t-4 border-t-teal-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="size-5 text-teal-600" /> Cenário PESTEL
                      2026
                    </CardTitle>
                    <CardDescription>
                      Fatores macroambientais de impacto.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="block font-bold text-slate-700 text-xs uppercase mb-1">
                          Político
                        </span>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          {relatorio_3.pestel.political}
                        </p>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="block font-bold text-slate-700 text-xs uppercase mb-1">
                          Econômico
                        </span>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          {relatorio_3.pestel.economic}
                        </p>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="block font-bold text-slate-700 text-xs uppercase mb-1">
                          Social
                        </span>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          {relatorio_3.pestel.social}
                        </p>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="block font-bold text-slate-700 text-xs uppercase mb-1">
                          Tecnológico
                        </span>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          {relatorio_3.pestel.technological}
                        </p>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="block font-bold text-slate-700 text-xs uppercase mb-1">
                          Ambiental (Eco)
                        </span>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          {relatorio_3.pestel.ecological}
                        </p>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="block font-bold text-slate-700 text-xs uppercase mb-1">
                          Legal
                        </span>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          {relatorio_3.pestel.legal}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 2. Rumelt & Trade-offs */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-l-4 border-l-indigo-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scale className="size-5 text-indigo-600" /> Políticas de
                      Guia (Rumelt)
                    </CardTitle>
                    <CardDescription>
                      Diretrizes claras para tomada de decisão no dia a dia.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {relatorio_3.guidingPolicies.map((policy, i) => (
                        <li key={i} className="flex gap-3 items-start text-sm">
                          <div className="bg-indigo-100 text-indigo-700 font-bold rounded-full size-6 flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <span className="text-slate-700">{policy}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500 bg-red-50/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-800">
                      <Ban className="size-5" /> Trade-offs Estratégicos
                    </CardTitle>
                    <CardDescription>
                      O que <strong>NÃO</strong> faremos.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {relatorio_3.tradeOffs.map((item, i) => (
                        <li key={i} className="flex gap-2 items-start text-sm">
                          <span className="text-red-500 font-bold">✕</span>
                          <span className="text-red-900">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="matrices" className="mt-6">
          {relatorio_3 && (
            <div className="space-y-8">
              {/* Crossed SWOT */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shuffle className="size-5 text-orange-600" /> SWOT Cruzada
                    (TOWS Matrix)
                  </CardTitle>
                  <CardDescription>
                    Estratégias geradas a partir da interseção de fatores.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-green-200 bg-green-50/30 rounded-lg p-4">
                      <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                        <span className="bg-green-200 text-green-800 px-1.5 py-0.5 rounded text-xs">
                          FO
                        </span>{' '}
                        Estratégia de Expansão
                      </h4>
                      <p className="text-xs text-slate-500 mb-2">
                        Usar Forças para aproveitar Oportunidades.
                      </p>
                      <ul className="list-disc pl-4 text-sm text-slate-700 space-y-1">
                        {relatorio_3.crossedSwot.fo.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="border border-amber-200 bg-amber-50/30 rounded-lg p-4">
                      <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                        <span className="bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded text-xs">
                          FA
                        </span>{' '}
                        Estratégia de Defesa
                      </h4>
                      <p className="text-xs text-slate-500 mb-2">
                        Usar Forças para evitar Ameaças.
                      </p>
                      <ul className="list-disc pl-4 text-sm text-slate-700 space-y-1">
                        {relatorio_3.crossedSwot.fa.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="border border-blue-200 bg-blue-50/30 rounded-lg p-4">
                      <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                        <span className="bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded text-xs">
                          DO
                        </span>{' '}
                        Estratégia de Melhoria
                      </h4>
                      <p className="text-xs text-slate-500 mb-2">
                        Superar Fraquezas aproveitando Oportunidades.
                      </p>
                      <ul className="list-disc pl-4 text-sm text-slate-700 space-y-1">
                        {relatorio_3.crossedSwot.do.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="border border-red-200 bg-red-50/30 rounded-lg p-4">
                      <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                        <span className="bg-red-200 text-red-800 px-1.5 py-0.5 rounded text-xs">
                          DA
                        </span>{' '}
                        Estratégia de Sobrevivência
                      </h4>
                      <p className="text-xs text-slate-500 mb-2">
                        Reduzir Fraquezas e evitar Ameaças.
                      </p>
                      <ul className="list-disc pl-4 text-sm text-slate-700 space-y-1">
                        {relatorio_3.crossedSwot.da.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Blue Ocean Matrix */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="size-5 text-cyan-600" /> Matriz Oceano
                    Azul (ERRC)
                  </CardTitle>
                  <CardDescription>
                    Movimentos para sair da competição irrelevante.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-white p-6">
                      <h4 className="text-red-600 font-bold uppercase mb-4 flex items-center gap-2">
                        Eliminar
                      </h4>
                      <ul className="space-y-2 text-sm text-slate-600">
                        {relatorio_3.blueOcean.eliminate.map((item, i) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white p-6">
                      <h4 className="text-green-600 font-bold uppercase mb-4 flex items-center gap-2">
                        Criar
                      </h4>
                      <ul className="space-y-2 text-sm text-slate-600">
                        {relatorio_3.blueOcean.create.map((item, i) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white p-6">
                      <h4 className="text-amber-600 font-bold uppercase mb-4 flex items-center gap-2">
                        Reduzir
                      </h4>
                      <ul className="space-y-2 text-sm text-slate-600">
                        {relatorio_3.blueOcean.reduce.map((item, i) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white p-6">
                      <h4 className="text-blue-600 font-bold uppercase mb-4 flex items-center gap-2">
                        Elevar
                      </h4>
                      <ul className="space-y-2 text-sm text-slate-600">
                        {relatorio_3.blueOcean.raise.map((item, i) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="canvas" className="mt-6">
          {relatorio_3 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Customer Profile */}
                <Card className="border-r-4 border-r-pink-500 rounded-r-none md:rounded-r-xl md:border-r-0 md:border-l-4 md:border-l-pink-500">
                  <CardHeader>
                    <CardTitle className="text-pink-700 flex items-center gap-2">
                      <UserCheck className="size-5" /> Perfil do Paciente
                    </CardTitle>
                    <CardDescription>O que o cliente observa.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h5 className="font-semibold text-slate-800 mb-2">
                        Jobs (Tarefas)
                      </h5>
                      <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                        {relatorio_3.valueCanvas.customerJobs.map((j, i) => (
                          <li key={i}>{j}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-red-700 mb-2">
                        Dores (Pains)
                      </h5>
                      <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                        {relatorio_3.valueCanvas.pains.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-green-700 mb-2">
                        Ganhos (Gains)
                      </h5>
                      <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                        {relatorio_3.valueCanvas.gains.map((g, i) => (
                          <li key={i}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Value Map */}
                <Card className="border-l-4 border-l-purple-500 rounded-l-none md:rounded-l-xl md:border-l-0 md:border-r-4 md:border-r-purple-500">
                  <CardHeader>
                    <CardTitle className="text-purple-700 flex items-center gap-2">
                      <Target className="size-5" /> Mapa de Valor
                    </CardTitle>
                    <CardDescription>O que a clínica oferece.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h5 className="font-semibold text-slate-800 mb-2">
                        Produtos & Serviços
                      </h5>
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                        {state.operationalAssessment.services ||
                          'Serviços gerais de clínica médica e especialidades.'}
                      </p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-purple-700 mb-2">
                        Aliviadores de Dor
                      </h5>
                      <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                        {relatorio_3.valueCanvas.painRelievers.map((pr, i) => (
                          <li key={i}>{pr}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-teal-700 mb-2">
                        Criadores de Ganho
                      </h5>
                      <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                        {relatorio_3.valueCanvas.gainCreators.map((gc, i) => (
                          <li key={i}>{gc}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
