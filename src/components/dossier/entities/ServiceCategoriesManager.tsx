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
import { Plus, Edit, Trash2, Folder } from 'lucide-react'
import {
  getServiceCategories,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
} from '@/services/entityService'
import { calculateSectionCompletion } from '@/services/dossierService'
import { toast } from 'sonner'

interface ServiceCategoriesManagerProps {
  dossierId: string
  onUpdateCompletion?: () => void
}

export default function ServiceCategoriesManager({
  dossierId,
  onUpdateCompletion,
}: ServiceCategoriesManagerProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [editingCategory, setEditingCategory] = useState<any | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [dossierId])

  const loadCategories = async () => {
    try {
      const data = await getServiceCategories(dossierId)
      setCategories(data)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (editingCategory) {
        await updateServiceCategory(dossierId, editingCategory.id, data)
        toast.success('Categoria atualizada!')
      } else {
        await createServiceCategory(dossierId, data)
        toast.success('Categoria criada!')
      }
      setDialogOpen(false)
      setEditingCategory(null)
      await loadCategories()
      if (onUpdateCompletion) {
        onUpdateCompletion()
      }
      await calculateSectionCompletion(dossierId, 'OFFER')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar categoria')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

    try {
      await deleteServiceCategory(dossierId, id)
      toast.success('Categoria excluída!')
      await loadCategories()
      if (onUpdateCompletion) {
        onUpdateCompletion()
      }
      await calculateSectionCompletion(dossierId, 'OFFER')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir categoria')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Folder className="size-5" />
              Categorias de Serviços
            </CardTitle>
            <CardDescription>
              Organize os serviços em categorias para melhor gestão
            </CardDescription>
          </div>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) setEditingCategory(null)
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 size-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <CategoryForm
                category={editingCategory}
                onSave={handleSave}
                onCancel={() => {
                  setDialogOpen(false)
                  setEditingCategory(null)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            Nenhuma categoria cadastrada. Clique em "Adicionar" para criar a primeira.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCategory(category)
                          setDialogOpen(true)
                        }}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
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

function CategoryForm({
  category,
  onSave,
  onCancel,
}: {
  category?: any
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(category?.name || '')
  const [description, setDescription] = useState(category?.description || '')
  const [notes, setNotes] = useState(category?.notes || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {category ? 'Editar Categoria' : 'Nova Categoria de Serviço'}
        </DialogTitle>
        <DialogDescription>
          Defina as informações da categoria
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="category-name">Nome *</Label>
          <Input
            id="category-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Tratamentos Estéticos"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category-description">Descrição</Label>
          <Textarea
            id="category-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva esta categoria de serviços"
            className="min-h-[80px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category-notes">Notas</Label>
          <Textarea
            id="category-notes"
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



