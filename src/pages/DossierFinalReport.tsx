import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
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
import { Loader2, FileText, RefreshCw, Download, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { toast } from 'sonner'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export default function DossierFinalReport() {
  const { dossierId } = useParams<{ dossierId: string }>()
  const [report, setReport] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (dossierId) {
      loadReport()
    }
  }, [dossierId])

  const loadReport = async () => {
    if (!dossierId) return

    setLoading(true)
    try {
      const reportData = await api.getFinalReport(dossierId)
      setReport(reportData)
    } catch (error: any) {
      if (error.message?.includes('404') || error.message?.includes('não gerado')) {
        setReport(null)
      } else {
        console.error('Erro ao carregar relatório final:', error)
        toast.error('Erro ao carregar relatório final')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!dossierId) return

    setGenerating(true)
    try {
      const newReport = await api.generateFinalReport(dossierId)
      setReport(newReport)
      toast.success('Relatório final gerado com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao gerar relatório final')
    } finally {
      setGenerating(false)
    }
  }

  const handleExport = async (format: 'pdf' = 'pdf') => {
    if (!dossierId) return

    // Verificar se estamos no browser
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      toast.error('Exportação disponível apenas no navegador')
      return
    }

    setExporting(true)
    try {
      // Obter token de autenticação
      const authStorage = localStorage.getItem('auth-storage')
      let token = null
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage)
          token = parsed.state?.token || null
        } catch {
          // Ignorar erro de parsing
        }
      }

      // No Next.js, usar URL relativa ou variável de ambiente NEXT_PUBLIC_API_URL
      const apiUrl = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) || ''
      const baseUrl = apiUrl || '/api'
      const response = await fetch(`${baseUrl}/dossiers/${dossierId}/final-report/export?format=${format}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      })

      if (!response.ok) {
        throw new Error('Erro ao exportar relatório')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-final-${dossierId}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Relatório exportado com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao exportar relatório')
    } finally {
      setExporting(false)
    }
  }

  const getStatusBadge = () => {
    if (!report) {
      return (
        <Badge variant="outline">
          <Clock className="size-3 mr-1" />
          Não gerado
        </Badge>
      )
    }

    switch (report.status) {
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
            {report.status}
          </Badge>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Relatório Final
          </h1>
          <p className="text-slate-500 mt-1">
            Consolidação estratégica de todas as seções do dossiê
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {report && (
            <Button
              onClick={() => handleExport('pdf')}
              disabled={exporting}
              variant="outline"
            >
              {exporting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="mr-2 size-4" />
                  Exportar PDF
                </>
              )}
            </Button>
          )}
          <Button
            onClick={handleGenerate}
            disabled={generating}
            variant={report ? 'outline' : 'default'}
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Gerando...
              </>
            ) : report ? (
              <>
                <RefreshCw className="mr-2 size-4" />
                Regenerar
              </>
            ) : (
              <>
                <FileText className="mr-2 size-4" />
                Gerar Relatório Final
              </>
            )}
          </Button>
        </div>
      </div>

      {report && report.status === 'stale' && (
        <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertCircle className="size-5 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Este relatório está desatualizado. Algumas seções foram alteradas desde a última geração.
            Recomendamos regenerar o relatório para refletir as mudanças mais recentes.
          </p>
        </div>
      )}

      {report ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Painel lateral com resumos */}
          {report.insights && (
            <div className="lg:col-span-1 space-y-4">
              {/* Scores Globais */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Scores Globais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Clareza</span>
                      <span className="font-semibold">{report.insights.global_score?.clarity || 0}/10</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-teal-600 h-2 rounded-full"
                        style={{ width: `${((report.insights.global_score?.clarity || 0) / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Consistência</span>
                      <span className="font-semibold">{report.insights.global_score?.consistency || 0}/10</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-teal-600 h-2 rounded-full"
                        style={{ width: `${((report.insights.global_score?.consistency || 0) / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Completude</span>
                      <span className="font-semibold">{report.insights.global_score?.completeness || 0}/10</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-teal-600 h-2 rounded-full"
                        style={{ width: `${((report.insights.global_score?.completeness || 0) / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Potencial</span>
                      <span className="font-semibold">{report.insights.global_score?.impact_potential || 0}/10</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-teal-600 h-2 rounded-full"
                        style={{ width: `${((report.insights.global_score?.impact_potential || 0) / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Prioridades */}
              {report.insights.top_priorities && report.insights.top_priorities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Top Prioridades</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {report.insights.top_priorities.slice(0, 5).map((priority: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-xs">
                        <div className="font-semibold mb-1">{priority.rank}. {priority.title}</div>
                        <div className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2">
                          {priority.rationale}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Riscos Críticos */}
              {report.insights.critical_risks && report.insights.critical_risks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Riscos Críticos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {report.insights.critical_risks
                      .filter((r: any) => r.severity === 'high')
                      .slice(0, 5)
                      .map((risk: any, idx: number) => (
                        <div key={idx} className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs">
                          <div className="font-semibold mb-1 text-red-800 dark:text-red-200">
                            {risk.title}
                          </div>
                          <div className="text-red-600 dark:text-red-400 text-xs line-clamp-2">
                            {risk.detail}
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Conteúdo principal */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Relatório Estratégico Consolidado</CardTitle>
                <CardDescription>
                  Gerado em:{' '}
                  {new Date(report.created_at).toLocaleString('pt-PT', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <MarkdownRenderer content={report.report_markdown} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="size-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-semibold mb-2">Nenhum relatório final gerado</h3>
            <p className="text-slate-500 mb-6">
              Gere um relatório final consolidado que integra todas as análises setoriais em uma
              narrativa estratégica única.
            </p>
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <FileText className="mr-2 size-4" />
                  Gerar Relatório Final
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}




