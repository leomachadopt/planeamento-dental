import { api } from '@/lib/api'

// ==================== CUSTOMER SEGMENTS ====================

export async function getCustomerSegments(dossierId: string, entityId?: string) {
  return api.getCustomerSegments(dossierId, entityId)
}

export async function createCustomerSegment(dossierId: string, data: {
  name: string
  description?: string
  priority?: number
  notes?: string
}) {
  return api.createCustomerSegment(dossierId, data)
}

export async function updateCustomerSegment(
  dossierId: string,
  entityId: string,
  data: {
    name?: string
    description?: string
    priority?: number
    notes?: string
    status?: string
  },
) {
  return api.updateCustomerSegment(dossierId, entityId, data)
}

export async function deleteCustomerSegment(dossierId: string, entityId: string) {
  return api.deleteCustomerSegment(dossierId, entityId)
}

// ==================== VALUE PROPOSITIONS ====================

export async function getValuePropositions(dossierId: string, entityId?: string) {
  return api.getValuePropositions(dossierId, entityId)
}

export async function createValueProposition(dossierId: string, data: {
  title: string
  description?: string
  targetSegmentId?: string
  notes?: string
}) {
  return api.createValueProposition(dossierId, data)
}

export async function updateValueProposition(
  dossierId: string,
  entityId: string,
  data: {
    title?: string
    description?: string
    targetSegmentId?: string
    notes?: string
    status?: string
  },
) {
  return api.updateValueProposition(dossierId, entityId, data)
}

export async function deleteValueProposition(dossierId: string, entityId: string) {
  return api.deleteValueProposition(dossierId, entityId)
}

// ==================== SERVICES ====================

export async function getServices(dossierId: string, entityId?: string) {
  return api.getServices(dossierId, entityId)
}

export async function createService(dossierId: string, data: {
  name: string
  description?: string
  serviceCategoryId?: string
  durationMinutes?: number
  price?: number
  estimatedCost?: number
  isFlagship?: boolean
  notes?: string
}) {
  return api.createService(dossierId, data)
}

export async function updateService(
  dossierId: string,
  entityId: string,
  data: {
    name?: string
    description?: string
    serviceCategoryId?: string
    durationMinutes?: number
    price?: number
    estimatedCost?: number
    isFlagship?: boolean
    notes?: string
    status?: string
  },
) {
  return api.updateService(dossierId, entityId, data)
}

export async function deleteService(dossierId: string, entityId: string) {
  return api.deleteService(dossierId, entityId)
}

// ==================== COMPETITORS ====================

export async function getCompetitors(dossierId: string, entityId?: string) {
  return api.getCompetitors(dossierId, entityId)
}

export async function createCompetitor(dossierId: string, data: {
  name: string
  type: 'direct' | 'indirect'
  notes?: string
  differentiationSummary?: string
}) {
  return api.createCompetitor(dossierId, data)
}

export async function updateCompetitor(
  dossierId: string,
  entityId: string,
  data: {
    name?: string
    type?: 'direct' | 'indirect'
    notes?: string
    differentiationSummary?: string
    status?: string
  },
) {
  return api.updateCompetitor(dossierId, entityId, data)
}

export async function deleteCompetitor(dossierId: string, entityId: string) {
  return api.deleteCompetitor(dossierId, entityId)
}

// ==================== TEAM MEMBERS ====================

export async function getTeamMembers(dossierId: string, entityId?: string) {
  return api.getTeamMembers(dossierId, entityId)
}

export async function createTeamMember(dossierId: string, data: {
  name: string
  roleId?: string
  employmentType: 'employee' | 'contractor' | 'partner'
  hoursPerWeek?: number
  notes?: string
}) {
  return api.createTeamMember(dossierId, data)
}

export async function updateTeamMember(
  dossierId: string,
  entityId: string,
  data: {
    name?: string
    roleId?: string
    employmentType?: 'employee' | 'contractor' | 'partner'
    hoursPerWeek?: number
    notes?: string
    status?: string
  },
) {
  return api.updateTeamMember(dossierId, entityId, data)
}

export async function deleteTeamMember(dossierId: string, entityId: string) {
  return api.deleteTeamMember(dossierId, entityId)
}

// ==================== CAPACITIES ====================

export async function getCapacities(dossierId: string, entityId?: string) {
  return api.getCapacities(dossierId, entityId)
}

export async function createCapacity(dossierId: string, data: {
  resourceType: 'room' | 'equipment' | 'staff_time' | 'other'
  name: string
  quantity: number
  unit?: string
  constraints?: string
  notes?: string
}) {
  return api.createCapacity(dossierId, data)
}

export async function updateCapacity(
  dossierId: string,
  entityId: string,
  data: {
    resourceType?: 'room' | 'equipment' | 'staff_time' | 'other'
    name?: string
    quantity?: number
    unit?: string
    constraints?: string
    notes?: string
    status?: string
  },
) {
  return api.updateCapacity(dossierId, entityId, data)
}

export async function deleteCapacity(dossierId: string, entityId: string) {
  return api.deleteCapacity(dossierId, entityId)
}

// ==================== SERVICE CATEGORIES ====================

export async function getServiceCategories(dossierId: string, entityId?: string) {
  return api.getServiceCategories(dossierId, entityId)
}

export async function createServiceCategory(dossierId: string, data: {
  name: string
  description?: string
  notes?: string
}) {
  return api.createServiceCategory(dossierId, data)
}

export async function updateServiceCategory(
  dossierId: string,
  entityId: string,
  data: {
    name?: string
    description?: string
    notes?: string
    status?: string
  },
) {
  return api.updateServiceCategory(dossierId, entityId, data)
}

export async function deleteServiceCategory(dossierId: string, entityId: string) {
  return api.deleteServiceCategory(dossierId, entityId)
}

// ==================== ROLES ====================

export async function getRoles(clinicId: string, entityId?: string) {
  return api.getRoles(clinicId, entityId)
}

export async function createRole(clinicId: string, data: {
  name: string
  description?: string
}) {
  return api.createRole(clinicId, data)
}

export async function updateRole(
  clinicId: string,
  entityId: string,
  data: {
    name?: string
    description?: string
  },
) {
  return api.updateRole(clinicId, entityId, data)
}

export async function deleteRole(clinicId: string, entityId: string) {
  return api.deleteRole(clinicId, entityId)
}


