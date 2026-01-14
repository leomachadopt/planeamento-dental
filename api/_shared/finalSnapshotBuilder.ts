// Builder de snapshot global para Relatório Final
// Consolida todos os relatórios de seções e calcula métricas globais
import pool from './db.js'

export interface FinalSnapshot {
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
  sections: Array<{
    section_code: string
    section_name: string
    report_markdown?: string
    insights?: any
    scores?: {
      clarity: number
      consistency: number
      completeness: number
      impact_potential: number
    }
    alerts?: Array<{
      severity: 'high' | 'medium' | 'low'
      title: string
      detail: string
      evidence: string[]
    }>
    recommendations?: Array<{
      priority: number
      title: string
      detail: string
      effort: 'low' | 'medium' | 'high'
      expected_impact: 'low' | 'medium' | 'high'
    }>
    missing_data?: Array<{
      item: string
      why_it_matters: string
      how_to_fill: string
    }>
    is_stale: boolean
    has_report: boolean
  }>
  global_metrics: {
    average_scores: {
      clarity: number
      consistency: number
      completeness: number
      impact_potential: number
    }
    high_severity_alerts: number
    medium_severity_alerts: number
    low_severity_alerts: number
    total_recommendations: number
    top_recommendations: Array<{
      title: string
      priority: number
      frequency: number
    }>
  }
  missing_sections: string[]
  stale_sections: string[]
  generated_at: string
}

/**
 * Constrói snapshot global consolidando todos os relatórios de seções
 */
export async function buildFinalSnapshot(dossierId: string): Promise<FinalSnapshot> {
  // 1. Buscar dados básicos
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

  // 2. Buscar todas as seções (exceto FINAL_REPORT)
  const sectionsResult = await pool.query(
    `SELECT * FROM sections WHERE code != 'FINAL_REPORT' ORDER BY order_index`,
  )

  // 3. Buscar último relatório de cada seção
  const sectionsData: FinalSnapshot['sections'] = []
  const missingSections: string[] = []
  const staleSections: string[] = []

  let totalClarity = 0
  let totalConsistency = 0
  let totalCompleteness = 0
  let totalImpactPotential = 0
  let sectionsWithScores = 0

  let highSeverityAlerts = 0
  let mediumSeverityAlerts = 0
  let lowSeverityAlerts = 0
  const allRecommendations: Array<{ title: string; priority: number }> = []

  for (const section of sectionsResult.rows) {
    // Buscar último relatório da seção (generated ou stale)
    const reportResult = await pool.query(
      `SELECT * FROM ai_reports 
       WHERE dossier_id = $1 AND section_code = $2 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [dossierId, section.code],
    )

    const hasReport = reportResult.rows.length > 0
    const report = hasReport ? reportResult.rows[0] : null
    const isStale = report?.status === 'stale'

    if (isStale) {
      staleSections.push(section.code)
    }

    if (!hasReport) {
      missingSections.push(section.code)
    }

    let insights: any = null
    let scores: any = null
    let alerts: any[] = []
    let recommendations: any[] = []
    let missingData: any[] = []

    if (report) {
      try {
        insights = typeof report.insights_json === 'string'
          ? JSON.parse(report.insights_json)
          : report.insights_json

        scores = insights?.score || {}
        alerts = insights?.alerts || []
        recommendations = insights?.recommendations || []
        missingData = insights?.missing_data || []

        // Acumular scores para média
        if (scores.clarity !== undefined) {
          totalClarity += scores.clarity
          totalConsistency += scores.consistency || 0
          totalCompleteness += scores.completeness || 0
          totalImpactPotential += scores.impact_potential || 0
          sectionsWithScores++
        }

        // Contar alertas por severidade
        alerts.forEach((alert: any) => {
          if (alert.severity === 'high') highSeverityAlerts++
          else if (alert.severity === 'medium') mediumSeverityAlerts++
          else if (alert.severity === 'low') lowSeverityAlerts++
        })

        // Acumular recomendações
        recommendations.forEach((rec: any) => {
          allRecommendations.push({
            title: rec.title || '',
            priority: rec.priority || 0,
          })
        })
      } catch (error) {
        console.warn(`Erro ao parsear insights da seção ${section.code}:`, error)
      }
    }

    sectionsData.push({
      section_code: section.code,
      section_name: section.name,
      report_markdown: report?.report_markdown || undefined,
      insights: insights || undefined,
      scores: scores || undefined,
      alerts: alerts.length > 0 ? alerts : undefined,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      missing_data: missingData.length > 0 ? missingData : undefined,
      is_stale: isStale,
      has_report: hasReport,
    })
  }

  // 4. Calcular métricas globais
  const averageScores = {
    clarity: sectionsWithScores > 0 ? totalClarity / sectionsWithScores : 0,
    consistency: sectionsWithScores > 0 ? totalConsistency / sectionsWithScores : 0,
    completeness: sectionsWithScores > 0 ? totalCompleteness / sectionsWithScores : 0,
    impact_potential: sectionsWithScores > 0 ? totalImpactPotential / sectionsWithScores : 0,
  }

  // Agrupar recomendações similares (por título)
  const recommendationsMap = new Map<string, { title: string; priority: number; frequency: number }>()
  allRecommendations.forEach((rec) => {
    const key = rec.title.toLowerCase().trim()
    const existing = recommendationsMap.get(key)
    if (existing) {
      existing.frequency++
      existing.priority = Math.max(existing.priority, rec.priority)
    } else {
      recommendationsMap.set(key, {
        title: rec.title,
        priority: rec.priority,
        frequency: 1,
      })
    }
  })

  const topRecommendations = Array.from(recommendationsMap.values())
    .sort((a, b) => {
      // Ordenar por prioridade primeiro, depois por frequência
      if (b.priority !== a.priority) return b.priority - a.priority
      return b.frequency - a.frequency
    })
    .slice(0, 10)

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
    sections: sectionsData,
    global_metrics: {
      average_scores: averageScores,
      high_severity_alerts: highSeverityAlerts,
      medium_severity_alerts: mediumSeverityAlerts,
      low_severity_alerts: lowSeverityAlerts,
      total_recommendations: allRecommendations.length,
      top_recommendations: topRecommendations,
    },
    missing_sections: missingSections,
    stale_sections: staleSections,
    generated_at: new Date().toISOString(),
  }
}



