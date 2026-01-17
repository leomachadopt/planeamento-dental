import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useAuthStore } from '@/stores/useAuthStore'
import Layout from '@/components/Layout'
import AdminLayout from '@/components/AdminLayout'
import '../src/main.css'
import '../src/components/ui/sonner.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore()
  const [isMounted, setIsMounted] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Só verificar autenticação se houver token no localStorage
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage')
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage)
          if (parsed.state?.token) {
            checkAuth()
          }
        } catch {
          // Ignorar erro de parsing
        }
      }
    }
  }, [checkAuth])

  useEffect(() => {
    if (router.isReady) {
      setIsReady(true)
    }
  }, [router.isReady])

  // Verificar autenticação para rotas protegidas (apenas no cliente após router estar pronto)
  useEffect(() => {
    if (!isMounted || !isReady || isLoading) return

    const pathname = router.pathname
    const isPublicRoute = pathname === '/login' || pathname === '/register'
    const isAdminRoute = pathname.startsWith('/admin')

    if (!isPublicRoute && !isAuthenticated) {
      router.push('/login')
      return
    }

    // Redirecionar admin que está na rota raiz para área administrativa
    if (isAuthenticated && pathname === '/' && !isAdminRoute) {
      const { user } = useAuthStore.getState()
      if (user?.role === 'admin') {
        router.push('/admin')
        return
      }
    }

    if (isAdminRoute && isAuthenticated) {
      const { user } = useAuthStore.getState()
      if (user?.role !== 'admin') {
        router.push('/')
        return
      }
    }
  }, [isAuthenticated, isLoading, router, isMounted, isReady])

  if (!isMounted || !isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando...</p>
        </div>
      </div>
    )
  }

  const pathname = router.pathname
  const isPublicRoute = pathname === '/login' || pathname === '/register'
  const isAdminRoute = pathname.startsWith('/admin')

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {isPublicRoute ? (
        <Component {...pageProps} />
      ) : isAdminRoute ? (
        <AdminLayout>
          <Component {...pageProps} />
        </AdminLayout>
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </TooltipProvider>
  )
}
