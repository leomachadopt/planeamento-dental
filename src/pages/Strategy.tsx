import { useState } from 'react'
import { useStrategyStore } from '@/stores/useStrategyStore'
import { generateStrategicDirectionReport } from '@/lib/report-generator'
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
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Plus,
  X,
  Waves,
  UserCheck,
  FileText,
  RefreshCw,
  Compass,
  Target,
  ArrowRight,
  Printer,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

export default function Strategy() {
  const state = useStrategyStore()
  const {
    blueOcean,
    jtbd,
    addBlueOceanItem,
    removeBlueOceanItem,
    relatorio_2,
    setRelatorio2,
  } = state
  const [newItem, setNewItem] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleAddItem = (category: keyof typeof blueOcean) => {
    if (!newItem.trim()) return
    addBlueOceanItem(category, newItem)
    setNewItem('')
  }

  const handleGenerateReport = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const report = generateStrategicDirectionReport(state)
      setRelatorio2(report)
      setIsGenerating(false)
      toast.success('Relatório de Direcionamento gerado com sucesso!')
    }, 1500)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Estúdio de Estratégia
        </h1>
        <p className="text-slate-500">
          Desenvolva sua proposta de valor única e inovação.
        </p>
      </div>

      <Tabs defaultValue="report" className="w-full">
        <TabsList className="grid w-full md:w-[600px] grid-cols-3">
          <TabsTrigger value="report">Direcionamento 2026</TabsTrigger>
          <TabsTrigger value="blue-ocean">Oceano Azul</TabsTrigger>
          <TabsTrigger value="jtbd">Jobs to be Done</TabsTrigger>
        </TabsList>

        <TabsContent value="report" className="mt-6 space-y-6 animate-fade-in">
          {!relatorio_2 ? (
            <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="bg-indigo-100 p-4 rounded-full">
                  <Compass className="size-10 text-indigo-600" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="text-xl font-semibold text-slate-900">
                    Gerar Relatório de Direcionamento
                  </h3>
                  <p className="text-slate-500">
                    Consolide Missão, Visão, Valores e o Mapa Estratégico em um
                    documento único para guiar sua clínica.
                  </p>
                </div>
                <Button
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[200px]"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 size-4 animate-spin" />
                      Processando Estratégia...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 size-4" />
                      Gerar Relatório Oficial
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-indigo-700 bg-indigo-50"
                  >
                    Gerado em:{' '}
                    {new Date(relatorio_2.generatedAt).toLocaleDateString()}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    Relatório Consolidado (Versão Final)
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

              <Card className="border-t-4 border-t-indigo-600 shadow-lg print:shadow-none">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-8">
                  <div className="text-center space-y-2">
                    <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">
                      Planejamento Estratégico 2026
                    </p>
                    <CardTitle className="text-3xl text-slate-900">
                      Relatório de Direcionamento
                    </CardTitle>
                    <CardDescription className="text-lg">
                      {state.clinicName}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-8 md:p-12 space-y-10 font-serif md:font-sans">
                  {/* 1. Mission & Vision */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <section className="space-y-3">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="text-lg text-indigo-600">01.</span>{' '}
                        Missão
                      </h3>
                      <p className="text-xl font-medium text-slate-800 leading-relaxed italic">
                        "{relatorio_2.mission}"
                      </p>
                    </section>
                    <section className="space-y-3">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="text-lg text-indigo-600">02.</span>{' '}
                        Visão 2026
                      </h3>
                      <p className="text-xl font-medium text-slate-800 leading-relaxed italic">
                        "{relatorio_2.vision}"
                      </p>
                    </section>
                  </div>

                  <Separator />

                  {/* 3. Values */}
                  <section className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <span className="text-lg text-indigo-600">03.</span>{' '}
                      Valores Fundamentais
                    </h3>
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {relatorio_2.values.map((val, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-center font-medium text-slate-700"
                        >
                          {val}
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* 4. Strategic Principles */}
                  <section className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <span className="text-lg text-indigo-600">04.</span>{' '}
                      Princípios Estratégicos (Kernel)
                    </h3>
                    <ul className="space-y-2 list-disc pl-5 text-slate-700">
                      {relatorio_2.strategicPrinciples.map((principle, idx) => (
                        <li key={idx} className="pl-2">
                          {principle}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* 5. Value Proposition */}
                    <section className="space-y-3">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="text-lg text-indigo-600">05.</span>{' '}
                        Proposta de Valor (JTBD)
                      </h3>
                      <p className="text-slate-700 bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
                        {relatorio_2.valueProposition}
                      </p>
                    </section>

                    {/* 7. Positioning */}
                    <section className="space-y-3">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="text-lg text-indigo-600">07.</span>{' '}
                        Posicionamento Competitivo
                      </h3>
                      <p className="text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        {relatorio_2.competitivePositioning}
                      </p>
                    </section>
                  </div>

                  {/* 6. Value Chain */}
                  <section className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <span className="text-lg text-indigo-600">06.</span>{' '}
                      Cadeia de Valor
                    </h3>
                    <div className="p-4 rounded-lg border border-dashed border-slate-300 text-center text-slate-600 font-medium text-sm">
                      {relatorio_2.valueChain}
                    </div>
                  </section>

                  <Separator />

                  {/* 8. BSC Objectives */}
                  <section className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <span className="text-lg text-indigo-600">08.</span>{' '}
                      Objetivos Estratégicos (BSC)
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="border-l-4 border-l-green-500 shadow-sm">
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm font-bold uppercase text-green-700">
                            Financeiro
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2 text-sm text-slate-600">
                          <ul className="list-disc pl-4 space-y-1">
                            {relatorio_2.bscObjectives.financial.map(
                              (obj, i) => (
                                <li key={i}>{obj}</li>
                              ),
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                      <Card className="border-l-4 border-l-blue-500 shadow-sm">
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm font-bold uppercase text-blue-700">
                            Clientes
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2 text-sm text-slate-600">
                          <ul className="list-disc pl-4 space-y-1">
                            {relatorio_2.bscObjectives.customers.map(
                              (obj, i) => (
                                <li key={i}>{obj}</li>
                              ),
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                      <Card className="border-l-4 border-l-amber-500 shadow-sm">
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm font-bold uppercase text-amber-700">
                            Processos Internos
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2 text-sm text-slate-600">
                          <ul className="list-disc pl-4 space-y-1">
                            {relatorio_2.bscObjectives.processes.map(
                              (obj, i) => (
                                <li key={i}>{obj}</li>
                              ),
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                      <Card className="border-l-4 border-l-purple-500 shadow-sm">
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm font-bold uppercase text-purple-700">
                            Aprendizado & Crescimento
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2 text-sm text-slate-600">
                          <ul className="list-disc pl-4 space-y-1">
                            {relatorio_2.bscObjectives.learning.map(
                              (obj, i) => (
                                <li key={i}>{obj}</li>
                              ),
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </section>

                  {/* 9. Strategic Map Text */}
                  <section className="space-y-3 bg-slate-900 text-slate-300 p-6 rounded-xl">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <span className="text-lg text-white">09.</span> Lógica do
                      Mapa Estratégico
                    </h3>
                    <p className="text-lg leading-relaxed font-medium text-white">
                      "{relatorio_2.strategicMapText}"
                    </p>
                  </section>
                </CardContent>
                <CardFooter className="bg-slate-50 border-t border-slate-100 p-8 flex justify-end">
                  <Button asChild size="lg" className="bg-teal-600 text-white">
                    <Link to="/mapa-estrategico">
                      Visualizar Mapa Interativo{' '}
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="blue-ocean" className="mt-6">
          <Card className="border-none shadow-none bg-transparent">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Eliminate */}
              <Card className="border-t-4 border-t-red-500 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-red-700 flex items-center gap-2">
                    <X className="size-5" /> Eliminar
                  </CardTitle>
                  <CardDescription>
                    O que a indústria aceita mas não agrega valor?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {blueOcean.eliminate.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center p-2 bg-red-50 rounded text-sm text-red-900"
                      >
                        {item}
                        <button
                          onClick={() => removeBlueOceanItem('eliminate', idx)}
                          className="text-red-400 hover:text-red-700"
                        >
                          <X className="size-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Adicionar item..."
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAddItem('eliminate')}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Reduce */}
              <Card className="border-t-4 border-t-amber-500 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-amber-700 flex items-center gap-2">
                    <Waves className="size-5" /> Reduzir
                  </CardTitle>
                  <CardDescription>
                    O que pode ser reduzido bem abaixo do padrão?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {blueOcean.reduce.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center p-2 bg-amber-50 rounded text-sm text-amber-900"
                      >
                        {item}
                        <button
                          onClick={() => removeBlueOceanItem('reduce', idx)}
                          className="text-amber-400 hover:text-amber-700"
                        >
                          <X className="size-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Adicionar item..."
                      className="h-8 text-sm"
                    />
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Raise */}
              <Card className="border-t-4 border-t-blue-500 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-700 flex items-center gap-2">
                    <TrendingUp className="size-5" /> Elevar
                  </CardTitle>
                  <CardDescription>
                    O que deve ser elevado bem acima do padrão?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {blueOcean.raise.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center p-2 bg-blue-50 rounded text-sm text-blue-900"
                      >
                        {item}
                        <button
                          onClick={() => removeBlueOceanItem('raise', idx)}
                          className="text-blue-400 hover:text-blue-700"
                        >
                          <X className="size-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Adicionar item..."
                      className="h-8 text-sm"
                    />
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Create */}
              <Card className="border-t-4 border-t-green-500 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-green-700 flex items-center gap-2">
                    <Lightbulb className="size-5" /> Criar
                  </CardTitle>
                  <CardDescription>
                    O que nunca foi oferecido antes?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {blueOcean.create.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center p-2 bg-green-50 rounded text-sm text-green-900"
                      >
                        {item}
                        <button
                          onClick={() => removeBlueOceanItem('create', idx)}
                          className="text-green-400 hover:text-green-700"
                        >
                          <X className="size-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Adicionar item..."
                      className="h-8 text-sm"
                    />
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="jtbd" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="size-5 text-teal-600" /> Canvas Jobs to be
                Done
              </CardTitle>
              <CardDescription>
                Entenda o progresso que seu paciente está tentando fazer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th className="px-6 py-3">O "Job" (Tarefa/Objetivo)</th>
                      <th className="px-6 py-3">Tipo</th>
                      <th className="px-6 py-3">Nossa Solução</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jtbd.map((job) => (
                      <tr
                        key={job.id}
                        className="bg-white border-b hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {job.job}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline">{job.type}</Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {job.solution}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                <span className="text-slate-500 flex items-center gap-2">
                  <Plus className="size-4" /> Adicionar novo Job do Paciente
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TrendingUp({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  )
}
function Lightbulb({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
      <path d="M9 18h6"></path>
      <path d="M10 22h4"></path>
    </svg>
  )
}
