import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { useSectionData } from '@/hooks/useSectionData'
import { useSectionReport } from '@/hooks/useSectionReport'
import SectionReportCard from '@/components/dossier/SectionReportCard'
import StrategicChoicesManager from '@/components/dossier/entities/StrategicChoicesManager'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Loader2, AlertCircle, CheckCircle2, Target } from 'lucide-react'

interface DossierStrategyPageProps {
  sectionCode: string
}

export default function DossierStrategyPage({ sectionCode }: DossierStrategyPageProps) {
  const router = useRouter()
  const dossierId = typeof router.query.dossierId === 'string' ? router.query.dossierId : undefined

  const { sectionData, loading, error, completionPercent } = useSectionData(dossierId, sectionCode)
  const {
    report,
    loadingReport,
    generatingReport,
    handleGenerateReport,
  } = useSectionReport(dossierId, sectionCode)

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

  // Calcular status dos insumos (seções anteriores)
  const diagnosticSections = ['IDENTITY', 'BUSINESS_MODEL', 'MARKET', 'OFFER', 'OPERATIONS', 'PEOPLE']
  // TODO: buscar status real das seções do dossierId

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Seção */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-lg">
              <Target className="size-6 text-teal-600" />
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
          <strong>Seção de Síntese & Decisões Estratégicas:</strong> Esta seção consolida os dados dos blocos diagnósticos
          (Identidade, Mercado, Oferta, Operações, Pessoas) e gera uma síntese estratégica com escolhas claras,
          trade-offs explícitos e renúncias necessárias.
        </AlertDescription>
      </Alert>

      {/* Status dos insumos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status dos Insumos Diagnósticos</CardTitle>
          <CardDescription>
            A qualidade da síntese estratégica depende da completude dos blocos anteriores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {diagnosticSections.map((section) => (
              <div key={section} className="flex items-center justify-between">
                <span className="text-sm font-medium">{section}</span>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-green-600" />
                  <span className="text-xs text-slate-500">Aguardando dados reais</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Escolhas Estratégicas (entidades) */}
      <StrategicChoicesManager dossierId={dossierId} />

      {/* Relatório de Síntese Estratégica */}
      <SectionReportCard
        report={report}
        loading={loadingReport}
        generating={generatingReport}
        onGenerate={handleGenerateReport}
        sectionCode={sectionCode}
        sectionTitle="Síntese Estratégica"
      />
    </div>
  )
}
