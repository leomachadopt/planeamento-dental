import { useState, useEffect } from 'react'
import { useStrategyStore } from '@/stores/useStrategyStore'
import { api } from '@/lib/api'
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
import { Save, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ClinicSelector() {
  const { currentClinicId, loadClinicData, saveClinicData, createNewClinic, isSaving, isLoading } =
    useStrategyStore()
  interface Clinic {
    id: string
    clinic_name: string
    created_at: Date
    updated_at: Date
  }

  const [clinics, setClinics] = useState<Clinic[]>([])
  const [loadingClinics, setLoadingClinics] = useState(false)
  const [newClinicName, setNewClinicName] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    loadClinics()
  }, [])

  const loadClinics = async () => {
    setLoadingClinics(true)
    try {
      const allClinics = await api.getAllClinics()
      setClinics(allClinics)
    } catch (error) {
      console.error('Erro ao carregar clínicas:', error)
      toast.error('Erro ao carregar lista de clínicas')
    } finally {
      setLoadingClinics(false)
    }
  }

  const handleSelectClinic = async (clinicId: string) => {
    if (clinicId === currentClinicId) return
    await loadClinicData(clinicId)
  }

  const handleCreateClinic = async () => {
    if (!newClinicName.trim()) {
      toast.error('Digite o nome da clínica')
      return
    }

    try {
      const clinicId = await api.createClinic(newClinicName.trim())
      await createNewClinic(newClinicName.trim())
      setNewClinicName('')
      setIsDialogOpen(false)
      await loadClinics()
    } catch (error) {
      toast.error('Erro ao criar clínica')
    }
  }

  const handleSave = async () => {
    await saveClinicData()
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentClinicId || ''}
        onValueChange={handleSelectClinic}
        disabled={loadingClinics || isLoading}
      >
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Selecione uma clínica" />
        </SelectTrigger>
        <SelectContent>
          {clinics.length === 0 ? (
            <SelectItem value="none" disabled>
              Nenhuma clínica cadastrada
            </SelectItem>
          ) : (
            clinics.map((clinic) => (
              <SelectItem key={clinic.id} value={clinic.id}>
                {clinic.clinic_name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 size-4" />
            Nova Clínica
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Clínica</DialogTitle>
            <DialogDescription>
              Digite o nome da nova clínica para começar o planejamento estratégico.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clinic-name">Nome da Clínica</Label>
              <Input
                id="clinic-name"
                value={newClinicName}
                onChange={(e) => setNewClinicName(e.target.value)}
                placeholder="Ex: Clínica Dentária Sorriso Radiante"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateClinic()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateClinic}>
              Criar Clínica
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        onClick={handleSave}
        disabled={!currentClinicId || isSaving}
        size="sm"
        variant="default"
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="mr-2 size-4" />
            Salvar
          </>
        )}
      </Button>
    </div>
  )
}

