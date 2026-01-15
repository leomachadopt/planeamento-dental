// Função para marcar relatórios como stale quando dados são alterados
import pool from './db'

/**
 * Marca relatórios de uma seção como stale
 */
export async function markSectionReportsAsStale(
  dossierId: string,
  sectionCode: string,
): Promise<void> {
  try {
    await pool.query(
      `UPDATE ai_reports 
       SET status = 'stale', updated_at = NOW()
       WHERE dossier_id = $1 AND section_code = $2 AND status = 'generated'`,
      [dossierId, sectionCode],
    )
  } catch (error) {
    console.error('Erro ao marcar relatórios como stale:', error)
    // Não lançar erro para não quebrar o fluxo principal
  }
}

/**
 * Determina a seção afetada por uma entidade
 */
export function getSectionForEntity(entityType: string): string | null {
  const entitySectionMap: Record<string, string> = {
    customer_segments: 'IDENTITY',
    value_propositions: 'IDENTITY',
    competitors: 'MARKET',
    service_categories: 'OFFER',
    services: 'OFFER',
    team_members: 'OPERATIONS',
    roles: 'OPERATIONS',
    capacities: 'OPERATIONS',
    strategic_choices: 'STRATEGY',
    initiatives: 'PLAN',
  }

  return entitySectionMap[entityType] || null
}

/**
 * Determina a seção afetada por uma pergunta (via question_set)
 */
export async function getSectionForQuestion(questionId: string): Promise<string | null> {
  try {
    const result = await pool.query(
      `SELECT s.code 
       FROM sections s
       JOIN question_sets qs ON qs.section_id = s.id
       JOIN questions q ON q.question_set_id = qs.id
       WHERE q.id = $1`,
      [questionId],
    )

    if (result.rows.length > 0) {
      return result.rows[0].code
    }
  } catch (error) {
    console.error('Erro ao buscar seção da pergunta:', error)
  }

  return null
}

/**
 * Marca o relatório final como stale quando qualquer seção fica stale
 */
export async function markFinalReportAsStale(dossierId: string): Promise<void> {
  try {
    await pool.query(
      `UPDATE ai_reports 
       SET status = 'stale', updated_at = NOW()
       WHERE dossier_id = $1 AND section_code = 'FINAL_REPORT' AND status = 'generated'`,
      [dossierId],
    )
  } catch (error) {
    console.error('Erro ao marcar relatório final como stale:', error)
    // Não lançar erro para não quebrar o fluxo principal
  }
}

