import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { api } from '@/lib/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

export default function ClinicSelector() {
  const { user } = useAuthStore()
  const currentClinicId = user?.clinicId || null
  interface Clinic {
    id: string
    clinic_name: string
    created_at: Date
    updated_at: Date
  }

  const [clinics, setClinics] = useState<Clinic[]>([])
  const [loadingClinics, setLoadingClinics] = useState(false)

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
    // Atualizar clínica do usuário (implementar se necessário)
    // Por enquanto, apenas recarregar a página para atualizar o contexto
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentClinicId || ''}
        onValueChange={handleSelectClinic}
        disabled={loadingClinics}
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

      {/* Apenas administradores podem criar clínicas através da área administrativa */}

    </div>
  )
}

