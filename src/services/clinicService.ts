/**
 * @deprecated Este serviço foi substituído pelo sistema de dossiês.
 * Use src/services/dossierService.ts para acessar dados de dossiês.
 * 
 * Este arquivo é mantido apenas para compatibilidade temporária.
 * Será removido em versão futura.
 */

import { api } from '@/lib/api'

export interface Clinic {
  id: string
  clinic_name: string
  created_at: Date
  updated_at: Date
}

// ==================== CLINIC CRUD ====================

export async function createClinic(clinicName: string): Promise<string> {
  return api.createClinic(clinicName)
}

export async function getClinic(clinicId: string): Promise<Clinic | null> {
  return api.getClinic(clinicId)
}

export async function getAllClinics(): Promise<Clinic[]> {
  return api.getAllClinics()
}

export async function updateClinicName(
  clinicId: string,
  clinicName: string,
): Promise<void> {
  return api.updateClinic(clinicId, { name: clinicName })
}

export async function deleteClinic(clinicId: string): Promise<void> {
  return api.deleteClinic(clinicId)
}
