import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Info, CheckCircle2, XCircle, AlertTriangle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import QuestionRenderer from './QuestionRenderer'
import { identityQuestionsContext, type QuestionContext } from '@/lib/identity-questions-context'
import type { Question, QuestionSet } from '@/services/dossierService'
import { fetchAPI } from '@/lib/api'

interface QuestionWizardProps {
  questionSets: QuestionSet[]
  answersMap: Record<string, any>
  savingAnswers: Set<string>
  onAnswerChange: (question: Question, value: any) => void
  sectionCode?: string
}

export default function QuestionWizard({
  questionSets,
  answersMap,
  savingAnswers,
  onAnswerChange,
  sectionCode,
}: QuestionWizardProps) {
  // Estado para controlar navegação hierárquica
  const [selectedQuestionSetId, setSelectedQuestionSetId] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // Ordenar questionSets por ordem (se houver)
  const sortedQuestionSets = useMemo(() => {
    return [...questionSets].sort((a, b) => {
      // Se houver ordem nas perguntas, usar a primeira pergunta como referência
      const aFirstOrder = a.questions[0]?.order_index || 0
      const bFirstOrder = b.questions[0]?.order_index || 0
      return aFirstOrder - bFirstOrder
    })
  }, [questionSets])

  // QuestionSet atual selecionado
  const currentQuestionSet = selectedQuestionSetId
    ? sortedQuestionSets.find((qs) => qs.id === selectedQuestionSetId)
    : null

  // Perguntas do questionSet atual, ordenadas
  const currentQuestions = useMemo(() => {
    if (!currentQuestionSet) return []
    return [...currentQuestionSet.questions].sort(
      (a, b) => a.order_index - b.order_index
    )
  }, [currentQuestionSet])

  // Pergunta atual
  const currentQuestion = currentQuestions[currentQuestionIndex]
  const currentAnswer = currentQuestion ? answersMap[currentQuestion.id] || {} : {}
  const isSaving = currentQuestion ? savingAnswers.has(currentQuestion.id) : false

  // Estado para contexto da pergunta (buscar do banco)
  const [questionContext, setQuestionContext] = useState<QuestionContext | undefined>(undefined)
  const [loadingContext, setLoadingContext] = useState(false)

  // Buscar contexto do banco de dados
  useEffect(() => {
    if (currentQuestion?.id) {
      console.log('🔍 Carregando contexto para pergunta:', currentQuestion.code, currentQuestion.id)
      setLoadingContext(true)

      fetchAPI(`/questions/${currentQuestion.id}/context`)
        .then((data) => {
          console.log('📦 Dados do contexto recebidos:', data)
          if (data && Object.keys(data).length > 1) {
            // Converter formato do banco para formato esperado
            const context = {
              why: data.why,
              consequences: data.consequences,
              howToAnswer: data.howToAnswer,
              goodExamples: data.goodExamples,
              badExamples: data.badExamples,
            }
            console.log('✅ Contexto processado e definido:', context)
            setQuestionContext(context)
          } else {
            console.log('⚠️ Contexto vazio do banco, usando fallback')
            // Fallback para contexto hardcoded se não houver no banco
            if (sectionCode === 'IDENTITY' && currentQuestion?.code) {
              const hardcodedContext = identityQuestionsContext[currentQuestion.code]
              console.log('📚 Usando contexto hardcoded:', hardcodedContext ? 'encontrado' : 'não encontrado')
              setQuestionContext(hardcodedContext)
            } else {
              setQuestionContext(undefined)
            }
          }
        })
        .catch((error) => {
          console.error('❌ Erro ao buscar contexto:', error)
          // Em caso de erro, usar fallback hardcoded
          if (sectionCode === 'IDENTITY' && currentQuestion?.code) {
            const hardcodedContext = identityQuestionsContext[currentQuestion.code]
            console.log('📚 Erro no fetch, usando contexto hardcoded:', hardcodedContext ? 'encontrado' : 'não encontrado')
            setQuestionContext(hardcodedContext)
          } else {
            setQuestionContext(undefined)
          }
        })
        .finally(() => {
          console.log('🏁 Carregamento de contexto finalizado')
          setLoadingContext(false)
        })
    } else {
      setQuestionContext(undefined)
    }
  }, [currentQuestion?.id, currentQuestion?.code, sectionCode])

  // Progresso dentro do questionSet atual
  const questionProgress =
    currentQuestions.length > 0
      ? ((currentQuestionIndex + 1) / currentQuestions.length) * 100
      : 0

  // Progresso geral (todas as perguntas de todos os questionSets)
  const totalQuestions = useMemo(() => {
    return questionSets.reduce((sum, qs) => sum + qs.questions.length, 0)
  }, [questionSets])

  const answeredQuestions = useMemo(() => {
    return Object.keys(answersMap).filter(
      (qId) => {
        const answer = answersMap[qId]
        return (
          answer?.valueText ||
          answer?.valueNumber !== undefined ||
          (answer?.valueJson && Object.keys(answer.valueJson).length > 0)
        )
      }
    ).length
  }, [answersMap])

  const overallProgress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

  // Selecionar primeiro questionSet automaticamente se nenhum estiver selecionado
  useEffect(() => {
    if (!selectedQuestionSetId && sortedQuestionSets.length > 0) {
      setSelectedQuestionSetId(sortedQuestionSets[0].id)
      setCurrentQuestionIndex(0)
    }
  }, [selectedQuestionSetId, sortedQuestionSets])

  // Resetar índice da pergunta quando mudar de questionSet
  useEffect(() => {
    setCurrentQuestionIndex(0)
  }, [selectedQuestionSetId])

  const goToQuestionSet = (questionSetId: string) => {
    setSelectedQuestionSetId(questionSetId)
    setCurrentQuestionIndex(0)
    // Scroll apenas quando mudar de questionSet (seção)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goBackToQuestionSets = () => {
    setSelectedQuestionSetId(null)
    setCurrentQuestionIndex(0)
    // Scroll apenas quando voltar para seleção de questionSets
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      // Não fazer scroll ao navegar entre perguntas
    } else {
      // Se estiver na primeira pergunta, voltar para seleção de questionSets
      goBackToQuestionSets()
    }
  }

  const goToNextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      // Não fazer scroll ao navegar entre perguntas
    }
  }

  const goToPreviousQuestionSet = () => {
    if (!currentQuestionSet) return
    const currentIdx = sortedQuestionSets.findIndex((qs) => qs.id === currentQuestionSet.id)
    if (currentIdx > 0) {
      goToQuestionSet(sortedQuestionSets[currentIdx - 1].id)
    }
  }

  const goToNextQuestionSet = () => {
    if (!currentQuestionSet) return
    const currentIdx = sortedQuestionSets.findIndex((qs) => qs.id === currentQuestionSet.id)
    if (currentIdx < sortedQuestionSets.length - 1) {
      goToQuestionSet(sortedQuestionSets[currentIdx + 1].id)
    }
  }

  // Tela de seleção de QuestionSets
  if (!selectedQuestionSetId || !currentQuestionSet) {
    return (
      <div className="space-y-6">
        {/* Progresso Geral */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Selecione uma seção para começar</CardTitle>
              <Badge variant="outline" className="text-sm">
                {answeredQuestions} de {totalQuestions} respondidas
              </Badge>
            </div>
            <div className="mt-4">
              <Progress value={overallProgress} className="h-2" />
            </div>
          </CardHeader>
        </Card>

        {/* Lista de QuestionSets */}
        <div className="grid gap-4 md:grid-cols-2">
          {sortedQuestionSets.map((questionSet) => {
            const questionsInSet = questionSet.questions.length
            const answeredInSet = questionSet.questions.filter(
              (q) => {
                const answer = answersMap[q.id]
                return (
                  answer?.valueText ||
                  answer?.valueNumber !== undefined ||
                  (answer?.valueJson && Object.keys(answer.valueJson).length > 0)
                )
              }
            ).length
            const setProgress = questionsInSet > 0 ? (answeredInSet / questionsInSet) * 100 : 0

            return (
              <Card
                key={questionSet.id}
                className="cursor-pointer hover:border-teal-400 transition-colors"
                onClick={() => goToQuestionSet(questionSet.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{questionSet.name}</CardTitle>
                      {questionSet.subsection_name && (
                        <CardDescription className="mt-1">
                          {questionSet.subsection_name}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {answeredInSet}/{questionsInSet}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <Progress value={setProgress} className="h-2" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {questionsInSet} pergunta{questionsInSet !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-slate-500">
            <p>Nenhuma pergunta encontrada nesta seção</p>
            <Button
              variant="outline"
              onClick={goBackToQuestionSets}
              className="mt-4"
            >
              <ArrowLeft className="mr-2 size-4" />
              Voltar para seções
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Indicador de Progresso */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBackToQuestionSets}
                  className="h-8 w-8 p-0"
                >
                  <ArrowLeft className="size-4" />
                </Button>
                <CardTitle className="text-lg">
                  {currentQuestionSet.name}
                </CardTitle>
              </div>
              {currentQuestionSet.subsection_name && (
                <CardDescription className="mt-1">
                  {currentQuestionSet.subsection_name}
                </CardDescription>
              )}
            </div>
            <Badge variant="outline" className="text-sm">
              Pergunta {currentQuestionIndex + 1} de {currentQuestions.length}
            </Badge>
          </div>
          <div className="mt-4">
            <Progress value={questionProgress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Card Principal da Pergunta */}
      <Card className="border-2 border-teal-200 dark:border-teal-800">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">
                {currentQuestion.text}
                {currentQuestion.required && (
                  <span className="text-red-500 ml-2">*</span>
                )}
              </CardTitle>
              {currentQuestion.help_text && (
                <CardDescription className="text-base mt-2">
                  {currentQuestion.help_text}
                </CardDescription>
              )}
            </div>
            {isSaving && (
              <div className="ml-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Contexto Detalhado */}
          {loadingContext && (
            <div className="text-center text-slate-500 text-sm py-4">Carregando contexto...</div>
          )}
          {!loadingContext && questionContext && (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-2 mb-4">
                <Info className="size-5 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" />
                <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                  Contexto e Orientações
                </h3>
              </div>
              
              <Accordion type="multiple" className="w-full" defaultValue={['why']}>
                {/* Por que estamos perguntando */}
                <AccordionItem value="why" className="border-b border-slate-200 dark:border-slate-700">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Info className="size-4 text-teal-600 dark:text-teal-400" />
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        Por que estamos perguntando isso?
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-2">
                      {questionContext.why}
                    </p>
                  </AccordionContent>
                </AccordionItem>

                {/* Consequências */}
                {questionContext.consequences && questionContext.consequences.length > 0 && (
                  <AccordionItem value="consequences" className="border-b border-slate-200 dark:border-slate-700">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="size-4 text-amber-600" />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          O que acontece sem isso?
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300 pt-2">
                        {questionContext.consequences.map((consequence, idx) => (
                          <li key={idx}>{consequence}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Como responder */}
                {questionContext.howToAnswer && (
                  <AccordionItem value="howToAnswer" className="border-b border-slate-200 dark:border-slate-700">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        Como responder bem?
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line pt-2">
                        {questionContext.howToAnswer}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Exemplos bons */}
                {questionContext.goodExamples && questionContext.goodExamples.length > 0 && (
                  <AccordionItem value="goodExamples" className="border-b border-slate-200 dark:border-slate-700">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-green-600" />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          Exemplos de boas respostas
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {questionContext.goodExamples.map((example, idx) => (
                          <div
                            key={idx}
                            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3 text-sm text-green-900 dark:text-green-200"
                          >
                            "{example}"
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Exemplos ruins */}
                {questionContext.badExamples && questionContext.badExamples.length > 0 && (
                  <AccordionItem value="badExamples" className="border-b-0">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-center gap-2">
                        <XCircle className="size-4 text-red-600" />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          Exemplos de respostas ruins
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {questionContext.badExamples.map((example, idx) => (
                          <div
                            key={idx}
                            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 text-sm text-red-900 dark:text-red-200"
                          >
                            "{example}"
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>
          )}

          {/* Campo de Resposta */}
          <div className="space-y-2">
            <QuestionRenderer
              question={currentQuestion}
              answer={currentAnswer}
              onChange={(value) => onAnswerChange(currentQuestion, value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Navegação */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Navegação entre perguntas */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="size-4" />
                {currentQuestionIndex === 0 ? 'Voltar para seções' : 'Pergunta anterior'}
              </Button>

              <div className="text-sm text-slate-600 dark:text-slate-400">
                {currentQuestionIndex + 1} de {currentQuestions.length}
              </div>

              <Button
                onClick={goToNextQuestion}
                disabled={currentQuestionIndex === currentQuestions.length - 1}
                className="flex items-center gap-2"
              >
                {currentQuestionIndex === currentQuestions.length - 1
                  ? 'Próxima seção'
                  : 'Próxima pergunta'}
                <ChevronRight className="size-4" />
              </Button>
            </div>

            {/* Navegação entre questionSets (se houver mais de um) */}
            {sortedQuestionSets.length > 1 && (
              <>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToPreviousQuestionSet}
                    disabled={
                      sortedQuestionSets.findIndex((qs) => qs.id === currentQuestionSet.id) === 0
                    }
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="size-4" />
                    Seção anterior
                  </Button>

                  <div className="text-slate-500 dark:text-slate-400">
                    Seção{' '}
                    {sortedQuestionSets.findIndex((qs) => qs.id === currentQuestionSet.id) + 1} de{' '}
                    {sortedQuestionSets.length}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToNextQuestionSet}
                    disabled={
                      sortedQuestionSets.findIndex((qs) => qs.id === currentQuestionSet.id) ===
                      sortedQuestionSets.length - 1
                    }
                    className="flex items-center gap-2"
                  >
                    Próxima seção
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

