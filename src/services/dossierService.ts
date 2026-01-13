import { api } from '@/lib/api'

export interface Dossier {
  id: string
  clinic_id: string
  title: string
  status: 'draft' | 'finalized' | 'archived'
  version_number: number
  baseline_date?: string
  created_at: string
  updated_at: string
}

export interface Section {
  id: string
  code: string
  name: string
  order_index: number
  description?: string
  status?: 'not_started' | 'in_progress' | 'complete'
  completion_percent?: number
  last_updated_at?: string
}

export interface Question {
  id: string
  code: string
  text: string
  help_text?: string
  type: 'text' | 'textarea' | 'number' | 'currency' | 'date' | 'single_select' | 'multi_select' | 'scale' | 'json'
  required: boolean
  order_index: number
  options?: Array<{ id: string; label: string; value: string; order_index: number }>
  answer?: {
    id: string
    value_text?: string
    value_number?: number
    value_json?: any
    source: string
  }
}

export interface QuestionSet {
  id: string
  name: string
  version: number
  subsection_code?: string
  subsection_name?: string
  questions: Question[]
}

export interface SectionData {
  section: Section
  status: {
    status: 'not_started' | 'in_progress' | 'complete'
    completion_percent: number
  }
  questionSets: QuestionSet[]
  entities?: {
    customerSegments?: any[]
    valuePropositions?: any[]
  }
}

export interface AnswerInput {
  questionId: string
  valueText?: string
  valueNumber?: number
  valueJson?: any
  source?: 'user' | 'ai' | 'import'
}

// ==================== DOSSIES ====================

export async function getDossiers(clinicId: string): Promise<Dossier[]> {
  return api.getDossiers(clinicId)
}

export async function getDossier(dossierId: string): Promise<Dossier> {
  return api.getDossier(dossierId)
}

export async function createDossier(
  clinicId: string,
  title: string,
  baselineDate?: string,
): Promise<Dossier> {
  return api.createDossier({ clinicId, title, baselineDate })
}

export async function updateDossier(
  dossierId: string,
  data: { title?: string; status?: string; baselineDate?: string },
): Promise<Dossier> {
  return api.updateDossier(dossierId, data)
}

export async function deleteDossier(dossierId: string): Promise<void> {
  return api.deleteDossier(dossierId)
}

// ==================== SECTIONS ====================

export async function getDossierSections(dossierId: string): Promise<Section[]> {
  return api.getDossierSections(dossierId)
}

export async function getSectionData(
  dossierId: string,
  sectionCode: string,
): Promise<SectionData> {
  return api.getDossierSection(dossierId, sectionCode)
}

// ==================== ANSWERS ====================

export async function getAnswers(
  dossierId: string,
  sectionCode?: string,
): Promise<any[]> {
  return api.getDossierAnswers(dossierId, sectionCode)
}

export async function saveAnswers(
  dossierId: string,
  answers: AnswerInput[],
): Promise<{ saved: number; answers: any[] }> {
  return api.saveDossierAnswers(dossierId, answers)
}

// ==================== COMPLETION CALCULATION ====================

export async function calculateSectionCompletion(
  dossierId: string,
  sectionCode: string,
): Promise<number> {
  try {
    const sectionData = await getSectionData(dossierId, sectionCode)
    
    // Coletar todas as perguntas required
    const requiredQuestions: Question[] = []
    sectionData.questionSets.forEach((qs) => {
      qs.questions.forEach((q) => {
        if (q.required) {
          requiredQuestions.push(q)
        }
      })
    })

    if (requiredQuestions.length === 0) {
      return 100 // Se não há perguntas required, considera completo
    }

    // Contar quantas têm respostas
    let answeredCount = 0
    requiredQuestions.forEach((q) => {
      if (q.answer) {
        const hasValue =
          q.answer.value_text !== null && q.answer.value_text !== undefined && q.answer.value_text !== '' ||
          q.answer.value_number !== null && q.answer.value_number !== undefined ||
          q.answer.value_json !== null && q.answer.value_json !== undefined

        if (hasValue) {
          answeredCount++
        }
      }
    })

    // Calcular % baseado em perguntas respondidas
    let completionPercent = Math.round((answeredCount / requiredQuestions.length) * 100)

    // Bônus: se seção é IDENTITY, verificar se há pelo menos 1 entidade de cada tipo
    if (sectionCode === 'IDENTITY') {
      const hasSegments = sectionData.entities?.customerSegments && sectionData.entities.customerSegments.length > 0
      const hasPropositions = sectionData.entities?.valuePropositions && sectionData.entities.valuePropositions.length > 0

      // Se tem pelo menos 1 segmento e 1 proposta, adiciona 10% de bônus (máximo 100%)
      if (hasSegments && hasPropositions) {
        completionPercent = Math.min(100, completionPercent + 10)
      } else if (hasSegments || hasPropositions) {
        completionPercent = Math.min(100, completionPercent + 5)
      }
    }

    // Atualizar status da seção (isso seria feito no backend, mas por enquanto retornamos o valor)
    return completionPercent
  } catch (error) {
    console.error('Erro ao calcular completude:', error)
    return 0
  }
}

