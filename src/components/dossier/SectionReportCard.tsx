import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import MarkdownRenderer from '@/components/MarkdownRenderer'

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
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-teal-600" />
          </div>
        ) : report ? (
          <div className="space-y-6">
            {report.status === 'error' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="size-5 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-800 dark:text-red-200">
                  Erro ao gerar relatório. Tente regenerar o relatório.
                </p>
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

            {report.insights && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Clareza</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {report.insights.score?.clarity || 0}/10
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Consistência</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {report.insights.score?.consistency || 0}/10
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Completude</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {report.insights.score?.completeness || 0}/10
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Potencial</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {report.insights.score?.impact_potential || 0}/10
                  </p>
                </div>
              </div>
            )}

            {report.insights?.alerts && report.insights.alerts.length > 0 && (
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

            {report.report_markdown && (
              <div className="mt-6 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <MarkdownRenderer content={report.report_markdown} />
              </div>
            )}

            {report.insights?.recommendations && report.insights.recommendations.length > 0 && (
              <div className="mt-6 space-y-2">
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

            {report.insights?.missing_data && report.insights.missing_data.length > 0 && (
              <div className="mt-6 space-y-2">
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

