import { useState } from 'react'
import { useStrategyStore } from '@/stores/useStrategyStore'
import { generateDiagnosticReport } from '@/lib/report-generator'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  ShieldAlert,
  RefreshCw,
  Save,
  FileText,
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  Zap,
  Target,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function Diagnostic() {
  const state = useStrategyStore()
  const { diagnosis, updateRumelt, relatorio_1, setRelatorio1 } = state
  const [rumeltData, setRumeltData] = useState(diagnosis.rumelt)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSaveRumelt = () => {
    updateRumelt(rumeltData)
    toast.success('Diagnóstico atualizado com sucesso!', {
      description: 'Sua política orientadora foi salva.',
    })
  }

  const generatePolicy = () => {
    toast.info('Consultor AI está analisando seus dados...', { duration: 2000 })
    setTimeout(() => {
      setRumeltData((prev) => ({
        ...prev,
        policy:
          'Nova Política Gerada: Focar na digitalização total da jornada do paciente para eliminar ineficiências operacionais e aumentar a percepção de valor.',
      }))
      toast.success('Política Orientadora sugerida!')
    }, 2000)
  }

  const handleGenerateReport = () => {
    setIsGenerating(true)
    // Simulate processing time for "AI" feel
    setTimeout(() => {
      const report = generateDiagnosticReport(state)
      setRelatorio1(report)
      setIsGenerating(false)
      toast.success('Relatório gerado com sucesso!', {
        description: 'Seu diagnóstico situacional está pronto.',
      })
    }, 1500)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Centro de Diagnóstico
        </h1>
        <p className="text-slate-500">
          Analise o cenário atual e gere relatórios estratégicos consolidados.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full md:w-[800px] grid-cols-3">
          <TabsTrigger value="overview">Relatório Consolidado</TabsTrigger>
          <TabsTrigger value="porter">Forças de Porter</TabsTrigger>
          <TabsTrigger value="rumelt">Diagnóstico de Rumelt</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {!relatorio_1 ? (
            <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="bg-teal-100 p-4 rounded-full">
                  <FileText className="size-10 text-teal-600" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="text-xl font-semibold text-slate-900">
                    Nenhum relatório gerado ainda
                  </h3>
                  <p className="text-slate-500">
                    O sistema irá compilar os dados dos módulos 2A, 2B e 2C para
                    criar um diagnóstico completo da sua clínica.
                  </p>
                </div>
                <Button
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="bg-teal-600 hover:bg-teal-700 text-white min-w-[200px]"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 size-4 animate-spin" />
                      Gerando Análise...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="mr-2 size-4" />
                      Gerar Diagnóstico 2026
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-teal-700 bg-teal-50">
                    Gerado em:{' '}
                    {new Date(relatorio_1.generatedAt).toLocaleDateString()}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    Versão 1.0 (Automática)
                  </span>
                </div>
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

              {/* Executive Summary */}
              <Card className="border-l-4 border-l-teal-500">
                <CardHeader>
                  <CardTitle>Sumário Executivo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed text-lg">
                    {relatorio_1.executiveSummary}
                  </p>
                </CardContent>
              </Card>

              {/* Context & Operations & Market Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-slate-600 uppercase tracking-wide">
                      Contexto & Operação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                      <h4 className="font-semibold text-slate-800 mb-1">
                        Contexto do Negócio
                      </h4>
                      <p className="text-slate-600">
                        {relatorio_1.businessContext}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                      <h4 className="font-semibold text-slate-800 mb-1">
                        Análise Operacional
                      </h4>
                      <p className="text-slate-600">
                        {relatorio_1.operationAnalysis}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-slate-600 uppercase tracking-wide">
                      Mercado & Concorrência
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                      <h4 className="font-semibold text-blue-800 mb-1">
                        Panorama de Mercado
                      </h4>
                      <p className="text-slate-600">
                        {relatorio_1.marketAnalysis}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* SWOT Matrix */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Target className="size-5 text-teal-600" /> Matriz SWOT
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <Card className="bg-green-50/50 border-green-200 shadow-none">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-green-800 flex items-center gap-2 text-lg">
                        <TrendingUp className="size-4" /> Forças (Strengths)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-green-900">
                        {relatorio_1.swot.strengths.length > 0 ? (
                          relatorio_1.swot.strengths.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))
                        ) : (
                          <li className="italic opacity-50">
                            Dados insuficientes
                          </li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Weaknesses */}
                  <Card className="bg-red-50/50 border-red-200 shadow-none">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-red-800 flex items-center gap-2 text-lg">
                        <AlertTriangle className="size-4" /> Fraquezas
                        (Weaknesses)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-red-900">
                        {relatorio_1.swot.weaknesses.length > 0 ? (
                          relatorio_1.swot.weaknesses.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))
                        ) : (
                          <li className="italic opacity-50">
                            Dados insuficientes
                          </li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Opportunities */}
                  <Card className="bg-blue-50/50 border-blue-200 shadow-none">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-blue-800 flex items-center gap-2 text-lg">
                        <Zap className="size-4" /> Oportunidades (Opportunities)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-blue-900">
                        {relatorio_1.swot.opportunities.length > 0 ? (
                          relatorio_1.swot.opportunities.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))
                        ) : (
                          <li className="italic opacity-50">
                            Dados insuficientes
                          </li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Threats */}
                  <Card className="bg-amber-50/50 border-amber-200 shadow-none">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-amber-800 flex items-center gap-2 text-lg">
                        <ShieldAlert className="size-4" /> Ameaças (Threats)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-amber-900">
                        {relatorio_1.swot.threats.length > 0 ? (
                          relatorio_1.swot.threats.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))
                        ) : (
                          <li className="italic opacity-50">
                            Dados insuficientes
                          </li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Insights & Risks Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Insights Estratégicos & Riscos</CardTitle>
                  <CardDescription>
                    Pontos de atenção crítica para o planejamento 2026.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Insight / Risco Identificado</TableHead>
                        <TableHead className="w-[150px] text-right">
                          Prioridade
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatorio_1.insightsRisks.map((insight, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-slate-700">
                            {insight}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={idx === 0 ? 'destructive' : 'secondary'}
                            >
                              {idx === 0 ? 'Alta' : 'Média'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="porter" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>As 5 Forças Competitivas</CardTitle>
              <CardDescription>
                Analise o ambiente competitivo da sua clínica.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Rivalidade entre Concorrentes</Label>
                <Textarea
                  defaultValue={diagnosis.porter.rivalry}
                  className="min-h-[100px]"
                  placeholder="Quão intensa é a competição?"
                />
              </div>
              <div className="space-y-2">
                <Label>Poder de Negociação dos Clientes</Label>
                <Textarea
                  defaultValue={diagnosis.porter.buyers}
                  className="min-h-[100px]"
                  placeholder="Os pacientes são sensíveis a preço ou qualidade?"
                />
              </div>
              <div className="space-y-2">
                <Label>Ameaça de Novos Entrantes</Label>
                <Textarea
                  defaultValue={diagnosis.porter.newEntrants}
                  className="min-h-[100px]"
                  placeholder="É fácil abrir uma clínica concorrente?"
                />
              </div>
              <div className="space-y-2">
                <Label>Ameaça de Produtos Substitutos</Label>
                <Textarea
                  defaultValue={diagnosis.porter.substitutes}
                  className="min-h-[100px]"
                  placeholder="Ex: Terapias alternativas, automedicação..."
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Poder dos Fornecedores</Label>
                <Textarea
                  defaultValue={diagnosis.porter.suppliers}
                  className="min-h-[80px]"
                  placeholder="Dependência de equipamentos ou insumos específicos?"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto bg-teal-600 hover:bg-teal-700 text-white">
                Salvar Análise
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="rumelt" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="size-5 text-teal-600" />
                  Definição do Problema (Kernel)
                </CardTitle>
                <CardDescription>
                  O segredo de uma boa estratégia é o diagnóstico honesto dos
                  obstáculos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-base">
                    1. Qual é o desafio crucial?
                  </Label>
                  <Input
                    value={rumeltData.challenge}
                    onChange={(e) =>
                      setRumeltData({
                        ...rumeltData,
                        challenge: e.target.value,
                      })
                    }
                    placeholder="Ex: Perda de pacientes após a primeira consulta..."
                  />
                  <p className="text-xs text-slate-500">
                    Defina o problema em uma frase simples e direta.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base">
                    2. Quais são os principais obstáculos?
                  </Label>
                  <Textarea
                    value={rumeltData.obstacles}
                    onChange={(e) =>
                      setRumeltData({
                        ...rumeltData,
                        obstacles: e.target.value,
                      })
                    }
                    placeholder="Listar complexidades, processos falhos ou mudanças de mercado..."
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-50 border-teal-200">
              <CardHeader>
                <CardTitle className="text-teal-800">
                  Política Orientadora
                </CardTitle>
                <CardDescription>
                  Como vamos lidar com o desafio?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={rumeltData.policy}
                  onChange={(e) =>
                    setRumeltData({ ...rumeltData, policy: e.target.value })
                  }
                  className="min-h-[200px] bg-white border-teal-100 focus-visible:ring-teal-500"
                  placeholder="A política orientadora deve direcionar a ação..."
                />
                <Button
                  variant="outline"
                  onClick={generatePolicy}
                  className="w-full border-teal-200 text-teal-700 hover:bg-teal-50"
                >
                  <RefreshCw className="mr-2 size-4" />
                  Sugerir com AI
                </Button>
                <Button
                  onClick={handleSaveRumelt}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Save className="mr-2 size-4" />
                  Salvar Diagnóstico
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
