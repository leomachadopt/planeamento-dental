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
import { Save, Loader2 } from 'lucide-react'
import { useSectionData } from '@/hooks/useSectionData'
import { useAnswerSave } from '@/hooks/useAnswerSave'
import { useSectionReport } from '@/hooks/useSectionReport'
import QuestionRenderer from './QuestionRenderer'
import SectionReportCard from './SectionReportCard'
import type { Question } from '@/services/dossierService'

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
  const { answers, handleAnswerChange, handleSaveAnswers, saving } = useAnswerSave(
    dossierId,
    sectionCode,
    sectionData,
    () => {
      // Recarregar dados após salvar
      refetch()
    },
  )
  const { report, loadingReport, generatingReport, handleGenerateReport } = useSectionReport(
    dossierId,
    sectionCode,
  )

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

      {/* Questionário */}
      {sectionData.questionSets.map((questionSet) => (
        <Card key={questionSet.id}>
          <CardHeader>
            <CardTitle>{questionSet.name}</CardTitle>
            {questionSet.subsection_name && (
              <CardDescription>{questionSet.subsection_name}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {questionSet.questions.map((question: Question) => {
              const answer = answers[question.id] || {}
              return (
                <div key={question.id} className="space-y-2">
                  <Label className="text-base font-semibold">
                    {question.text}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {question.help_text && (
                    <p className="text-sm text-slate-500">{question.help_text}</p>
                  )}
                  <QuestionRenderer
                    question={question}
                    answer={answer}
                    onChange={(value) => handleAnswerChange(question.id, value)}
                  />
                </div>
              )
            })}
          </CardContent>
        </Card>
      ))}

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

