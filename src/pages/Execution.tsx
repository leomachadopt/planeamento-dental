import { useState } from 'react'
import {
  useStrategyStore,
  ActionItem,
  ActionStatus,
} from '@/stores/useStrategyStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRightCircle,
} from 'lucide-react'
import { toast } from 'sonner'

export default function Execution() {
  const { actions, addAction, updateActionStatus } = useStrategyStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newAction, setNewAction] = useState<Partial<ActionItem>>({
    status: 'Plan',
  })

  const handleAddAction = () => {
    if (!newAction.title || !newAction.owner) return
    addAction({
      id: Date.now().toString(),
      title: newAction.title,
      owner: newAction.owner,
      status: newAction.status || 'Plan',
      deadline: newAction.deadline || new Date().toISOString(),
    })
    setIsModalOpen(false)
    setNewAction({ status: 'Plan' })
    toast.success('Ação adicionada ao plano!')
  }

  const getStatusColor = (status: ActionStatus) => {
    switch (status) {
      case 'Plan':
        return 'bg-slate-100 text-slate-700 border-slate-200'
      case 'Do':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'Check':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'Act':
        return 'bg-green-50 text-green-700 border-green-200'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Execução Operacional
          </h1>
          <p className="text-slate-500">
            Ciclo PDCA e gerenciamento de tarefas táticas.
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              <Plus className="mr-2 size-4" /> Nova Ação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Planejar Nova Ação (Plan)</DialogTitle>
              <DialogDescription>
                Crie uma tarefa vinculada a um OKR.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>O que será feito?</Label>
                <Input
                  value={newAction.title || ''}
                  onChange={(e) =>
                    setNewAction({ ...newAction, title: e.target.value })
                  }
                  placeholder="Título da ação"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Responsável</Label>
                  <Input
                    value={newAction.owner || ''}
                    onChange={(e) =>
                      setNewAction({ ...newAction, owner: e.target.value })
                    }
                    placeholder="Nome"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Prazo</Label>
                  <Input
                    type="date"
                    onChange={(e) =>
                      setNewAction({ ...newAction, deadline: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleAddAction}
                className="bg-teal-600 text-white"
              >
                Salvar Ação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lean Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-red-50 border-red-100">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase">
                Desperdícios (Muda)
              </p>
              <h3 className="text-2xl font-bold text-red-900">12%</h3>
              <p className="text-xs text-red-700">
                Cancelamentos em cima da hora
              </p>
            </div>
            <AlertTriangle className="size-8 text-red-300" />
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase">
                Lead Time
              </p>
              <h3 className="text-2xl font-bold text-blue-900">48h</h3>
              <p className="text-xs text-blue-700">Média para 1º agendamento</p>
            </div>
            <Clock className="size-8 text-blue-300" />
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase">
                Eficiência
              </p>
              <h3 className="text-2xl font-bold text-green-900">92%</h3>
              <p className="text-xs text-green-700">
                Ocupação de agenda médica
              </p>
            </div>
            <CheckCircle2 className="size-8 text-green-300" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plano de Ação (5W2H)</CardTitle>
          <CardDescription>
            Acompanhe o status de cada iniciativa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Ação</TableHead>
                <TableHead>Status (PDCA)</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell className="font-medium">{action.title}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={action.status}
                      onValueChange={(val) =>
                        updateActionStatus(action.id, val as ActionStatus)
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          'w-[110px] h-8 text-xs font-medium border-2',
                          getStatusColor(action.status),
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Plan">PLAN</SelectItem>
                        <SelectItem value="Do">DO</SelectItem>
                        <SelectItem value="Check">CHECK</SelectItem>
                        <SelectItem value="Act">ACT</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{action.owner}</TableCell>
                  <TableCell>
                    {new Date(action.deadline).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ArrowRightCircle className="size-4 text-slate-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
