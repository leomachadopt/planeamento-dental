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
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Edit, Trash2, Package, Star } from 'lucide-react'
import {
  getServices,
  createService,
  updateService,
  deleteService,
  getServiceCategories,
} from '@/services/entityService'
import { calculateSectionCompletion } from '@/services/dossierService'
import { toast } from 'sonner'

interface ServicesManagerProps {
  dossierId: string
  onUpdateCompletion?: () => void
}

export default function ServicesManager({
  dossierId,
  onUpdateCompletion,
}: ServicesManagerProps) {
  const [services, setServices] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [editingService, setEditingService] = useState<any | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [dossierId])

  const loadData = async () => {
    try {
      const [servicesData, categoriesData] = await Promise.all([
        getServices(dossierId),
        getServiceCategories(dossierId),
      ])
      setServices(servicesData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (editingService) {
        await updateService(dossierId, editingService.id, data)
        toast.success('Serviço atualizado!')
      } else {
        await createService(dossierId, data)
        toast.success('Serviço criado!')
      }
      setDialogOpen(false)
      setEditingService(null)
      await loadData()
      if (onUpdateCompletion) {
        onUpdateCompletion()
      }
      await calculateSectionCompletion(dossierId, 'OFFER')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar serviço')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return

    try {
      await deleteService(dossierId, id)
      toast.success('Serviço excluído!')
      await loadData()
      if (onUpdateCompletion) {
        onUpdateCompletion()
      }
      await calculateSectionCompletion(dossierId, 'OFFER')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir serviço')
    }
  }

  const formatPrice = (price: number | null) => {
    if (!price) return '-'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="size-5" />
              Serviços
            </CardTitle>
            <CardDescription>
              Gerencie os serviços oferecidos pela clínica
            </CardDescription>
          </div>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) setEditingService(null)
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 size-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <ServiceForm
                service={editingService}
                categories={categories}
                onSave={handleSave}
                onCancel={() => {
                  setDialogOpen(false)
                  setEditingService(null)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            Nenhum serviço cadastrado. Clique em "Adicionar" para criar o primeiro.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Flagship</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.category_name || '-'}</TableCell>
                  <TableCell>
                    {service.duration_minutes ? `${service.duration_minutes} min` : '-'}
                  </TableCell>
                  <TableCell>{formatPrice(service.price)}</TableCell>
                  <TableCell>
                    {service.is_flagship ? (
                      <Star className="size-4 text-amber-500 fill-amber-500" />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingService(service)
                          setDialogOpen(true)
                        }}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(service.id)}
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

function ServiceForm({
  service,
  categories,
  onSave,
  onCancel,
}: {
  service?: any
  categories: any[]
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(service?.name || '')
  const [description, setDescription] = useState(service?.description || '')
  const [serviceCategoryId, setServiceCategoryId] = useState(service?.service_category_id || '')
  const [durationMinutes, setDurationMinutes] = useState(service?.duration_minutes || '')
  const [price, setPrice] = useState(service?.price || '')
  const [estimatedCost, setEstimatedCost] = useState(service?.estimated_cost || '')
  const [isFlagship, setIsFlagship] = useState(service?.is_flagship || false)
  const [notes, setNotes] = useState(service?.notes || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      serviceCategoryId: serviceCategoryId || undefined,
      durationMinutes: durationMinutes ? parseInt(durationMinutes) : undefined,
      price: price ? parseFloat(price) : undefined,
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      isFlagship,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {service ? 'Editar Serviço' : 'Novo Serviço'}
        </DialogTitle>
        <DialogDescription>
          Defina as informações do serviço
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="service-name">Nome *</Label>
          <Input
            id="service-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Limpeza Profissional"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service-description">Descrição</Label>
          <Textarea
            id="service-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o serviço"
            className="min-h-[80px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service-category">Categoria</Label>
          <select
            id="service-category"
            value={serviceCategoryId}
            onChange={(e) => setServiceCategoryId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Nenhuma</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="service-duration">Duração (minutos)</Label>
            <Input
              id="service-duration"
              type="number"
              min="1"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              placeholder="Ex: 60"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="service-price">Preço (R$)</Label>
            <Input
              id="service-price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ex: 150.00"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="service-cost">Custo Estimado (R$)</Label>
          <Input
            id="service-cost"
            type="number"
            step="0.01"
            min="0"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
            placeholder="Ex: 80.00"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="service-flagship"
            checked={isFlagship}
            onCheckedChange={(checked) => setIsFlagship(checked === true)}
          />
          <Label htmlFor="service-flagship" className="cursor-pointer">
            Serviço carro-chefe (flagship)
          </Label>
        </div>
        <div className="space-y-2">
          <Label htmlFor="service-notes">Notas</Label>
          <Textarea
            id="service-notes"
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



