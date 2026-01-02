import { useState } from 'react'
import { useStrategyStore } from '@/stores/useStrategyStore'
import { generateTacticalPlanReport } from '@/lib/report-generator'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  RefreshCw,
  Printer,
  CalendarRange,
  Target,
  BarChart2,
  ListTodo,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function TacticalPlan() {
  const state = useStrategyStore()
  const { relatorio_4, setRelatorio4 } = state
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateReport = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const report = generateTacticalPlanReport(state)
      setRelatorio4(report)
      setIsGenerating(false)
      toast.success('Plano Tático 2026 gerado com sucesso!')
    }, 2000)
  }

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Alta':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      case 'Média':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200'
      default:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Plano Tático 2026
        </h1>
        <p className="text-slate-500">
          Relatório 4: Transformando estratégia em ação com OKRs, KPIs e
          Roadmap.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full md:w-[800px] grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="okrs">OKRs & KPIs</TabsTrigger>
          <TabsTrigger value="initiatives">Iniciativas</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap Anual</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {!relatorio_4 ? (
            <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="bg-orange-100 p-4 rounded-full">
                  <CalendarRange className="size-10 text-orange-600" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="text-xl font-semibold text-slate-900">
                    Gerar Plano Tático
                  </h3>
                  <p className="text-slate-500">
                    Consolide diagnósticos, estratégia e metas em um plano de
                    execução claro para 2026.
                  </p>
                </div>
                <Button
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="bg-orange-600 hover:bg-orange-700 text-white min-w-[200px]"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 size-4 animate-spin" />
                      Processando Tática...
                    </>
                  ) : (
                    <>
                      <ListTodo className="mr-2 size-4" />
                      Gerar Relatório 4
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
                    className="text-orange-700 bg-orange-50"
                  >
                    Gerado em:{' '}
                    {new Date(relatorio_4.generatedAt).toLocaleDateString()}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    Versão Final 2026
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
                    disabled={isGenerating}
                  >
                    <RefreshCw
                      className={cn(
                        'mr-2 size-3',
                        isGenerating && 'animate-spin',
                      )}
                    />
                    Regerar
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-white to-orange-50 border-orange-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-orange-800 text-4xl font-bold">
                      {relatorio_4.okrs.length}
                    </CardTitle>
                    <CardDescription className="text-orange-700 font-medium">
                      Objetivos Estratégicos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-slate-500">
                      Definidos para alavancar Financeiro, Clientes, Processos e
                      Pessoas.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-blue-800 text-4xl font-bold">
                      {Object.values(relatorio_4.kpis).flat().length}
                    </CardTitle>
                    <CardDescription className="text-blue-700 font-medium">
                      KPIs Monitorados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-slate-500">
                      Indicadores de performance distribuídos em 5 áreas de
                      gestão.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-white to-green-50 border-green-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-green-800 text-4xl font-bold">
                      {relatorio_4.initiatives.length}
                    </CardTitle>
                    <CardDescription className="text-green-700 font-medium">
                      Iniciativas Táticas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-slate-500">
                      Ações concretas priorizadas por impacto e esforço.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="okrs" className="mt-6">
          {relatorio_4 && (
            <div className="space-y-8">
              <div className="grid gap-6">
                {relatorio_4.okrs.map((okr, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="bg-white border border-slate-200 rounded-md size-8 flex items-center justify-center font-bold text-slate-700">
                          O{index + 1}
                        </span>
                        <div>
                          <h3 className="font-semibold text-slate-800">
                            {okr.objective}
                          </h3>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {okr.area}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/50">
                            <TableHead className="w-12"></TableHead>
                            <TableHead>
                              Key Results (Resultados-Chave)
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {okr.krs.map((kr, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="text-center font-mono text-xs text-slate-400">
                                KR{idx + 1}
                              </TableCell>
                              <TableCell className="font-medium text-slate-700">
                                {kr}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="size-5 text-blue-600" /> Dashboard de
                    KPIs
                  </CardTitle>
                  <CardDescription>
                    Indicadores essenciais por área de gestão.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(relatorio_4.kpis).map(([area, kpis]) => (
                      <div
                        key={area}
                        className="border rounded-lg p-4 bg-slate-50/50"
                      >
                        <h4 className="font-bold text-slate-700 uppercase text-xs mb-3 flex items-center gap-2">
                          <span className="size-2 rounded-full bg-blue-500" />
                          {area === 'finance'
                            ? 'Financeiro'
                            : area === 'clients'
                              ? 'Clientes'
                              : area === 'processes'
                                ? 'Processos'
                                : area === 'people'
                                  ? 'Pessoas'
                                  : 'Marketing'}
                        </h4>
                        <ul className="space-y-2">
                          {kpis.map((kpi, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-slate-600 flex items-center gap-2"
                            >
                              <div className="size-1 rounded-full bg-slate-300" />
                              {kpi}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="initiatives" className="mt-6">
          {relatorio_4 && (
            <Card>
              <CardHeader>
                <CardTitle>Matriz de Priorização (Esforço x Impacto)</CardTitle>
                <CardDescription>
                  Lista de iniciativas classificadas para execução.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Iniciativa Tática</TableHead>
                      <TableHead>Objetivo Relacionado</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Impacto</TableHead>
                      <TableHead>Esforço</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relatorio_4.initiatives.map((init) => (
                      <TableRow key={init.id}>
                        <TableCell className="font-medium text-slate-800">
                          {init.title}
                        </TableCell>
                        <TableCell className="text-slate-500 text-xs">
                          {init.relatedObjective}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'border-0',
                              getPriorityColor(init.priority),
                            )}
                          >
                            {init.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {init.impact}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {init.effort}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="roadmap" className="mt-6">
          {relatorio_4 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => (
                <Card key={quarter} className="border-t-4 border-t-teal-500">
                  <CardHeader className="bg-slate-50 pb-3">
                    <CardTitle className="text-teal-800 text-lg">
                      {quarter} 2026
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3 min-h-[200px]">
                    {relatorio_4.initiatives
                      .filter((i) => i.quarter === quarter)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-white border border-slate-200 rounded shadow-sm text-sm hover:border-teal-300 transition-colors"
                        >
                          <p className="font-medium text-slate-800 mb-1">
                            {item.title}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">
                              {item.priority}
                            </span>
                            <Target className="size-3 text-slate-300" />
                          </div>
                        </div>
                      ))}
                    {relatorio_4.initiatives.filter(
                      (i) => i.quarter === quarter,
                    ).length === 0 && (
                      <div className="text-center text-xs text-slate-400 py-4 italic">
                        Sem entregas previstas
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
