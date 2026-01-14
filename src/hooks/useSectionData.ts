import { useState, useEffect } from 'react'
import {
  getSectionData,
  calculateSectionCompletion,
  type SectionData,
} from '@/services/dossierService'
import { toast } from 'sonner'

export function useSectionData(dossierId: string | undefined, sectionCode: string) {
  const [sectionData, setSectionData] = useState<SectionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [completionPercent, setCompletionPercent] = useState(0)

  const refetch = async () => {
    if (!dossierId) return

    setLoading(true)
    setError(null)
    try {
      const data = await getSectionData(dossierId, sectionCode)
      setSectionData(data)

      // Calcular completude
      const percent = await calculateSectionCompletion(dossierId, sectionCode)
      setCompletionPercent(percent)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao carregar dados da seção')
      setError(error)
      console.error('Erro ao carregar dados da seção:', err)
      toast.error('Erro ao carregar dados da seção')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (dossierId) {
      refetch()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dossierId, sectionCode])

  return {
    sectionData,
    loading,
    error,
    completionPercent,
    refetch,
  }
}

