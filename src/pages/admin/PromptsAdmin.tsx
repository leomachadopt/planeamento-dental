import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Code, Save, RotateCcw, Eye } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const promptTypes = [
  { value: 'diagnostic', label: 'Diagnóstico', description: 'Prompt para relatório de diagnóstico' },
  { value: 'strategic', label: 'Estratégico', description: 'Prompt para direcionamento estratégico' },
  { value: 'advanced', label: 'Análise Avançada', description: 'Prompt para análise estratégica avançada' },
  { value: 'tactical', label: 'Tático', description: 'Prompt para plano tático (OKRs)' },
  { value: 'operational', label: 'Operacional', description: 'Prompt para plano operacional' },
  { value: 'final', label: 'Relatório Final', description: 'Prompt para relatório final consolidado' },
]

const modelConfigs = {
  temperature: { min: 0, max: 2, default: 0.7, step: 0.1 },
  maxTokens: { min: 1000, max: 16000, default: 4000, step: 100 },
  model: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
}

export default function PromptsAdmin() {
  const [selectedType, setSelectedType] = useState('diagnostic')
  const [promptContent, setPromptContent] = useState('')
  const [modelConfig, setModelConfig] = useState({
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 4000,
  })
  const [originalPrompt, setOriginalPrompt] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    loadPrompt(selectedType)
  }, [selectedType])

  // Carregar prompt atual ao mudar tipo
  const loadPrompt = async (type: string) => {
    try {
      try {
        const response = await api.getPrompt(type)
        setPromptContent(response.content || getDefaultPrompt(type))
        setOriginalPrompt(response.content || getDefaultPrompt(type))
      } catch (error) {
        // Se endpoint não existir, usar prompt padrão
        const defaultPrompt = getDefaultPrompt(type)
        setPromptContent(defaultPrompt)
        setOriginalPrompt(defaultPrompt)
      }
    } catch (error) {
      toast.error('Erro ao carregar prompt')
    }
  }

  const getDefaultPrompt = (type: string) => {
    // Retorna um prompt padrão baseado no tipo
    return `Prompt para ${type} - Edite este prompt conforme necessário.\n\nEste prompt será usado para gerar relatórios do tipo "${type}".`
  }

  const handleTypeChange = (type: string) => {
    setSelectedType(type)
    loadPrompt(type)
  }

  const handleSave = async () => {
    try {
      try {
        await api.savePrompt(selectedType, promptContent)
        toast.success('Prompt salvo com sucesso')
        setOriginalPrompt(promptContent)
      } catch (error: any) {
        // Se endpoint não existir, apenas salvar localmente
        toast.info('Salvando localmente (endpoint não disponível)')
        setOriginalPrompt(promptContent)
      }
    } catch (error) {
      toast.error('Erro ao salvar prompt')
    }
  }

  const handleReset = () => {
    if (confirm('Deseja restaurar o prompt original? As alterações serão perdidas.')) {
      setPromptContent(originalPrompt)
      toast.info('Prompt restaurado')
    }
  }

  const hasChanges = promptContent !== originalPrompt

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prompts & Modelos</h1>
          <p className="text-slate-500 mt-1">
            Gerencie os prompts do sistema e configurações dos modelos de IA
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Restaurar
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="mr-2 h-4 w-4" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Seleção de Tipo */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Tipo de Prompt</CardTitle>
            <CardDescription>Selecione o prompt que deseja editar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {promptTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={selectedType === type.value ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => handleTypeChange(type.value)}
                >
                  <Code className="mr-2 h-4 w-4" />
                  {type.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Editor de Prompt */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {promptTypes.find((t) => t.value === selectedType)?.label}
            </CardTitle>
            <CardDescription>
              {promptTypes.find((t) => t.value === selectedType)?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Conteúdo do Prompt</Label>
                <Textarea
                  value={promptContent}
                  onChange={(e) => setPromptContent(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="Digite o prompt aqui..."
                />
                <p className="text-xs text-slate-500">
                  {promptContent.length} caracteres
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configurações do Modelo */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Modelo</CardTitle>
          <CardDescription>
            Ajuste os parâmetros do modelo de IA para geração de relatórios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="model" className="w-full">
            <TabsList>
              <TabsTrigger value="model">Modelo</TabsTrigger>
              <TabsTrigger value="parameters">Parâmetros</TabsTrigger>
            </TabsList>
            <TabsContent value="model" className="space-y-4">
              <div className="space-y-2">
                <Label>Modelo de IA</Label>
                <Select
                  value={modelConfig.model}
                  onValueChange={(value) =>
                    setModelConfig({ ...modelConfig, model: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modelConfigs.model.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            <TabsContent value="parameters" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    Temperatura ({modelConfig.temperature})
                  </Label>
                  <input
                    type="range"
                    min={modelConfigs.temperature.min}
                    max={modelConfigs.temperature.max}
                    step={modelConfigs.temperature.step}
                    value={modelConfig.temperature}
                    onChange={(e) =>
                      setModelConfig({
                        ...modelConfig,
                        temperature: parseFloat(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500">
                    Controla a criatividade (0 = determinístico, 2 = muito criativo)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Max Tokens ({modelConfig.maxTokens})</Label>
                  <input
                    type="range"
                    min={modelConfigs.maxTokens.min}
                    max={modelConfigs.maxTokens.max}
                    step={modelConfigs.maxTokens.step}
                    value={modelConfig.maxTokens}
                    onChange={(e) =>
                      setModelConfig({
                        ...modelConfig,
                        maxTokens: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500">
                    Tamanho máximo da resposta em tokens
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleReset}>
              Restaurar Padrões
            </Button>
            <Button onClick={handleSave}>Salvar Configurações</Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Preview */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Preview do Prompt</DialogTitle>
            <DialogDescription>
              Visualização do prompt que será enviado para a IA
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg border">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {promptContent || '(Prompt vazio)'}
              </pre>
            </div>
            <div className="text-sm text-slate-500">
              <p>
                <strong>Modelo:</strong> {modelConfig.model}
              </p>
              <p>
                <strong>Temperatura:</strong> {modelConfig.temperature}
              </p>
              <p>
                <strong>Max Tokens:</strong> {modelConfig.maxTokens}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

