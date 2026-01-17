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
import { toast } from 'sonner'

// Tipos para segmentos de texto
interface TextSegment {
  text: string
  type: 'h1' | 'h2' | 'h3' | 'paragraph' | 'list-item' | 'separator'
}

// Função para parsear markdown em segmentos estruturados
function parseMarkdownToSegments(markdown: string): TextSegment[] {
  const segments: TextSegment[] = []
  const lines = markdown.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (!line) {
      if (segments.length > 0 && segments[segments.length - 1].type !== 'separator') {
        segments.push({ text: '', type: 'separator' })
      }
      continue
    }

    // Headers
    if (line.startsWith('### ')) {
      segments.push({ text: line.replace(/^###\s+/, ''), type: 'h3' })
    } else if (line.startsWith('## ')) {
      segments.push({ text: line.replace(/^##\s+/, ''), type: 'h2' })
    } else if (line.startsWith('# ')) {
      segments.push({ text: line.replace(/^#\s+/, ''), type: 'h1' })
    }
    // Listas
    else if (line.match(/^\s*[-*+]\s+/)) {
      const text = line.replace(/^\s*[-*+]\s+/, '')
      segments.push({ text: `• ${cleanInlineMarkdown(text)}`, type: 'list-item' })
    }
    else if (line.match(/^\s*\d+\.\s+/)) {
      const text = line.replace(/^\s*\d+\.\s+/, '')
      const num = line.match(/^\s*(\d+)\./)?.[1] || '1'
      segments.push({ text: `${num}. ${cleanInlineMarkdown(text)}`, type: 'list-item' })
    }
    // Parágrafos
    else {
      segments.push({ text: cleanInlineMarkdown(line), type: 'paragraph' })
    }
  }

  return segments
}

// Limpar formatação inline do markdown
function cleanInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .trim()
}

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
      // Criar PDF com jsPDF diretamente (texto nativo, fontes grandes e legíveis)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const marginLeft = 25
      const marginRight = 25
      const marginTop = 30
      const marginBottom = 25
      const maxWidth = pageWidth - marginLeft - marginRight
      let yPosition = marginTop

      // Configurações de tipografia - fontes grandes para boa legibilidade
      const typography = {
        h1: { size: 22, lineHeight: 11, spaceBefore: 12, spaceAfter: 7, font: 'bold' as const },
        h2: { size: 18, lineHeight: 9, spaceBefore: 10, spaceAfter: 5, font: 'bold' as const },
        h3: { size: 15, lineHeight: 8, spaceBefore: 8, spaceAfter: 4, font: 'bold' as const },
        paragraph: { size: 12, lineHeight: 6, spaceBefore: 0, spaceAfter: 4, font: 'normal' as const },
        'list-item': { size: 12, lineHeight: 6, spaceBefore: 0, spaceAfter: 3, font: 'normal' as const },
        separator: { size: 12, lineHeight: 5, spaceBefore: 0, spaceAfter: 0, font: 'normal' as const },
      }

      // Função para adicionar nova página se necessário
      const checkPageBreak = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - marginBottom) {
          pdf.addPage()
          yPosition = marginTop
          return true
        }
        return false
      }

      // Função auxiliar para adicionar texto com quebra de linha
      const addText = (text: string, style: keyof typeof typography, indent: number = 0) => {
        const config = typography[style]

        if (config.spaceBefore > 0) {
          checkPageBreak(config.spaceBefore)
          yPosition += config.spaceBefore
        }

        pdf.setFontSize(config.size)
        pdf.setFont('helvetica', config.font)

        const effectiveMaxWidth = maxWidth - indent
        const lines = pdf.splitTextToSize(text, effectiveMaxWidth)

        for (const line of lines) {
          checkPageBreak(config.lineHeight)
          pdf.text(line, marginLeft + indent, yPosition)
          yPosition += config.lineHeight
        }

        if (config.spaceAfter > 0) {
          yPosition += config.spaceAfter
        }
      }

      // Título da seção no topo
      pdf.setFontSize(26)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(0, 128, 128) // Teal
      const title = sectionTitle || `Relatório - ${sectionCode}`
      pdf.text(title, pageWidth / 2, yPosition, { align: 'center' })
      pdf.setTextColor(0, 0, 0)
      yPosition += 15

      // Linha decorativa
      pdf.setDrawColor(0, 128, 128)
      pdf.setLineWidth(0.8)
      pdf.line(marginLeft + 20, yPosition, pageWidth - marginRight - 20, yPosition)
      yPosition += 15

      // Data de geração
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'italic')
      pdf.setTextColor(100, 100, 100)
      const date = new Date().toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
      pdf.text(`Gerado em ${date}`, pageWidth / 2, yPosition, { align: 'center' })
      pdf.setTextColor(0, 0, 0)
      yPosition += 15

      // Parsear e renderizar o markdown
      const segments = parseMarkdownToSegments(report.report_markdown)

      for (const segment of segments) {
        if (segment.type === 'separator') {
          yPosition += typography.separator.lineHeight
          continue
        }

        const indent = segment.type === 'list-item' ? 5 : 0
        addText(segment.text, segment.type, indent)
      }

      // Numeração de páginas
      const totalPages = pdf.internal.pages.length - 1
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(120, 120, 120)
        pdf.text(`${i} / ${totalPages}`, pageWidth / 2, pageHeight - 15, { align: 'center' })
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

