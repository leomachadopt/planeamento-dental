import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'

/**
 * Página Admin legada - redireciona para a nova área administrativa
 * Mantida para compatibilidade com links antigos
 */
export default function Admin() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  return null
}
