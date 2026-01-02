// Cliente API para comunicação com o backend
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
    throw new Error(error.error || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export const api = {
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
}

