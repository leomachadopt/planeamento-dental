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
import { Plus, Edit, Trash2, Building2 } from 'lucide-react'
import {
  getCompetitors,
  createCompetitor,
  updateCompetitor,
  deleteCompetitor,
} from '@/services/entityService'
import { calculateSectionCompletion } from '@/services/dossierService'
import { toast } from 'sonner'

interface CompetitorsManagerProps {
  dossierId: string
  onUpdateCompletion?: () => void
}

export default function CompetitorsManager({
  dossierId,
  onUpdateCompletion,
}: CompetitorsManagerProps) {
  const [competitors, setCompetitors] = useState<any[]>([])
  const [editingCompetitor, setEditingCompetitor] = useState<any | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadCompetitors()
  }, [dossierId])

  const loadCompetitors = async () => {
    try {
      const data = await getCompetitors(dossierId)
      setCompetitors(data)
    } catch (error) {
      console.error('Erro ao carregar concorrentes:', error)
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (editingCompetitor) {
        await updateCompetitor(dossierId, editingCompetitor.id, data)
        toast.success('Concorrente atualizado!')
      } else {
        await createCompetitor(dossierId, data)
        toast.success('Concorrente criado!')
      }
      setDialogOpen(false)
      setEditingCompetitor(null)
      await loadCompetitors()
      if (onUpdateCompletion) {
        onUpdateCompletion()
      }
      await calculateSectionCompletion(dossierId, 'MARKET')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar concorrente')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este concorrente?')) return

    try {
      await deleteCompetitor(dossierId, id)
      toast.success('Concorrente excluído!')
      await loadCompetitors()
      if (onUpdateCompletion) {
        onUpdateCompletion()
      }
      await calculateSectionCompletion(dossierId, 'MARKET')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir concorrente')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5" />
              Concorrentes
            </CardTitle>
            <CardDescription>
              Identifique e analise os principais concorrentes do mercado
            </CardDescription>
          </div>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) setEditingCompetitor(null)
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 size-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <CompetitorForm
                competitor={editingCompetitor}
                onSave={handleSave}
                onCancel={() => {
                  setDialogOpen(false)
                  setEditingCompetitor(null)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {competitors.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            Nenhum concorrente cadastrado. Clique em "Adicionar" para criar o primeiro.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Diferenciação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitors.map((competitor) => (
                <TableRow key={competitor.id}>
                  <TableCell className="font-medium">{competitor.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      competitor.type === 'direct' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                      {competitor.type === 'direct' ? 'Direto' : 'Indireto'}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {competitor.differentiation_summary || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCompetitor(competitor)
                          setDialogOpen(true)
                        }}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(competitor.id)}
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

function CompetitorForm({
  competitor,
  onSave,
  onCancel,
}: {
  competitor?: any
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(competitor?.name || '')
  const [type, setType] = useState(competitor?.type || 'direct')
  const [notes, setNotes] = useState(competitor?.notes || '')
  const [differentiationSummary, setDifferentiationSummary] = useState(competitor?.differentiation_summary || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    onSave({
      name: name.trim(),
      type,
      notes: notes.trim() || undefined,
      differentiationSummary: differentiationSummary.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {competitor ? 'Editar Concorrente' : 'Novo Concorrente'}
        </DialogTitle>
        <DialogDescription>
          Defina as informações do concorrente
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="competitor-name">Nome *</Label>
          <Input
            id="competitor-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Clínica XYZ"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="competitor-type">Tipo *</Label>
          <select
            id="competitor-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="direct">Direto</option>
            <option value="indirect">Indireto</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="competitor-differentiation">Resumo de Diferenciação</Label>
          <Textarea
            id="competitor-differentiation"
            value={differentiationSummary}
            onChange={(e) => setDifferentiationSummary(e.target.value)}
            placeholder="Como este concorrente se diferencia?"
            className="min-h-[80px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="competitor-notes">Notas</Label>
          <Textarea
            id="competitor-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações adicionais sobre o concorrente"
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


