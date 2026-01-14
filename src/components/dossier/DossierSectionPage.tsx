import { useState, useMemo, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Save, Loader2, ChevronLeft, ChevronRight, ChevronDown, Info, Lightbulb, CheckCircle2, XCircle, CheckCircle } from 'lucide-react'
import { useSectionData } from '@/hooks/useSectionData'
import { useAnswerSave } from '@/hooks/useAnswerSave'
import { useSectionReport } from '@/hooks/useSectionReport'
import QuestionRenderer from './QuestionRenderer'
import SectionReportCard from './SectionReportCard'
import type { Question } from '@/services/dossierService'
import { identityQuestionsContext } from '@/lib/identity-questions-context'

interface DossierSectionPageProps {
  sectionCode: string
  title?: string
  description?: string
  entityBlocks?: React.ReactNode
}

export default function DossierSectionPage({
  sectionCode,
  title,
  description,
  entityBlocks,
}: DossierSectionPageProps) {
  const { dossierId } = useParams<{ dossierId: string }>()
  const { sectionData, loading, completionPercent, refetch } = useSectionData(dossierId, sectionCode)
  const { 
    answers, 
    handleAnswerChange, 
    handleSaveAnswers,
    saveAnswersSilently,
    saving,
    isQuestionAnswered,
    areAllRequiredQuestionsAnswered,
  } = useAnswerSave(
    dossierId,
    sectionCode,
    sectionData,
    () => {
      // Recarregar dados após salvar (apenas quando necessário)
      refetch()
    },
  )
  const { report, loadingReport, generatingReport, handleGenerateReport } = useSectionReport(
    dossierId,
    sectionCode,
  )

  // Estado para controlar qual pergunta está sendo exibida
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // Coletar todas as perguntas de todos os question sets
  const allQuestions = useMemo(() => {
    if (!sectionData) return []
    return sectionData.questionSets.flatMap((questionSet) =>
      questionSet.questions.map((question: Question) => ({
        ...question,
        questionSetName: questionSet.name,
        questionSetId: questionSet.id,
      }))
    )
  }, [sectionData])

  // Navegação entre perguntas
  const goToPrevious = useCallback(async () => {
    if (currentQuestionIndex > 0) {
      // Salvar silenciosamente antes de voltar (sem refresh)
      try {
        await saveAnswersSilently()
      } catch (error) {
        // Erro já tratado no hook
      }
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }, [currentQuestionIndex, saveAnswersSilently])

  const goToNext = useCallback(async () => {
    const currentQuestion = allQuestions[currentQuestionIndex]
    if (!currentQuestion) return

    const answer = answers[currentQuestion.id] || {}
    const answerText = answer.valueText || ''
    const validation = currentQuestion.validation_schema

    // Validar se pergunta obrigatória foi respondida
    if (currentQuestion.required && !isQuestionAnswered(currentQuestion.id)) {
      const { toast } = await import('sonner')
      toast.error('Por favor, responda esta pergunta obrigatória antes de avançar')
      return
    }

    // Validar minLength se existir
    if (validation?.minLength && answerText.length < validation.minLength) {
      const { toast } = await import('sonner')
      toast.error(`A resposta deve ter no mínimo ${validation.minLength} caracteres. Atualmente: ${answerText.length} caracteres.`)
      return
    }

    // Validar maxLength se existir (apenas aviso, não bloqueia)
    if (validation?.maxLength && answerText.length > validation.maxLength) {
      const { toast } = await import('sonner')
      toast.warning(`A resposta excede o máximo recomendado de ${validation.maxLength} caracteres. Atualmente: ${answerText.length} caracteres.`)
      // Não bloqueia, apenas avisa
    }

    // Salvar silenciosamente antes de avançar (sem refresh)
    try {
      await saveAnswersSilently()
    } catch (error) {
      // Erro já tratado no hook
    }

    // Navegar imediatamente sem esperar
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }, [currentQuestionIndex, allQuestions, answers, isQuestionAnswered, saveAnswersSilently])

  const handleComplete = useCallback(async () => {
    // Verificar se todas as perguntas obrigatórias foram respondidas
    if (!areAllRequiredQuestionsAnswered()) {
      const { toast } = await import('sonner')
      toast.error('Por favor, responda todas as perguntas obrigatórias antes de concluir')
      return
    }

    // Salvar antes de concluir (com refresh para atualizar completude)
    try {
      await handleSaveAnswers()
      const { toast } = await import('sonner')
      toast.success('Seção concluída com sucesso!')
      // Recarregar dados para atualizar completude
      await refetch()
    } catch (error) {
      // Erro já tratado no hook
    }
  }, [areAllRequiredQuestionsAnswered, handleSaveAnswers, refetch])

  // Resetar índice quando as perguntas mudarem
  useEffect(() => {
    if (allQuestions.length > 0 && currentQuestionIndex >= allQuestions.length) {
      setCurrentQuestionIndex(0)
    }
  }, [allQuestions.length, currentQuestionIndex])

  // Navegação por teclado
  useEffect(() => {
    const handleKeyPress = async (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
        await goToPrevious()
      } else if (e.key === 'ArrowRight') {
        if (currentQuestionIndex < allQuestions.length - 1) {
          await goToNext()
        } else if (areAllRequiredQuestionsAnswered()) {
          // Se estiver na última pergunta e todas estiverem respondidas, permitir concluir
          await handleComplete()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentQuestionIndex, allQuestions.length, goToPrevious, goToNext, handleComplete, areAllRequiredQuestionsAnswered])

  const handleSave = async () => {
    try {
      await handleSaveAnswers()
      await refetch()
    } catch (error) {
      // Erro já tratado no hook
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

  const sectionTitle = title || sectionData.section.name
  const sectionDescription = description || sectionData.section.description

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {sectionTitle}
          </h1>
          {sectionDescription && (
            <p className="text-slate-500 mt-1">{sectionDescription}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="w-48">
            <div className="flex justify-between text-sm mb-1">
              <span>Completude</span>
              <span className="font-semibold">{completionPercent}%</span>
            </div>
            <Progress value={completionPercent} className="h-2" />
          </div>
          <Button onClick={handleSave} disabled={saving}>
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

      {/* Entity Blocks */}
      {entityBlocks && <div className="space-y-6">{entityBlocks}</div>}

      {/* Questionário - Modo Wizard (uma pergunta por vez) */}
      {allQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{allQuestions[currentQuestionIndex]?.questionSetName || 'Questionário'}</CardTitle>
                {sectionData.questionSets.find(
                  (qs) => qs.id === allQuestions[currentQuestionIndex]?.questionSetId
                )?.subsection_name && (
                  <CardDescription>
                    {sectionData.questionSets.find(
                      (qs) => qs.id === allQuestions[currentQuestionIndex]?.questionSetId
                    )?.subsection_name}
                  </CardDescription>
                )}
              </div>
              <div className="text-sm text-slate-500">
                Pergunta {currentQuestionIndex + 1} de {allQuestions.length}
              </div>
            </div>
            {/* Barra de progresso das perguntas */}
            <div className="mt-4">
              <Progress 
                value={((currentQuestionIndex + 1) / allQuestions.length) * 100} 
                className="h-2" 
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {allQuestions[currentQuestionIndex] && (() => {
              const question = allQuestions[currentQuestionIndex]
              const answer = answers[question.id] || {}
              const context = identityQuestionsContext[question.code]
              
              return (
                <div className="space-y-6 min-h-[400px]">
                  {/* Pergunta Principal */}
                  <div className="space-y-3">
                    <Label className="text-xl font-bold text-slate-900 dark:text-white">
                      {question.text}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    
                    {/* Descrição Curta (subtítulo) - sempre mostrar help_text como subtítulo */}
                    {question.help_text && (
                      <p className="text-base text-slate-600 dark:text-slate-400">
                        {question.help_text}
                      </p>
                    )}
                  </div>

                  {/* Contexto Completo - Por que estamos perguntando */}
                  {context && (
                    <div className="space-y-4">
                      <Collapsible defaultOpen={true}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full text-left p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group">
                          <div className="flex items-center gap-2">
                            <Info className="size-5 text-teal-600" />
                            <span className="font-semibold text-slate-900 dark:text-white">
                              Por que estamos perguntando isso?
                            </span>
                          </div>
                          <ChevronDown className="size-4 text-slate-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 space-y-3">
                          <p className="text-sm text-slate-700 dark:text-slate-300 pl-7">
                            {context.why}
                          </p>
                          
                          {context.consequences && context.consequences.length > 0 && (
                            <div className="pl-7 space-y-2">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Uma clínica sem isso tende a:
                              </p>
                              <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                {context.consequences.map((consequence, idx) => (
                                  <li key={idx}>{consequence}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Como responder bem */}
                      {context.howToAnswer && (
                        <Collapsible defaultOpen={true}>
                          <CollapsibleTrigger className="flex items-center justify-between w-full text-left p-3 bg-blue-50 dark:bg-blue-950 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors group">
                            <div className="flex items-center gap-2">
                              <Lightbulb className="size-5 text-blue-600" />
                              <span className="font-semibold text-slate-900 dark:text-white">
                                Como responder bem
                              </span>
                            </div>
                            <ChevronDown className="size-4 text-slate-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2">
                            <p className="text-sm text-slate-700 dark:text-slate-300 pl-7">
                              {context.howToAnswer}
                            </p>
                          </CollapsibleContent>
                        </Collapsible>
                      )}

                      {/* Exemplos bons */}
                      {context.goodExamples && context.goodExamples.length > 0 && (
                        <Collapsible defaultOpen={false}>
                          <CollapsibleTrigger className="flex items-center justify-between w-full text-left p-3 bg-green-50 dark:bg-green-950 rounded-lg hover:bg-green-100 dark:hover:bg-green-900 transition-colors group">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="size-5 text-green-600" />
                              <span className="font-semibold text-slate-900 dark:text-white">
                                Exemplos bons
                              </span>
                            </div>
                            <ChevronDown className="size-4 text-slate-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2">
                            <ul className="space-y-2 pl-7">
                              {context.goodExamples.map((example, idx) => (
                                <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                  <span className="text-green-600 mt-1">•</span>
                                  <span className="italic">"{example}"</span>
                                </li>
                              ))}
                            </ul>
                          </CollapsibleContent>
                        </Collapsible>
                      )}

                      {/* Exemplos ruins */}
                      {context.badExamples && context.badExamples.length > 0 && (
                        <Collapsible defaultOpen={false}>
                          <CollapsibleTrigger className="flex items-center justify-between w-full text-left p-3 bg-red-50 dark:bg-red-950 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition-colors group">
                            <div className="flex items-center gap-2">
                              <XCircle className="size-5 text-red-600" />
                              <span className="font-semibold text-slate-900 dark:text-white">
                                Exemplos ruins (genéricos)
                              </span>
                            </div>
                            <ChevronDown className="size-4 text-slate-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2">
                            <ul className="space-y-2 pl-7">
                              {context.badExamples.map((example, idx) => (
                                <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                  <span className="text-red-600 mt-1">•</span>
                                  <span className="italic">"{example}"</span>
                                </li>
                              ))}
                            </ul>
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  )}

                  {/* Regra de Qualidade (validação) */}
                  {question.validation_schema && (question.validation_schema.minLength || question.validation_schema.maxLength) && (
                    <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <span className="text-amber-600 text-lg">📏</span>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 dark:text-white mb-2">
                            Regra de Qualidade (validação para avançar)
                          </p>
                          <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            {question.validation_schema.minLength && (
                              <p>
                                <strong>Mínimo:</strong> {question.validation_schema.minLength} caracteres
                              </p>
                            )}
                            {question.validation_schema.maxLength && (
                              <p>
                                <strong>Máximo recomendado:</strong> {question.validation_schema.maxLength} caracteres
                              </p>
                            )}
                            {question.validation_schema.rules && question.validation_schema.rules.length > 0 && (
                              <div className="mt-2">
                                <p className="font-medium mb-1">Deve responder claramente:</p>
                                <ul className="list-disc list-inside space-y-1">
                                  {question.validation_schema.rules.map((rule, idx) => (
                                    <li key={idx}>{rule}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <p className="mt-2 text-amber-700 dark:text-amber-300 font-medium">
                              Se não cumprir, o botão "Próxima" fica bloqueado.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Campo de Resposta */}
                  <div className="pt-4 border-t">
                    <Label className="text-base font-semibold mb-3 block">
                      Sua resposta:
                    </Label>
                    <QuestionRenderer
                      question={question}
                      answer={answer}
                      onChange={(value) => handleAnswerChange(question.id, value)}
                    />
                    {/* Contador de caracteres e validação */}
                    {question.validation_schema && (question.validation_schema.minLength || question.validation_schema.maxLength) && (
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className={`${
                          answer.valueText && answer.valueText.length < (question.validation_schema.minLength || 0)
                            ? 'text-red-600 dark:text-red-400'
                            : answer.valueText && question.validation_schema.maxLength && answer.valueText.length > question.validation_schema.maxLength
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {answer.valueText?.length || 0} / {question.validation_schema.maxLength || '∞'} caracteres
                          {question.validation_schema.minLength && (
                            <span className="ml-2">
                              (mínimo: {question.validation_schema.minLength})
                            </span>
                          )}
                        </span>
                        {answer.valueText && answer.valueText.length < (question.validation_schema.minLength || 0) && (
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            Resposta muito curta
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}

            {/* Navegação */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={goToPrevious}
                disabled={currentQuestionIndex === 0 || saving}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="size-4" />
                Anterior
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 mr-2 hidden sm:inline">Navegação rápida:</span>
                <div className="flex gap-1.5">
                  {allQuestions.map((_, index) => {
                    const question = allQuestions[index]
                    const isAnswered = isQuestionAnswered(question.id)
                    const isRequired = question.required
                    return (
                      <button
                        key={index}
                        onClick={async () => {
                          // Salvar silenciosamente antes de mudar de pergunta (sem refresh)
                          try {
                            await saveAnswersSilently()
                          } catch (error) {
                            // Erro já tratado no hook
                          }
                          setCurrentQuestionIndex(index)
                        }}
                        className={`size-3 rounded-full transition-all hover:scale-125 ${
                          index === currentQuestionIndex
                            ? 'bg-teal-600 ring-2 ring-teal-300 ring-offset-2'
                            : isAnswered
                            ? 'bg-teal-300 hover:bg-teal-400'
                            : isRequired
                            ? 'bg-red-300 hover:bg-red-400'
                            : 'bg-slate-300 hover:bg-slate-400'
                        }`}
                        title={`Pergunta ${index + 1}: ${question.text.substring(0, 50)}...${isRequired && !isAnswered ? ' (Obrigatória)' : ''}`}
                      />
                    )
                  })}
                </div>
                <span className="text-xs text-slate-400 ml-2 hidden md:inline">
                  (Use ← → para navegar)
                </span>
              </div>

              {currentQuestionIndex === allQuestions.length - 1 ? (
                // Última pergunta - mostrar botão "Concluir" se todas obrigatórias estiverem respondidas
                <Button
                  onClick={handleComplete}
                  disabled={!areAllRequiredQuestionsAnswered() || saving}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="size-4" />
                      Concluir
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={goToNext}
                  disabled={(() => {
                    if (saving) return true
                    const currentQuestion = allQuestions[currentQuestionIndex]
                    if (!currentQuestion) return true
                    
                    // Verificar se pergunta obrigatória foi respondida
                    if (currentQuestion.required && !isQuestionAnswered(currentQuestion.id)) {
                      return true
                    }
                    
                    // Verificar validação de minLength
                    const answer = answers[currentQuestion.id] || {}
                    const answerText = answer.valueText || ''
                    const validation = currentQuestion.validation_schema
                    
                    if (validation?.minLength && answerText.length < validation.minLength) {
                      return true
                    }
                    
                    return false
                  })()}
                  className="flex items-center gap-2"
                >
                  Próxima
                  <ChevronRight className="size-4" />
                </Button>
              )}
            </div>

            {/* Mensagem de aviso se pergunta obrigatória não foi respondida */}
            {allQuestions[currentQuestionIndex]?.required && 
             !isQuestionAnswered(allQuestions[currentQuestionIndex].id) && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  ⚠️ Esta pergunta é obrigatória. Por favor, responda antes de avançar.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Card de Relatório */}
      <SectionReportCard
        report={report}
        loading={loadingReport}
        generating={generatingReport}
        onGenerate={handleGenerateReport}
        sectionCode={sectionCode}
        sectionTitle={sectionTitle}
      />
    </div>
  )
}

