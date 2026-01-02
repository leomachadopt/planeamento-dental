import { useState } from 'react'
import { useStrategyStore } from '@/stores/useStrategyStore'
import { generateOperationalPlanReport } from '@/lib/report-generator'
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
  RefreshCw,
  Printer,
  CalendarCheck,
  ClipboardList,
  CheckSquare,
  BookOpen,
  Settings,
  Clock,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export default function OperationalPlan() {
  const state = useStrategyStore()
  const { relatorio_5, setRelatorio5, config_inicial } = state
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateReport = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const report = generateOperationalPlanReport(state)
      setRelatorio5(report)
      setIsGenerating(false)
      toast.success('Plano Operacional 2026 gerado com sucesso!')
    }, 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Plano Operacional 2026
        </h1>
        <p className="text-slate-500">
          Relatório 5: Rotinas, POPs e Calendário para garantir a execução.
        </p>
      </div>

      <Tabs defaultValue="routines" className="w-full">
        <TabsList className="grid w-full md:w-[800px] grid-cols-4">
          <TabsTrigger value="routines">Rotinas</TabsTrigger>
          <TabsTrigger value="sops">POPs (SOPs)</TabsTrigger>
          <TabsTrigger value="checklists">Checklists</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
        </TabsList>

        <TabsContent value="routines" className="mt-6 space-y-6">
          {!relatorio_5 ? (
            <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="bg-emerald-100 p-4 rounded-full">
                  <Settings className="size-10 text-emerald-600" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="text-xl font-semibold text-slate-900">
                    Gerar Plano Operacional
                  </h3>
                  <p className="text-slate-500">
                    Crie rotinas padronizadas, manuais de procedimentos e um
                    calendário de ações para 2026.
                  </p>
                </div>
                <Button
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[200px]"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 size-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <ClipboardList className="mr-2 size-4" />
                      Gerar Relatório 5
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
                    className="text-emerald-700 bg-emerald-50"
                  >
                    Gerado em:{' '}
                    {new Date(relatorio_5.generatedAt).toLocaleDateString()}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    Manual de Operações
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatorio_5.routines.map((areaRoutine, idx) => (
                  <Card
                    key={idx}
                    className="overflow-hidden border-t-4 border-t-emerald-500"
                  >
                    <CardHeader className="bg-slate-50 pb-3">
                      <CardTitle className="text-lg text-emerald-800">
                        {areaRoutine.area}
                      </CardTitle>
                      <CardDescription>
                        Rotinas e rituais de gestão
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      {areaRoutine.routines.map((routine, rIdx) => (
                        <div
                          key={rIdx}
                          className={cn(
                            'p-4 border-b border-slate-100 last:border-0',
                          )}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant="secondary"
                              className={cn(
                                'text-xs',
                                routine.frequency === 'Diária' &&
                                  'bg-blue-100 text-blue-700',
                                routine.frequency === 'Semanal' &&
                                  'bg-purple-100 text-purple-700',
                                routine.frequency === 'Mensal' &&
                                  'bg-orange-100 text-orange-700',
                              )}
                            >
                              {routine.frequency}
                            </Badge>
                          </div>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                            {routine.tasks.map((task, tIdx) => (
                              <li key={tIdx}>{task}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sops" className="mt-6">
          {relatorio_5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-5 text-emerald-600" />
                  Procedimentos Operacionais Padrão (POPs)
                </CardTitle>
                <CardDescription>
                  Passo a passo para garantir a qualidade consistente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {relatorio_5.sops.map((sop) => (
                    <AccordionItem key={sop.id} value={sop.id}>
                      <AccordionTrigger className="hover:no-underline px-4 bg-slate-50/50 rounded-lg mb-2">
                        <div className="flex flex-col items-start text-left">
                          <span className="font-semibold text-slate-800">
                            {sop.title}
                          </span>
                          <span className="text-xs font-normal text-slate-500">
                            Responsável: {sop.responsible}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 pt-2">
                        <div className="mb-4 text-sm text-slate-600 italic border-l-2 border-emerald-200 pl-3">
                          <strong>Objetivo:</strong> {sop.objective}
                        </div>
                        <ol className="relative border-l border-slate-200 ml-3 space-y-4">
                          {sop.steps.map((step, idx) => (
                            <li key={idx} className="mb-2 ml-4">
                              <div className="absolute w-3 h-3 bg-emerald-500 rounded-full mt-1.5 -left-1.5 border border-white"></div>
                              <p className="text-sm text-slate-700 font-medium">
                                {step}
                              </p>
                            </li>
                          ))}
                        </ol>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="checklists" className="mt-6">
          {relatorio_5 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatorio_5.checklists.map((checklist) => (
                <Card
                  key={checklist.id}
                  className="bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckSquare className="size-4 text-slate-500" />
                      {checklist.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-3">
                      {checklist.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 group">
                          <div className="size-4 border-2 border-slate-300 rounded mt-0.5 group-hover:border-emerald-400 transition-colors" />
                          <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          {relatorio_5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarCheck className="size-5 text-emerald-600" />
                  Calendário Anual 2026
                </CardTitle>
                <CardDescription>
                  Planejamento mês a mês de campanhas e ações estratégicas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative border-l border-slate-200 ml-3 md:ml-6 space-y-8 py-4">
                  {relatorio_5.calendar.map((monthData, idx) => (
                    <div key={idx} className="mb-8 ml-6 relative">
                      <span className="absolute flex items-center justify-center size-8 bg-white border border-slate-200 rounded-full -left-10 ring-4 ring-white">
                        <span className="text-xs font-bold text-slate-500">
                          {idx + 1}
                        </span>
                      </span>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 hover:border-emerald-200 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
                          <h3 className="text-lg font-bold text-slate-800">
                            {monthData.month}
                          </h3>
                          <Badge variant="outline" className="w-fit bg-white">
                            {monthData.theme}
                          </Badge>
                        </div>
                        <ul className="space-y-2 mt-3">
                          {monthData.events.map((event, eIdx) => (
                            <li
                              key={eIdx}
                              className="text-sm text-slate-600 flex items-center gap-2"
                            >
                              <div className="size-1.5 bg-emerald-400 rounded-full" />
                              {event}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
