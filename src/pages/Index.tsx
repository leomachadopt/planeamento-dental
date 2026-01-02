import { useStrategyStore } from '@/stores/useStrategyStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  Users,
  Target,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Calendar,
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Index() {
  const { diagnosis, okrs, actions } = useStrategyStore()

  const activeOkrs = okrs.slice(0, 3)
  const pendingActions = actions.filter((a) => a.status !== 'Act').slice(0, 5)

  // Mock calculation for overview cards
  const executionRate = Math.round(
    (actions.filter((a) => a.status === 'Act').length / (actions.length || 1)) *
      100,
  )

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Painel de Controle
          </h1>
          <p className="text-slate-500 mt-1">
            Visão geral do desempenho estratégico da clínica.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
          >
            Exportar Relatório
          </Button>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-200/50">
            Nova Análise
          </Button>
        </div>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-teal-500 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sustentabilidade Financeira
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">vs. mês anterior</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Satisfação (NPS)
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78</div>
            <p className="text-xs text-muted-foreground">Zona de Excelência</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Novos Pacientes
            </CardTitle>
            <Target className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">-2% da meta mensal</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Execução
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{executionRate}%</div>
            <Progress
              value={executionRate}
              className="h-2 mt-2 bg-purple-100"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Rumelt Diagnosis Card */}
        <Card className="lg:col-span-4 shadow-md bg-gradient-to-br from-white to-slate-50 border-teal-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <AlertCircle className="size-5 text-teal-600" />O Desafio Crucial
              (Diagnóstico)
            </CardTitle>
            <CardDescription>
              O "kernel" da sua estratégia atual baseado na metodologia Rumelt.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
              <h4 className="font-semibold text-slate-700 mb-2 text-sm uppercase tracking-wide">
                Desafio Identificado
              </h4>
              <p className="text-slate-600 leading-relaxed italic">
                "{diagnosis.rumelt.challenge}"
              </p>
            </div>
            <div className="p-4 bg-teal-50 rounded-lg border border-teal-100 shadow-inner">
              <h4 className="font-semibold text-teal-800 mb-2 text-sm uppercase tracking-wide">
                Política Orientadora
              </h4>
              <p className="text-teal-900 font-medium leading-relaxed">
                "{diagnosis.rumelt.policy}"
              </p>
            </div>
            <div className="flex justify-end">
              <Button
                variant="link"
                asChild
                className="text-teal-600 p-0 h-auto"
              >
                <Link to="/diagnostico" className="flex items-center gap-1">
                  Revisar Diagnóstico <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Strategic Map Preview & OKRs */}
        <Card className="lg:col-span-3 shadow-md">
          <CardHeader>
            <CardTitle>OKRs em Foco</CardTitle>
            <CardDescription>
              Top 3 objetivos prioritários para este trimestre.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {activeOkrs.map((okr) => (
              <div key={okr.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span
                    className="font-medium text-slate-700 truncate max-w-[200px]"
                    title={okr.objective}
                  >
                    {okr.objective}
                  </span>
                  <span className="text-slate-500 text-xs">
                    {okr.progress}%
                  </span>
                </div>
                <Progress value={okr.progress} className="h-2" />
              </div>
            ))}
            <div className="pt-2">
              <Button
                asChild
                variant="outline"
                className="w-full text-slate-600"
              >
                <Link to="/mapa-estrategico">
                  Ver Mapa Estratégico Completo
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Timeline */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5 text-slate-500" />
            Linha do Tempo de Ações (PDCA)
          </CardTitle>
          <CardDescription>
            Próximas entregas operacionais para garantir a execução da
            estratégia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {pendingActions.length > 0 ? (
              pendingActions.map((action) => (
                <div
                  key={action.id}
                  className="min-w-[280px] p-4 rounded-lg border bg-white flex flex-col justify-between gap-3 group hover:border-teal-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        variant={
                          action.status === 'Plan'
                            ? 'outline'
                            : action.status === 'Do'
                              ? 'secondary'
                              : 'default'
                        }
                        className="text-xs"
                      >
                        {action.status.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(action.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    <h4
                      className="font-medium text-slate-800 text-sm line-clamp-2"
                      title={action.title}
                    >
                      {action.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="size-6">
                      <AvatarFallback className="text-[10px] bg-slate-100 text-slate-600">
                        {action.owner.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-slate-500 truncate">
                      {action.owner}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full py-8 text-center text-slate-500">
                Nenhuma ação pendente. Bom trabalho!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
