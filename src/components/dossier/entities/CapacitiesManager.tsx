import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, Cpu } from 'lucide-react'
import {
  getCapacities,
  createCapacity,
  updateCapacity,
  deleteCapacity,
} from '@/services/entityService'
import { calculateSectionCompletion } from '@/services/dossierService'
import { toast } from 'sonner'

interface CapacitiesManagerProps {
  dossierId: string
  onUpdateCompletion?: () => void
}

export default function CapacitiesManager({
  dossierId,
  onUpdateCompletion,
}: CapacitiesManagerProps) {
  const [capacities, setCapacities] = useState<any[]>([])
  const [editingCapacity, setEditingCapacity] = useState<any | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadCapacities()
  }, [dossierId])

  const loadCapacities = async () => {
    try {
      const data = await getCapacities(dossierId)
      setCapacities(data)
    } catch (error) {
      console.error('Erro ao carregar capacidades:', error)
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (editingCapacity) {
        await updateCapacity(dossierId, editingCapacity.id, data)
        toast.success('Capacidade atualizada!')
      } else {
        await createCapacity(dossierId, data)
        toast.success('Capacidade criada!')
      }
      setDialogOpen(false)
      setEditingCapacity(null)
      await loadCapacities()
      if (onUpdateCompletion) {
        onUpdateCompletion()
      }
      await calculateSectionCompletion(dossierId, 'OPERATIONS')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar capacidade')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta capacidade?')) return

    try {
      await deleteCapacity(dossierId, id)
      toast.success('Capacidade excluída!')
      await loadCapacities()
      if (onUpdateCompletion) {
        onUpdateCompletion()
      }
      await calculateSectionCompletion(dossierId, 'OPERATIONS')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir capacidade')
    }
  }

  const getResourceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      room: 'Consultório',
      equipment: 'Equipamento',
      staff_time: 'Tempo de Equipe',
      other: 'Outro',
    }
    return labels[type] || type
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="size-5" />
              Capacidades Operacionais
            </CardTitle>
            <CardDescription>
              Gerencie os recursos e capacidades operacionais da clínica
            </CardDescription>
          </div>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) setEditingCapacity(null)
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 size-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <CapacityForm
                capacity={editingCapacity}
                onSave={handleSave}
                onCancel={() => {
                  setDialogOpen(false)
                  setEditingCapacity(null)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {capacities.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            Nenhuma capacidade cadastrada. Clique em "Adicionar" para criar a primeira.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {capacities.map((capacity) => (
                <TableRow key={capacity.id}>
                  <TableCell>
                    <span className="px-2 py-1 rounded text-xs bg-slate-100 dark:bg-slate-800">
                      {getResourceTypeLabel(capacity.resource_type)}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{capacity.name}</TableCell>
                  <TableCell>{capacity.quantity}</TableCell>
                  <TableCell>{capacity.unit || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCapacity(capacity)
                          setDialogOpen(true)
                        }}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(capacity.id)}
                      >
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function CapacityForm({
  capacity,
  onSave,
  onCancel,
}: {
  capacity?: any
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [resourceType, setResourceType] = useState(capacity?.resource_type || 'room')
  const [name, setName] = useState(capacity?.name || '')
  const [quantity, setQuantity] = useState(capacity?.quantity || '')
  const [unit, setUnit] = useState(capacity?.unit || '')
  const [constraints, setConstraints] = useState(capacity?.constraints || '')
  const [notes, setNotes] = useState(capacity?.notes || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    if (!quantity) {
      toast.error('Quantidade é obrigatória')
      return
    }
    onSave({
      resourceType,
      name: name.trim(),
      quantity: parseInt(quantity),
      unit: unit.trim() || undefined,
      constraints: constraints.trim() || undefined,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {capacity ? 'Editar Capacidade' : 'Nova Capacidade Operacional'}
        </DialogTitle>
        <DialogDescription>
          Defina as informações da capacidade operacional
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="capacity-type">Tipo de Recurso *</Label>
          <select
            id="capacity-type"
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="room">Consultório</option>
            <option value="equipment">Equipamento</option>
            <option value="staff_time">Tempo de Equipe</option>
            <option value="other">Outro</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity-name">Nome *</Label>
          <Input
            id="capacity-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Consultório 1"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="capacity-quantity">Quantidade *</Label>
            <Input
              id="capacity-quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ex: 2"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity-unit">Unidade</Label>
            <Input
              id="capacity-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Ex: unidades, horas"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity-constraints">Restrições</Label>
          <Textarea
            id="capacity-constraints"
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            placeholder="Descreva restrições ou limitações"
            className="min-h-[80px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity-notes">Notas</Label>
          <Textarea
            id="capacity-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações adicionais"
            className="min-h-[80px]"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar</Button>
      </DialogFooter>
    </form>
  )
}



