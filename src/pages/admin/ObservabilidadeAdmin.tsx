import { useEffect, useState } from 'react'
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
import { Activity, LogIn, AlertCircle, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
  user?: string
  endpoint?: string
  statusCode?: number
}

interface Session {
  id: string
  userId: string
  userName: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
  lastActivity: string
  expiresAt: string
}

export default function ObservabilidadeAdmin() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      // TODO: Implementar endpoints
      // Por enquanto, mock
      setLogs([])
      setSessions([])
    } catch (error) {
      toast.error('Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('Deseja revogar esta sessão?')) return

    try {
      // TODO: Implementar revogação
      toast.success('Sessão revogada')
      loadData()
    } catch (error) {
      toast.error('Erro ao revogar sessão')
    }
  }

  const getLogBadge = (level: string) => {
    switch (level) {
      case 'error':
        return <Badge variant="destructive">Erro</Badge>
      case 'warning':
        return <Badge variant="outline" className="border-amber-500 text-amber-700">Aviso</Badge>
      case 'success':
        return <Badge variant="default" className="bg-green-600">Sucesso</Badge>
      default:
        return <Badge variant="secondary">Info</Badge>
    }
  }

  const getStatusBadge = (statusCode?: number) => {
    if (!statusCode) return null
    if (statusCode >= 200 && statusCode < 300) {
      return <Badge variant="default" className="bg-green-600">{statusCode}</Badge>
    }
    if (statusCode >= 400 && statusCode < 500) {
      return <Badge variant="destructive">{statusCode}</Badge>
    }
    if (statusCode >= 500) {
      return <Badge variant="destructive">{statusCode}</Badge>
    }
    return <Badge variant="secondary">{statusCode}</Badge>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Observabilidade & Auditoria</h1>
          <p className="text-slate-500 mt-1">
            Logs do sistema, sessões ativas e monitoramento
          </p>
        </div>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Cards de Status */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Erros (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {logs.filter((l) => l.level === 'error').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avisos (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {logs.filter((l) => l.level === 'warning').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="font-semibold">Operacional</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="w-full">
        <TabsList>
          <TabsTrigger value="logs">Logs do Sistema</TabsTrigger>
          <TabsTrigger value="sessions">Sessões Ativas</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Logs Recentes
              </CardTitle>
              <CardDescription>
                Últimas 100 entradas de log do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  Nenhum log encontrado
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Nível</TableHead>
                      <TableHead>Mensagem</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>{getLogBadge(log.level)}</TableCell>
                        <TableCell className="max-w-md truncate">{log.message}</TableCell>
                        <TableCell>{log.user || '-'}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.endpoint || '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(log.statusCode)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Sessões Ativas
              </CardTitle>
              <CardDescription>
                Sessões de usuários atualmente conectados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  Nenhuma sessão ativa
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Última Atividade</TableHead>
                      <TableHead>Expira em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{session.userName}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {session.ipAddress || '-'}
                        </TableCell>
                        <TableCell>
                          {new Date(session.createdAt).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          {new Date(session.lastActivity).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          {new Date(session.expiresAt).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeSession(session.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


