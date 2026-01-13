import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getSectionData,
  saveAnswers,
  calculateSectionCompletion,
  type SectionData,
  type Question,
  type AnswerInput,
} from '@/services/dossierService'
import {
  getCustomerSegments,
  createCustomerSegment,
  updateCustomerSegment,
  deleteCustomerSegment,
} from '@/services/entityService'
import {
  getValuePropositions,
  createValueProposition,
  updateValueProposition,
  deleteValueProposition,
} from '@/services/entityService'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Save, Plus, Edit, Trash2, Loader2, Users, Award, FileText, RefreshCw, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { api } from '@/lib/api'

export default function DossierIdentity() {
  const { dossierId } = useParams<{ dossierId: string }>()
  const navigate = useNavigate()
  const [sectionData, setSectionData] = useState<SectionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [completionPercent, setCompletionPercent] = useState(0)

  // Estados para entidades
  const [customerSegments, setCustomerSegments] = useState<any[]>([])
  const [valuePropositions, setValuePropositions] = useState<any[]>([])

  // Estados para formulários
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [editingSegment, setEditingSegment] = useState<any | null>(null)
  const [editingProposition, setEditingProposition] = useState<any | null>(null)
  const [segmentDialogOpen, setSegmentDialogOpen] = useState(false)
  const [propositionDialogOpen, setPropositionDialogOpen] = useState(false)

  // Estados para relatório
  const [report, setReport] = useState<any | null>(null)
  const [loadingReport, setLoadingReport] = useState(false)
  const [generatingReport, setGeneratingReport] = useState(false)

  useEffect(() => {
    if (dossierId) {
      loadSectionData()
      loadEntities()
      loadReport()
    }
  }, [dossierId])

  const loadSectionData = async () => {
    if (!dossierId) return

    setLoading(true)
    try {
      const data = await getSectionData(dossierId, 'IDENTITY')
      setSectionData(data)

      // Carregar respostas existentes
      const answersMap: Record<string, any> = {}
      data.questionSets.forEach((qs) => {
        qs.questions.forEach((q) => {
          if (q.answer) {
            answersMap[q.id] = {
              valueText: q.answer.value_text,
              valueNumber: q.answer.value_number,
              valueJson: q.answer.value_json,
            }
          }
        })
      })
      setAnswers(answersMap)

      // Calcular completude
      const percent = await calculateSectionCompletion(dossierId, 'IDENTITY')
      setCompletionPercent(percent)
    } catch (error) {
      console.error('Erro ao carregar dados da seção:', error)
      toast.error('Erro ao carregar dados da seção')
    } finally {
      setLoading(false)
    }
  }

  const loadEntities = async () => {
    if (!dossierId) return

    try {
      const [segments, propositions] = await Promise.all([
        getCustomerSegments(dossierId),
        getValuePropositions(dossierId),
      ])
      setCustomerSegments(segments)
      setValuePropositions(propositions)
    } catch (error) {
      console.error('Erro ao carregar entidades:', error)
    }
  }

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleSaveAnswers = async () => {
    if (!dossierId || !sectionData) return

    setSaving(true)
    try {
      const answerInputs: AnswerInput[] = []

      sectionData.questionSets.forEach((qs) => {
        qs.questions.forEach((q) => {
          const answer = answers[q.id]
          if (answer) {
            answerInputs.push({
              questionId: q.id,
              valueText: answer.valueText,
              valueNumber: answer.valueNumber,
              valueJson: answer.valueJson,
              source: 'user',
            })
          }
        })
      })

      await saveAnswers(dossierId, answerInputs)
      toast.success('Respostas salvas com sucesso!')
      
      // Recalcular completude
      const percent = await calculateSectionCompletion(dossierId, 'IDENTITY')
      setCompletionPercent(percent)
      
      // Recarregar dados
      await loadSectionData()
    } catch (error: any) {
      console.error('Erro ao salvar respostas:', error)
      toast.error(error.message || 'Erro ao salvar respostas')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSegment = async (data: any) => {
    if (!dossierId) return

    try {
      if (editingSegment) {
        await updateCustomerSegment(dossierId, editingSegment.id, data)
        toast.success('Segmento atualizado!')
      } else {
        await createCustomerSegment(dossierId, data)
        toast.success('Segmento criado!')
      }
      setSegmentDialogOpen(false)
      setEditingSegment(null)
      await loadEntities()
      const percent = await calculateSectionCompletion(dossierId, 'IDENTITY')
      setCompletionPercent(percent)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar segmento')
    }
  }

  const handleDeleteSegment = async (id: string) => {
    if (!dossierId) return

    if (!confirm('Tem certeza que deseja excluir este segmento?')) return

    try {
      await deleteCustomerSegment(dossierId, id)
      toast.success('Segmento excluído!')
      await loadEntities()
      const percent = await calculateSectionCompletion(dossierId, 'IDENTITY')
      setCompletionPercent(percent)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir segmento')
    }
  }

  const handleSaveProposition = async (data: any) => {
    if (!dossierId) return

    try {
      if (editingProposition) {
        await updateValueProposition(dossierId, editingProposition.id, data)
        toast.success('Proposta de valor atualizada!')
      } else {
        await createValueProposition(dossierId, data)
        toast.success('Proposta de valor criada!')
      }
      setPropositionDialogOpen(false)
      setEditingProposition(null)
      await loadEntities()
      const percent = await calculateSectionCompletion(dossierId, 'IDENTITY')
      setCompletionPercent(percent)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar proposta de valor')
    }
  }

  const handleDeleteProposition = async (id: string) => {
    if (!dossierId) return

    if (!confirm('Tem certeza que deseja excluir esta proposta de valor?')) return

    try {
      await deleteValueProposition(dossierId, id)
      toast.success('Proposta de valor excluída!')
      await loadEntities()
      const percent = await calculateSectionCompletion(dossierId, 'IDENTITY')
      setCompletionPercent(percent)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir proposta de valor')
    }
  }

  const loadReport = async () => {
    if (!dossierId) return

    setLoadingReport(true)
    try {
      const reportData = await api.getSectionReport(dossierId, 'IDENTITY')
      setReport(reportData)
    } catch (error: any) {
      if (error.message?.includes('404') || error.message?.includes('não gerado')) {
        setReport(null)
      } else {
        console.error('Erro ao carregar relatório:', error)
      }
    } finally {
      setLoadingReport(false)
    }
  }

  const handleGenerateReport = async () => {
    if (!dossierId) return

    setGeneratingReport(true)
    try {
      const newReport = await api.generateSectionReport(dossierId, 'IDENTITY')
      setReport(newReport)
      toast.success('Relatório gerado com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao gerar relatório')
    } finally {
      setGeneratingReport(false)
    }
  }

  const renderQuestion = (question: Question) => {
    const answer = answers[question.id] || {}

    switch (question.type) {
      case 'textarea':
        return (
          <Textarea
            value={answer.valueText || ''}
            onChange={(e) =>
              handleAnswerChange(question.id, {
                ...answer,
                valueText: e.target.value,
              })
            }
            placeholder={question.help_text}
            className="min-h-[100px]"
          />
        )

      case 'single_select':
        return (
          <RadioGroup
            value={answer.valueText || ''}
            onValueChange={(value) =>
              handleAnswerChange(question.id, {
                ...answer,
                valueText: value,
              })
            }
          >
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.id} />
                <Label htmlFor={option.id} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      default:
        return (
          <Input
            value={answer.valueText || ''}
            onChange={(e) =>
              handleAnswerChange(question.id, {
                ...answer,
                valueText: e.target.value,
              })
            }
            placeholder={question.help_text}
          />
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

  if (!sectionData) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-500">Dados da seção não encontrados</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {sectionData.section.name}
          </h1>
          <p className="text-slate-500 mt-1">{sectionData.section.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-48">
            <div className="flex justify-between text-sm mb-1">
              <span>Completude</span>
              <span className="font-semibold">{completionPercent}%</span>
            </div>
            <Progress value={completionPercent} className="h-2" />
          </div>
          <Button onClick={handleSaveAnswers} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Bloco 1: Segmentos de Cliente */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5" />
                Segmentos de Cliente
              </CardTitle>
              <CardDescription>
                Defina os principais segmentos de clientes que a clínica atende
              </CardDescription>
            </div>
            <Dialog
              open={segmentDialogOpen}
              onOpenChange={(open) => {
                setSegmentDialogOpen(open)
                if (!open) setEditingSegment(null)
              }}
            >
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 size-4" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <SegmentForm
                  segment={editingSegment}
                  segments={customerSegments}
                  onSave={handleSaveSegment}
                  onCancel={() => {
                    setSegmentDialogOpen(false)
                    setEditingSegment(null)
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {customerSegments.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              Nenhum segmento cadastrado. Clique em "Adicionar" para criar o primeiro.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerSegments.map((segment) => (
                  <TableRow key={segment.id}>
                    <TableCell className="font-medium">{segment.name}</TableCell>
                    <TableCell>{segment.description || '-'}</TableCell>
                    <TableCell>
                      {segment.priority ? `Prioridade ${segment.priority}` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingSegment(segment)
                            setSegmentDialogOpen(true)
                          }}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSegment(segment.id)}
                        >
                          <Trash2 className="size-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Bloco 2: Propostas de Valor */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="size-5" />
                Propostas de Valor
              </CardTitle>
              <CardDescription>
                Defina as propostas de valor oferecidas pela clínica
              </CardDescription>
            </div>
            <Dialog
              open={propositionDialogOpen}
              onOpenChange={(open) => {
                setPropositionDialogOpen(open)
                if (!open) setEditingProposition(null)
              }}
            >
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 size-4" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <PropositionForm
                  proposition={editingProposition}
                  segments={customerSegments}
                  onSave={handleSaveProposition}
                  onCancel={() => {
                    setPropositionDialogOpen(false)
                    setEditingProposition(null)
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {valuePropositions.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              Nenhuma proposta de valor cadastrada. Clique em "Adicionar" para criar a primeira.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Segmento Alvo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {valuePropositions.map((proposition) => (
                  <TableRow key={proposition.id}>
                    <TableCell className="font-medium">{proposition.title}</TableCell>
                    <TableCell>{proposition.description || '-'}</TableCell>
                    <TableCell>
                      {proposition.target_segment_name || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingProposition(proposition)
                            setPropositionDialogOpen(true)
                          }}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProposition(proposition.id)}
                        >
                          <Trash2 className="size-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Bloco 3: Questionário */}
      {sectionData.questionSets.map((questionSet) => (
        <Card key={questionSet.id}>
          <CardHeader>
            <CardTitle>{questionSet.name}</CardTitle>
            {questionSet.subsection_name && (
              <CardDescription>{questionSet.subsection_name}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {questionSet.questions.map((question) => (
              <div key={question.id} className="space-y-2">
                <Label className="text-base font-semibold">
                  {question.text}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {question.help_text && (
                  <p className="text-sm text-slate-500">{question.help_text}</p>
                )}
                {renderQuestion(question)}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Card de Relatório */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5" />
                Relatório desta Seção
              </CardTitle>
              <CardDescription>
                Relatório gerado por IA com análise e insights sobre a identidade estratégica
              </CardDescription>
            </div>
            <Button
              onClick={handleGenerateReport}
              disabled={generatingReport}
              variant={report ? 'outline' : 'default'}
            >
              {generatingReport ? (
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
          {loadingReport ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-teal-600" />
            </div>
          ) : report ? (
            <div className="space-y-6">
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
    </div>
  )
}

// Componente de formulário para Segmento
function SegmentForm({
  segment,
  segments,
  onSave,
  onCancel,
}: {
  segment?: any
  segments: any[]
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(segment?.name || '')
  const [description, setDescription] = useState(segment?.description || '')
  const [priority, setPriority] = useState(segment?.priority || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      priority: priority ? parseInt(priority) : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {segment ? 'Editar Segmento' : 'Novo Segmento de Cliente'}
        </DialogTitle>
        <DialogDescription>
          Defina as características do segmento de cliente
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="segment-name">Nome *</Label>
          <Input
            id="segment-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Pacientes adultos 35-55 anos"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="segment-description">Descrição</Label>
          <Textarea
            id="segment-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva as características deste segmento"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="segment-priority">Prioridade (1-5)</Label>
          <Input
            id="segment-priority"
            type="number"
            min="1"
            max="5"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            placeholder="1 = maior prioridade"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar</Button>
      </DialogFooter>
    </form>
  )
}

// Componente de formulário para Proposta de Valor
function PropositionForm({
  proposition,
  segments,
  onSave,
  onCancel,
}: {
  proposition?: any
  segments: any[]
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(proposition?.title || '')
  const [description, setDescription] = useState(proposition?.description || '')
  const [targetSegmentId, setTargetSegmentId] = useState(proposition?.target_segment_id || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Título é obrigatório')
      return
    }
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      targetSegmentId: targetSegmentId || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {proposition ? 'Editar Proposta de Valor' : 'Nova Proposta de Valor'}
        </DialogTitle>
        <DialogDescription>
          Defina a proposta de valor oferecida pela clínica
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="proposition-title">Título *</Label>
          <Input
            id="proposition-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Tratamento personalizado com tecnologia avançada"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="proposition-description">Descrição</Label>
          <Textarea
            id="proposition-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva detalhadamente a proposta de valor"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="proposition-segment">Segmento Alvo</Label>
          <select
            id="proposition-segment"
            value={targetSegmentId}
            onChange={(e) => setTargetSegmentId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Nenhum</option>
            {segments.map((segment) => (
              <option key={segment.id} value={segment.id}>
                {segment.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar</Button>
      </DialogFooter>
    </form>
  )
}

