import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  Building2,
  FileText,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalClinics: number
  totalReports: number
  reportsToday: number
  reportsThisMonth: number
  pendingReports: number
  failedReports: number
}

export default function DashboardAdmin() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setIsLoading(true)
      try {
        const statsData = await api.getAdminStats()
        setStats(statsData)
      } catch (error) {
        // Fallback: buscar dados separadamente se endpoint não existir
        const users = await api.getAllUsers()
        const clinics = await api.getAllClinics()
        
        setStats({
          totalUsers: users.users.length,
          activeUsers: users.users.filter((u: any) => u.isActive).length,
          totalClinics: clinics.clinics?.length || 0,
          totalReports: 0,
          reportsToday: 0,
          reportsThisMonth: 0,
          pendingReports: 0,
          failedReports: 0,
        })
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      toast.error('Erro ao carregar estatísticas')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Dashboard Administrativo
        </h1>
        <p className="text-slate-500 mt-1">
          Visão geral do sistema e métricas principais
        </p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeUsers || 0} ativos
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clínicas</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalClinics || 0}</div>
            <p className="text-xs text-muted-foreground">Cadastradas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relatórios</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReports || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.reportsThisMonth || 0} este mês
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
            <Activity className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats && stats.failedReports > 0 ? (
                <span className="text-red-600">{stats.failedReports}</span>
              ) : (
                <CheckCircle2 className="h-6 w-6 text-green-600 inline" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats && stats.failedReports > 0
                ? 'Erros detectados'
                : 'Sistema operacional'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Atividade Recente */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Relatórios Hoje
            </CardTitle>
            <CardDescription>Gerações realizadas hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.reportsToday || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Pendentes
            </CardTitle>
            <CardDescription>Relatórios em processamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.pendingReports || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Falhas
            </CardTitle>
            <CardDescription>Relatórios com erro</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.failedReports || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <a
              href="/admin/usuarios"
              className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Users className="h-6 w-6 text-blue-600 mb-2" />
              <h3 className="font-semibold">Gerenciar Usuários</h3>
              <p className="text-sm text-slate-500">Criar, editar e gerenciar usuários</p>
            </a>
            <a
              href="/admin/clinicas"
              className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Building2 className="h-6 w-6 text-green-600 mb-2" />
              <h3 className="font-semibold">Gerenciar Clínicas</h3>
              <p className="text-sm text-slate-500">Visualizar e gerenciar clínicas</p>
            </a>
            <a
              href="/admin/relatorios"
              className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
            >
              <FileText className="h-6 w-6 text-purple-600 mb-2" />
              <h3 className="font-semibold">Ver Relatórios</h3>
              <p className="text-sm text-slate-500">Histórico e gerenciamento</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

