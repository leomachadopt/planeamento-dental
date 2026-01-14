// Cliente API para comunicação com o backend
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Função para obter token do store
function getAuthToken(): string | null {
  try {
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      const parsed = JSON.parse(authStorage)
      return parsed.state?.token || null
    }
  } catch (error) {
    console.error('Erro ao ler token:', error)
  }
  return null
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  // Garantir que endpoint começa com /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${API_BASE_URL}${normalizedEndpoint}`
  const token = getAuthToken()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    if (response.status === 401) {
      // Token inválido, limpar autenticação
      localStorage.removeItem('auth-storage')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      throw new Error('Sessão expirada. Faça login novamente.')
    }

    // Tentar parsear como JSON, mas tratar erros de parsing
    let errorMessage = `HTTP error! status: ${response.status}`
    try {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json()
        errorMessage = error.error || error.message || errorMessage
      } else {
        // Se não for JSON, tentar ler como texto
        const text = await response.text()
        // Se o texto parece ser código (contém "import" ou "export"), é um erro de roteamento
        if (text.includes('import') || text.includes('export')) {
          errorMessage = `Erro de roteamento: a API retornou código ao invés de JSON. Verifique se a rota ${endpoint} existe.`
        } else if (text.trim()) {
          errorMessage = text.substring(0, 200) // Limitar tamanho
        }
      }
    } catch (parseError) {
      // Se falhar ao parsear, usar mensagem padrão
      console.error('Erro ao parsear resposta de erro:', parseError)
    }
    
    throw new Error(errorMessage)
  }

  // Verificar se a resposta é JSON antes de fazer parse
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  } else {
    // Se não for JSON, tentar parsear mesmo assim (pode ser texto vazio)
    const text = await response.text()
    if (text.trim()) {
      // Se parece ser código, é um erro
      if (text.includes('import') || text.includes('export')) {
        throw new Error(`A API retornou código ao invés de JSON para ${endpoint}. Verifique a rota.`)
      }
      try {
        return JSON.parse(text)
      } catch {
        throw new Error(`Resposta inválida da API: esperado JSON, recebido ${contentType || 'texto'}`)
      }
    }
    return null
  }
}

export const api = {
  // Autenticação
  login: (email: string, password: string) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, name: string, clinicId?: string) =>
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, clinicId }),
    }),

  logout: () =>
    fetchAPI('/auth/logout', {
      method: 'POST',
    }),

  getMe: () => fetchAPI('/auth/me'),

  // Usuários (admin)
  getAllUsers: () => fetchAPI('/users'),
  
  getUser: (id: string) => fetchAPI(`/users/${id}`),
  
  createUser: (userData: {
    email: string
    password: string
    name: string
    role?: 'admin' | 'user'
    clinicId?: string
  }) =>
    fetchAPI('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  updateUser: (id: string, userData: {
    name?: string
    role?: 'admin' | 'user'
    clinicId?: string
    isActive?: boolean
    password?: string
  }) =>
    fetchAPI(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  deleteUser: (id: string) =>
    fetchAPI(`/users/${id}`, {
      method: 'DELETE',
    }),

  // Clínicas
  getAllClinics: () => fetchAPI('/clinics'),

  getClinic: (id: string) => fetchAPI(`/clinic/${id}`),

  createClinic: (clinicName: string) =>
    fetchAPI('/clinics', {
      method: 'POST',
      body: JSON.stringify({ clinicName }),
    }),

  saveClinicData: (id: string, data: any) =>
    fetchAPI(`/clinic/${id}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteClinic: (id: string) =>
    fetchAPI(`/clinic/${id}`, {
      method: 'DELETE',
    }),

  // Relatórios
  generateReport: (
    clinicId: string,
    reportType: 'diagnostic' | 'strategic' | 'advanced' | 'tactical' | 'operational' | 'final',
    state: any,
  ) =>
    fetchAPI('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ clinicId, reportType, state }),
    }),

  // Admin - Estatísticas
  getAdminStats: () => fetchAPI('/admin/stats'),

  // Admin - Relatórios
  getAllReports: () => fetchAPI('/admin/reports'),
  getReport: (id: string) => fetchAPI(`/admin/reports/${id}`),
  reprocessReport: (id: string) =>
    fetchAPI(`/admin/reports/${id}/reprocess`, {
      method: 'POST',
    }),
  downloadReport: (id: string) =>
    fetchAPI(`/admin/reports/${id}/download`),

  // Admin - Prompts
  getPrompts: () => fetchAPI('/admin/prompts'),
  getPrompt: (type: string) => fetchAPI(`/admin/prompts/${type}`),
  savePrompt: (type: string, systemPrompt: string, userPrompt: string) =>
    fetchAPI(`/admin/prompts/${type}`, {
      method: 'PUT',
      body: JSON.stringify({ system_prompt: systemPrompt, user_prompt: userPrompt }),
    }),

  // Admin - Configurações
  getSettings: () => fetchAPI('/admin/settings'),
  saveSettings: (settings: any) =>
    fetchAPI('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // Admin - Logs e Sessões
  getLogs: (limit?: number) =>
    fetchAPI(`/admin/logs${limit ? `?limit=${limit}` : ''}`),
  getSessions: () => fetchAPI('/admin/sessions'),
  revokeSession: (sessionId: string) =>
    fetchAPI(`/admin/sessions/${sessionId}`, {
      method: 'DELETE',
    }),

  // Admin - Reset de Senha
  resetUserPassword: (userId: string) =>
    fetchAPI(`/admin/users/${userId}/reset-password`, {
      method: 'POST',
    }),

  // Admin - Export/Import
  exportClinicData: (clinicId: string) =>
    fetchAPI(`/admin/clinics/${clinicId}/export`),
  importClinicData: (data: any) =>
    fetchAPI('/admin/clinics/import', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Dossiês
  getDossiers: (clinicId: string) =>
    fetchAPI(`/dossiers?clinicId=${clinicId}`),
  
  getDossier: (id: string) => fetchAPI(`/dossiers/${id}`),
  
  createDossier: (data: { clinicId: string; title: string; baselineDate?: string }) =>
    fetchAPI('/dossiers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateDossier: (id: string, data: { title?: string; status?: string; baselineDate?: string }) =>
    fetchAPI(`/dossiers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteDossier: (id: string) =>
    fetchAPI(`/dossiers/${id}`, {
      method: 'DELETE',
    }),

  // Seções do Dossiê
  getDossierSections: (dossierId: string) =>
    fetchAPI(`/dossiers/${dossierId}/sections`),
  
  getDossierSection: (dossierId: string, sectionCode: string) =>
    fetchAPI(`/dossiers/${dossierId}/sections?sectionCode=${sectionCode}`),

  // Respostas
  getDossierAnswers: (dossierId: string, sectionCode?: string) =>
    fetchAPI(`/dossiers/${dossierId}/answers${sectionCode ? `?sectionCode=${sectionCode}` : ''}`),
  
  saveDossierAnswers: (dossierId: string, answers: any[]) =>
    fetchAPI(`/dossiers/${dossierId}/answers`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),

  // Entidades
  getCustomerSegments: (dossierId: string, entityId?: string) =>
    fetchAPI(`/dossiers/${dossierId}/entities/customer-segments${entityId ? `?entityId=${entityId}` : ''}`),
  
  createCustomerSegment: (dossierId: string, data: any) =>
    fetchAPI(`/dossiers/${dossierId}/entities/customer-segments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateCustomerSegment: (dossierId: string, entityId: string, data: any) =>
    fetchAPI(`/dossiers/${dossierId}/entities/customer-segments?entityId=${entityId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteCustomerSegment: (dossierId: string, entityId: string) =>
    fetchAPI(`/dossiers/${dossierId}/entities/customer-segments?entityId=${entityId}`, {
      method: 'DELETE',
    }),

  getValuePropositions: (dossierId: string, entityId?: string) =>
    fetchAPI(`/dossiers/${dossierId}/entities/value-propositions${entityId ? `?entityId=${entityId}` : ''}`),
  
  createValueProposition: (dossierId: string, data: any) =>
    fetchAPI(`/dossiers/${dossierId}/entities/value-propositions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateValueProposition: (dossierId: string, entityId: string, data: any) =>
    fetchAPI(`/dossiers/${dossierId}/entities/value-propositions?entityId=${entityId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteValueProposition: (dossierId: string, entityId: string) =>
    fetchAPI(`/dossiers/${dossierId}/entities/value-propositions?entityId=${entityId}`, {
      method: 'DELETE',
    }),

  getServices: (dossierId: string, entityId?: string) =>
    fetchAPI(`/dossiers/${dossierId}/entities/services${entityId ? `?entityId=${entityId}` : ''}`),
  
  createService: (dossierId: string, data: any) =>
    fetchAPI(`/dossiers/${dossierId}/entities/services`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateService: (dossierId: string, entityId: string, data: any) =>
    fetchAPI(`/dossiers/${dossierId}/entities/services?entityId=${entityId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteService: (dossierId: string, entityId: string) =>
    fetchAPI(`/dossiers/${dossierId}/entities/services?entityId=${entityId}`, {
      method: 'DELETE',
    }),

  getCompetitors: (dossierId: string, entityId?: string) =>
    fetchAPI(`/dossiers/${dossierId}/entities/competitors${entityId ? `?entityId=${entityId}` : ''}`),
  
  createCompetitor: (dossierId: string, data: any) =>
    fetchAPI(`/dossiers/${dossierId}/entities/competitors`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateCompetitor: (dossierId: string, entityId: string, data: any) =>
    fetchAPI(`/dossiers/${dossierId}/entities/competitors?entityId=${entityId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteCompetitor: (dossierId: string, entityId: string) =>
    fetchAPI(`/dossiers/${dossierId}/entities/competitors?entityId=${entityId}`, {
      method: 'DELETE',
    }),

  getTeamMembers: (dossierId: string, entityId?: string) =>
    fetchAPI(`/dossiers/${dossierId}/entities/team-members${entityId ? `?entityId=${entityId}` : ''}`),
  
  createTeamMember: (dossierId: string, data: any) =>
    fetchAPI(`/dossiers/${dossierId}/entities/team-members`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateTeamMember: (dossierId: string, entityId: string, data: any) =>
    fetchAPI(`/dossiers/${dossierId}/entities/team-members?entityId=${entityId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteTeamMember: (dossierId: string, entityId: string) =>
    fetchAPI(`/dossiers/${dossierId}/entities/team-members?entityId=${entityId}`, {
      method: 'DELETE',
    }),

  getCapacities: (dossierId: string, entityId?: string) =>
    fetchAPI(`/dossiers/${dossierId}/entities/capacities${entityId ? `?entityId=${entityId}` : ''}`),
  
  createCapacity: (dossierId: string, data: any) =>
    fetchAPI(`/dossiers/${dossierId}/entities/capacities`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateCapacity: (dossierId: string, entityId: string, data: any) =>
    fetchAPI(`/dossiers/${dossierId}/entities/capacities?entityId=${entityId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteCapacity: (dossierId: string, entityId: string) =>
    fetchAPI(`/dossiers/${dossierId}/entities/capacities?entityId=${entityId}`, {
      method: 'DELETE',
    }),

  getStrategicChoices: (dossierId: string, entityId?: string) =>
    fetchAPI(`/dossiers/${dossierId}/entities/strategic-choices${entityId ? `?entityId=${entityId}` : ''}`),
  
  createStrategicChoice: (dossierId: string, data: any) =>
    fetchAPI(`/dossiers/${dossierId}/entities/strategic-choices`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateStrategicChoice: (dossierId: string, entityId: string, data: any) =>
    fetchAPI(`/dossiers/${dossierId}/entities/strategic-choices?entityId=${entityId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteStrategicChoice: (dossierId: string, entityId: string) =>
    fetchAPI(`/dossiers/${dossierId}/entities/strategic-choices?entityId=${entityId}`, {
      method: 'DELETE',
    }),

  getInitiatives: (dossierId: string, entityId?: string) =>
    fetchAPI(`/dossiers/${dossierId}/entities/initiatives${entityId ? `?entityId=${entityId}` : ''}`),
  
  createInitiative: (dossierId: string, data: any) =>
    fetchAPI(`/dossiers/${dossierId}/entities/initiatives`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateInitiative: (dossierId: string, entityId: string, data: any) =>
    fetchAPI(`/dossiers/${dossierId}/entities/initiatives?entityId=${entityId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteInitiative: (dossierId: string, entityId: string) =>
    fetchAPI(`/dossiers/${dossierId}/entities/initiatives?entityId=${entityId}`, {
      method: 'DELETE',
    }),

  // Service Categories
  getServiceCategories: (dossierId: string, entityId?: string) =>
    fetchAPI(`/dossiers/${dossierId}/entities/service-categories${entityId ? `?entityId=${entityId}` : ''}`),
  
  createServiceCategory: (dossierId: string, data: any) =>
    fetchAPI(`/dossiers/${dossierId}/entities/service-categories`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateServiceCategory: (dossierId: string, entityId: string, data: any) =>
    fetchAPI(`/dossiers/${dossierId}/entities/service-categories?entityId=${entityId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteServiceCategory: (dossierId: string, entityId: string) =>
    fetchAPI(`/dossiers/${dossierId}/entities/service-categories?entityId=${entityId}`, {
      method: 'DELETE',
    }),

  // Roles (clinic-level)
  getRoles: (clinicId: string, entityId?: string) =>
    fetchAPI(`/clinics/${clinicId}/roles${entityId ? `?entityId=${entityId}` : ''}`),
  
  createRole: (clinicId: string, data: any) =>
    fetchAPI(`/clinics/${clinicId}/roles`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateRole: (clinicId: string, entityId: string, data: any) =>
    fetchAPI(`/clinics/${clinicId}/roles?entityId=${entityId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteRole: (clinicId: string, entityId: string) =>
    fetchAPI(`/clinics/${clinicId}/roles?entityId=${entityId}`, {
      method: 'DELETE',
    }),

  // Relatórios por IA
  generateSectionReport: (dossierId: string, sectionCode: string) =>
    fetchAPI(`/dossiers/${dossierId}/sections/${sectionCode}/report`, {
      method: 'POST',
    }),
  
  getSectionReport: (dossierId: string, sectionCode: string) =>
    fetchAPI(`/dossiers/${dossierId}/sections/${sectionCode}/report`),
  
  getDossierReports: (dossierId: string) =>
    fetchAPI(`/dossiers/${dossierId}/reports`),

  // Relatório Final
  generateFinalReport: (dossierId: string) =>
    fetchAPI(`/dossiers/${dossierId}/final-report:generate`, {
      method: 'POST',
    }),
  
  getFinalReport: (dossierId: string) =>
    fetchAPI(`/dossiers/${dossierId}/final-report`),
  
  exportFinalReport: (dossierId: string, format: 'pdf' | 'docx' = 'pdf') =>
    fetchAPI(`/dossiers/${dossierId}/final-report/export?format=${format}`, {
      method: 'GET',
      responseType: 'blob',
    }),
}




