import { useState } from 'react'
import { useStrategyStore } from '@/stores/useStrategyStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Waves, UserCheck } from 'lucide-react'

export default function Strategy() {
  const { blueOcean, jtbd, addBlueOceanItem, removeBlueOceanItem } =
    useStrategyStore()
  const [newItem, setNewItem] = useState('')

  const handleAddItem = (category: keyof typeof blueOcean) => {
    if (!newItem.trim()) return
    addBlueOceanItem(category, newItem)
    setNewItem('')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Estúdio de Estratégia
        </h1>
        <p className="text-slate-500">
          Desenvolva sua proposta de valor única e inovação.
        </p>
      </div>

      <Tabs defaultValue="blue-ocean" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="blue-ocean">Oceano Azul</TabsTrigger>
          <TabsTrigger value="jtbd">Jobs to be Done</TabsTrigger>
        </TabsList>

        <TabsContent value="blue-ocean" className="mt-6">
          <Card className="border-none shadow-none bg-transparent">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Eliminate */}
              <Card className="border-t-4 border-t-red-500 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-red-700 flex items-center gap-2">
                    <X className="size-5" /> Eliminar
                  </CardTitle>
                  <CardDescription>
                    O que a indústria aceita mas não agrega valor?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {blueOcean.eliminate.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center p-2 bg-red-50 rounded text-sm text-red-900"
                      >
                        {item}
                        <button
                          onClick={() => removeBlueOceanItem('eliminate', idx)}
                          className="text-red-400 hover:text-red-700"
                        >
                          <X className="size-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Adicionar item..."
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAddItem('eliminate')}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Reduce */}
              <Card className="border-t-4 border-t-amber-500 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-amber-700 flex items-center gap-2">
                    <Waves className="size-5" /> Reduzir
                  </CardTitle>
                  <CardDescription>
                    O que pode ser reduzido bem abaixo do padrão?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {blueOcean.reduce.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center p-2 bg-amber-50 rounded text-sm text-amber-900"
                      >
                        {item}
                        <button
                          onClick={() => removeBlueOceanItem('reduce', idx)}
                          className="text-amber-400 hover:text-amber-700"
                        >
                          <X className="size-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Adicionar item..."
                      className="h-8 text-sm"
                    />
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Raise */}
              <Card className="border-t-4 border-t-blue-500 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-700 flex items-center gap-2">
                    <TrendingUp className="size-5" /> Elevar
                  </CardTitle>
                  <CardDescription>
                    O que deve ser elevado bem acima do padrão?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {blueOcean.raise.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center p-2 bg-blue-50 rounded text-sm text-blue-900"
                      >
                        {item}
                        <button
                          onClick={() => removeBlueOceanItem('raise', idx)}
                          className="text-blue-400 hover:text-blue-700"
                        >
                          <X className="size-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Adicionar item..."
                      className="h-8 text-sm"
                    />
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Create */}
              <Card className="border-t-4 border-t-green-500 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-green-700 flex items-center gap-2">
                    <Lightbulb className="size-5" /> Criar
                  </CardTitle>
                  <CardDescription>
                    O que nunca foi oferecido antes?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {blueOcean.create.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center p-2 bg-green-50 rounded text-sm text-green-900"
                      >
                        {item}
                        <button
                          onClick={() => removeBlueOceanItem('create', idx)}
                          className="text-green-400 hover:text-green-700"
                        >
                          <X className="size-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Adicionar item..."
                      className="h-8 text-sm"
                    />
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="jtbd" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="size-5 text-teal-600" /> Canvas Jobs to be
                Done
              </CardTitle>
              <CardDescription>
                Entenda o progresso que seu paciente está tentando fazer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th className="px-6 py-3">O "Job" (Tarefa/Objetivo)</th>
                      <th className="px-6 py-3">Tipo</th>
                      <th className="px-6 py-3">Nossa Solução</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jtbd.map((job) => (
                      <tr
                        key={job.id}
                        className="bg-white border-b hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {job.job}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline">{job.type}</Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {job.solution}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                <span className="text-slate-500 flex items-center gap-2">
                  <Plus className="size-4" /> Adicionar novo Job do Paciente
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TrendingUp({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  )
}
function Lightbulb({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
      <path d="M9 18h6"></path>
      <path d="M10 22h4"></path>
    </svg>
  )
}
