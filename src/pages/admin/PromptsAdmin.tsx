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
import { getSectionInstruction, getSystemPrompt } from '@/lib/section-prompts'

const promptTypes = [
  // Seções do Dossiê (ordem igual à sidebar do usuário)
  { value: 'section_IDENTITY', label: 'IDENTITY - Identidade', description: 'Prompt para relatório de identidade estratégica', category: 'sections' },
  { value: 'section_BUSINESS_MODEL', label: 'BUSINESS_MODEL - Modelo de Negócio', description: 'Prompt para relatório de modelo de negócio', category: 'sections' },
  { value: 'section_MARKET', label: 'MARKET - Mercado', description: 'Prompt para relatório de mercado e concorrência', category: 'sections' },
  { value: 'section_OFFER', label: 'OFFER - Oferta', description: 'Prompt para relatório de oferta de serviços', category: 'sections' },
  { value: 'section_OPERATIONS', label: 'OPERATIONS - Operações', description: 'Prompt para relatório de operações', category: 'sections' },
  { value: 'section_PEOPLE', label: 'PEOPLE - Pessoas, Cultura & Gestão', description: 'Prompt para relatório de pessoas e cultura organizacional', category: 'sections' },
  { value: 'section_STRATEGY', label: 'STRATEGY - Estratégia', description: 'Prompt para síntese estratégica', category: 'sections' },
  { value: 'section_PLAN', label: 'PLAN - Plano', description: 'Prompt para plano de execução', category: 'sections' },
  // Tipos antigos (mantidos para compatibilidade)
  { value: 'diagnostic', label: 'Diagnóstico', description: 'Prompt para relatório de diagnóstico', category: 'legacy' },
  { value: 'strategic', label: 'Estratégico', description: 'Prompt para direcionamento estratégico', category: 'legacy' },
  { value: 'advanced', label: 'Análise Avançada', description: 'Prompt para análise estratégica avançada', category: 'legacy' },
  { value: 'tactical', label: 'Tático', description: 'Prompt para plano tático (OKRs)', category: 'legacy' },
  { value: 'operational', label: 'Operacional', description: 'Prompt para plano operacional', category: 'legacy' },
  { value: 'final', label: 'Relatório Final', description: 'Prompt para relatório final consolidado', category: 'legacy' },
]

const modelConfigs = {
  temperature: { min: 0, max: 2, default: 0.7, step: 0.1 },
  maxTokens: { min: 1000, max: 16000, default: 4000, step: 100 },
  model: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
}

export default function PromptsAdmin() {
  const [selectedType, setSelectedType] = useState('section_IDENTITY')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [userPrompt, setUserPrompt] = useState('')
  const [originalSystemPrompt, setOriginalSystemPrompt] = useState('')
  const [originalUserPrompt, setOriginalUserPrompt] = useState('')
  const [modelConfig, setModelConfig] = useState({
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 4000,
  })
  const [previewOpen, setPreviewOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadPrompt(selectedType)
  }, [selectedType])

  // Carregar prompt atual ao mudar tipo
  const loadPrompt = async (type: string) => {
    setLoading(true)
    try {
      try {
        const response = await api.getPrompt(type)
        setSystemPrompt(response.system_prompt || '')
        setUserPrompt(response.user_prompt || '')
        setOriginalSystemPrompt(response.system_prompt || '')
        setOriginalUserPrompt(response.user_prompt || '')
        
        // Se não tiver prompts salvos, carregar defaults do código
        if (!response.system_prompt && !response.user_prompt) {
          const defaults = getDefaultPrompts(type)
          setSystemPrompt(defaults.systemPrompt)
          setUserPrompt(defaults.userPrompt)
          setOriginalSystemPrompt(defaults.systemPrompt)
          setOriginalUserPrompt(defaults.userPrompt)
        }
      } catch (error: any) {
        // Se endpoint não existir, usar prompts padrão
        const defaults = getDefaultPrompts(type)
        setSystemPrompt(defaults.systemPrompt)
        setUserPrompt(defaults.userPrompt)
        setOriginalSystemPrompt(defaults.systemPrompt)
        setOriginalUserPrompt(defaults.userPrompt)
      }
    } catch (error) {
      toast.error('Erro ao carregar prompt')
    } finally {
      setLoading(false)
    }
  }

  const getDefaultPrompts = (type: string): { systemPrompt: string; userPrompt: string } => {
    // Se for uma seção, buscar prompts robustos de section-prompts.ts
    if (type.startsWith('section_')) {
      const sectionCode = type.replace('section_', '')
      const sectionInstruction = getSectionInstruction(sectionCode)

      // System Prompt: tom intermediário
      const systemPrompt = getSystemPrompt('intermediario')

      // User Prompt: instruções da seção + formato de saída
      const userPrompt = sectionInstruction
        ? `${sectionInstruction}\n\n**DADOS DA CLÍNICA E DO DOSSIÊ:**\n\nSnapshot:\n{{SNAPSHOT_JSON}}\n\n---\n\nGere o relatório completo e os insights estruturados baseados EXCLUSIVAMENTE nos dados fornecidos acima.\nRetorne um JSON válido com a seguinte estrutura:\n\n{\n  "report_markdown": "# Relatório da Seção ${sectionCode}\\n\\n[Conteúdo completo em Markdown]",\n  "insights": {\n    "score": { "clarity": 0-10, "consistency": 0-10, "completeness": 0-10, "impact_potential": 0-10 },\n    "alerts": [],\n    "recommendations": [],\n    "missing_data": [],\n    "contradictions": [],\n    "checklist": [],\n    "tags": []\n  }\n}`
        : `Gere um relatório executivo da seção ${sectionCode} com base no snapshot abaixo.\n\nSnapshot:\n{{SNAPSHOT_JSON}}\n\nRetorne um JSON válido com report_markdown e insights estruturados.`

      return { systemPrompt, userPrompt }
    }

    // Retorna prompts padrão baseado no tipo legacy
    return {
      systemPrompt: `Você é um consultor especializado. Analise os dados fornecidos e gere um relatório detalhado.`,
      userPrompt: `Gere um relatório do tipo "${type}" com base nos dados fornecidos.\n\nRetorne um JSON válido com report_markdown e insights estruturados.`,
    }
  }

  const handleTypeChange = (type: string) => {
    setSelectedType(type)
    loadPrompt(type)
  }

  const handleSave = async () => {
    try {
      try {
        await api.savePrompt(selectedType, systemPrompt, userPrompt)
        toast.success('Prompt salvo com sucesso')
        setOriginalSystemPrompt(systemPrompt)
        setOriginalUserPrompt(userPrompt)
      } catch (error: any) {
        toast.error(`Erro ao salvar prompt: ${error.message}`)
      }
    } catch (error) {
      toast.error('Erro ao salvar prompt')
    }
  }

  const handleReset = () => {
    if (confirm('Deseja restaurar os prompts originais? As alterações serão perdidas.')) {
      setSystemPrompt(originalSystemPrompt)
      setUserPrompt(originalUserPrompt)
      toast.info('Prompts restaurados')
    }
  }

  const hasChanges = systemPrompt !== originalSystemPrompt || userPrompt !== originalUserPrompt

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
          <Button onClick={handleSave} disabled={!hasChanges || loading}>
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
            <Tabs defaultValue="sections" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sections">Seções</TabsTrigger>
                <TabsTrigger value="legacy">Legado</TabsTrigger>
              </TabsList>
              <TabsContent value="sections" className="space-y-2 mt-4">
                {promptTypes
                  .filter((type) => type.category === 'sections')
                  .map((type) => (
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
              </TabsContent>
              <TabsContent value="legacy" className="space-y-2 mt-4">
                {promptTypes
                  .filter((type) => type.category === 'legacy')
                  .map((type) => (
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Editor de Prompts */}
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
            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="system-prompt">
                    SYSTEM PROMPT <span className="text-xs text-slate-500">(role: system)</span>
                  </Label>
                  <Textarea
                    id="system-prompt"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                    placeholder="Digite o system prompt aqui..."
                  />
                  <p className="text-xs text-slate-500">
                    {systemPrompt.length} caracteres
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-prompt">
                    USER PROMPT <span className="text-xs text-slate-500">(role: user)</span>
                  </Label>
                  <Textarea
                    id="user-prompt"
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                    placeholder="Digite o user prompt aqui... Use {{SNAPSHOT_JSON}} como placeholder para o snapshot."
                  />
                  <p className="text-xs text-slate-500">
                    {userPrompt.length} caracteres
                  </p>
                  <p className="text-xs text-slate-400">
                    💡 Use <code className="bg-slate-100 px-1 rounded">{'{{SNAPSHOT_JSON}}'}</code> como placeholder para o snapshot JSON
                  </p>
                </div>
              </div>
            )}
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
            <DialogTitle>Preview dos Prompts</DialogTitle>
            <DialogDescription>
              Visualização dos prompts que serão enviados para a IA
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">SYSTEM PROMPT:</h4>
              <div className="p-4 bg-slate-50 rounded-lg border">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {systemPrompt || '(System prompt vazio)'}
                </pre>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">USER PROMPT:</h4>
              <div className="p-4 bg-slate-50 rounded-lg border">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {userPrompt || '(User prompt vazio)'}
                </pre>
              </div>
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
