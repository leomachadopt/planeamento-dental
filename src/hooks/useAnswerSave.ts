import { useState, useEffect } from 'react'
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
    }
  }, [sectionData])

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
      const percent = await calculateSectionCompletion(dossierId, sectionCode)
      
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

  return {
    answers,
    setAnswers,
    handleAnswerChange,
    handleSaveAnswers,
    saving,
  }
}

