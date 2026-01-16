import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, RefreshCw, Loader2, AlertCircle, Download } from 'lucide-react'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { toast } from 'sonner'

interface SectionReportCardProps {
  report: any | null
  loading: boolean
  generating: boolean
  onGenerate: () => void
  sectionCode: string
  sectionTitle?: string
}

export default function SectionReportCard({
  report,
  loading,
  generating,
  onGenerate,
  sectionCode,
  sectionTitle,
}: SectionReportCardProps) {
  const displayTitle = sectionTitle || 'Relatório desta Seção'
  const [exporting, setExporting] = useState(false)

  const handleExportPDF = async () => {
    if (!report || !report.report_markdown) {
      toast.error('Nenhum relatório para exportar')
      return
    }

    setExporting(true)
    toast.info('Preparando PDF...')

    try {
      // Capturar o conteúdo do relatório
      const reportElement = document.getElementById(`report-content-${sectionCode}`)
      if (!reportElement) {
        throw new Error('Conteúdo do relatório não encontrado')
      }

      // Converter para canvas
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        logging: false,
        useCORS: true,
      })

      // Criar PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      // Adicionar primeira página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Adicionar páginas adicionais se necessário
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Salvar PDF
      const fileName = `relatorio-${sectionCode.toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)

      toast.success('PDF exportado com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar PDF:', error)
      toast.error('Erro ao exportar PDF')
    } finally {
      setExporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              {displayTitle}
            </CardTitle>
            <CardDescription>
              Relatório gerado por IA com análise e insights sobre esta seção
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {report && (
              <Button
                onClick={handleExportPDF}
                disabled={exporting}
                variant="outline"
                size="default"
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
              onClick={onGenerate}
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
                  Gerar Relatório
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-teal-600" />
          </div>
        ) : report ? (
          <div id={`report-content-${sectionCode}`} className="space-y-6">
            {report.status === 'error' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="size-5 text-red-600 dark:text-red-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Erro ao gerar relatório
                  </p>
                  {report.error_message && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {report.error_message}
                    </p>
                  )}
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Tente regenerar o relatório.
                  </p>
                </div>
              </div>
            )}
            
            {report.status === 'stale' && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <AlertCircle className="size-5 text-amber-600 dark:text-amber-400" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Este relatório está desatualizado. Os dados da seção foram alterados desde a última geração.
                </p>
              </div>
            )}

            {/* CONTEÚDO PRINCIPAL: Markdown do relatório */}
            {report.report_markdown && (
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <MarkdownRenderer content={report.report_markdown} />
              </div>
            )}

            {/* INSIGHTS COMO COMPLEMENTO - Após o markdown (apenas seções relevantes) */}
            {report.insights && (
              <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">

                {/* Resumo da Identidade (apenas para IDENTITY) */}
                {report.insights.identity_summary && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Resumo da Identidade</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {report.insights.identity_summary.purpose && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Propósito</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{report.insights.identity_summary.purpose}</p>
                        </div>
                      )}
                      {report.insights.identity_summary.vision && (
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                          <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">Visão</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{report.insights.identity_summary.vision}</p>
                        </div>
                      )}
                      {report.insights.identity_summary.priority_audience && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">Público Prioritário</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{report.insights.identity_summary.priority_audience}</p>
                        </div>
                      )}
                      {report.insights.identity_summary.positioning && (
                        <div className="p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg">
                          <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1">Posicionamento</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{report.insights.identity_summary.positioning}</p>
                        </div>
                      )}
                    </div>
                    {report.insights.identity_summary.values && report.insights.identity_summary.values.length > 0 && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2">Valores</p>
                        <div className="flex flex-wrap gap-2">
                          {report.insights.identity_summary.values.map((value: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="bg-white dark:bg-slate-800">
                              {value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Alertas */}
                {report.insights.alerts && report.insights.alerts.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Alertas</h3>
                    {report.insights.alerts.map((alert: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border ${
                          alert.severity === 'high'
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            : alert.severity === 'medium'
                              ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        <p className="font-medium text-sm">{alert.title}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{alert.detail}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recomendações */}
                {report.insights.recommendations && report.insights.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Recomendações</h3>
                    {report.insights.recommendations
                      .sort((a: any, b: any) => (b.priority || 0) - (a.priority || 0))
                      .map((rec: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-medium text-sm">{rec.title}</p>
                            <Badge variant="outline" className="text-xs">
                              Prioridade {rec.priority || 0}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{rec.detail}</p>
                        </div>
                      ))}
                  </div>
                )}

                {/* Checklist */}
                {report.insights.checklist && report.insights.checklist.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Checklist de Melhoria</h3>
                    <div className="space-y-2">
                      {report.insights.checklist.map((item: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                        >
                          <input type="checkbox" className="mt-1" />
                          <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dados Faltantes */}
                {report.insights.missing_data && report.insights.missing_data.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Dados Faltantes</h3>
                    {report.insights.missing_data.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                      >
                        <p className="font-medium text-sm">{item.item}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.why_it_matters}</p>
                        {item.how_to_fill && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                            Como preencher: {item.how_to_fill}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <FileText className="size-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum relatório gerado ainda.</p>
            <p className="text-sm mt-1">Clique em "Gerar Relatório" para criar um relatório com análise e insights.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

