import { getSectionData, calculateSectionCompletion, type SectionData } from './dossierService'
import {
  getCustomerSegments,
  getValuePropositions,
  getServices,
  getCompetitors,
  getTeamMembers,
  getCapacities,
} from './entityService'
import { api } from '@/lib/api'

// Mapeamento de entidades por seção
const SECTION_ENTITIES_MAP: Record<string, string[]> = {
  IDENTITY: ['customer_segments', 'value_propositions'],
  MARKET: ['competitors'],
  OFFER: ['service_categories', 'services'],
  OPERATIONS: ['team_members', 'roles', 'capacities'],
  STRATEGY: ['strategic_choices'],
  PLAN: ['initiatives'],
  BUSINESS: [],
  FINAL_REPORT: [],
}

export interface SectionSnapshot {
  clinic: {
    id: string
    name: string
    location?: string
    type?: string
  }
  dossier: {
    id: string
    title: string
    baseline_date?: string
  }
  section: {
    code: string
    name: string
    description?: string
  }
  answers: Array<{
    question_code: string
    question_text: string
    value_normalized: any
    required: boolean
    raw_value?: any
  }>
  entities: Record<string, any[]>
  completeness: {
    percent: number
    missing_items: string[]
  }
  data_quality_flags: string[]
  generated_at: string
}

/**
 * Normaliza uma resposta baseada no tipo da pergunta
 */
function normalizeAnswer(question: any, answer: any): any {
  if (!answer) {
    return null
  }

  const questionType = question.type

  switch (questionType) {
    case 'multi_select':
    case 'json':
      // Se já é JSON, retornar como está
      if (answer.value_json) {
        return Array.isArray(answer.value_json) ? answer.value_json : [answer.value_json]
      }
      // Se está em value_text como JSON string, fazer parse
      if (answer.value_text) {
        try {
          const parsed = JSON.parse(answer.value_text)
          return Array.isArray(parsed) ? parsed : [parsed]
        } catch {
          return answer.value_text.split(',').map((s: string) => s.trim())
        }
      }
      return []

    case 'currency':
      const currencyValue = answer.value_number || parseFloat(answer.value_text || '0')
      return {
        value: currencyValue,
        currency: 'EUR', // Default, pode ser configurável
        formatted: new Intl.NumberFormat('pt-PT', {
          style: 'currency',
          currency: 'EUR',
        }).format(currencyValue),
        raw: answer.value_text || answer.value_number,
      }

    case 'number':
    case 'scale':
      return answer.value_number !== null && answer.value_number !== undefined
        ? answer.value_number
        : parseFloat(answer.value_text || '0')

    case 'date':
      return answer.value_text || null

    case 'text':
    case 'textarea':
    default:
      return answer.value_text || answer.value_number?.toString() || null
  }
}

/**
 * Detecta flags de qualidade de dados
 */
function detectDataQualityFlags(
  sectionCode: string,
  snapshot: Partial<SectionSnapshot>,
): string[] {
  const flags: string[] = []

  // Verificar respostas required vazias
  if (snapshot.answers) {
    const missingRequired = snapshot.answers.filter(
      (a) => a.required && (!a.value_normalized || a.value_normalized === ''),
    )
    if (missingRequired.length > 0) {
      flags.push(
        `Campos obrigatórios não preenchidos: ${missingRequired.map((a) => a.question_code).join(', ')}`,
      )
    }
  }

  // Verificações específicas por seção
  if (sectionCode === 'IDENTITY') {
    const entities = snapshot.entities || {}
    const segments = entities.customer_segments || []
    const propositions = entities.value_propositions || []

    if (segments.length === 0) {
      flags.push('Nenhum segmento de cliente cadastrado')
    }

    if (propositions.length === 0) {
      flags.push('Nenhuma proposta de valor cadastrada')
    }

    // Verificar se há propostas sem segmento alvo
    const propositionsWithoutSegment = propositions.filter(
      (p: any) => !p.target_segment_id && !p.target_segment_name,
    )
    if (propositionsWithoutSegment.length > 0) {
      flags.push(
        `${propositionsWithoutSegment.length} proposta(s) de valor sem segmento alvo definido`,
      )
    }
  }

  if (sectionCode === 'OFFER') {
    const entities = snapshot.entities || {}
    const services = entities.services || []

    // Verificar serviços com preço negativo ou zero
    const invalidPrices = services.filter(
      (s: any) => s.price !== null && s.price !== undefined && (s.price < 0 || s.price === 0),
    )
    if (invalidPrices.length > 0) {
      flags.push(`${invalidPrices.length} serviço(s) com preço inválido (zero ou negativo)`)
    }
  }

  if (sectionCode === 'OPERATIONS') {
    const entities = snapshot.entities || {}
    const teamMembers = entities.team_members || []
    const capacities = entities.capacities || []

    if (teamMembers.length === 0) {
      flags.push('Nenhum membro da equipe cadastrado')
    }

    if (capacities.length === 0) {
      flags.push('Nenhuma capacidade operacional cadastrada')
    }
  }

  return flags
}

/**
 * Busca entidades relevantes para uma seção
 */
async function fetchSectionEntities(
  dossierId: string,
  sectionCode: string,
): Promise<Record<string, any[]>> {
  const entityTypes = SECTION_ENTITIES_MAP[sectionCode] || []
  const entities: Record<string, any[]> = {}

  for (const entityType of entityTypes) {
    try {
      switch (entityType) {
        case 'customer_segments':
          entities.customer_segments = await getCustomerSegments(dossierId)
          break
        case 'value_propositions':
          entities.value_propositions = await getValuePropositions(dossierId)
          break
        case 'services':
          entities.services = await getServices(dossierId)
          break
        case 'competitors':
          entities.competitors = await getCompetitors(dossierId)
          break
        case 'team_members':
          entities.team_members = await getTeamMembers(dossierId)
          break
        case 'capacities':
          entities.capacities = await getCapacities(dossierId)
          break
        case 'strategic_choices':
          try {
            entities.strategic_choices = await api.getStrategicChoices(dossierId)
          } catch {
            entities.strategic_choices = []
          }
          break
        case 'initiatives':
          try {
            entities.initiatives = await api.getInitiatives(dossierId)
          } catch {
            entities.initiatives = []
          }
          break
        case 'service_categories':
          // Se existir API para service_categories
          entities.service_categories = await api.getServiceCategories(dossierId).catch(() => [])
          break
        case 'roles':
          // Se existir API para roles
          entities.roles = await api.getRoles(dossierId).catch(() => [])
          break
      }
    } catch (error) {
      console.warn(`Erro ao buscar entidade ${entityType}:`, error)
      entities[entityType] = []
    }
  }

  return entities
}

/**
 * Constrói um snapshot determinístico de uma seção do dossiê
 */
export async function buildSectionSnapshot(
  dossierId: string,
  sectionCode: string,
): Promise<SectionSnapshot> {
  // 1. Buscar dados básicos
  const sectionData = await getSectionData(dossierId, sectionCode)

  // Buscar dados da clínica e dossiê
  const dossier = await api.getDossier(dossierId)
  const clinics = await api.getAllClinics()
  const clinic = clinics.find((c: any) => c.id === dossier.clinic_id) || { id: dossier.clinic_id, clinic_name: 'Clínica' }

  // 2. Normalizar respostas
  const normalizedAnswers: SectionSnapshot['answers'] = []
  const missingItems: string[] = []

  sectionData.questionSets.forEach((questionSet) => {
    questionSet.questions.forEach((question) => {
      const answer = question.answer
      const normalized = normalizeAnswer(question, answer || {})

      normalizedAnswers.push({
        question_code: question.code,
        question_text: question.text,
        value_normalized: normalized,
        required: question.required,
        raw_value: answer
          ? {
              value_text: answer.value_text,
              value_number: answer.value_number,
              value_json: answer.value_json,
            }
          : undefined,
      })

      if (question.required && (!normalized || normalized === '' || normalized === null)) {
        missingItems.push(question.code)
      }
    })
  })

  // 3. Buscar entidades relevantes
  const entities = await fetchSectionEntities(dossierId, sectionCode)

  // 4. Calcular completude
  const completionPercent = await calculateSectionCompletion(dossierId, sectionCode)

  // 5. Detectar data quality flags
  const snapshot: Partial<SectionSnapshot> = {
    answers: normalizedAnswers,
    entities,
    completeness: {
      percent: completionPercent,
      missing_items: missingItems,
    },
  }

  const dataQualityFlags = detectDataQualityFlags(sectionCode, snapshot)

  // 6. Retornar snapshot completo
  return {
    clinic: {
      id: clinic.id,
      name: clinic.clinic_name,
      location: undefined, // Pode ser buscado de clinic_configs se necessário
      type: undefined, // Pode ser buscado de clinic_configs se necessário
    },
    dossier: {
      id: dossier.id,
      title: dossier.title,
      baseline_date: dossier.baseline_date || undefined,
    },
    section: {
      code: sectionData.section.code,
      name: sectionData.section.name,
      description: sectionData.section.description || undefined,
    },
    answers: normalizedAnswers,
    entities,
    completeness: {
      percent: completionPercent,
      missing_items: missingItems,
    },
    data_quality_flags: dataQualityFlags,
    generated_at: new Date().toISOString(),
  }
}

