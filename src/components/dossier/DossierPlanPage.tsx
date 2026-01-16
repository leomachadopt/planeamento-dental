import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { useSectionData } from '@/hooks/useSectionData'
import { useSectionReport } from '@/hooks/useSectionReport'
import SectionReportCard from '@/components/dossier/SectionReportCard'
import InitiativesManager from '@/components/dossier/entities/InitiativesManager'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, Calendar, Plus } from 'lucide-react'

interface DossierPlanPageProps {
  sectionCode: string
}

export default function DossierPlanPage({ sectionCode }: DossierPlanPageProps) {
  const router = useRouter()
  const dossierId = typeof router.query.dossierId === 'string' ? router.query.dossierId : undefined

  const { sectionData, loading, error } = useSectionData(dossierId, sectionCode)
  const {
    report,
    loadingReport,
    generatingReport,
    handleGenerateReport,
  } = useSectionReport(dossierId, sectionCode)

  const [okrs, setOkrs] = useState<any[]>([])
  const [initiatives, setInitiatives] = useState<any[]>([])

  if (!dossierId) {
    return null
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
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <Calendar className="size-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle>{sectionData.section.name}</CardTitle>
              {sectionData.section.description && (
                <CardDescription className="mt-2">
                  {sectionData.section.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alerta sobre a natureza da seção */}
      <Alert>
        <AlertCircle className="size-4" />
        <AlertDescription>
          <strong>Seção de Planejamento:</strong> Traduza a síntese estratégica em um plano executável com OKRs,
          iniciativas priorizadas, responsáveis e prazos para os próximos 12 meses.
        </AlertDescription>
      </Alert>

      {/* OKRs Placeholder */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">OKRs (Objectives & Key Results)</CardTitle>
              <CardDescription>
                Objetivos estratégicos e resultados-chave mensuráveis
              </CardDescription>
            </div>
            <Button size="sm" variant="outline">
              <Plus className="size-4 mr-2" />
              Adicionar OKR
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <p>Nenhum OKR cadastrado ainda</p>
            <p className="text-sm mt-2">
              Use "Gerar Plano Inicial com IA" abaixo para começar, ou adicione manualmente
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Iniciativas (usando componente existente) */}
      <InitiativesManager dossierId={dossierId} />

      {/* Relatório/Plano Inicial com IA */}
      <SectionReportCard
        report={report}
        loading={loadingReport}
        generating={generatingReport}
        onGenerate={handleGenerateReport}
        sectionCode={sectionCode}
        sectionTitle="Plano Inicial (gerado por IA)"
      />
    </div>
  )
}
