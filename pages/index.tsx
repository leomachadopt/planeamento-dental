import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  FileText, 
  BookOpenCheck, 
  Plus, 
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'
import { createDossier } from '@/services/dossierService'
import { toast } from 'sonner'

interface Dossier {
  id: string
  title: string
  status: string
  clinic_id: string
  created_at: string
  updated_at: string
}

interface SectionStatus {
  section_code: string
  section_name: string
  status: string
  completion_percent: number
  has_report: boolean
  report_status?: 'generated' | 'stale' | 'error'
}

export default function Index() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [dossiers, setDossiers] = useState<Dossier[]>([])
  const [loading, setLoading] = useState(true)
  const [dossierReports, setDossierReports] = useState<Record<string, SectionStatus[]>>({})
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newDossierTitle, setNewDossierTitle] = useState('')
  const [creatingDossier, setCreatingDossier] = useState(false)

  useEffect(() => {
    loadDossiers()
  }, [user?.clinicId])

  const loadDossiers = async () => {
    if (!user?.clinicId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await api.getDossiers(user.clinicId)
      setDossiers(data)

      for (const dossier of data) {
        try {
          const reportsResponse = await api.getDossierReports(dossier.id)
          setDossierReports(prev => ({
            ...prev,
            [dossier.id]: reportsResponse,
          }))
        } catch (error) {
          // Ignorar erros de relatórios
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dossiês:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'finalized':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle2 className="size-3 mr-1" />
            Finalizado
          </Badge>
        )
      case 'archived':
        return (
          <Badge variant="outline">
            <Clock className="size-3 mr-1" />
            Arquivado
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <Clock className="size-3 mr-1" />
            Em Edição
          </Badge>
        )
    }
  }

  const getReportStatusBadge = (reportStatus?: string) => {
    if (!reportStatus) {
      return (
        <Badge variant="outline" className="text-xs">
          Não gerado
        </Badge>
      )
    }

    switch (reportStatus) {
      case 'generated':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
            Gerado
          </Badge>
        )
      case 'stale':
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-xs">
            Desatualizado
          </Badge>
        )
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">
            Erro
          </Badge>
        )
      default:
        return null
    }
  }

  const handleCreateDossier = async () => {
    if (!newDossierTitle.trim()) {
      toast.error('Digite o título do dossiê')
      return
    }

    if (!user?.clinicId) {
      toast.error('Selecione uma clínica primeiro')
      return
    }

    setCreatingDossier(true)
    try {
      const newDossier = await createDossier(user.clinicId, newDossierTitle.trim())
      setNewDossierTitle('')
      setIsCreateDialogOpen(false)
      toast.success('Dossiê criado com sucesso!')
      router.push(`/dossie/${newDossier.id}/identity`)
      await loadDossiers()
    } catch (error: any) {
      console.error('Erro ao criar dossiê:', error)
      toast.error(error.message || 'Erro ao criar dossiê')
    } finally {
      setCreatingDossier(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Centro de Documentação Estratégica
          </h1>
          <p className="text-slate-500 mt-1 max-w-2xl">
            Gerencie seus dossiês estratégicos e visualize os relatórios gerados por IA para cada seção.
            Documente o negócio da sua clínica de forma estruturada e gere documentos formais.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-200/50"
              >
                <Plus className="mr-2 size-4" />
                Novo Dossiê
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Dossiê</DialogTitle>
                <DialogDescription>
                  Crie um novo dossiê para documentar a estratégia da clínica. Cada dossiê representa um snapshot no tempo.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="dossier-title">Título do Dossiê</Label>
                  <Input
                    id="dossier-title"
                    value={newDossierTitle}
                    onChange={(e) => setNewDossierTitle(e.target.value)}
                    placeholder="Ex: Dossiê 2026 - Q1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateDossier()
                      }
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateDossier} disabled={creatingDossier}>
                  {creatingDossier ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Dossiê'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {dossiers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="text-center py-12">
            <BookOpenCheck className="size-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-semibold mb-2">Nenhum dossiê criado</h3>
            <p className="text-slate-500 mb-6">
              Comece criando um novo dossiê para documentar o negócio da sua clínica.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 size-4" />
              Criar Primeiro Dossiê
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dossiers.map((dossier) => {
            const reports = dossierReports[dossier.id] || []
            const hasReports = reports.some(r => r.has_report)
            const staleReports = reports.filter(r => r.report_status === 'stale').length
            const generatedReports = reports.filter(r => r.report_status === 'generated').length

            return (
              <Card key={dossier.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <BookOpenCheck className="size-5 text-teal-600" />
                        {dossier.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Criado em {new Date(dossier.created_at).toLocaleDateString('pt-PT')}
                      </CardDescription>
                    </div>
                    {getStatusBadge(dossier.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Relatórios gerados:</span>
                      <span className="font-semibold">
                        {generatedReports} de {reports.length}
                      </span>
                    </div>
                    {staleReports > 0 && (
                      <div className="flex items-center gap-2 text-xs text-amber-600">
                        <AlertCircle className="size-4" />
                        <span>{staleReports} relatório(s) desatualizado(s)</span>
                      </div>
                    )}
                  </div>

                  {reports.length > 0 && (
                    <div className="space-y-1 pt-2 border-t">
                      {reports.slice(0, 3).map((report) => (
                        <div key={report.section_code} className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 truncate">{report.section_name}</span>
                          {getReportStatusBadge(report.report_status)}
                        </div>
                      ))}
                      {reports.length > 3 && (
                        <div className="text-xs text-slate-500 pt-1">
                          +{reports.length - 3} mais seções
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      asChild 
                      variant="outline" 
                      className="flex-1"
                    >
                      <Link href={`/dossie/${dossier.id}/identity`}>
                        Abrir Dossiê
                        <ArrowRight className="ml-2 size-4" />
                      </Link>
                    </Button>
                    {hasReports && (
                      <Button 
                        asChild 
                        variant="ghost" 
                        size="sm"
                      >
                        <Link href={`/dossie/${dossier.id}/relatorios`}>
                          <FileText className="size-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Card className="mt-6 border-teal-100 bg-teal-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-teal-900">
            <FileText className="size-5" />
            Sobre o Sistema de Documentação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 leading-relaxed">
            Este sistema permite <strong>documentar e estruturar</strong> o pensamento estratégico da sua clínica.
            Cada dossiê contém seções para Identidade, Mercado, Oferta, Operações, Estratégia e Plano.
            Você pode preencher questionários, cadastrar entidades estruturadas e gerar relatórios descritivos via IA.
            O sistema gera documentos formais que podem ser exportados em PDF.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

