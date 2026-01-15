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
import { Plus, Edit, Trash2, Briefcase } from 'lucide-react'
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from '@/services/entityService'
import { useAuthStore } from '@/stores/useAuthStore'
import { toast } from 'sonner'

interface RolesManagerProps {
  onUpdateCompletion?: () => void
}

export default function RolesManager({
  onUpdateCompletion,
}: RolesManagerProps) {
  const { user } = useAuthStore()
  const clinicId = user?.clinicId
  const [roles, setRoles] = useState<any[]>([])
  const [editingRole, setEditingRole] = useState<any | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (clinicId) {
      loadRoles()
    }
  }, [clinicId])

  const loadRoles = async () => {
    if (!clinicId) return
    try {
      const data = await getRoles(clinicId)
      setRoles(data)
    } catch (error) {
      console.error('Erro ao carregar cargos:', error)
    }
  }

  const handleSave = async (data: any) => {
    if (!clinicId) return
    try {
      if (editingRole) {
        await updateRole(clinicId, editingRole.id, data)
        toast.success('Cargo atualizado!')
      } else {
        await createRole(clinicId, data)
        toast.success('Cargo criado!')
      }
      setDialogOpen(false)
      setEditingRole(null)
      await loadRoles()
      if (onUpdateCompletion) {
        onUpdateCompletion()
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar cargo')
    }
  }

  const handleDelete = async (id: string) => {
    if (!clinicId) return
    if (!confirm('Tem certeza que deseja excluir este cargo?')) return

    try {
      await deleteRole(clinicId, id)
      toast.success('Cargo excluído!')
      await loadRoles()
      if (onUpdateCompletion) {
        onUpdateCompletion()
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir cargo')
    }
  }

  if (!clinicId) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="size-5" />
              Cargos e Funções
            </CardTitle>
            <CardDescription>
              Defina os cargos e funções da equipe (compartilhado entre todos os dossiês da clínica)
            </CardDescription>
          </div>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) setEditingRole(null)
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 size-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <RoleForm
                role={editingRole}
                onSave={handleSave}
                onCancel={() => {
                  setDialogOpen(false)
                  setEditingRole(null)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {roles.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            Nenhum cargo cadastrado. Clique em "Adicionar" para criar o primeiro.
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
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingRole(role)
                          setDialogOpen(true)
                        }}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(role.id)}
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

function RoleForm({
  role,
  onSave,
  onCancel,
}: {
  role?: any
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(role?.name || '')
  const [description, setDescription] = useState(role?.description || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {role ? 'Editar Cargo' : 'Novo Cargo'}
        </DialogTitle>
        <DialogDescription>
          Defina as informações do cargo ou função
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="role-name">Nome *</Label>
          <Input
            id="role-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Dentista Clínico Geral"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role-description">Descrição</Label>
          <Textarea
            id="role-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva as responsabilidades deste cargo"
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



