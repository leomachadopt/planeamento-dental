import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export function useSectionReport(dossierId: string | undefined, sectionCode: string) {
  const [report, setReport] = useState<any | null>(null)
  const [loadingReport, setLoadingReport] = useState(false)
  const [generatingReport, setGeneratingReport] = useState(false)
  const hasFetchedRef = useRef(false)

  const refetchReport = async () => {
    if (!dossierId) return

    setLoadingReport(true)
    try {
      const reportData = await api.getSectionReport(dossierId, sectionCode)
      setReport(reportData)
      hasFetchedRef.current = true
    } catch (error: any) {
      // Tratar tanto 404 quanto 500 como "relatório não encontrado"
      if (
        error.message?.includes('404') || 
        error.message?.includes('500') ||
        error.message?.includes('não gerado') ||
        error.message?.includes('não encontrado') ||
        error.message?.includes('Internal Server Error')
      ) {
        setReport(null)
        hasFetchedRef.current = true
      } else {
        console.error('Erro ao carregar relatório:', error)
      }
    } finally {
      setLoadingReport(false)
    }
  }

  useEffect(() => {
    // Resetar flag quando dossierId ou sectionCode mudarem
    hasFetchedRef.current = false
    
    if (dossierId) {
      refetchReport()
    }
  }, [dossierId, sectionCode])

  const handleGenerateReport = async () => {
    if (!dossierId) return

    setGeneratingReport(true)
    try {
      const newReport = await api.generateSectionReport(dossierId, sectionCode)
      setReport(newReport)
      hasFetchedRef.current = true
      toast.success('Relatório gerado com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao gerar relatório')
    } finally {
      setGeneratingReport(false)
    }
  }

  return {
    report,
    loadingReport,
    generatingReport,
    handleGenerateReport,
    refetchReport,
  }
}

