import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from '@/stores/useAuthStore'

/**
 * Página Admin legada - redireciona para a nova área administrativa
 * Mantida para compatibilidade com links antigos
 */
export default function Admin() {
  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (user?.role === 'admin') {
      router.replace('/admin')
    } else {
      router.replace('/')
    }
  }, [user, router])

  return null
}
