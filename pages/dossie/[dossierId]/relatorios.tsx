import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { api } from '@/lib/api'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Loader2, FileText, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function DossierReports() {
  const router = useRouter()
  const { dossierId } = router.query
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (dossierId && typeof dossierId === 'string') {
      loadReports()
    }
  }, [dossierId])

  const loadReports = async () => {
    if (!dossierId || typeof dossierId !== 'string') return

    setLoading(true)
    try {
      const data = await api.getDossierReports(dossierId)
      setSections(data)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar relatórios')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-teal-600" />
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'generated':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle2 className="size-3 mr-1" />
            Atualizado
          </Badge>
        )
      case 'stale':
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            <AlertCircle className="size-3 mr-1" />
            Desatualizado
          </Badge>
        )
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <AlertCircle className="size-3 mr-1" />
            Erro
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <Clock className="size-3 mr-1" />
            Não gerado
          </Badge>
        )
    }
  }

  const getSectionRoute = (sectionCode: string) => {
    const routeMap: Record<string, string> = {
      IDENTITY: 'identity',
      BUSINESS_MODEL: 'business-model',
      MARKET: 'market',
      OFFER: 'offer',
      OPERATIONS: 'operations',
      PEOPLE: 'people',
      STRATEGY: 'strategy',
      PLAN: 'plan',
      FINAL_REPORT: 'final-report',
    }
    return routeMap[sectionCode] || sectionCode.toLowerCase()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Relatórios do Dossiê
          </h1>
          <p className="text-slate-500 mt-1">
            Visão geral dos relatórios gerados por IA para cada seção
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {sections.map((item) => {
          const section = item.section
          const report = item.report

          return (
            <Card key={section.code}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="size-5" />
                      {section.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {section.description || 'Sem descrição'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {report ? getStatusBadge(report.status) : getStatusBadge('not_generated')}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 dark:text-slate-400">Completude da Seção</span>
                      <span className="font-semibold">{section.completion_percent || 0}%</span>
                    </div>
                    <Progress value={section.completion_percent || 0} className="h-2" />
                  </div>

                  {report && report.insights && (
                    <div className="grid grid-cols-4 gap-2">
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Clareza</p>
                        <p className="text-lg font-bold">{report.insights.score?.clarity || 0}/10</p>
                      </div>
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Consistência</p>
                        <p className="text-lg font-bold">{report.insights.score?.consistency || 0}/10</p>
                      </div>
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Completude</p>
                        <p className="text-lg font-bold">{report.insights.score?.completeness || 0}/10</p>
                      </div>
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Potencial</p>
                        <p className="text-lg font-bold">{report.insights.score?.impact_potential || 0}/10</p>
                      </div>
                    </div>
                  )}

                  {report && (
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      <p>
                        Gerado em:{' '}
                        {new Date(report.created_at).toLocaleString('pt-BR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </p>
                      {report.status === 'stale' && (
                        <p className="text-amber-600 dark:text-amber-400 mt-1">
                          Dados da seção foram alterados após a geração
                        </p>
                      )}
                      {report.status === 'error' && (
                        <p className="text-red-600 dark:text-red-400 mt-1">
                          Erro ao gerar relatório. Tente regenerar.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dossie/${dossierId}/${getSectionRoute(section.code)}`}>
                        Ver Seção
                      </Link>
                    </Button>
                    {report && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await api.generateSectionReport(dossierId as string, section.code)
                            toast.success('Relatório regenerado!')
                            await loadReports()
                          } catch (error: any) {
                            toast.error(error.message || 'Erro ao regenerar relatório')
                          }
                        }}
                      >
                        Regenerar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
