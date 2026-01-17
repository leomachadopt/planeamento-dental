// Versão server-side do snapshot builder
import pool from './db'

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

const SECTION_ENTITIES_MAP: Record<string, string[]> = {
  IDENTITY: ['customer_segments', 'value_propositions'],
  MARKET: ['competitors'],
  OFFER: ['service_categories', 'services'],
  OPERATIONS: ['team_members', 'roles', 'capacities'],
  STRATEGY: ['strategic_choices'],
  PLAN: ['initiatives'],
  BUSINESS_MODEL: [],
  FINAL_REPORT: [],
}

function normalizeAnswer(question: any, answer: any): any {
  if (!answer) return null

  switch (question.type) {
    case 'multi_select':
    case 'json':
      if (answer.value_json) {
        return Array.isArray(answer.value_json) ? answer.value_json : [answer.value_json]
      }
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
        currency: 'EUR',
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

    default:
      return answer.value_text || answer.value_number?.toString() || null
  }
}

function detectDataQualityFlags(
  sectionCode: string,
  snapshot: Partial<SectionSnapshot>,
): string[] {
  const flags: string[] = []

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

  if (sectionCode === 'IDENTITY') {
    const entities = snapshot.entities || {}
    const segments = entities.customer_segments || []
    const propositions = entities.value_propositions || []

    if (segments.length === 0) flags.push('Nenhum segmento de cliente cadastrado')
    if (propositions.length === 0) flags.push('Nenhuma proposta de valor cadastrada')

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

    if (teamMembers.length === 0) flags.push('Nenhum membro da equipe cadastrado')
    if (capacities.length === 0) flags.push('Nenhuma capacidade operacional cadastrada')
  }

  return flags
}

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
          const segResult = await pool.query(
            'SELECT * FROM customer_segments WHERE dossier_id = $1 ORDER BY priority, created_at',
            [dossierId],
          )
          entities.customer_segments = segResult.rows
          break
        case 'value_propositions':
          const propResult = await pool.query(
            `SELECT vp.*, cs.name as target_segment_name
             FROM value_propositions vp
             LEFT JOIN customer_segments cs ON cs.id = vp.target_segment_id
             WHERE vp.dossier_id = $1 ORDER BY vp.created_at`,
            [dossierId],
          )
          entities.value_propositions = propResult.rows
          break
        case 'services':
          const servResult = await pool.query(
            `SELECT s.*, sc.name as category_name
             FROM services s
             LEFT JOIN service_categories sc ON sc.id = s.service_category_id
             WHERE s.dossier_id = $1 ORDER BY s.is_flagship DESC, s.created_at`,
            [dossierId],
          )
          entities.services = servResult.rows
          break
        case 'competitors':
          const compResult = await pool.query(
            'SELECT * FROM competitors WHERE dossier_id = $1 ORDER BY type, created_at',
            [dossierId],
          )
          entities.competitors = compResult.rows
          break
        case 'team_members':
          const teamResult = await pool.query(
            `SELECT tm.*, r.name as role_name
             FROM team_members tm
             LEFT JOIN roles r ON r.id = tm.role_id
             WHERE tm.dossier_id = $1 ORDER BY tm.created_at`,
            [dossierId],
          )
          entities.team_members = teamResult.rows
          break
        case 'capacities':
          const capResult = await pool.query(
            'SELECT * FROM capacities WHERE dossier_id = $1 ORDER BY resource_type, created_at',
            [dossierId],
          )
          entities.capacities = capResult.rows
          break
        case 'strategic_choices':
          const stratResult = await pool.query(
            'SELECT * FROM strategic_choices WHERE dossier_id = $1 ORDER BY priority, created_at',
            [dossierId],
          )
          entities.strategic_choices = stratResult.rows
          break
        case 'initiatives':
          const initResult = await pool.query(
            'SELECT * FROM initiatives WHERE dossier_id = $1 ORDER BY created_at',
            [dossierId],
          )
          entities.initiatives = initResult.rows
          break
      }
    } catch (error) {
      console.warn(`Erro ao buscar entidade ${entityType}:`, error)
      entities[entityType] = []
    }
  }

  return entities
}

async function calculateSectionCompletion(
  dossierId: string,
  sectionId: string,
): Promise<number> {
  const requiredQuestionsResult = await pool.query(
    `SELECT COUNT(*) as total FROM questions q
     JOIN question_sets qs ON qs.id = q.question_set_id
     WHERE qs.section_id = $1 AND q.required = true`,
    [sectionId],
  )

  const answeredResult = await pool.query(
    `SELECT COUNT(*) as total FROM answers a
     JOIN questions q ON q.id = a.question_id
     JOIN question_sets qs ON qs.id = q.question_set_id
     WHERE qs.section_id = $1 AND a.dossier_id = $2 
     AND (a.value_text IS NOT NULL AND a.value_text != '' 
          OR a.value_number IS NOT NULL 
          OR a.value_json IS NOT NULL)`,
    [sectionId, dossierId],
  )

  const totalRequired = parseInt(requiredQuestionsResult.rows[0].total)
  const totalAnswered = parseInt(answeredResult.rows[0].total)

  if (totalRequired === 0) return 100

  let completionPercent = Math.round((totalAnswered / totalRequired) * 100)

  // Bônus para IDENTITY se tiver entidades
  const sectionResult = await pool.query('SELECT code FROM sections WHERE id = $1', [sectionId])
  if (sectionResult.rows[0]?.code === 'IDENTITY') {
    const segmentsResult = await pool.query(
      'SELECT COUNT(*) as count FROM customer_segments WHERE dossier_id = $1',
      [dossierId],
    )
    const propositionsResult = await pool.query(
      'SELECT COUNT(*) as count FROM value_propositions WHERE dossier_id = $1',
      [dossierId],
    )

    const hasSegments = parseInt(segmentsResult.rows[0].count) > 0
    const hasPropositions = parseInt(propositionsResult.rows[0].count) > 0

    if (hasSegments && hasPropositions) {
      completionPercent = Math.min(100, completionPercent + 10)
    } else if (hasSegments || hasPropositions) {
      completionPercent = Math.min(100, completionPercent + 5)
    }
  }

  return completionPercent
}

export async function buildSectionSnapshot(
  dossierId: string,
  sectionCode: string,
): Promise<SectionSnapshot> {
  // Buscar dados básicos
  const dossierResult = await pool.query('SELECT * FROM dossiers WHERE id = $1', [dossierId])
  if (dossierResult.rows.length === 0) {
    throw new Error('Dossiê não encontrado')
  }
  const dossier = dossierResult.rows[0]

  const clinicResult = await pool.query('SELECT * FROM clinics WHERE id = $1', [dossier.clinic_id])
  if (clinicResult.rows.length === 0) {
    throw new Error('Clínica não encontrada')
  }
  const clinic = clinicResult.rows[0]

  const sectionResult = await pool.query('SELECT * FROM sections WHERE code = $1', [sectionCode])
  if (sectionResult.rows.length === 0) {
    throw new Error('Seção não encontrada')
  }
  const section = sectionResult.rows[0]

  // Buscar question_sets e perguntas
  const questionSetsResult = await pool.query(
    `SELECT qs.* FROM question_sets qs
     WHERE qs.section_id = $1 AND qs.is_active = true
     ORDER BY qs.version DESC`,
    [section.id],
  )

  const normalizedAnswers: SectionSnapshot['answers'] = []
  const missingItems: string[] = []

  for (const qs of questionSetsResult.rows) {
    const questionsResult = await pool.query(
      `SELECT q.*, 
       json_agg(
         json_build_object('id', qo.id, 'label', qo.label, 'value', qo.value, 'order_index', qo.order_index)
         ORDER BY qo.order_index
       ) FILTER (WHERE qo.id IS NOT NULL) as options
       FROM questions q
       LEFT JOIN question_options qo ON qo.question_id = q.id
       WHERE q.question_set_id = $1
       GROUP BY q.id
       ORDER BY q.order_index`,
      [qs.id],
    )

    const questionIds = questionsResult.rows.map((q: any) => q.id)
    let answers: any[] = []

    if (questionIds.length > 0) {
      const answersResult = await pool.query(
        `SELECT * FROM answers WHERE dossier_id = $1 AND question_id = ANY($2::uuid[])`,
        [dossierId, questionIds],
      )
      answers = answersResult.rows
    }

    const answersMap = new Map(answers.map((a) => [a.question_id, a]))

    for (const question of questionsResult.rows) {
      const answer = answersMap.get(question.id)
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
    }
  }

  // Buscar entidades
  const entities = await fetchSectionEntities(dossierId, sectionCode)

  // Calcular completude
  const completionPercent = await calculateSectionCompletion(dossierId, section.id)

  // Detectar flags
  const snapshot: Partial<SectionSnapshot> = {
    answers: normalizedAnswers,
    entities,
    completeness: {
      percent: completionPercent,
      missing_items: missingItems,
    },
  }

  const dataQualityFlags = detectDataQualityFlags(sectionCode, snapshot)

  return {
    clinic: {
      id: clinic.id,
      name: clinic.clinic_name,
    },
    dossier: {
      id: dossier.id,
      title: dossier.title,
      baseline_date: dossier.baseline_date || undefined,
    },
    section: {
      code: section.code,
      name: section.name,
      description: section.description || undefined,
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




