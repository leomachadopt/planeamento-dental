import { useEffect, useRef } from 'react'
import { useStrategyStore } from '@/stores/useStrategyStore'

/**
 * Hook que carrega automaticamente a última clínica selecionada
 * quando o aplicativo é iniciado
 */
export function useAutoLoadClinic() {
  const { currentClinicId, loadClinicData, isLoading } = useStrategyStore()
  const hasTriedToLoad = useRef(false)

  useEffect(() => {
    // Previne múltiplas tentativas de carregamento
    if (hasTriedToLoad.current) {
      console.log('⏭️ Auto-load já foi executado, pulando...')
      return
    }

    // Só carrega se não houver nenhuma clínica já carregada
    if (!currentClinicId && !isLoading) {
      const savedClinicId = localStorage.getItem('currentClinicId')

      console.log('🔍 Verificando auto-load:', {
        savedClinicId,
        currentClinicId,
        isLoading,
      })

      if (savedClinicId) {
        console.log('🔄 Carregando última clínica selecionada:', savedClinicId)
        hasTriedToLoad.current = true

        loadClinicData(savedClinicId).catch((error) => {
          console.error('❌ Erro ao carregar clínica salva:', error)
          // Se falhar, remove do localStorage
          localStorage.removeItem('currentClinicId')
          hasTriedToLoad.current = false // Permite tentar novamente
        })
      } else {
        console.log('ℹ️ Nenhuma clínica salva no localStorage')
      }
    } else {
      console.log('ℹ️ Clínica já carregada ou loading:', {
        currentClinicId,
        isLoading,
      })
    }
  }, [currentClinicId, isLoading, loadClinicData])

  return null
}
