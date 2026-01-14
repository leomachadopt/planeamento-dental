import { useState, useEffect, useRef } from 'react'
import { saveAnswers, calculateSectionCompletion, type SectionData, type AnswerInput } from '@/services/dossierService'
import { toast } from 'sonner'

export function useAnswerSave(
  dossierId: string | undefined,
  sectionCode: string,
  sectionData: SectionData | null,
  onSaveSuccess?: () => void,
) {
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasUnsavedChangesRef = useRef(false)
  const answersRef = useRef<Record<string, any>>({})

  // Sincronizar ref com state
  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  // Carregar respostas existentes quando sectionData mudar
  useEffect(() => {
    if (sectionData) {
      const answersMap: Record<string, any> = {}
      sectionData.questionSets.forEach((qs) => {
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
      answersRef.current = answersMap
      hasUnsavedChangesRef.current = false
    }
  }, [sectionData])

  // Função de salvamento silencioso (sem callback e sem toast)
  const saveAnswersSilently = async (): Promise<void> => {
    if (!dossierId || !sectionData) {
      return
    }

    // Cancelar debounce pendente se houver
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }

    // Se não há mudanças, não precisa salvar
    if (!hasUnsavedChangesRef.current) {
      return
    }

    try {
      const answerInputs: AnswerInput[] = []
      const currentAnswers = answersRef.current

      sectionData.questionSets.forEach((qs) => {
        qs.questions.forEach((q) => {
          const answer = currentAnswers[q.id]
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

      if (answerInputs.length > 0) {
        await saveAnswers(dossierId, answerInputs)
        await calculateSectionCompletion(dossierId, sectionCode)
        hasUnsavedChangesRef.current = false
        // Não chama onSaveSuccess para evitar refresh
      }
    } catch (error: any) {
      console.error('Erro no salvamento silencioso:', error)
      // Não mostrar toast para não incomodar o usuário
    }
  }

  // Auto-save com debounce
  const debouncedSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (!dossierId || !sectionData || !hasUnsavedChangesRef.current || saving) {
        return
      }

      try {
        setSaving(true)
        await saveAnswersSilently()
      } catch (error: any) {
        console.error('Erro no auto-save:', error)
      } finally {
        setSaving(false)
      }
    }, 2000) // 2 segundos de debounce
  }

  // Salvar antes de sair da página/seção
  useEffect(() => {
    return () => {
      // Cleanup: salvar antes de desmontar
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = null
      }
      if (hasUnsavedChangesRef.current && dossierId && sectionData && !saving) {
        // Salvar imediatamente ao sair
        const answerInputs: AnswerInput[] = []
        const currentAnswers = answersRef.current
        
        sectionData.questionSets.forEach((qs) => {
          qs.questions.forEach((q) => {
            const answer = currentAnswers[q.id]
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
        if (answerInputs.length > 0) {
          saveAnswers(dossierId, answerInputs).catch(console.error)
        }
      }
    }
  }, [dossierId, sectionData, saving])

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => {
      const newAnswers = {
        ...prev,
        [questionId]: value,
      }
      answersRef.current = newAnswers
      return newAnswers
    })
    hasUnsavedChangesRef.current = true
    debouncedSave()
  }

  const handleSaveAnswers = async () => {
    if (!dossierId || !sectionData) return

    // Cancelar debounce pendente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }

    setSaving(true)
    try {
      const answerInputs: AnswerInput[] = []
      const currentAnswers = answersRef.current

      sectionData.questionSets.forEach((qs) => {
        qs.questions.forEach((q) => {
          const answer = currentAnswers[q.id]
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
      const percent = await calculateSectionCompletion(dossierId, sectionCode)
      hasUnsavedChangesRef.current = false
      
      // Chamar callback de sucesso se fornecido
      if (onSaveSuccess) {
        onSaveSuccess()
      }

      return percent
    } catch (error: any) {
      console.error('Erro ao salvar respostas:', error)
      toast.error(error.message || 'Erro ao salvar respostas')
      throw error
    } finally {
      setSaving(false)
    }
  }

  // Função para verificar se uma pergunta foi respondida
  const isQuestionAnswered = (questionId: string): boolean => {
    const answer = answersRef.current[questionId]
    if (!answer) return false
    
    return (
      (answer.valueText !== undefined && answer.valueText !== null && answer.valueText !== '') ||
      (answer.valueNumber !== undefined && answer.valueNumber !== null) ||
      (answer.valueJson !== undefined && answer.valueJson !== null)
    )
  }

  // Função para verificar se todas as perguntas obrigatórias foram respondidas
  const areAllRequiredQuestionsAnswered = (): boolean => {
    if (!sectionData) return false
    
    return sectionData.questionSets.every((qs) =>
      qs.questions.every((q) => {
        if (!q.required) return true
        return isQuestionAnswered(q.id)
      })
    )
  }

  return {
    answers,
    setAnswers,
    handleAnswerChange,
    handleSaveAnswers,
    saveAnswersSilently,
    saving,
    isQuestionAnswered,
    areAllRequiredQuestionsAnswered,
  }
}


