import { Button } from '@/components/ui/button'
import { Loader2, Sparkles } from 'lucide-react'
import { useStrategyStore } from '@/stores/useStrategyStore'

interface GenerateReportButtonProps {
  reportType:
    | 'diagnostic'
    | 'strategic'
    | 'advanced'
    | 'tactical'
    | 'operational'
    | 'final'
  label?: string
  variant?: 'default' | 'outline' | 'secondary'
  className?: string
}

export function GenerateReportButton({
  reportType,
  label,
  variant = 'default',
  className = '',
}: GenerateReportButtonProps) {
  const { isGeneratingReport, currentClinicId } = useStrategyStore()

  const generateFunctions = {
    diagnostic: useStrategyStore.getState().generateDiagnosticReport,
    strategic: useStrategyStore.getState().generateStrategicReport,
    advanced: useStrategyStore.getState().generateAdvancedReport,
    tactical: useStrategyStore.getState().generateTacticalReport,
    operational: useStrategyStore.getState().generateOperationalReport,
    final: useStrategyStore.getState().generateFinalReport,
  }

  const defaultLabels = {
    diagnostic: 'Gerar Diagnóstico com IA',
    strategic: 'Gerar Direcionamento Estratégico com IA',
    advanced: 'Gerar Análise Avançada com IA',
    tactical: 'Gerar Plano Tático com IA',
    operational: 'Gerar Plano Operacional com IA',
    final: 'Gerar Relatório Final com IA',
  }

  const handleGenerate = async () => {
    const generateFn = generateFunctions[reportType]
    if (generateFn) {
      await generateFn()
    }
  }

  const buttonLabel = label || defaultLabels[reportType]
  const isDisabled = isGeneratingReport || !currentClinicId

  return (
    <Button
      onClick={handleGenerate}
      disabled={isDisabled}
      variant={variant}
      className={className}
    >
      {isGeneratingReport ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          {buttonLabel}
        </>
      )}
    </Button>
  )
}
