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
import { Plus, Edit, Trash2, Target } from 'lucide-react'
import { api } from '@/lib/api'
import { calculateSectionCompletion } from '@/services/dossierService'
import { toast } from 'sonner'

interface StrategicChoicesManagerProps {
  dossierId: string
  onUpdateCompletion?: () => void
}

export default function StrategicChoicesManager({
  dossierId,
  onUpdateCompletion,
}: StrategicChoicesManagerProps) {
  const [choices, setChoices] = useState<any[]>([])
  const [editingChoice, setEditingChoice] = useState<any | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadChoices()
  }, [dossierId])

  const loadChoices = async () => {
    try {
      const data = await api.getStrategicChoices(dossierId)
      setChoices(data)
    } catch (error) {
      console.error('Erro ao carregar escolhas estratégicas:', error)
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (editingChoice) {
        await api.updateStrategicChoice(dossierId, editingChoice.id, data)
        toast.success('Escolha estratégica atualizada!')
      } else {
        await api.createStrategicChoice(dossierId, data)
        toast.success('Escolha estratégica criada!')
      }
      setDialogOpen(false)
      setEditingChoice(null)
      await loadChoices()
      if (onUpdateCompletion) {
        onUpdateCompletion()
      }
      await calculateSectionCompletion(dossierId, 'STRATEGY')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar escolha estratégica')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta escolha estratégica?')) return

    try {
      await api.deleteStrategicChoice(dossierId, id)
      toast.success('Escolha estratégica excluída!')
      await loadChoices()
      if (onUpdateCompletion) {
        onUpdateCompletion()
      }
      await calculateSectionCompletion(dossierId, 'STRATEGY')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir escolha estratégica')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-5" />
              Escolhas Estratégicas
            </CardTitle>
            <CardDescription>
              Defina as escolhas estratégicas fundamentais da clínica
            </CardDescription>
          </div>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) setEditingChoice(null)
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 size-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <StrategicChoiceForm
                choice={editingChoice}
                onSave={handleSave}
                onCancel={() => {
                  setDialogOpen(false)
                  setEditingChoice(null)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {choices.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            Nenhuma escolha estratégica cadastrada. Clique em "Adicionar" para criar a primeira.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {choices.map((choice) => (
                <TableRow key={choice.id}>
                  <TableCell className="font-medium">{choice.title}</TableCell>
                  <TableCell>
                    {choice.priority ? `Prioridade ${choice.priority}` : '-'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {choice.rationale || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingChoice(choice)
                          setDialogOpen(true)
                        }}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(choice.id)}
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

function StrategicChoiceForm({
  choice,
  onSave,
  onCancel,
}: {
  choice?: any
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(choice?.title || '')
  const [rationale, setRationale] = useState(choice?.rationale || '')
  const [priority, setPriority] = useState(choice?.priority || '')
  const [notes, setNotes] = useState(choice?.notes || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Título é obrigatório')
      return
    }
    onSave({
      title: title.trim(),
      rationale: rationale.trim() || undefined,
      priority: priority ? parseInt(priority) : undefined,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {choice ? 'Editar Escolha Estratégica' : 'Nova Escolha Estratégica'}
        </DialogTitle>
        <DialogDescription>
          Defina as informações da escolha estratégica
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="choice-title">Título *</Label>
          <Input
            id="choice-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Foco em tratamentos estéticos"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="choice-rationale">Racional (Justificativa)</Label>
          <Textarea
            id="choice-rationale"
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Explique o raciocínio por trás desta escolha estratégica"
            className="min-h-[100px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="choice-priority">Prioridade (1-5)</Label>
          <Input
            id="choice-priority"
            type="number"
            min="1"
            max="5"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            placeholder="1 = maior prioridade"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="choice-notes">Notas</Label>
          <Textarea
            id="choice-notes"
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



