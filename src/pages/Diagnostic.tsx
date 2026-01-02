import { useState } from 'react'
import { useStrategyStore } from '@/stores/useStrategyStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldAlert, RefreshCw, Save, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export default function Diagnostic() {
  const { diagnosis, updateRumelt } = useStrategyStore()
  const [rumeltData, setRumeltData] = useState(diagnosis.rumelt)

  const handleSaveRumelt = () => {
    updateRumelt(rumeltData)
    toast.success('Diagnóstico atualizado com sucesso!', {
      description: 'Sua política orientadora foi salva.',
    })
  }

  const generatePolicy = () => {
    // Mock AI generation
    toast.info('Consultor AI está analisando seus dados...', { duration: 2000 })
    setTimeout(() => {
      setRumeltData((prev) => ({
        ...prev,
        policy:
          'Nova Política Gerada: Focar na digitalização total da jornada do paciente para eliminar ineficiências operacionais e aumentar a percepção de valor.',
      }))
      toast.success('Política Orientadora sugerida!')
    }, 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Centro de Diagnóstico
        </h1>
        <p className="text-slate-500">
          Identifique as forças do mercado e o desafio central da sua clínica.
        </p>
      </div>

      <Tabs defaultValue="porter" className="w-full">
        <TabsList className="grid w-full md:w-[600px] grid-cols-2">
          <TabsTrigger value="porter">Forças de Porter</TabsTrigger>
          <TabsTrigger value="rumelt">Diagnóstico de Rumelt</TabsTrigger>
        </TabsList>

        <TabsContent value="porter" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>As 5 Forças Competitivas</CardTitle>
              <CardDescription>
                Analise o ambiente competitivo da sua clínica.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Rivalidade entre Concorrentes</Label>
                <Textarea
                  defaultValue={diagnosis.porter.rivalry}
                  className="min-h-[100px]"
                  placeholder="Quão intensa é a competição?"
                />
              </div>
              <div className="space-y-2">
                <Label>Poder de Negociação dos Clientes</Label>
                <Textarea
                  defaultValue={diagnosis.porter.buyers}
                  className="min-h-[100px]"
                  placeholder="Os pacientes são sensíveis a preço ou qualidade?"
                />
              </div>
              <div className="space-y-2">
                <Label>Ameaça de Novos Entrantes</Label>
                <Textarea
                  defaultValue={diagnosis.porter.newEntrants}
                  className="min-h-[100px]"
                  placeholder="É fácil abrir uma clínica concorrente?"
                />
              </div>
              <div className="space-y-2">
                <Label>Ameaça de Produtos Substitutos</Label>
                <Textarea
                  defaultValue={diagnosis.porter.substitutes}
                  className="min-h-[100px]"
                  placeholder="Ex: Terapias alternativas, automedicação..."
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Poder dos Fornecedores</Label>
                <Textarea
                  defaultValue={diagnosis.porter.suppliers}
                  className="min-h-[80px]"
                  placeholder="Dependência de equipamentos ou insumos específicos?"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto bg-teal-600 hover:bg-teal-700 text-white">
                Salvar Análise
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="rumelt" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="size-5 text-teal-600" />
                  Definição do Problema (Kernel)
                </CardTitle>
                <CardDescription>
                  O segredo de uma boa estratégia é o diagnóstico honesto dos
                  obstáculos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-base">
                    1. Qual é o desafio crucial?
                  </Label>
                  <Input
                    value={rumeltData.challenge}
                    onChange={(e) =>
                      setRumeltData({
                        ...rumeltData,
                        challenge: e.target.value,
                      })
                    }
                    placeholder="Ex: Perda de pacientes após a primeira consulta..."
                  />
                  <p className="text-xs text-slate-500">
                    Defina o problema em uma frase simples e direta.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base">
                    2. Quais são os principais obstáculos?
                  </Label>
                  <Textarea
                    value={rumeltData.obstacles}
                    onChange={(e) =>
                      setRumeltData({
                        ...rumeltData,
                        obstacles: e.target.value,
                      })
                    }
                    placeholder="Listar complexidades, processos falhos ou mudanças de mercado..."
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-50 border-teal-200">
              <CardHeader>
                <CardTitle className="text-teal-800">
                  Política Orientadora
                </CardTitle>
                <CardDescription>
                  Como vamos lidar com o desafio?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={rumeltData.policy}
                  onChange={(e) =>
                    setRumeltData({ ...rumeltData, policy: e.target.value })
                  }
                  className="min-h-[200px] bg-white border-teal-100 focus-visible:ring-teal-500"
                  placeholder="A política orientadora deve direcionar a ação..."
                />
                <Button
                  variant="outline"
                  onClick={generatePolicy}
                  className="w-full border-teal-200 text-teal-700 hover:bg-teal-50"
                >
                  <RefreshCw className="mr-2 size-4" />
                  Sugerir com AI
                </Button>
                <Button
                  onClick={handleSaveRumelt}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Save className="mr-2 size-4" />
                  Salvar Diagnóstico
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
