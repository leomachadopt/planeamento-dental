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
import { Plus, Edit, Trash2, Award } from 'lucide-react'
import {
  getValuePropositions,
  createValueProposition,
  updateValueProposition,
  deleteValueProposition,
  getCustomerSegments,
} from '@/services/entityService'
import { calculateSectionCompletion } from '@/services/dossierService'
import { toast } from 'sonner'

interface ValuePropositionsBlockProps {
  dossierId: string
  onUpdateCompletion?: () => void
}

export default function ValuePropositionsBlock({
  dossierId,
  onUpdateCompletion,
}: ValuePropositionsBlockProps) {
  const [propositions, setPropositions] = useState<any[]>([])
  const [customerSegments, setCustomerSegments] = useState<any[]>([])
  const [editingProposition, setEditingProposition] = useState<any | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [dossierId])

  const loadData = async () => {
    try {
      const [props, segments] = await Promise.all([
        getValuePropositions(dossierId),
        getCustomerSegments(dossierId),
      ])
      setPropositions(props)
      setCustomerSegments(segments)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (editingProposition) {
        await updateValueProposition(dossierId, editingProposition.id, data)
        toast.success('Proposta de valor atualizada!')
      } else {
        await createValueProposition(dossierId, data)
        toast.success('Proposta de valor criada!')
      }
      setDialogOpen(false)
      setEditingProposition(null)
      await loadData()
      if (onUpdateCompletion) {
        onUpdateCompletion()
      }
      await calculateSectionCompletion(dossierId, 'IDENTITY')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar proposta de valor')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta proposta de valor?')) return

    try {
      await deleteValueProposition(dossierId, id)
      toast.success('Proposta de valor excluída!')
      await loadData()
      if (onUpdateCompletion) {
        onUpdateCompletion()
      }
      await calculateSectionCompletion(dossierId, 'IDENTITY')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir proposta de valor')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="size-5" />
              Propostas de Valor
            </CardTitle>
            <CardDescription>
              Defina as propostas de valor oferecidas pela clínica
            </CardDescription>
          </div>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) setEditingProposition(null)
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 size-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <PropositionForm
                proposition={editingProposition}
                segments={customerSegments}
                onSave={handleSave}
                onCancel={() => {
                  setDialogOpen(false)
                  setEditingProposition(null)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {propositions.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            Nenhuma proposta de valor cadastrada. Clique em "Adicionar" para criar a primeira.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Segmento Alvo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propositions.map((proposition) => (
                <TableRow key={proposition.id}>
                  <TableCell className="font-medium">{proposition.title}</TableCell>
                  <TableCell>{proposition.description || '-'}</TableCell>
                  <TableCell>
                    {proposition.target_segment_name || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingProposition(proposition)
                          setDialogOpen(true)
                        }}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(proposition.id)}
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

// Componente de formulário para Proposta de Valor
function PropositionForm({
  proposition,
  segments,
  onSave,
  onCancel,
}: {
  proposition?: any
  segments: any[]
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(proposition?.title || '')
  const [description, setDescription] = useState(proposition?.description || '')
  const [targetSegmentId, setTargetSegmentId] = useState(proposition?.target_segment_id || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Título é obrigatório')
      return
    }
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      targetSegmentId: targetSegmentId || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {proposition ? 'Editar Proposta de Valor' : 'Nova Proposta de Valor'}
        </DialogTitle>
        <DialogDescription>
          Defina a proposta de valor oferecida pela clínica
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="proposition-title">Título *</Label>
          <Input
            id="proposition-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Tratamento personalizado com tecnologia avançada"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="proposition-description">Descrição</Label>
          <Textarea
            id="proposition-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva detalhadamente a proposta de valor"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="proposition-segment">Segmento Alvo</Label>
          <select
            id="proposition-segment"
            value={targetSegmentId}
            onChange={(e) => setTargetSegmentId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Nenhum</option>
            {segments.map((segment) => (
              <option key={segment.id} value={segment.id}>
                {segment.name}
              </option>
            ))}
          </select>
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

