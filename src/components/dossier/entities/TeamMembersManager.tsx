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
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getRoles,
} from '@/services/entityService'
import { useAuthStore } from '@/stores/useAuthStore'
import { calculateSectionCompletion } from '@/services/dossierService'
import { toast } from 'sonner'

interface TeamMembersManagerProps {
  dossierId: string
  onUpdateCompletion?: () => void
}

export default function TeamMembersManager({
  dossierId,
  onUpdateCompletion,
}: TeamMembersManagerProps) {
  const { user } = useAuthStore()
  const clinicId = user?.clinicId
  const [members, setMembers] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [editingMember, setEditingMember] = useState<any | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (dossierId) {
      loadData()
    }
  }, [dossierId, clinicId])

  const loadData = async () => {
    if (!dossierId || !clinicId) return
    try {
      const [membersData, rolesData] = await Promise.all([
        getTeamMembers(dossierId),
        getRoles(clinicId),
      ])
      setMembers(membersData)
      setRoles(rolesData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (editingMember) {
        await updateTeamMember(dossierId, editingMember.id, data)
        toast.success('Membro atualizado!')
      } else {
        await createTeamMember(dossierId, data)
        toast.success('Membro criado!')
      }
      setDialogOpen(false)
      setEditingMember(null)
      await loadData()
      if (onUpdateCompletion) {
        onUpdateCompletion()
      }
      await calculateSectionCompletion(dossierId, 'OPERATIONS')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar membro')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este membro?')) return

    try {
      await deleteTeamMember(dossierId, id)
      toast.success('Membro excluído!')
      await loadData()
      if (onUpdateCompletion) {
        onUpdateCompletion()
      }
      await calculateSectionCompletion(dossierId, 'OPERATIONS')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir membro')
    }
  }

  const getEmploymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      employee: 'Funcionário',
      contractor: 'Contratado',
      partner: 'Parceiro',
    }
    return labels[type] || type
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Membros da Equipe
            </CardTitle>
            <CardDescription>
              Gerencie os membros da equipe e suas atribuições
            </CardDescription>
          </div>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) setEditingMember(null)
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 size-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <TeamMemberForm
                member={editingMember}
                roles={roles}
                onSave={handleSave}
                onCancel={() => {
                  setDialogOpen(false)
                  setEditingMember(null)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            Nenhum membro cadastrado. Clique em "Adicionar" para criar o primeiro.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Horas/Semana</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.role_name || '-'}</TableCell>
                  <TableCell>{getEmploymentTypeLabel(member.employment_type)}</TableCell>
                  <TableCell>
                    {member.hours_per_week ? `${member.hours_per_week}h` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingMember(member)
                          setDialogOpen(true)
                        }}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(member.id)}
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

function TeamMemberForm({
  member,
  roles,
  onSave,
  onCancel,
}: {
  member?: any
  roles: any[]
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(member?.name || '')
  const [roleId, setRoleId] = useState(member?.role_id || '')
  const [employmentType, setEmploymentType] = useState(member?.employment_type || 'employee')
  const [hoursPerWeek, setHoursPerWeek] = useState(member?.hours_per_week || '')
  const [notes, setNotes] = useState(member?.notes || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    onSave({
      name: name.trim(),
      roleId: roleId || undefined,
      employmentType,
      hoursPerWeek: hoursPerWeek ? parseInt(hoursPerWeek) : undefined,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {member ? 'Editar Membro' : 'Novo Membro da Equipe'}
        </DialogTitle>
        <DialogDescription>
          Defina as informações do membro da equipe
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="member-name">Nome *</Label>
          <Input
            id="member-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Dr. João Silva"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="member-role">Cargo</Label>
          <select
            id="member-role"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Nenhum</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="member-type">Tipo de Vínculo *</Label>
          <select
            id="member-type"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="employee">Funcionário</option>
            <option value="contractor">Contratado</option>
            <option value="partner">Parceiro</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="member-hours">Horas por Semana</Label>
          <Input
            id="member-hours"
            type="number"
            min="1"
            max="168"
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(e.target.value)}
            placeholder="Ex: 40"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="member-notes">Notas</Label>
          <Textarea
            id="member-notes"
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


