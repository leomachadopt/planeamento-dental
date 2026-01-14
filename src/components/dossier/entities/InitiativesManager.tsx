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
import { Plus, Edit, Trash2, CheckSquare } from 'lucide-react'
import { api } from '@/lib/api'
import { calculateSectionCompletion } from '@/services/dossierService'
import { toast } from 'sonner'

interface InitiativesManagerProps {
  dossierId: string
  onUpdateCompletion?: () => void
}

export default function InitiativesManager({
  dossierId,
  onUpdateCompletion,
}: InitiativesManagerProps) {
  const [initiatives, setInitiatives] = useState<any[]>([])
  const [editingInitiative, setEditingInitiative] = useState<any | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadInitiatives()
  }, [dossierId])

  const loadInitiatives = async () => {
    try {
      const data = await api.getInitiatives(dossierId)
      setInitiatives(data)
    } catch (error) {
      console.error('Erro ao carregar iniciativas:', error)
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (editingInitiative) {
        await api.updateInitiative(dossierId, editingInitiative.id, data)
        toast.success('Iniciativa atualizada!')
      } else {
        await api.createInitiative(dossierId, data)
        toast.success('Iniciativa criada!')
      }
      setDialogOpen(false)
      setEditingInitiative(null)
      await loadInitiatives()
      if (onUpdateCompletion) {
        onUpdateCompletion()
      }
      await calculateSectionCompletion(dossierId, 'PLAN')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar iniciativa')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta iniciativa?')) return

    try {
      await api.deleteInitiative(dossierId, id)
      toast.success('Iniciativa excluída!')
      await loadInitiatives()
      if (onUpdateCompletion) {
        onUpdateCompletion()
      }
      await calculateSectionCompletion(dossierId, 'PLAN')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir iniciativa')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="size-5" />
              Iniciativas
            </CardTitle>
            <CardDescription>
              Gerencie as iniciativas e projetos do plano estratégico
            </CardDescription>
          </div>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) setEditingInitiative(null)
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 size-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <InitiativeForm
                initiative={editingInitiative}
                onSave={handleSave}
                onCancel={() => {
                  setDialogOpen(false)
                  setEditingInitiative(null)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {initiatives.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            Nenhuma iniciativa cadastrada. Clique em "Adicionar" para criar a primeira.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initiatives.map((initiative) => (
                <TableRow key={initiative.id}>
                  <TableCell className="font-medium">{initiative.title}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      initiative.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : initiative.status === 'completed'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {initiative.status === 'active' ? 'Ativa' : initiative.status === 'completed' ? 'Concluída' : 'Rascunho'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {initiative.priority ? `Prioridade ${initiative.priority}` : '-'}
                  </TableCell>
                  <TableCell>{initiative.owner || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingInitiative(initiative)
                          setDialogOpen(true)
                        }}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(initiative.id)}
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

function InitiativeForm({
  initiative,
  onSave,
  onCancel,
}: {
  initiative?: any
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(initiative?.title || '')
  const [description, setDescription] = useState(initiative?.description || '')
  const [status, setStatus] = useState(initiative?.status || 'draft')
  const [priority, setPriority] = useState(initiative?.priority || '')
  // Parse timeframe - formato: "2024-01-01 a 2024-12-31" ou apenas uma data
  const parseTimeframe = (timeframe: string | null) => {
    if (!timeframe) return { start: '', end: '' }
    const parts = timeframe.split(' a ')
    return {
      start: parts[0]?.trim() || '',
      end: parts[1]?.trim() || '',
    }
  }

  const initialTimeframe = parseTimeframe(initiative?.timeframe)
  const [startDate, setStartDate] = useState(initialTimeframe.start)
  const [endDate, setEndDate] = useState(initialTimeframe.end)
  const [responsible, setResponsible] = useState(initiative?.owner || '')
  const [notes, setNotes] = useState(initiative?.notes || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Título é obrigatório')
      return
    }
    
    // API espera timeframe como string (VARCHAR no banco)
    // Formato: "2024-01-01 a 2024-12-31" ou similar
    const timeframe = (startDate || endDate) 
      ? `${startDate || ''}${startDate && endDate ? ' a ' : ''}${endDate || ''}`.trim()
      : null

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority: priority ? parseInt(priority) : undefined,
      timeframe,
      owner: responsible.trim() || undefined,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {initiative ? 'Editar Iniciativa' : 'Nova Iniciativa'}
        </DialogTitle>
        <DialogDescription>
          Defina as informações da iniciativa
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="initiative-title">Título *</Label>
          <Input
            id="initiative-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Implementar sistema de agendamento online"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="initiative-description">Descrição</Label>
          <Textarea
            id="initiative-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva detalhadamente a iniciativa"
            className="min-h-[100px]"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="initiative-status">Status</Label>
            <select
              id="initiative-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="draft">Rascunho</option>
              <option value="active">Ativa</option>
              <option value="completed">Concluída</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="initiative-priority">Prioridade (1-5)</Label>
            <Input
              id="initiative-priority"
              type="number"
              min="1"
              max="5"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              placeholder="1 = maior prioridade"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="initiative-start">Data de Início</Label>
            <Input
              id="initiative-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="initiative-end">Data de Término</Label>
            <Input
              id="initiative-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="initiative-responsible">Responsável</Label>
          <Input
            id="initiative-responsible"
            value={responsible}
            onChange={(e) => setResponsible(e.target.value)}
            placeholder="Ex: Dr. João Silva"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="initiative-notes">Notas</Label>
          <Textarea
            id="initiative-notes"
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

