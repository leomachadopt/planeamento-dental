import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Building2, Trash2, Eye, Download, Upload, Search, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Clinic {
  id: string
  clinic_name: string
  created_at: string
  updated_at: string
  userCount?: number
  reportCount?: number
}

export default function ClinicasAdmin() {
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newClinicName, setNewClinicName] = useState('')

  useEffect(() => {
    loadClinics()
  }, [])

  useEffect(() => {
    filterClinics()
  }, [clinics, searchTerm])

  const filterClinics = () => {
    let filtered = [...clinics]

    if (searchTerm) {
      filtered = filtered.filter((c) =>
        c.clinic_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredClinics(filtered)
  }

  const loadClinics = async () => {
    try {
      setIsLoading(true)
      const response = await api.getAllClinics()
      // A API retorna um array direto, não um objeto com 'clinics'
      setClinics(Array.isArray(response) ? response : response.clinics || [])
    } catch (error: any) {
      toast.error('Erro ao carregar clínicas')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClinic = async (clinicId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta clínica? Todos os dados serão perdidos.')) return

    try {
      await api.deleteClinic(clinicId)
      toast.success('Clínica deletada com sucesso')
      loadClinics()
    } catch (error: any) {
      toast.error('Erro ao deletar clínica')
    }
  }

  const handleExportClinic = async (clinicId: string) => {
    try {
      // TODO: Implementar endpoint de export
      toast.info('Funcionalidade de export em desenvolvimento')
    } catch (error: any) {
      toast.error('Erro ao exportar dados')
    }
  }

  const handleImportClinic = () => {
    // TODO: Implementar importação
    toast.info('Funcionalidade de import em desenvolvimento')
  }

  const handleCreateClinic = async () => {
    if (!newClinicName.trim()) {
      toast.error('Nome da clínica é obrigatório')
      return
    }

    try {
      await api.createClinic(newClinicName.trim())
      toast.success('Clínica criada com sucesso')
      setIsCreateDialogOpen(false)
      setNewClinicName('')
      loadClinics()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar clínica')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Clínicas</h1>
          <p className="text-slate-500 mt-1">Visualize e gerencie todas as clínicas cadastradas</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setNewClinicName('')}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Clínica
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Clínica</DialogTitle>
                <DialogDescription>
                  Preencha os dados para criar uma nova clínica
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da Clínica</Label>
                  <Input
                    placeholder="Digite o nome da clínica..."
                    value={newClinicName}
                    onChange={(e) => setNewClinicName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateClinic()
                      }
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateClinic} className="flex-1">
                    Criar
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleImportClinic}>
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Clínica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Nome da Clínica</Label>
              <Input
                placeholder="Digite o nome da clínica..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Clínicas Cadastradas ({filteredClinics.length})
          </CardTitle>
          <CardDescription>
            Lista de todas as clínicas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead>Última Atualização</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClinics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      Nenhuma clínica encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClinics.map((clinic) => (
                    <TableRow key={clinic.id}>
                      <TableCell className="font-medium">{clinic.clinic_name}</TableCell>
                      <TableCell>
                        {new Date(clinic.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {new Date(clinic.updated_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Ativa</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedClinic(clinic)}
                            title="Ver Detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleExportClinic(clinic.id)}
                            title="Exportar Dados"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClinic(clinic.id)}
                            title="Deletar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={!!selectedClinic} onOpenChange={() => setSelectedClinic(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedClinic?.clinic_name}</DialogTitle>
            <DialogDescription>Detalhes da clínica</DialogDescription>
          </DialogHeader>
          {selectedClinic && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-slate-500">ID</Label>
                  <p className="font-mono text-sm">{selectedClinic.id}</p>
                </div>
                <div>
                  <Label className="text-sm text-slate-500">Data de Criação</Label>
                  <p>{new Date(selectedClinic.created_at).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <Label className="text-sm text-slate-500">Última Atualização</Label>
                  <p>{new Date(selectedClinic.updated_at).toLocaleString('pt-BR')}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleExportClinic(selectedClinic.id)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Dados
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteClinic(selectedClinic.id)
                    setSelectedClinic(null)
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Deletar Clínica
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


