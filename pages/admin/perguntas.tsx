import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Plus, Edit, Trash2, Save, X, ChevronDown, ChevronUp, FileText, Copy, Upload, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'

// Função helper para fazer fetch com autenticação
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token 
    : null

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Não autorizado')
    }

    // Tentar extrair mensagem de erro do JSON
    try {
      const errorData = await response.json()
      console.log('❌ Erro da API:', errorData)
      const error = new Error(errorData.error || errorData.message || `Erro: ${response.status}`)
      // Adicionar dados extras do erro (como existingId) ao objeto de erro
      if (errorData.existingId) {
        (error as any).existingId = errorData.existingId
      }
      if (errorData.existingText) {
        (error as any).existingText = errorData.existingText
      }
      throw error
    } catch (jsonError: any) {
      if (jsonError instanceof Error && jsonError.message !== `Erro: ${response.status}`) {
        throw jsonError
      }
      throw new Error(`Erro: ${response.status}`)
    }
  }

  return response.json()
}

interface QuestionContext {
  why?: string
  consequences?: string[]
  how_to_answer?: string
  good_examples?: string[]
  bad_examples?: string[]
  show_why?: boolean
  show_consequences?: boolean
  show_how_to_answer?: boolean
  show_good_examples?: boolean
  show_bad_examples?: boolean
}

interface QuestionOption {
  id?: string
  label: string
  value: string
  order_index: number
}

interface ValidationSchema {
  min_length?: number
  max_length?: number
  pattern?: string
  [key: string]: any
}

interface Question {
  id?: string
  question_set_id: string
  code: string
  text: string
  help_text?: string
  type: 'text' | 'textarea' | 'single_select' | 'multi_select'
  required: boolean
  order_index: number
  ai_importance_weight?: number
  validation_schema?: ValidationSchema
  options?: QuestionOption[]
  context?: QuestionContext
  section_code?: string
  section_name?: string
  question_set_name?: string
}

interface Section {
  id: string
  code: string
  name: string
  questionSets: Array<{
    id: string
    name: string
    subsection_name?: string
  }>
}

export default function PerguntasAdmin() {
  const router = useRouter()
  const { sectionCode } = router.query
  const [sections, setSections] = useState<Section[]>([])
  const [selectedSection, setSelectedSection] = useState<string>('')
  const [selectedQuestionSet, setSelectedQuestionSet] = useState<string>('all')
  const [questions, setQuestions] = useState<Question[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [bulkImportModalOpen, setBulkImportModalOpen] = useState(false)
  const [bulkJsonInput, setBulkJsonInput] = useState('')
  const [bulkImporting, setBulkImporting] = useState(false)

  useEffect(() => {
    loadSections()
  }, [])

  useEffect(() => {
    if (sectionCode && typeof sectionCode === 'string') {
      setSelectedSection(sectionCode)
      // Não carregar aqui, deixar o próximo useEffect fazer isso
    }
  }, [sectionCode])

  useEffect(() => {
    if (!selectedSection) return
    
    if (selectedQuestionSet && selectedQuestionSet !== 'all') {
      loadQuestions(selectedSection, selectedQuestionSet)
    } else {
      loadQuestions(selectedSection)
    }
  }, [selectedSection, selectedQuestionSet])

  const loadSections = async () => {
    try {
      const data = await fetchAPI('/admin/sections')
      setSections(data)
      
      if (data.length > 0 && !selectedSection) {
        setSelectedSection(data[0].code)
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar seções')
    }
  }

  const loadQuestions = async (sectionCode: string, questionSetId?: string) => {
    setLoading(true)
    try {
      let url = `/admin/questions?sectionCode=${sectionCode}`
      if (questionSetId) {
        url += `&questionSetId=${questionSetId}`
      }
      const data = await fetchAPI(url)
      setQuestions(data)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar perguntas')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (question: Question) => {
    console.log('💾 Salvando pergunta:', {
      id: question.id,
      code: question.code,
      question_set_id: question.question_set_id,
      isEdit: !!question.id
    })

    try {
      // Limpar validation_schema: remover propriedades undefined e tratar objeto vazio
      let cleanedValidationSchema = question.validation_schema
      if (cleanedValidationSchema && typeof cleanedValidationSchema === 'object') {
        const cleaned = Object.fromEntries(
          Object.entries(cleanedValidationSchema).filter(([_, v]) => v !== undefined && v !== null && v !== '')
        )
        cleanedValidationSchema = Object.keys(cleaned).length > 0 ? cleaned : undefined
      }

      // Se for uma nova pergunta, definir order_index como o próximo disponível
      let orderIndex = question.order_index
      if (!question.id) {
        // Nova pergunta: colocar no final
        orderIndex = questions.length
      }

      // Preparar dados para envio
      const dataToSend = {
        ...question,
        order_index: orderIndex,
        validation_schema: cleanedValidationSchema,
      }

      console.log('📤 Dados a enviar:', dataToSend)

      if (question.id) {
        await fetchAPI(`/admin/questions/${question.id}`, {
          method: 'PUT',
          body: JSON.stringify(dataToSend),
        })
        toast.success('Pergunta atualizada!')
      } else {
        try {
          await fetchAPI('/admin/questions', {
            method: 'POST',
            body: JSON.stringify(dataToSend),
          })
          toast.success('Pergunta criada!')
        } catch (createError: any) {
          // Tratar erro de duplicação de código
          console.log('🔍 Erro ao criar:', createError)
          console.log('🔍 existingId:', createError.existingId)
          console.log('🔍 existingText:', createError.existingText)

          if (createError.message?.includes('Já existe uma pergunta') || createError.message?.includes('duplicate')) {
            const existingId = createError.existingId
            const existingText = createError.existingText

            if (existingId) {
              toast.error(
                `Já existe uma pergunta com o código "${dataToSend.code}" neste question set.` +
                (existingText ? `\n\nPergunta existente: "${existingText}"` : ''),
                {
                  duration: 7000,
                  action: {
                    label: 'Editar existente',
                    onClick: () => {
                      setEditingId(existingId)
                      // Recarregar perguntas para ter os dados atualizados
                      if (selectedSection) {
                        const questionSetId = selectedQuestionSet && selectedQuestionSet !== 'all' ? selectedQuestionSet : undefined
                        loadQuestions(selectedSection, questionSetId)
                      }
                    }
                  }
                }
              )
            } else {
              toast.error('Já existe uma pergunta com este código neste question set. Edite a pergunta existente ou altere o código.')
            }
            return
          }
          throw createError
        }
      }
      setEditingId(null)
      if (selectedSection) {
        const questionSetId = selectedQuestionSet && selectedQuestionSet !== 'all' ? selectedQuestionSet : undefined
        loadQuestions(selectedSection, questionSetId)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao salvar pergunta'
      if (errorMessage.includes('Já existe uma pergunta')) {
        toast.error(errorMessage)
      } else {
        toast.error(errorMessage)
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta pergunta?')) return

    try {
      await fetchAPI(`/admin/questions/${id}`, { method: 'DELETE' })
      toast.success('Pergunta excluída!')
      if (selectedSection) {
        const questionSetId = selectedQuestionSet && selectedQuestionSet !== 'all' ? selectedQuestionSet : undefined
        loadQuestions(selectedSection, questionSetId)
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir pergunta')
    }
  }

  const handleReorder = async (questionId: string, direction: 'up' | 'down') => {
    const currentIndex = questions.findIndex(q => q.id === questionId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= questions.length) return

    // Reordenar localmente primeiro
    const newQuestions = [...questions]
    const [movedQuestion] = newQuestions.splice(currentIndex, 1)
    newQuestions.splice(newIndex, 0, movedQuestion)

    // Atualizar UI imediatamente
    setQuestions(newQuestions)

    try {
      // Atualizar a ordem no backend
      const updates = newQuestions.map((q, index) => ({
        id: q.id,
        order_index: index
      }))

      await fetchAPI('/admin/questions/reorder', {
        method: 'POST',
        body: JSON.stringify({ updates })
      })

      toast.success('Ordem atualizada!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao reordenar perguntas')
      // Reverter em caso de erro
      if (selectedSection) {
        const questionSetId = selectedQuestionSet && selectedQuestionSet !== 'all' ? selectedQuestionSet : undefined
        loadQuestions(selectedSection, questionSetId)
      }
    }
  }

  const handleBulkImport = async () => {
    if (!bulkJsonInput.trim()) {
      toast.error('Por favor, cole o JSON do bloco')
      return
    }

    try {
      setBulkImporting(true)
      const parsed = JSON.parse(bulkJsonInput)

      if (!parsed.block) {
        toast.error('JSON inválido: esperado formato { "block": { ... } }')
        return
      }

      console.log('📦 Enviando importação em lote:', parsed)

      const result = await fetchAPI('/admin/questions/bulk-import', {
        method: 'POST',
        body: JSON.stringify(parsed)
      })

      console.log('✅ Resultado da importação:', result)

      // Mostrar resumo
      toast.success(
        `Importação concluída! ${result.summary.imported} pergunta(s) importada(s), ` +
        `${result.summary.skipped} ignorada(s), ${result.summary.errors} erro(s)`
      )

      // Fechar modal e limpar
      setBulkImportModalOpen(false)
      setBulkJsonInput('')

      // Recarregar perguntas
      if (selectedSection) {
        const questionSetId = selectedQuestionSet && selectedQuestionSet !== 'all' ? selectedQuestionSet : undefined
        loadQuestions(selectedSection, questionSetId)
      }

    } catch (error: any) {
      console.error('❌ Erro na importação:', error)
      toast.error('Erro ao importar: ' + error.message)
    } finally {
      setBulkImporting(false)
    }
  }

  const currentSection = sections.find((s) => s.code === selectedSection)
  const availableQuestionSets = currentSection?.questionSets || []

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Perguntas</h1>
          <p className="text-slate-500 mt-1">
            Adicione, edite e personalize perguntas e seus contextos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setBulkImportModalOpen(true)}>
            <Upload className="mr-2 size-4" />
            Importar Bloco (JSON)
          </Button>
          <Button onClick={() => setEditingId('new')} disabled={!selectedQuestionSet || selectedQuestionSet === 'all'}>
            <Plus className="mr-2 size-4" />
            Nova Pergunta
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Seção</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma seção" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.code}>
                      {section.name} ({section.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Question Set (Subseção)</Label>
              <Select
                value={selectedQuestionSet}
                onValueChange={setSelectedQuestionSet}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as subseções" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as subseções</SelectItem>
                  {availableQuestionSets.map((qs) => (
                    <SelectItem key={qs.id} value={qs.id}>
                      {qs.name}
                      {qs.subsection_name && ` - ${qs.subsection_name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Perguntas */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-slate-500">Carregando...</div>
          </CardContent>
        </Card>
      ) : questions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-slate-500">
              {selectedSection
                ? 'Nenhuma pergunta encontrada. Clique em "Nova Pergunta" para criar.'
                : 'Selecione uma seção para ver as perguntas.'}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((q, index) => (
            <QuestionCard
              key={q.id}
              question={q}
              questionIndex={index}
              totalQuestions={questions.length}
              isEditing={editingId === q.id}
              onEdit={() => setEditingId(q.id || null)}
              onSave={handleSave}
              onDelete={handleDelete}
              onCancel={() => setEditingId(null)}
              onMoveUp={() => q.id && handleReorder(q.id, 'up')}
              onMoveDown={() => q.id && handleReorder(q.id, 'down')}
            />
          ))}
        </div>
      )}

      {/* Formulário de Nova Pergunta */}
      {editingId === 'new' && selectedQuestionSet && selectedQuestionSet !== 'all' && (
        <QuestionForm
          question={null}
          questionSetId={selectedQuestionSet}
          sectionCode={selectedSection}
          onSave={handleSave}
          onCancel={() => setEditingId(null)}
        />
      )}

      {/* Modal de Importação em Lote */}
      <Dialog open={bulkImportModalOpen} onOpenChange={setBulkImportModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Importar Bloco de Perguntas via JSON</DialogTitle>
            <DialogDescription>
              Cole o JSON completo do bloco com todas as perguntas. O sistema criará automaticamente o question_set e todas as perguntas com seus contextos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>JSON do Bloco</Label>
              <Textarea
                value={bulkJsonInput}
                onChange={(e) => setBulkJsonInput(e.target.value)}
                placeholder='{ "block": { "code": "OFFER_VALUE_PROPOSITION", "name": "Bloco 4 ...", "questions": [...] } }'
                className="min-h-[400px] font-mono text-sm"
              />
            </div>
            <div className="text-sm text-slate-500 space-y-2">
              <p className="font-semibold">Formato esperado:</p>
              <pre className="bg-slate-100 p-3 rounded text-xs overflow-x-auto">
{`{
  "block": {
    "code": "OFFER_VALUE_PROPOSITION",
    "name": "Bloco 4 — Oferta & Proposta de Valor",
    "description": "Define o que é vendido...",
    "questions": [
      {
        "code": "OFFER_CORE_PROBLEM",
        "text": "Qual é o principal problema...",
        "help_text": "Descreva o problema...",
        "type": "textarea",
        "required": true,
        "ai_importance_weight": 1.0,
        "validation_schema": {
          "min_length": 200,
          "max_length": 900
        },
        "options": [],
        "context": {
          "why": "Toda oferta forte...",
          "consequences": ["...", "..."],
          "how_to_answer": "Descreva...",
          "good_examples": ["..."],
          "bad_examples": ["..."],
          "show_why": true,
          "show_consequences": true,
          "show_how_to_answer": true,
          "show_good_examples": true,
          "show_bad_examples": true
        }
      },
      ...
    ]
  }
}`}
              </pre>
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-2">
                <p className="font-semibold text-blue-900">ℹ️ Como funciona:</p>
                <ul className="list-disc list-inside text-blue-800 space-y-1 mt-1">
                  <li>O código da seção é extraído automaticamente (ex: "OFFER" de "OFFER_VALUE_PROPOSITION")</li>
                  <li>Se o question_set já existir, as perguntas serão adicionadas a ele</li>
                  <li>Perguntas duplicadas (mesmo código) serão ignoradas</li>
                  <li>Os contextos são criados automaticamente se a tabela existir</li>
                </ul>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkImportModalOpen(false)} disabled={bulkImporting}>
              Cancelar
            </Button>
            <Button onClick={handleBulkImport} disabled={!bulkJsonInput.trim() || bulkImporting}>
              {bulkImporting ? 'Importando...' : 'Importar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  isEditing,
  onEdit,
  onSave,
  onDelete,
  onCancel,
  onMoveUp,
  onMoveDown,
}: {
  question: Question
  questionIndex: number
  totalQuestions: number
  isEditing: boolean
  onEdit: () => void
  onSave: (q: Question) => void
  onDelete: (id: string) => void
  onCancel: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  if (isEditing) {
    return (
      <QuestionForm
        question={question}
        questionSetId={question.question_set_id}
        sectionCode={question.section_code}
        onSave={onSave}
        onCancel={onCancel}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex flex-col gap-1 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onMoveUp}
                disabled={questionIndex === 0}
                className="h-6 w-6 p-0"
                title="Mover para cima"
              >
                <ArrowUp className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onMoveDown}
                disabled={questionIndex === totalQuestions - 1}
                className="h-6 w-6 p-0"
                title="Mover para baixo"
              >
                <ArrowDown className="size-3" />
              </Button>
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{question.text}</CardTitle>
              <CardDescription>
                #{questionIndex + 1} • {question.code} • {question.type}
                {question.required && ' • Obrigatória'}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => question.id && onDelete(question.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {question.context && (
        <CardContent>
          <div className="text-sm text-slate-600">
            <FileText className="inline size-4 mr-1" />
            Contexto configurado
          </div>
        </CardContent>
      )}
    </Card>
  )
}

function QuestionForm({
  question,
  questionSetId,
  sectionCode,
  onSave,
  onCancel,
}: {
  question: Question | null
  questionSetId: string
  sectionCode?: string
  onSave: (q: Question) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<Question>({
    id: question?.id, // IMPORTANTE: preservar o ID para edição
    question_set_id: question?.question_set_id || questionSetId || '',
    code: question?.code || '',
    text: question?.text || '',
    help_text: question?.help_text || '',
    type: question?.type || 'textarea',
    required: question?.required || false,
    order_index: question?.order_index || 0,
    ai_importance_weight: question?.ai_importance_weight || 0.5,
    validation_schema: question?.validation_schema || {},
    options: question?.options || [],
    context: question?.context || {
      show_why: true,
      show_consequences: true,
      show_how_to_answer: true,
      show_good_examples: true,
      show_bad_examples: true,
    },
  })

  const [newOption, setNewOption] = useState({ label: '', value: '' })
  const [jsonModalOpen, setJsonModalOpen] = useState(false)
  const [jsonInput, setJsonInput] = useState('')

  const addOption = () => {
    if (!newOption.label || !newOption.value) return
    const options = formData.options || []
    setFormData({
      ...formData,
      options: [
        ...options,
        {
          label: newOption.label,
          value: newOption.value,
          order_index: options.length,
        },
      ],
    })
    setNewOption({ label: '', value: '' })
  }

  const removeOption = (index: number) => {
    const options = formData.options || []
    setFormData({
      ...formData,
      options: options.filter((_, i) => i !== index),
    })
  }

  const addContextItem = (field: 'consequences' | 'good_examples' | 'bad_examples', value: string) => {
    if (!value.trim()) return
    const context = formData.context || {}
    const current = context[field] || []
    setFormData({
      ...formData,
      context: {
        ...context,
        [field]: [...current, value.trim()],
      },
    })
  }

  const removeContextItem = (
    field: 'consequences' | 'good_examples' | 'bad_examples',
    index: number
  ) => {
    const context = formData.context || {}
    const current = context[field] || []
    setFormData({
      ...formData,
      context: {
        ...context,
        [field]: current.filter((_, i) => i !== index),
      },
    })
  }

  const handleExportJson = () => {
    const jsonData = {
      code: formData.code,
      text: formData.text,
      help_text: formData.help_text || '',
      type: formData.type,
      required: formData.required,
      ai_importance_weight: formData.ai_importance_weight || 0.5,
      validation_schema: formData.validation_schema || {},
      options: formData.options || [],
      context: formData.context || {},
    }
    const jsonString = JSON.stringify(jsonData, null, 2)
    navigator.clipboard.writeText(jsonString)
    toast.success('JSON copiado para a área de transferência!')
  }

  const handleLoadJson = async () => {
    try {
      const parsed = JSON.parse(jsonInput)

      // Validar campos obrigatórios (order_index não é mais obrigatório)
      if (!parsed.code || !parsed.text || !parsed.type) {
        toast.error('JSON inválido: faltam campos obrigatórios (code, text, type)')
        return
      }

      const currentQuestionSetId = formData.question_set_id

      // Verificar se já existe uma pergunta com este código no question_set_id atual
      try {
        const questionsResponse = await fetchAPI(`/admin/questions?sectionCode=${sectionCode}&questionSetId=${currentQuestionSetId}`)
        const existingQuestion = questionsResponse.find((q: Question) =>
          q.code === parsed.code && q.question_set_id === currentQuestionSetId
        )

        if (existingQuestion) {
          // Se existe, usar o ID da pergunta existente mas aplicar os dados do JSON
          // Isso permite atualizar a pergunta existente com os dados do JSON
          setFormData({
            id: existingQuestion.id, // ID é crucial para indicar que é edição
            question_set_id: currentQuestionSetId, // Preservar o question_set_id atual
            code: parsed.code,
            text: parsed.text,
            help_text: parsed.help_text || '',
            type: parsed.type,
            required: parsed.required || false,
            order_index: existingQuestion.order_index, // Manter a ordem atual da pergunta existente
            ai_importance_weight: parsed.ai_importance_weight || 0.5,
            validation_schema: parsed.validation_schema || {},
            options: parsed.options || [],
            context: parsed.context || {
              show_why: true,
              show_consequences: true,
              show_how_to_answer: true,
              show_good_examples: true,
              show_bad_examples: true,
            },
          })

          setJsonModalOpen(false)
          setJsonInput('')
          toast.success('Pergunta existente detectada. Os dados do JSON foram carregados. Ao salvar, a pergunta será atualizada.')
          return
        }
      } catch (checkError) {
        // Se houver erro ao verificar, continuar com o carregamento normal
        console.warn('Erro ao verificar pergunta existente:', checkError)
      }

      // Se não existe, carregar os dados do JSON normalmente (criação de nova pergunta)
      // A ordem será definida automaticamente no handleSave
      setFormData({
        question_set_id: currentQuestionSetId, // Sempre preservar o question_set_id atual
        code: parsed.code,
        text: parsed.text,
        help_text: parsed.help_text || '',
        type: parsed.type,
        required: parsed.required || false,
        order_index: 0, // Será ajustado no handleSave para ser o último
        ai_importance_weight: parsed.ai_importance_weight || 0.5,
        validation_schema: parsed.validation_schema || {},
        options: parsed.options || [],
        context: parsed.context || {
          show_why: true,
          show_consequences: true,
          show_how_to_answer: true,
          show_good_examples: true,
          show_bad_examples: true,
        },
      })

      setJsonModalOpen(false)
      setJsonInput('')
      toast.success('JSON carregado com sucesso! Nova pergunta será criada.')
    } catch (error: any) {
      toast.error('Erro ao parsear JSON: ' + error.message)
    }
  }

  return (
    <>
    <Card className="border-2 border-teal-200">
      <CardHeader>
        <CardTitle>
          {question ? 'Editar Pergunta' : 'Nova Pergunta'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Campos Básicos */}
        <div className="space-y-4">
          <div>
            <Label>Código da Pergunta *</Label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="IDENTITY_REASON"
            />
            <p className="text-xs text-slate-500 mt-1">
              Identificador único da pergunta (ex: IDENTITY_REASON)
            </p>
          </div>
        </div>

        <div>
          <Label>Texto da Pergunta *</Label>
          <Textarea
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            placeholder="Qual é a razão de existir da sua clínica?"
            className="min-h-[80px]"
          />
        </div>

        <div>
          <Label>Texto de Ajuda</Label>
          <Textarea
            value={formData.help_text || ''}
            onChange={(e) => setFormData({ ...formData, help_text: e.target.value })}
            placeholder="Texto auxiliar que aparece abaixo da pergunta"
            className="min-h-[60px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Tipo de Resposta *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: any) => {
                setFormData({
                  ...formData,
                  type: value,
                  options: value === 'single_select' || value === 'multi_select' ? formData.options : [],
                })
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="textarea">Texto Longo</SelectItem>
                <SelectItem value="text">Texto Curto</SelectItem>
                <SelectItem value="single_select">Seleção Única</SelectItem>
                <SelectItem value="multi_select">Seleção Múltipla</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Peso para IA</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={formData.ai_importance_weight || 0.5}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ai_importance_weight: parseFloat(e.target.value) || 0.5,
                })
              }
            />
          </div>
          <div className="flex items-end">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="required"
                checked={formData.required}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, required: checked === true })
                }
              />
              <Label htmlFor="required" className="cursor-pointer">
                Obrigatória
              </Label>
            </div>
          </div>
        </div>

        {/* Validação de Caracteres */}
        {(formData.type === 'text' || formData.type === 'textarea') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Mínimo de Caracteres</Label>
              <Input
                type="number"
                min="0"
                value={formData.validation_schema?.min_length || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    validation_schema: {
                      ...formData.validation_schema,
                      min_length: e.target.value ? parseInt(e.target.value) : undefined,
                    },
                  })
                }
                placeholder="Ex: 10"
              />
            </div>
            <div>
              <Label>Máximo de Caracteres</Label>
              <Input
                type="number"
                min="0"
                value={formData.validation_schema?.max_length || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    validation_schema: {
                      ...formData.validation_schema,
                      max_length: e.target.value ? parseInt(e.target.value) : undefined,
                    },
                  })
                }
                placeholder="Ex: 500"
              />
            </div>
          </div>
        )}

        {/* Opções para Seleção */}
        {(formData.type === 'single_select' || formData.type === 'multi_select') && (
          <div className="space-y-2">
            <Label>Opções de Resposta</Label>
            {formData.options?.map((option, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={option.label}
                  onChange={(e) => {
                    const options = [...(formData.options || [])]
                    options[index].label = e.target.value
                    setFormData({ ...formData, options })
                  }}
                  placeholder="Label da opção"
                  className="flex-1"
                />
                <Input
                  value={option.value}
                  onChange={(e) => {
                    const options = [...(formData.options || [])]
                    options[index].value = e.target.value
                    setFormData({ ...formData, options })
                  }}
                  placeholder="Valor"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeOption(index)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                value={newOption.label}
                onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
                placeholder="Nova opção - Label"
                className="flex-1"
              />
              <Input
                value={newOption.value}
                onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                placeholder="Valor"
                className="flex-1"
              />
              <Button onClick={addOption} variant="outline">
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
        )}

        <Separator />

        {/* Contexto e Orientações */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold">Contexto e Orientações</Label>
          </div>

          {/* Por que estamos perguntando */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show_why"
                checked={formData.context?.show_why !== false}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    context: { ...formData.context, show_why: checked === true },
                  })
                }
              />
              <Label htmlFor="show_why" className="font-semibold cursor-pointer">
                Por que estamos perguntando isso?
              </Label>
            </div>
            {formData.context?.show_why !== false && (
              <Textarea
                value={formData.context?.why || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    context: { ...formData.context, why: e.target.value },
                  })
                }
                placeholder="Explicação do porquê a pergunta é importante..."
                className="min-h-[100px]"
              />
            )}
          </div>

          {/* Consequências */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show_consequences"
                checked={formData.context?.show_consequences !== false}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    context: { ...formData.context, show_consequences: checked === true },
                  })
                }
              />
              <Label htmlFor="show_consequences" className="font-semibold cursor-pointer">
                O que acontece sem isso?
              </Label>
            </div>
            {formData.context?.show_consequences !== false && (
              <div className="space-y-2">
                {(formData.context?.consequences || []).map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const consequences = [...(formData.context?.consequences || [])]
                        consequences[index] = e.target.value
                        setFormData({
                          ...formData,
                          context: { ...formData.context, consequences },
                        })
                      }}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeContextItem('consequences', index)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Nova consequência"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addContextItem('consequences', e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Nova consequência"]') as HTMLInputElement
                      if (input) {
                        addContextItem('consequences', input.value)
                        input.value = ''
                      }
                    }}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Como responder */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show_how_to_answer"
                checked={formData.context?.show_how_to_answer !== false}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    context: { ...formData.context, show_how_to_answer: checked === true },
                  })
                }
              />
              <Label htmlFor="show_how_to_answer" className="font-semibold cursor-pointer">
                Como responder bem?
              </Label>
            </div>
            {formData.context?.show_how_to_answer !== false && (
              <Textarea
                value={formData.context?.how_to_answer || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    context: { ...formData.context, how_to_answer: e.target.value },
                  })
                }
                placeholder="Orientações de como responder bem..."
                className="min-h-[100px]"
              />
            )}
          </div>

          {/* Exemplos bons */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show_good_examples"
                checked={formData.context?.show_good_examples !== false}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    context: { ...formData.context, show_good_examples: checked === true },
                  })
                }
              />
              <Label htmlFor="show_good_examples" className="font-semibold cursor-pointer">
                Exemplos de boas respostas
              </Label>
            </div>
            {formData.context?.show_good_examples !== false && (
              <div className="space-y-2">
                {(formData.context?.good_examples || []).map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Textarea
                      value={item}
                      onChange={(e) => {
                        const examples = [...(formData.context?.good_examples || [])]
                        examples[index] = e.target.value
                        setFormData({
                          ...formData,
                          context: { ...formData.context, good_examples: examples },
                        })
                      }}
                      className="flex-1 min-h-[60px]"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeContextItem('good_examples', index)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    const examples = formData.context?.good_examples || []
                    setFormData({
                      ...formData,
                      context: {
                        ...formData.context,
                        good_examples: [...examples, ''],
                      },
                    })
                  }}
                >
                  <Plus className="mr-2 size-4" />
                  Adicionar Exemplo
                </Button>
              </div>
            )}
          </div>

          {/* Exemplos ruins */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show_bad_examples"
                checked={formData.context?.show_bad_examples !== false}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    context: { ...formData.context, show_bad_examples: checked === true },
                  })
                }
              />
              <Label htmlFor="show_bad_examples" className="font-semibold cursor-pointer">
                Exemplos de respostas ruins
              </Label>
            </div>
            {formData.context?.show_bad_examples !== false && (
              <div className="space-y-2">
                {(formData.context?.bad_examples || []).map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Textarea
                      value={item}
                      onChange={(e) => {
                        const examples = [...(formData.context?.bad_examples || [])]
                        examples[index] = e.target.value
                        setFormData({
                          ...formData,
                          context: { ...formData.context, bad_examples: examples },
                        })
                      }}
                      className="flex-1 min-h-[60px]"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeContextItem('bad_examples', index)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    const examples = formData.context?.bad_examples || []
                    setFormData({
                      ...formData,
                      context: {
                        ...formData.context,
                        bad_examples: [...examples, ''],
                      },
                    })
                  }}
                >
                  <Plus className="mr-2 size-4" />
                  Adicionar Exemplo
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-between gap-2 pt-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setJsonModalOpen(true)}>
              <Upload className="mr-2 size-4" />
              Carregar .json
            </Button>
            <Button variant="outline" onClick={handleExportJson}>
              <Copy className="mr-2 size-4" />
              Copiar .json
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button
              onClick={() => onSave(formData)}
              disabled={!formData.code || !formData.text || !formData.question_set_id}
            >
              <Save className="mr-2 size-4" />
              Salvar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Modal de Carregar JSON */}
    <Dialog open={jsonModalOpen} onOpenChange={setJsonModalOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Carregar Pergunta via JSON</DialogTitle>
          <DialogDescription>
            Cole o código JSON abaixo para preencher automaticamente todos os campos da pergunta.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>JSON da Pergunta</Label>
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{"code": "IDENTITY_REASON", "text": "Qual é a razão de existir da sua clínica?", ...}'
              className="min-h-[300px] font-mono text-sm"
            />
          </div>
          <div className="text-sm text-slate-500 space-y-1">
            <p className="font-semibold">Formato esperado (ordem será definida automaticamente):</p>
            <pre className="bg-slate-100 p-2 rounded text-xs overflow-x-auto">
{`{
  "code": "IDENTITY_REASON",
  "text": "Qual é a razão de existir da sua clínica?",
  "help_text": "Texto auxiliar...",
  "type": "textarea",
  "required": true,
  "ai_importance_weight": 0.8,
  "validation_schema": {
    "min_length": 10,
    "max_length": 500
  },
  "options": [],
  "context": {
    "why": "...",
    "consequences": ["..."],
    "how_to_answer": "...",
    "good_examples": ["..."],
    "bad_examples": ["..."],
    "show_why": true,
    "show_consequences": true,
    "show_how_to_answer": true,
    "show_good_examples": true,
    "show_bad_examples": true
  }
}`}
            </pre>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setJsonModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleLoadJson} disabled={!jsonInput.trim()}>
            Carregar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}

