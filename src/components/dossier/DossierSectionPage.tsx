import { useRouter } from 'next/router'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSectionData } from '@/hooks/useSectionData'
import { useSectionReport } from '@/hooks/useSectionReport'
import { saveAnswers } from '@/services/dossierService'
import QuestionWizard from '@/components/dossier/QuestionWizard'
import SectionReportCard from '@/components/dossier/SectionReportCard'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Question } from '@/services/dossierService'

interface DossierSectionPageProps {
  sectionCode: string
  entityBlocks?: React.ReactNode
}

export default function DossierSectionPage({
  sectionCode,
  entityBlocks,
}: DossierSectionPageProps) {
  const router = useRouter()
  const dossierId = typeof router.query.dossierId === 'string' ? router.query.dossierId : undefined
  const { sectionData, loading, error, completionPercent, refetch } =
    useSectionData(dossierId, sectionCode)
  const {
    report,
    loadingReport,
    generatingReport,
    handleGenerateReport,
  } = useSectionReport(dossierId, sectionCode)

  const [savingAnswers, setSavingAnswers] = useState<Set<string>>(new Set())
  const [answersMap, setAnswersMap] = useState<Record<string, any>>({})
  const saveTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({})

  // Inicializar answersMap quando sectionData mudar
  useEffect(() => {
    if (sectionData?.questionSets) {
      console.log('📥 Carregando dados da seção:', {
        sectionCode,
        questionSetsCount: sectionData.questionSets.length,
      })

      const initialAnswers: Record<string, any> = {}
      let answersCount = 0

      sectionData.questionSets.forEach((qs) => {
        qs.questions.forEach((q) => {
          if (q.answer && Object.keys(q.answer).length > 0) {
            answersCount++
            console.log('📝 Resposta encontrada:', {
              questionId: q.id,
              questionCode: q.code,
              answerKeys: Object.keys(q.answer),
              valueText: q.answer.value_text?.substring(0, 50),
              valueNumber: q.answer.value_number,
              valueJson: q.answer.value_json,
            })
          }
          initialAnswers[q.id] = q.answer || {}
        })
      })

      console.log(`✅ Total de ${answersCount} respostas carregadas`)
      setAnswersMap(initialAnswers)
    }
  }, [sectionData, sectionCode])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(saveTimeoutRef.current).forEach(clearTimeout)
    }
  }, [])

  if (!dossierId) {
    return null
  }

  const handleAnswerChange = useCallback(
    (
      question: Question,
      value: {
        valueText?: string
        valueNumber?: number
        valueJson?: any
      },
    ) => {
      if (!question.id) return

      // Atualizar estado local imediatamente para feedback visual
      setAnswersMap((prev) => ({
        ...prev,
        [question.id]: value,
      }))

      // Limpar timeout anterior se existir
      if (saveTimeoutRef.current[question.id]) {
        clearTimeout(saveTimeoutRef.current[question.id])
      }

      // Marcar como salvando após um pequeno delay (para evitar piscar o ícone)
      const savingTimeout = setTimeout(() => {
        setSavingAnswers((prev) => new Set(prev).add(question.id))
      }, 300)

      // Debounce: salvar após 1 segundo de inatividade
      saveTimeoutRef.current[question.id] = setTimeout(async () => {
        try {
          console.log('💾 Salvando resposta:', {
            dossierId,
            questionId: question.id,
            questionCode: question.code,
            valueText: value.valueText?.substring(0, 50),
            valueNumber: value.valueNumber,
            valueJson: value.valueJson,
          })

          const result = await saveAnswers(dossierId, [
            {
              questionId: question.id,
              valueText: value.valueText,
              valueNumber: value.valueNumber,
              valueJson: value.valueJson,
              source: 'user',
            },
          ])

          console.log('✅ Resposta salva com sucesso:', result)

          // Não fazer refetch aqui - o estado local já está atualizado
          // Isso evita o refresh da tela enquanto o usuário está digitando
        } catch (err) {
          console.error('❌ Erro ao salvar resposta:', err)
          toast.error('Erro ao salvar resposta')

          // Reverter mudança em caso de erro
          setAnswersMap((prev) => ({
            ...prev,
            [question.id]: sectionData?.questionSets
              .flatMap((qs) => qs.questions)
              .find((q) => q.id === question.id)?.answer || {},
          }))
        } finally {
          clearTimeout(savingTimeout)
          setSavingAnswers((prev) => {
            const next = new Set(prev)
            next.delete(question.id)
            return next
          })
          delete saveTimeoutRef.current[question.id]
        }
      }, 1000) // 1 segundo de debounce
    },
    [dossierId, sectionData],
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-teal-600" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Erro ao carregar dados da seção</p>
            <p className="text-sm mt-2">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!sectionData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-slate-500">
            <p>Nenhum dado encontrado para esta seção</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Seção */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{sectionData.section.name}</CardTitle>
              {sectionData.section.description && (
                <CardDescription className="mt-2">
                  {sectionData.section.description}
                </CardDescription>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Completude
              </div>
              <div className="text-2xl font-bold">{completionPercent}%</div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={completionPercent} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Perguntas - Usar QuestionWizard para todas as seções */}
      <QuestionWizard
        questionSets={sectionData.questionSets}
        answersMap={answersMap}
        savingAnswers={savingAnswers}
        onAnswerChange={handleAnswerChange}
        sectionCode={sectionCode}
      />

      {/* Blocos de Entidades */}
      {entityBlocks && (
        <div className="space-y-4">
          {entityBlocks}
        </div>
      )}

      {/* Relatório da Seção */}
      <SectionReportCard
        report={report}
        loading={loadingReport}
        generating={generatingReport}
        onGenerate={handleGenerateReport}
        sectionCode={sectionCode}
        sectionTitle={`Relatório - ${sectionData.section.name}`}
      />
    </div>
  )
}
