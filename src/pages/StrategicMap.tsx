import { useState } from 'react'
import { useStrategyStore, OKR } from '@/stores/useStrategyStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Target, ArrowUp, Zap } from 'lucide-react'
import { toast } from 'sonner'

export default function StrategicMap() {
  const { okrs, addOKR } = useStrategyStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newObjective, setNewObjective] = useState('')
  const [newPerspective, setNewPerspective] =
    useState<OKR['perspective']>('Financeira')

  const handleAddOKR = () => {
    if (!newObjective) return

    addOKR({
      id: Date.now().toString(),
      objective: newObjective,
      perspective: newPerspective,
      progress: 0,
      keyResults: [],
    })
    setIsModalOpen(false)
    setNewObjective('')
    toast.success('Novo Objetivo criado com sucesso!')
  }

  const perspectives = ['Financeira', 'Clientes', 'Processos', 'Aprendizado']

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Mapa Estratégico (BSC)
          </h1>
          <p className="text-slate-500">
            Alinhamento visual dos objetivos e gerenciamento de OKRs.
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              <Plus className="mr-2 size-4" /> Novo Objetivo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Objetivo Estratégico</DialogTitle>
              <DialogDescription>
                Defina onde a clínica deve chegar.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Perspectiva do BSC</Label>
                <Select
                  value={newPerspective}
                  onValueChange={(v: any) => setNewPerspective(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {perspectives.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Objetivo (O que?)</Label>
                <Input
                  placeholder="Ex: Tornar-se referência em reabilitação..."
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddOKR} className="bg-teal-600 text-white">
                Salvar Objetivo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* BSC Visualization */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-300"></div>
            <h3 className="font-bold text-slate-400 uppercase text-xs mb-4 pl-4">
              Topo: Financeiro
            </h3>
            <div className="flex flex-wrap gap-2 pl-4">
              {okrs
                .filter((o) => o.perspective === 'Financeira')
                .map((o) => (
                  <div
                    key={o.id}
                    className="bg-green-50 text-green-800 text-sm p-3 rounded-lg border border-green-100 shadow-sm cursor-pointer hover:bg-green-100 transition-colors"
                  >
                    {o.objective}
                  </div>
                ))}
              {okrs.filter((o) => o.perspective === 'Financeira').length ===
                0 && (
                <span className="text-slate-400 text-sm italic">
                  Sem objetivos definidos
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-center">
            <ArrowUp className="text-slate-300" />
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-300"></div>
            <h3 className="font-bold text-slate-400 uppercase text-xs mb-4 pl-4">
              Meio: Clientes
            </h3>
            <div className="flex flex-wrap gap-2 pl-4">
              {okrs
                .filter((o) => o.perspective === 'Clientes')
                .map((o) => (
                  <div
                    key={o.id}
                    className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg border border-blue-100 shadow-sm cursor-pointer hover:bg-blue-100 transition-colors"
                  >
                    {o.objective}
                  </div>
                ))}
            </div>
          </div>
          <div className="flex justify-center">
            <ArrowUp className="text-slate-300" />
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-300"></div>
            <h3 className="font-bold text-slate-400 uppercase text-xs mb-4 pl-4">
              Base: Processos Internos
            </h3>
            <div className="flex flex-wrap gap-2 pl-4">
              {okrs
                .filter((o) => o.perspective === 'Processos')
                .map((o) => (
                  <div
                    key={o.id}
                    className="bg-amber-50 text-amber-800 text-sm p-3 rounded-lg border border-amber-100 shadow-sm cursor-pointer hover:bg-amber-100 transition-colors"
                  >
                    {o.objective}
                  </div>
                ))}
            </div>
          </div>
          <div className="flex justify-center">
            <ArrowUp className="text-slate-300" />
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-300"></div>
            <h3 className="font-bold text-slate-400 uppercase text-xs mb-4 pl-4">
              Raiz: Aprendizado e Crescimento
            </h3>
            <div className="flex flex-wrap gap-2 pl-4">
              {okrs
                .filter((o) => o.perspective === 'Aprendizado')
                .map((o) => (
                  <div
                    key={o.id}
                    className="bg-purple-50 text-purple-800 text-sm p-3 rounded-lg border border-purple-100 shadow-sm cursor-pointer hover:bg-purple-100 transition-colors"
                  >
                    {o.objective}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* OKR Management List */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Gerenciador de OKRs</h2>
          {okrs.map((okr) => (
            <Card
              key={okr.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3 bg-slate-50/50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-800">
                      {okr.objective}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Target className="size-3" /> {okr.perspective}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-teal-600">
                      {okr.progress}%
                    </span>
                  </div>
                </div>
                <Progress value={okr.progress} className="h-2 mt-2" />
              </CardHeader>
              <CardContent className="pt-4">
                <h4 className="text-xs font-semibold uppercase text-slate-400 mb-3">
                  Resultados-Chave (KRs)
                </h4>
                <div className="space-y-3">
                  {okr.keyResults.map((kr) => (
                    <div
                      key={kr.id}
                      className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded"
                    >
                      <span className="text-slate-700">{kr.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-600">
                          {kr.current} / {kr.target}{' '}
                          <span className="text-xs text-slate-400">
                            {kr.unit}
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                  {okr.keyResults.length === 0 && (
                    <div className="text-sm text-slate-400 italic">
                      Nenhum KR definido.
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-slate-500 hover:text-teal-600 dashed border border-slate-200"
                  >
                    <Plus className="mr-2 size-3" /> Adicionar Key Result
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
