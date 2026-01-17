import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { fetchAPI } from '@/lib/api'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Loader2,
  AlertCircle,
  FileText,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
} from 'lucide-react'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'

interface FinalReportData {
  report?: {
    id: string
    report_markdown: string
    insights: any
    generated_at: string
  }
  sections?: Array<{
    section_code: string
    section_name: string
    has_report: boolean
    is_stale: boolean
  }>
  missing_sections?: string[]
  stale_sections?: string[]
}

export default function DossierFinalReportPage() {
  const router = useRouter()
  const dossierId = typeof router.query.dossierId === 'string' ? router.query.dossierId : undefined

  const [finalReport, setFinalReport] = useState<FinalReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (dossierId) {
      loadFinalReport()
    }
  }, [dossierId])

  const loadFinalReport = async () => {
    if (!dossierId) return

    setLoading(true)
    try {
      const data = await fetchAPI(`/dossiers/${dossierId}/final-report`)
      setFinalReport(data)
    } catch (error: any) {
      console.error('Erro ao carregar relatório final:', error)
      if (error.message !== 'Relatório final ainda não foi gerado') {
        toast.error('Erro ao carregar relatório final')
      }
      setFinalReport(null)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    if (!dossierId) return

    setGenerating(true)
    try {
      await fetchAPI(`/dossiers/${dossierId}/final-report`, {
        method: 'POST',
      })
      toast.success('Relatório final gerado com sucesso!')
      await loadFinalReport()
    } catch (error: any) {
      console.error('Erro ao gerar relatório final:', error)
      toast.error(error.message || 'Erro ao gerar relatório final')
    } finally {
      setGenerating(false)
    }
  }

  const handleExportPDF = async () => {
    if (!dossierId) return

    try {
      // TODO: implementar exportação PDF
      toast.info('Exportação PDF em desenvolvimento')
    } catch (error: any) {
      console.error('Erro ao exportar PDF:', error)
      toast.error('Erro ao exportar PDF')
    }
  }

  const handleExportDOCX = async () => {
    if (!dossierId) return

    try {
      // TODO: implementar exportação DOCX
      toast.info('Exportação DOCX em desenvolvimento')
    } catch (error: any) {
      console.error('Erro ao exportar DOCX:', error)
      toast.error('Erro ao exportar DOCX')
    }
  }

  if (!dossierId) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
              <BookOpen className="size-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <CardTitle>Relatório Final Consolidado</CardTitle>
              <CardDescription className="mt-2">
                Documento estratégico oficial que consolida todas as análises setoriais em uma narrativa única
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Status das seções */}
      {finalReport?.sections && finalReport.sections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status dos Relatórios Setoriais</CardTitle>
            <CardDescription>
              Seções que alimentam o relatório final
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {finalReport.sections.map((section) => (
                <div key={section.section_code} className="flex items-center justify-between py-2">
                  <span className="font-medium">{section.section_name}</span>
                  <div className="flex items-center gap-2">
                    {section.has_report ? (
                      section.is_stale ? (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                          <AlertTriangle className="size-3 mr-1" />
                          Desatualizado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                          <CheckCircle2 className="size-3 mr-1" />
                          Atualizado
                        </Badge>
                      )
                    ) : (
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-300">
                        Não gerado
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas */}
      {finalReport?.missing_sections && finalReport.missing_sections.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>
            <strong>Seções sem relatório:</strong> {finalReport.missing_sections.join(', ')}.
            Gere os relatórios dessas seções antes de criar o relatório final para obter uma análise completa.
          </AlertDescription>
        </Alert>
      )}

      {finalReport?.stale_sections && finalReport.stale_sections.length > 0 && (
        <Alert>
          <AlertTriangle className="size-4" />
          <AlertDescription>
            <strong>Seções desatualizadas:</strong> {finalReport.stale_sections.join(', ')}.
            Os dados dessas seções foram alterados após a geração dos relatórios.
          </AlertDescription>
        </Alert>
      )}

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleGenerateReport}
              disabled={generating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {generating ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : finalReport?.report ? (
                <>
                  <RefreshCw className="size-4 mr-2" />
                  Atualizar Relatório
                </>
              ) : (
                <>
                  <FileText className="size-4 mr-2" />
                  Gerar Relatório Final
                </>
              )}
            </Button>

            {finalReport?.report && (
              <>
                <Button variant="outline" onClick={handleExportPDF}>
                  <Download className="size-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button variant="outline" onClick={handleExportDOCX}>
                  <Download className="size-4 mr-2" />
                  Exportar DOCX
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Relatório */}
      {finalReport?.report && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Relatório Consolidado</CardTitle>
                <CardDescription>
                  Gerado em {new Date(finalReport.report.generated_at).toLocaleString('pt-BR')}
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                <CheckCircle2 className="size-3 mr-1" />
                Disponível
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate max-w-none dark:prose-invert">
              <ReactMarkdown>{finalReport.report.report_markdown}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado vazio */}
      {!finalReport?.report && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="size-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Relatório Final ainda não foi gerado</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Clique em "Gerar Relatório Final" acima para consolidar todas as análises em um documento único
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
