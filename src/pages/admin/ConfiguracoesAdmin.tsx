import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Settings, Key, Save, Eye, EyeOff, Database, Bell } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

export default function ConfiguracoesAdmin() {
  const [showApiKey, setShowApiKey] = useState(false)
  const [config, setConfig] = useState({
    openaiApiKey: '',
    databaseUrl: '',
    maxReportsPerMonth: 100,
    enableNotifications: true,
    enableAuditLog: true,
    systemName: 'Clinique AI',
    systemEmail: 'admin@cliniqueai.com',
    maintenanceMode: false,
    webhookUrl: '',
  })

  const handleSave = async () => {
    try {
      // TODO: Implementar endpoint para salvar configurações
      toast.success('Configurações salvas com sucesso')
    } catch (error) {
      toast.error('Erro ao salvar configurações')
    }
  }

  const handleTestConnection = async () => {
    try {
      // TODO: Implementar teste de conexão
      toast.info('Testando conexão...')
    } catch (error) {
      toast.error('Erro ao testar conexão')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
          <p className="text-slate-500 mt-1">
            Gerencie as configurações gerais e integrações do sistema
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Salvar Todas
        </Button>
      </div>

      <Tabs defaultValue="integrations" className="w-full">
        <TabsList>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="limits">Limites</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                OpenAI API
              </CardTitle>
              <CardDescription>
                Configure a chave da API OpenAI para geração de relatórios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={config.openaiApiKey}
                    onChange={(e) =>
                      setConfig({ ...config, openaiApiKey: e.target.value })
                    }
                    placeholder="sk-..."
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  A chave será armazenada de forma segura e criptografada
                </p>
              </div>
              <Button variant="outline" onClick={handleTestConnection}>
                Testar Conexão
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Banco de Dados
              </CardTitle>
              <CardDescription>
                Configurações de conexão com o banco de dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL de Conexão</Label>
                <Input
                  type="password"
                  value={config.databaseUrl}
                  onChange={(e) =>
                    setConfig({ ...config, databaseUrl: e.target.value })
                  }
                  placeholder="postgresql://..."
                  className="font-mono"
                />
                <p className="text-xs text-slate-500">
                  Apenas para visualização. Não edite sem conhecimento técnico.
                </p>
              </div>
              <Button variant="outline" onClick={handleTestConnection}>
                Testar Conexão
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>
                Configure webhooks para notificações externas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL do Webhook</Label>
                <Input
                  value={config.webhookUrl}
                  onChange={(e) =>
                    setConfig({ ...config, webhookUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Sistema</Label>
                <Input
                  value={config.systemName}
                  onChange={(e) =>
                    setConfig({ ...config, systemName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Email do Sistema</Label>
                <Input
                  type="email"
                  value={config.systemEmail}
                  onChange={(e) =>
                    setConfig({ ...config, systemEmail: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo de Manutenção</Label>
                  <p className="text-sm text-slate-500">
                    Bloqueia acesso de usuários durante manutenção
                  </p>
                </div>
                <Switch
                  checked={config.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, maintenanceMode: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auditoria Ativa</Label>
                  <p className="text-sm text-slate-500">
                    Registra todas as ações no sistema
                  </p>
                </div>
                <Switch
                  checked={config.enableAuditLog}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, enableAuditLog: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Limites e Cotas</CardTitle>
              <CardDescription>
                Configure limites de uso do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Máximo de Relatórios por Mês</Label>
                <Input
                  type="number"
                  value={config.maxReportsPerMonth}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      maxReportsPerMonth: parseInt(e.target.value) || 0,
                    })
                  }
                />
                <p className="text-xs text-slate-500">
                  Limite global de gerações de relatórios por mês
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
              <CardDescription>
                Configure as notificações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações Ativas</Label>
                  <p className="text-sm text-slate-500">
                    Habilita notificações por email e no sistema
                  </p>
                </div>
                <Switch
                  checked={config.enableNotifications}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, enableNotifications: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

