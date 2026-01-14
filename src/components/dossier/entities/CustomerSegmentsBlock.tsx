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
import { Plus, Edit, Trash2, Users } from 'lucide-react'
import {
  getCustomerSegments,
  createCustomerSegment,
  updateCustomerSegment,
  deleteCustomerSegment,
} from '@/services/entityService'
import { calculateSectionCompletion } from '@/services/dossierService'
import { toast } from 'sonner'

interface CustomerSegmentsBlockProps {
  dossierId: string
  onUpdateCompletion?: () => void
}

export default function CustomerSegmentsBlock({
  dossierId,
  onUpdateCompletion,
}: CustomerSegmentsBlockProps) {
  const [segments, setSegments] = useState<any[]>([])
  const [editingSegment, setEditingSegment] = useState<any | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadSegments()
  }, [dossierId])

  const loadSegments = async () => {
    try {
      const data = await getCustomerSegments(dossierId)
      setSegments(data)
    } catch (error) {
      console.error('Erro ao carregar segmentos:', error)
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (editingSegment) {
        await updateCustomerSegment(dossierId, editingSegment.id, data)
        toast.success('Segmento atualizado!')
      } else {
        await createCustomerSegment(dossierId, data)
        toast.success('Segmento criado!')
      }
      setDialogOpen(false)
      setEditingSegment(null)
      await loadSegments()
      if (onUpdateCompletion) {
        onUpdateCompletion()
      }
      // Recalcular completude
      await calculateSectionCompletion(dossierId, 'IDENTITY')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar segmento')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este segmento?')) return

    try {
      await deleteCustomerSegment(dossierId, id)
      toast.success('Segmento excluído!')
      await loadSegments()
      if (onUpdateCompletion) {
        onUpdateCompletion()
      }
      await calculateSectionCompletion(dossierId, 'IDENTITY')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir segmento')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Segmentos de Cliente
            </CardTitle>
            <CardDescription>
              Defina os principais segmentos de clientes que a clínica atende
            </CardDescription>
          </div>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) setEditingSegment(null)
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 size-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <SegmentForm
                segment={editingSegment}
                segments={segments}
                onSave={handleSave}
                onCancel={() => {
                  setDialogOpen(false)
                  setEditingSegment(null)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {segments.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            Nenhum segmento cadastrado. Clique em "Adicionar" para criar o primeiro.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {segments.map((segment) => (
                <TableRow key={segment.id}>
                  <TableCell className="font-medium">{segment.name}</TableCell>
                  <TableCell>{segment.description || '-'}</TableCell>
                  <TableCell>
                    {segment.priority ? `Prioridade ${segment.priority}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingSegment(segment)
                          setDialogOpen(true)
                        }}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(segment.id)}
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

// Componente de formulário para Segmento
function SegmentForm({
  segment,
  segments,
  onSave,
  onCancel,
}: {
  segment?: any
  segments: any[]
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(segment?.name || '')
  const [description, setDescription] = useState(segment?.description || '')
  const [priority, setPriority] = useState(segment?.priority || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      priority: priority ? parseInt(priority) : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {segment ? 'Editar Segmento' : 'Novo Segmento de Cliente'}
        </DialogTitle>
        <DialogDescription>
          Defina as características do segmento de cliente
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="segment-name">Nome *</Label>
          <Input
            id="segment-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Pacientes adultos 35-55 anos"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="segment-description">Descrição</Label>
          <Textarea
            id="segment-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva as características deste segmento"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="segment-priority">Prioridade (1-5)</Label>
          <Input
            id="segment-priority"
            type="number"
            min="1"
            max="5"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            placeholder="1 = maior prioridade"
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

