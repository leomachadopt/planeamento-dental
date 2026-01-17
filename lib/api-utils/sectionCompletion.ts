import pool from './db'

/**
 * Calcula e persiste o completion_percent e status de uma seção do dossiê
 */
export async function updateSectionCompletion(
  dossierId: string,
  sectionCode: string,
): Promise<void> {
  // 1. Buscar section_id pelo code
  const sectionResult = await pool.query(
    'SELECT id FROM sections WHERE code = $1',
    [sectionCode],
  )

  if (sectionResult.rows.length === 0) {
    console.warn(`Seção ${sectionCode} não encontrada`)
    return
  }

  const sectionId = sectionResult.rows[0].id

  // 2. Calcular completion_percent base (required questions respondidas / total required)
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

  // Se não há perguntas required, considera 100% se não há perguntas, ou 0% se há mas nenhuma respondida
  let completionPercent = 0
  if (totalRequired === 0) {
    // Verificar se há perguntas não-required respondidas
    const allQuestionsResult = await pool.query(
      `SELECT COUNT(*) as total FROM questions q
       JOIN question_sets qs ON qs.id = q.question_set_id
       WHERE qs.section_id = $1`,
      [sectionId],
    )
    const totalQuestions = parseInt(allQuestionsResult.rows[0].total)
    completionPercent = totalQuestions === 0 ? 100 : 0
  } else {
    completionPercent = Math.round((totalAnswered / totalRequired) * 100)
  }

  // 3. Aplicar bônus por entidades mínimas
  if (sectionCode === 'IDENTITY') {
    const segmentsResult = await pool.query(
      'SELECT COUNT(*) as count FROM customer_segments WHERE dossier_id = $1 AND status = $2',
      [dossierId, 'active'],
    )
    const propositionsResult = await pool.query(
      'SELECT COUNT(*) as count FROM value_propositions WHERE dossier_id = $1 AND status = $2',
      [dossierId, 'active'],
    )

    const hasSegments = parseInt(segmentsResult.rows[0].count) >= 1
    const hasPropositions = parseInt(propositionsResult.rows[0].count) >= 1

    if (hasSegments && hasPropositions) {
      completionPercent = Math.min(100, completionPercent + 10)
    } else if (hasSegments || hasPropositions) {
      completionPercent = Math.min(100, completionPercent + 5)
    }
  } else if (sectionCode === 'MARKET') {
    const competitorsResult = await pool.query(
      'SELECT COUNT(*) as count FROM competitors WHERE dossier_id = $1 AND status = $2',
      [dossierId, 'active'],
    )
    const hasCompetitors = parseInt(competitorsResult.rows[0].count) >= 1
    if (hasCompetitors) {
      completionPercent = Math.min(100, completionPercent + 10)
    }
  } else if (sectionCode === 'OFFER') {
    const servicesResult = await pool.query(
      'SELECT COUNT(*) as count FROM services WHERE dossier_id = $1 AND status = $2',
      [dossierId, 'active'],
    )
    const hasServices = parseInt(servicesResult.rows[0].count) >= 1
    if (hasServices) {
      completionPercent = Math.min(100, completionPercent + 10)
    }
  } else if (sectionCode === 'OPERATIONS') {
    const teamMembersResult = await pool.query(
      'SELECT COUNT(*) as count FROM team_members WHERE dossier_id = $1 AND status = $2',
      [dossierId, 'active'],
    )
    const capacitiesResult = await pool.query(
      'SELECT COUNT(*) as count FROM capacities WHERE dossier_id = $1 AND status = $2',
      [dossierId, 'active'],
    )
    const hasTeamMembers = parseInt(teamMembersResult.rows[0].count) >= 1
    const hasCapacities = parseInt(capacitiesResult.rows[0].count) >= 1
    if (hasTeamMembers || hasCapacities) {
      completionPercent = Math.min(100, completionPercent + 10)
    }
  } else if (sectionCode === 'STRATEGY') {
    const strategicChoicesResult = await pool.query(
      'SELECT COUNT(*) as count FROM strategic_choices WHERE dossier_id = $1 AND status = $2',
      [dossierId, 'active'],
    )
    const hasStrategicChoices = parseInt(strategicChoicesResult.rows[0].count) >= 1
    if (hasStrategicChoices) {
      completionPercent = Math.min(100, completionPercent + 10)
    }
  } else if (sectionCode === 'PLAN') {
    const initiativesResult = await pool.query(
      'SELECT COUNT(*) as count FROM initiatives WHERE dossier_id = $1 AND status = $2',
      [dossierId, 'active'],
    )
    const hasInitiatives = parseInt(initiativesResult.rows[0].count) >= 1
    if (hasInitiatives) {
      completionPercent = Math.min(100, completionPercent + 10)
    }
  }

  // 4. Determinar status baseado no completion_percent
  let status: 'not_started' | 'in_progress' | 'complete'
  if (completionPercent === 0) {
    status = 'not_started'
  } else if (completionPercent === 100) {
    status = 'complete'
  } else {
    status = 'in_progress'
  }

  // 5. Persistir no banco
  await pool.query(
    `INSERT INTO dossier_sections_status (dossier_id, section_id, completion_percent, status, last_updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (dossier_id, section_id)
     DO UPDATE SET 
       completion_percent = EXCLUDED.completion_percent,
       status = EXCLUDED.status,
       last_updated_at = NOW()`,
    [dossierId, sectionId, completionPercent, status],
  )
}



