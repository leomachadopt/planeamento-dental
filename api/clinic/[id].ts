import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateToken, AuthRequest } from '../_shared/auth.js'
import pool from '../_shared/db.js'

// Importar funções do clinicService
// Como estamos no servidor, podemos usar diretamente
// Mas precisamos recriar aqui porque o caminho é diferente

async function loadAllClinicData(clinicId: string) {
  // Implementação simplificada - você pode mover para um módulo compartilhado
  const [config, porter, rumelt, operational, market, managerVision, identity, blueOcean, jtbd, okrs, actions, report1, report2, report3, report4, report5, reportFinal] = await Promise.all([
    getConfigInicial(clinicId),
    getPorterAnalysis(clinicId),
    getRumeltDiagnosis(clinicId),
    getOperationalAssessment(clinicId),
    getMarketAssessment(clinicId),
    getManagerVision(clinicId),
    getIdentity(clinicId),
    getBlueOcean(clinicId),
    getJTBD(clinicId),
    getOKRs(clinicId),
    getActions(clinicId),
    getReport(clinicId, 'diagnostic'),
    getReport(clinicId, 'strategic'),
    getReport(clinicId, 'advanced'),
    getReport(clinicId, 'tactical'),
    getReport(clinicId, 'operational'),
    getReport(clinicId, 'final'),
  ])

  return {
    config_inicial: config,
    diagnosis: {
      porter: porter || { rivalry: '', newEntrants: '', substitutes: '', buyers: '', suppliers: '' },
      rumelt: rumelt || { challenge: '', obstacles: '', policy: '' },
    },
    operationalAssessment: operational,
    marketAssessment: market,
    managerVision: managerVision,
    identity: identity,
    blueOcean: blueOcean || { eliminate: [], reduce: [], raise: [], create: [] },
    jtbd: jtbd || [],
    okrs: okrs || [],
    actions: actions || [],
    relatorio_1: report1,
    relatorio_2: report2,
    relatorio_3: report3,
    relatorio_4: report4,
    relatorio_5: report5,
    relatorio_final: reportFinal,
  }
}

// Funções auxiliares (implementação simplificada)
async function getConfigInicial(clinicId: string) {
  const result = await pool.query('SELECT * FROM clinic_configs WHERE clinic_id = $1', [clinicId])
  if (!result.rows[0]) return null
  const row = result.rows[0]
  return {
    tipo_clinica: row.tipo_clinica || '',
    nome_clinica: row.nome_clinica || '',
    localizacao: row.localizacao || '',
    publico_principal: row.publico_principal || '',
    estagio_clinica: row.estagio_clinica || '',
    gestores_principais: row.gestores_principais || '',
    objetivo_geral_2026: row.objetivo_geral_2026 || '',
    tamanho_relatorio: row.tamanho_relatorio || '',
    tom_linguagem: row.tom_linguagem || '',
  }
}

async function getPorterAnalysis(clinicId: string) {
  const result = await pool.query('SELECT * FROM porter_analysis WHERE clinic_id = $1', [clinicId])
  if (!result.rows[0]) return null
  const row = result.rows[0]
  return {
    rivalry: row.rivalry || '',
    newEntrants: row.new_entrants || '',
    substitutes: row.substitutes || '',
    buyers: row.buyers || '',
    suppliers: row.suppliers || '',
  }
}

async function getRumeltDiagnosis(clinicId: string) {
  const result = await pool.query('SELECT * FROM rumelt_diagnosis WHERE clinic_id = $1', [clinicId])
  if (!result.rows[0]) return null
  const row = result.rows[0]
  return {
    challenge: row.challenge || '',
    obstacles: row.obstacles || '',
    policy: row.policy || '',
  }
}

async function getOperationalAssessment(clinicId: string) {
  const result = await pool.query('SELECT * FROM operational_assessments WHERE clinic_id = $1', [clinicId])
  if (!result.rows[0]) return null
  const row = result.rows[0]
  return {
    services: row.services || '',
    infrastructure: row.infrastructure || '',
    team_composition: row.team_composition || '',
    working_hours: row.working_hours || '',
    patient_management: row.patient_management || '',
    financial_management: row.financial_management || '',
    processes_well_defined: row.processes_well_defined || '',
    processes_disorganized: row.processes_disorganized || '',
  }
}

async function getMarketAssessment(clinicId: string) {
  const result = await pool.query('SELECT * FROM market_assessments WHERE clinic_id = $1', [clinicId])
  if (!result.rows[0]) return null
  const row = result.rows[0]
  return {
    marketDescription: row.market_description || '',
    competitors: row.competitors || '',
    clinicStrengths: row.clinic_strengths || '',
    competitorStrengths: row.competitor_strengths || '',
    acquisitionChannels: row.acquisition_channels || '',
    patientComplaints: row.patient_complaints || '',
    patientCompliments: row.patient_compliments || '',
    patientLoss: row.patient_loss || '',
  }
}

async function getManagerVision(clinicId: string) {
  const visionResult = await pool.query('SELECT * FROM manager_visions WHERE clinic_id = $1', [clinicId])
  if (!visionResult.rows[0]) return null
  
  const problemsResult = await pool.query('SELECT problem FROM manager_problems WHERE clinic_id = $1 ORDER BY position', [clinicId])
  const opportunitiesResult = await pool.query('SELECT opportunity FROM manager_opportunities WHERE clinic_id = $1 ORDER BY position', [clinicId])
  
  const row = visionResult.rows[0]
  return {
    problems: problemsResult.rows.map((r) => r.problem),
    opportunities: opportunitiesResult.rows.map((r) => r.opportunity),
    vision2026: row.vision_2026 || '',
    goals: {
      revenue: row.revenue_goal || '',
      occupancy: row.occupancy_goal || '',
      nps: row.nps_goal || '',
      other: row.other_goal || '',
    },
    ratings: {
      processes: { score: row.processes_score || 5, justification: row.processes_justification || '' },
      financial: { score: row.financial_score || 5, justification: row.financial_justification || '' },
      satisfaction: { score: row.satisfaction_score || 5, justification: row.satisfaction_justification || '' },
    },
  }
}

async function getIdentity(clinicId: string) {
  const result = await pool.query('SELECT * FROM identities WHERE clinic_id = $1', [clinicId])
  if (!result.rows[0]) return null
  const row = result.rows[0]
  return {
    reason: row.reason || '',
    recognitionGoal: row.recognition_goal || '',
    values: row.values || '',
    priorityAudience: row.priority_audience || '',
    pricePositioning: row.price_positioning || '',
    strategyFocus: row.strategy_focus || '',
    strategyFocusComplement: row.strategy_focus_complement || '',
  }
}

async function getBlueOcean(clinicId: string) {
  const result = await pool.query('SELECT category, item FROM blue_ocean_items WHERE clinic_id = $1 ORDER BY category, position', [clinicId])
  const blueOcean = { eliminate: [] as string[], reduce: [] as string[], raise: [] as string[], create: [] as string[] }
  for (const row of result.rows) {
    blueOcean[row.category as keyof typeof blueOcean].push(row.item)
  }
  return blueOcean
}

async function getJTBD(clinicId: string) {
  const result = await pool.query('SELECT job, type, solution FROM jtbd_items WHERE clinic_id = $1', [clinicId])
  return result.rows.map((row, index) => ({
    id: String(index + 1),
    job: row.job,
    type: row.type,
    solution: row.solution,
  }))
}

async function getOKRs(clinicId: string) {
  const okrsResult = await pool.query('SELECT * FROM okrs WHERE clinic_id = $1', [clinicId])
  const okrs = []
  for (const okrRow of okrsResult.rows) {
    const krsResult = await pool.query('SELECT * FROM key_results WHERE okr_id = $1', [okrRow.id])
    okrs.push({
      id: okrRow.id,
      objective: okrRow.objective,
      perspective: okrRow.perspective,
      progress: okrRow.progress,
      keyResults: krsResult.rows.map((kr) => ({
        id: kr.id,
        title: kr.title,
        target: Number(kr.target),
        current: Number(kr.current),
        unit: kr.unit,
      })),
    })
  }
  return okrs
}

async function getActions(clinicId: string) {
  const result = await pool.query('SELECT * FROM actions WHERE clinic_id = $1 ORDER BY created_at', [clinicId])
  return result.rows.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    owner: row.owner || '',
    deadline: row.deadline ? new Date(row.deadline).toISOString().split('T')[0] : '',
    okrId: row.okr_id || undefined,
  }))
}

async function getReport(clinicId: string, reportType: string) {
  const result = await pool.query('SELECT report_data FROM reports WHERE clinic_id = $1 AND report_type = $2', [clinicId, reportType])
  if (!result.rows[0]) return null
  return result.rows[0].report_data
}

async function saveAllClinicData(clinicId: string, state: any) {
  // Salvar todos os dados da clínica
  // Implementação usando as funções auxiliares definidas acima
  
  const promises: Promise<any>[] = []
  
  if (state.config_inicial) {
    promises.push(saveConfigInicial(clinicId, state.config_inicial))
  }
  if (state.diagnosis?.porter) {
    promises.push(savePorterAnalysis(clinicId, state.diagnosis.porter))
  }
  if (state.diagnosis?.rumelt) {
    promises.push(saveRumeltDiagnosis(clinicId, state.diagnosis.rumelt))
  }
  if (state.operationalAssessment) {
    promises.push(saveOperationalAssessment(clinicId, state.operationalAssessment))
  }
  if (state.marketAssessment) {
    promises.push(saveMarketAssessment(clinicId, state.marketAssessment))
  }
  if (state.managerVision) {
    promises.push(saveManagerVision(clinicId, state.managerVision))
  }
  if (state.identity) {
    promises.push(saveIdentity(clinicId, state.identity))
  }
  if (state.blueOcean) {
    promises.push(saveBlueOcean(clinicId, state.blueOcean))
  }
  if (state.jtbd) {
    promises.push(saveJTBD(clinicId, state.jtbd))
  }
  if (state.okrs) {
    promises.push(saveOKRs(clinicId, state.okrs))
  }
  if (state.actions) {
    promises.push(saveActions(clinicId, state.actions))
  }
  if (state.relatorio_1) {
    promises.push(saveReport(clinicId, 'diagnostic', state.relatorio_1))
  }
  if (state.relatorio_2) {
    promises.push(saveReport(clinicId, 'strategic', state.relatorio_2))
  }
  if (state.relatorio_3) {
    promises.push(saveReport(clinicId, 'advanced', state.relatorio_3))
  }
  if (state.relatorio_4) {
    promises.push(saveReport(clinicId, 'tactical', state.relatorio_4))
  }
  if (state.relatorio_5) {
    promises.push(saveReport(clinicId, 'operational', state.relatorio_5))
  }
  if (state.relatorio_final) {
    promises.push(saveReport(clinicId, 'final', state.relatorio_final))
  }
  
  await Promise.all(promises)
}

// Funções de salvamento (implementação simplificada - versão completa no clinicService)
async function saveConfigInicial(clinicId: string, config: any) {
  await pool.query(
    `INSERT INTO clinic_configs (
      clinic_id, tipo_clinica, nome_clinica, localizacao, publico_principal,
      estagio_clinica, gestores_principais, objetivo_geral_2026,
      tamanho_relatorio, tom_linguagem
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (clinic_id) DO UPDATE SET
      tipo_clinica = $2, nome_clinica = $3, localizacao = $4,
      publico_principal = $5, estagio_clinica = $6, gestores_principais = $7,
      objetivo_geral_2026 = $8, tamanho_relatorio = $9, tom_linguagem = $10,
      updated_at = NOW()`,
    [
      clinicId, config.tipo_clinica, config.nome_clinica, config.localizacao,
      config.publico_principal, config.estagio_clinica, config.gestores_principais,
      config.objetivo_geral_2026, config.tamanho_relatorio, config.tom_linguagem,
    ],
  )
}

async function savePorterAnalysis(clinicId: string, porter: any) {
  await pool.query(
    `INSERT INTO porter_analysis (
      clinic_id, rivalry, new_entrants, substitutes, buyers, suppliers
    ) VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (clinic_id) DO UPDATE SET
      rivalry = $2, new_entrants = $3, substitutes = $4,
      buyers = $5, suppliers = $6, updated_at = NOW()`,
    [clinicId, porter.rivalry, porter.newEntrants, porter.substitutes, porter.buyers, porter.suppliers],
  )
}

async function saveRumeltDiagnosis(clinicId: string, rumelt: any) {
  await pool.query(
    `INSERT INTO rumelt_diagnosis (clinic_id, challenge, obstacles, policy)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (clinic_id) DO UPDATE SET
      challenge = $2, obstacles = $3, policy = $4, updated_at = NOW()`,
    [clinicId, rumelt.challenge, rumelt.obstacles, rumelt.policy],
  )
}

async function saveOperationalAssessment(clinicId: string, assessment: any) {
  await pool.query(
    `INSERT INTO operational_assessments (
      clinic_id, services, infrastructure, team_composition, working_hours,
      patient_management, financial_management, processes_well_defined,
      processes_disorganized
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (clinic_id) DO UPDATE SET
      services = $2, infrastructure = $3, team_composition = $4,
      working_hours = $5, patient_management = $6, financial_management = $7,
      processes_well_defined = $8, processes_disorganized = $9, updated_at = NOW()`,
    [
      clinicId, assessment.services, assessment.infrastructure, assessment.team_composition,
      assessment.working_hours, assessment.patient_management, assessment.financial_management,
      assessment.processes_well_defined, assessment.processes_disorganized,
    ],
  )
}

async function saveMarketAssessment(clinicId: string, assessment: any) {
  await pool.query(
    `INSERT INTO market_assessments (
      clinic_id, market_description, competitors, clinic_strengths,
      competitor_strengths, acquisition_channels, patient_complaints,
      patient_compliments, patient_loss
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (clinic_id) DO UPDATE SET
      market_description = $2, competitors = $3, clinic_strengths = $4,
      competitor_strengths = $5, acquisition_channels = $6,
      patient_complaints = $7, patient_compliments = $8, patient_loss = $9,
      updated_at = NOW()`,
    [
      clinicId, assessment.marketDescription, assessment.competitors, assessment.clinicStrengths,
      assessment.competitorStrengths, assessment.acquisitionChannels,
      assessment.patientComplaints, assessment.patientCompliments, assessment.patientLoss,
    ],
  )
}

async function saveManagerVision(clinicId: string, vision: any) {
  await pool.query(
    `INSERT INTO manager_visions (
      clinic_id, vision_2026, revenue_goal, occupancy_goal, nps_goal, other_goal,
      processes_score, processes_justification, financial_score,
      financial_justification, satisfaction_score, satisfaction_justification
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (clinic_id) DO UPDATE SET
      vision_2026 = $2, revenue_goal = $3, occupancy_goal = $4,
      nps_goal = $5, other_goal = $6, processes_score = $7,
      processes_justification = $8, financial_score = $9,
      financial_justification = $10, satisfaction_score = $11,
      satisfaction_justification = $12, updated_at = NOW()`,
    [
      clinicId, vision.vision2026, vision.goals.revenue, vision.goals.occupancy,
      vision.goals.nps, vision.goals.other, vision.ratings.processes.score,
      vision.ratings.processes.justification, vision.ratings.financial.score,
      vision.ratings.financial.justification, vision.ratings.satisfaction.score,
      vision.ratings.satisfaction.justification,
    ],
  )

  await pool.query('DELETE FROM manager_problems WHERE clinic_id = $1', [clinicId])
  await pool.query('DELETE FROM manager_opportunities WHERE clinic_id = $1', [clinicId])

  for (let i = 0; i < vision.problems.length; i++) {
    if (vision.problems[i]) {
      await pool.query('INSERT INTO manager_problems (clinic_id, problem, position) VALUES ($1, $2, $3)', [clinicId, vision.problems[i], i])
    }
  }

  for (let i = 0; i < vision.opportunities.length; i++) {
    if (vision.opportunities[i]) {
      await pool.query('INSERT INTO manager_opportunities (clinic_id, opportunity, position) VALUES ($1, $2, $3)', [clinicId, vision.opportunities[i], i])
    }
  }
}

async function saveIdentity(clinicId: string, identity: any) {
  await pool.query(
    `INSERT INTO identities (
      clinic_id, reason, recognition_goal, values, priority_audience,
      price_positioning, strategy_focus, strategy_focus_complement
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (clinic_id) DO UPDATE SET
      reason = $2, recognition_goal = $3, values = $4,
      priority_audience = $5, price_positioning = $6, strategy_focus = $7,
      strategy_focus_complement = $8, updated_at = NOW()`,
    [
      clinicId, identity.reason, identity.recognitionGoal, identity.values,
      identity.priorityAudience, identity.pricePositioning, identity.strategyFocus,
      identity.strategyFocusComplement || '',
    ],
  )
}

async function saveBlueOcean(clinicId: string, blueOcean: any) {
  await pool.query('DELETE FROM blue_ocean_items WHERE clinic_id = $1', [clinicId])
  const categories = ['eliminate', 'reduce', 'raise', 'create'] as const
  for (const category of categories) {
    const items = blueOcean[category]
    for (let i = 0; i < items.length; i++) {
      if (items[i]) {
        await pool.query('INSERT INTO blue_ocean_items (clinic_id, category, item, position) VALUES ($1, $2, $3, $4)', [clinicId, category, items[i], i])
      }
    }
  }
}

async function saveJTBD(clinicId: string, jtbd: any[]) {
  await pool.query('DELETE FROM jtbd_items WHERE clinic_id = $1', [clinicId])
  for (const item of jtbd) {
    await pool.query('INSERT INTO jtbd_items (clinic_id, job, type, solution) VALUES ($1, $2, $3, $4)', [clinicId, item.job, item.type, item.solution])
  }
}

async function saveOKRs(clinicId: string, okrs: any[]) {
  const oldOkrs = await pool.query('SELECT id FROM okrs WHERE clinic_id = $1', [clinicId])
  for (const oldOkr of oldOkrs.rows) {
    await pool.query('DELETE FROM key_results WHERE okr_id = $1', [oldOkr.id])
  }
  await pool.query('DELETE FROM okrs WHERE clinic_id = $1', [clinicId])

  for (const okr of okrs) {
    const okrResult = await pool.query('INSERT INTO okrs (clinic_id, objective, perspective, progress) VALUES ($1, $2, $3, $4) RETURNING id', [clinicId, okr.objective, okr.perspective, okr.progress])
    const okrId = okrResult.rows[0].id
    for (const kr of okr.keyResults) {
      await pool.query('INSERT INTO key_results (okr_id, title, target, current, unit) VALUES ($1, $2, $3, $4, $5)', [okrId, kr.title, kr.target, kr.current, kr.unit])
    }
  }
}

async function saveActions(clinicId: string, actions: any[]) {
  await pool.query('DELETE FROM actions WHERE clinic_id = $1', [clinicId])
  for (const action of actions) {
    await pool.query('INSERT INTO actions (id, clinic_id, title, status, owner, deadline, okr_id) VALUES ($1, $2, $3, $4, $5, $6, $7)', [action.id, clinicId, action.title, action.status, action.owner, action.deadline || null, action.okrId || null])
  }
}

async function saveReport(clinicId: string, reportType: string, reportData: any) {
  await pool.query(
    `INSERT INTO reports (clinic_id, report_type, report_data, generated_at)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (clinic_id, report_type) DO UPDATE SET
      report_data = $3, generated_at = $4, created_at = NOW()`,
    [clinicId, reportType, JSON.stringify(reportData), reportData.generatedAt],
  )
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  )
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  return authenticateToken(req as AuthRequest, res, async () => {
    try {
      const { id } = req.query
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'ID da clínica é obrigatório' })
      }

      const authReq = req as AuthRequest
      const user = authReq.user!

      // Verificar se o usuário tem acesso à clínica (admin pode acessar todas)
      if (user.role !== 'admin' && user.clinicId !== id) {
        return res.status(403).json({ error: 'Acesso negado a esta clínica' })
      }

      const { method } = req

      if (method === 'GET') {
        // Carregar todos os dados da clínica
        const data = await loadAllClinicData(id)
        const clinicResult = await pool.query('SELECT * FROM clinics WHERE id = $1', [id])
        const clinic = clinicResult.rows[0]
        return res.status(200).json({
          ...data,
          clinicName: clinic?.clinic_name || data.config_inicial?.nome_clinica || 'Clínica',
        })
      }

      if (method === 'POST' || method === 'PUT') {
        // Salvar todos os dados da clínica
        const state = req.body
        await saveAllClinicData(id, state)
        return res.status(200).json({ success: true })
      }

      if (method === 'DELETE') {
        // Apenas admin pode deletar clínicas
        if (user.role !== 'admin') {
          return res.status(403).json({ error: 'Apenas administradores podem deletar clínicas' })
        }
        await pool.query('DELETE FROM clinics WHERE id = $1', [id])
        return res.status(200).json({ success: true })
      }

      return res.status(405).json({ error: 'Método não permitido' })
    } catch (error: any) {
      console.error('Erro na API:', error)
      return res.status(500).json({ error: error.message })
    }
  })
}

