import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { useSectionData } from '@/hooks/useSectionData'
import { useSectionReport } from '@/hooks/useSectionReport'
import { saveAnswers } from '@/services/dossierService'
import QuestionRenderer from '@/components/dossier/QuestionRenderer'
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

  // Inicializar answersMap quando sectionData mudar
  useEffect(() => {
    if (sectionData?.questionSets) {
      const initialAnswers: Record<string, any> = {}
      sectionData.questionSets.forEach((qs) => {
        qs.questions.forEach((q) => {
          initialAnswers[q.id] = q.answer || {}
        })
      })
      setAnswersMap(initialAnswers)
    }
  }, [sectionData])

  if (!dossierId) {
    return null
  }

  const handleAnswerChange = async (
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

    setSavingAnswers((prev) => new Set(prev).add(question.id))

    try {
      await saveAnswers(dossierId, [
        {
          questionId: question.id,
          valueText: value.valueText,
          valueNumber: value.valueNumber,
          valueJson: value.valueJson,
          source: 'user',
        },
      ])

      // Atualizar dados da seção após salvar
      await refetch()
    } catch (err) {
      console.error('Erro ao salvar resposta:', err)
      toast.error('Erro ao salvar resposta')
      // Reverter mudança em caso de erro
      setAnswersMap((prev) => ({
        ...prev,
        [question.id]: sectionData?.questionSets
          .flatMap((qs) => qs.questions)
          .find((q) => q.id === question.id)?.answer || {},
      }))
    } finally {
      setSavingAnswers((prev) => {
        const next = new Set(prev)
        next.delete(question.id)
        return next
      })
    }
  }

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

      {/* Perguntas - Usar QuestionWizard para IDENTITY, senão mostrar todas */}
      {sectionCode === 'IDENTITY' ? (
        <QuestionWizard
          questionSets={sectionData.questionSets}
          answersMap={answersMap}
          savingAnswers={savingAnswers}
          onAnswerChange={handleAnswerChange}
          sectionCode={sectionCode}
        />
      ) : (
        sectionData.questionSets.map((questionSet) => (
          <Card key={questionSet.id}>
            <CardHeader>
              <CardTitle className="text-lg">{questionSet.name}</CardTitle>
              {questionSet.subsection_name && (
                <CardDescription>{questionSet.subsection_name}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {questionSet.questions.map((question) => {
                const answer = answersMap[question.id] || question.answer || {}
                const isSaving = savingAnswers.has(question.id)

                return (
                  <div key={question.id} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {question.text}
                        {question.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      {isSaving && (
                        <Loader2 className="size-4 animate-spin text-teal-600" />
                      )}
                    </div>
                    {question.help_text && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {question.help_text}
                      </p>
                    )}
                    <QuestionRenderer
                      question={question}
                      answer={answer}
                      onChange={(value) => handleAnswerChange(question, value)}
                    />
                  </div>
                )
              })}
            </CardContent>
          </Card>
        ))
      )}

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
