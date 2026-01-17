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
import { FileText, RefreshCw, Download, Eye, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Report {
  id: string
  clinic_id: string
  clinic_name?: string
  report_type: string
  generated_at: string
  status?: 'success' | 'pending' | 'failed'
  error?: string
}

export default function RelatoriosAdmin() {
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  useEffect(() => {
    loadReports()
  }, [])

  useEffect(() => {
    filterReports()
  }, [reports, searchTerm, typeFilter, statusFilter])

  const filterReports = () => {
    let filtered = [...reports]

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.clinic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.report_type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((r) => r.report_type === typeFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter)
    }

    setFilteredReports(filtered)
  }

  const loadReports = async () => {
    try {
      setIsLoading(true)
      try {
        const response = await api.getAllReports()
        setReports(response.reports || [])
      } catch (error: any) {
        // Se endpoint não existir, usar array vazio
        setReports([])
        console.warn('Endpoint de relatórios não disponível:', error)
      }
    } catch (error: any) {
      toast.error('Erro ao carregar relatórios')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReprocess = async (reportId: string) => {
    try {
      // TODO: Implementar reprocessamento
      toast.info('Funcionalidade de reprocessamento em desenvolvimento')
    } catch (error: any) {
      toast.error('Erro ao reprocessar relatório')
    }
  }

  const handleDownload = async (reportId: string) => {
    try {
      // TODO: Implementar download
      toast.info('Funcionalidade de download em desenvolvimento')
    } catch (error: any) {
      toast.error('Erro ao baixar relatório')
    }
  }

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      diagnostic: 'Diagnóstico',
      strategic: 'Estratégico',
      advanced: 'Análise Avançada',
      tactical: 'Tático',
      operational: 'Operacional',
      final: 'Relatório Final',
    }
    return labels[type] || type
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default">Sucesso</Badge>
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Relatórios</h1>
          <p className="text-slate-500 mt-1">
            Histórico, fila e gerenciamento de relatórios gerados
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reports.filter((r) => r.status === 'success').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {reports.filter((r) => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Falhas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {reports.filter((r) => r.status === 'failed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Label className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4" />
                Buscar
              </Label>
              <Input
                placeholder="Clínica ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-[180px]">
              <Label className="mb-2">Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="diagnostic">Diagnóstico</SelectItem>
                  <SelectItem value="strategic">Estratégico</SelectItem>
                  <SelectItem value="advanced">Análise Avançada</SelectItem>
                  <SelectItem value="tactical">Tático</SelectItem>
                  <SelectItem value="operational">Operacional</SelectItem>
                  <SelectItem value="final">Relatório Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[150px]">
              <Label className="mb-2">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatórios ({filteredReports.length})
          </CardTitle>
          <CardDescription>Histórico de todos os relatórios gerados</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Nenhum relatório encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clínica</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data de Geração</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {report.clinic_name || report.clinic_id}
                    </TableCell>
                    <TableCell>{getReportTypeLabel(report.report_type)}</TableCell>
                    <TableCell>
                      {new Date(report.generated_at).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedReport(report)}
                          title="Ver Detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(report.id)}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {report.status === 'failed' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleReprocess(report.id)}
                            title="Reprocessar"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Relatório</DialogTitle>
            <DialogDescription>Informações completas do relatório</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-slate-500">ID</Label>
                  <p className="font-mono text-sm">{selectedReport.id}</p>
                </div>
                <div>
                  <Label className="text-sm text-slate-500">Tipo</Label>
                  <p>{getReportTypeLabel(selectedReport.report_type)}</p>
                </div>
                <div>
                  <Label className="text-sm text-slate-500">Clínica</Label>
                  <p>{selectedReport.clinic_name || selectedReport.clinic_id}</p>
                </div>
                <div>
                  <Label className="text-sm text-slate-500">Data</Label>
                  <p>{new Date(selectedReport.generated_at).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <Label className="text-sm text-slate-500">Status</Label>
                  <div>{getStatusBadge(selectedReport.status)}</div>
                </div>
              </div>
              {selectedReport.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <Label className="text-sm text-red-700 font-semibold">Erro:</Label>
                  <p className="text-sm text-red-600 mt-1">{selectedReport.error}</p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleDownload(selectedReport.id)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                {selectedReport.status === 'failed' && (
                  <Button onClick={() => handleReprocess(selectedReport.id)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reprocessar
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

