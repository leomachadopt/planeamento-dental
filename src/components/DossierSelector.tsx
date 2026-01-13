import { useState, useEffect } from 'react'
import { useStrategyStore } from '@/stores/useStrategyStore'
import { getDossiers, createDossier, type Dossier } from '@/services/dossierService'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
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
import { Label } from '@/components/ui/label'
import { Plus, Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface DossierSelectorProps {
  onDossierChange?: (dossierId: string | null) => void
}

export default function DossierSelector({ onDossierChange }: DossierSelectorProps) {
  const { currentClinicId } = useStrategyStore()
  const [dossiers, setDossiers] = useState<Dossier[]>([])
  const [currentDossierId, setCurrentDossierId] = useState<string | null>(null)
  const [loadingDossiers, setLoadingDossiers] = useState(false)
  const [creatingDossier, setCreatingDossier] = useState(false)
  const [newDossierTitle, setNewDossierTitle] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (currentClinicId) {
      loadDossiers()
    } else {
      setDossiers([])
      setCurrentDossierId(null)
    }
  }, [currentClinicId])

  const loadDossiers = async () => {
    if (!currentClinicId) return

    setLoadingDossiers(true)
    try {
      const allDossiers = await getDossiers(currentClinicId)
      setDossiers(allDossiers)
      
      // Se não há dossiê selecionado e há dossiês disponíveis, selecionar o primeiro
      if (!currentDossierId && allDossiers.length > 0) {
        const firstDossier = allDossiers[0]
        setCurrentDossierId(firstDossier.id)
        onDossierChange?.(firstDossier.id)
      }
    } catch (error) {
      console.error('Erro ao carregar dossiês:', error)
      toast.error('Erro ao carregar lista de dossiês')
    } finally {
      setLoadingDossiers(false)
    }
  }

  const handleSelectDossier = (dossierId: string) => {
    if (dossierId === currentDossierId) return
    setCurrentDossierId(dossierId)
    onDossierChange?.(dossierId)
  }

  const handleCreateDossier = async () => {
    if (!newDossierTitle.trim()) {
      toast.error('Digite o título do dossiê')
      return
    }

    if (!currentClinicId) {
      toast.error('Selecione uma clínica primeiro')
      return
    }

    setCreatingDossier(true)
    try {
      const newDossier = await createDossier(currentClinicId, newDossierTitle.trim())
      setNewDossierTitle('')
      setIsDialogOpen(false)
      await loadDossiers()
      setCurrentDossierId(newDossier.id)
      onDossierChange?.(newDossier.id)
      toast.success('Dossiê criado com sucesso!')
    } catch (error: any) {
      console.error('Erro ao criar dossiê:', error)
      toast.error(error.message || 'Erro ao criar dossiê')
    } finally {
      setCreatingDossier(false)
    }
  }

  const currentDossier = dossiers.find((d) => d.id === currentDossierId)

  if (!currentClinicId) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <FileText className="size-4 text-slate-500" />
      <Select
        value={currentDossierId || ''}
        onValueChange={handleSelectDossier}
        disabled={loadingDossiers}
      >
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Selecione um dossiê" />
        </SelectTrigger>
        <SelectContent>
          {dossiers.length === 0 ? (
            <SelectItem value="none" disabled>
              Nenhum dossiê cadastrado
            </SelectItem>
          ) : (
            dossiers
              .filter((d) => d.status !== 'archived')
              .map((dossier) => (
                <SelectItem key={dossier.id} value={dossier.id}>
                  {dossier.title}
                  {dossier.status === 'finalized' && ' ✓'}
                </SelectItem>
              ))
          )}
        </SelectContent>
      </Select>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 size-4" />
            Novo Dossiê
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Dossiê</DialogTitle>
            <DialogDescription>
              Crie um novo dossiê para documentar a estratégia da clínica. Cada dossiê representa um snapshot no tempo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dossier-title">Título do Dossiê</Label>
              <Input
                id="dossier-title"
                value={newDossierTitle}
                onChange={(e) => setNewDossierTitle(e.target.value)}
                placeholder="Ex: Dossiê 2026 - Q1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateDossier()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateDossier} disabled={creatingDossier}>
              {creatingDossier ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Dossiê'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

