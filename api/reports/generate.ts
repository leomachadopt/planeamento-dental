import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  generateReportWithAI,
  validateReportStructure,
  type ReportType,
} from '../../src/lib/openai-report-generator'
import { authenticateToken, AuthRequest } from '../_shared/auth.js'
import pool from '../_shared/db.js'

/**
 * API Route para geração de relatórios com OpenAI
 *
 * POST /api/reports/generate
 * Body: {
 *   clinicId: string,
 *   reportType: 'diagnostic' | 'strategic' | 'advanced' | 'tactical' | 'operational' | 'final',
 *   state: StrategyState (dados completos da clínica)
 * }
 */
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  return authenticateToken(req as AuthRequest, res, async () => {
    try {
      const { clinicId, reportType, state } = req.body
      const authReq = req as AuthRequest
      const user = authReq.user!

      // Verificar se o usuário tem acesso à clínica
      if (user.role !== 'admin' && user.clinicId !== clinicId) {
        return res.status(403).json({ error: 'Acesso negado a esta clínica' })
      }

    // Validações
    if (!clinicId || typeof clinicId !== 'string') {
      return res.status(400).json({ error: 'clinicId é obrigatório' })
    }

    if (!reportType || typeof reportType !== 'string') {
      return res.status(400).json({ error: 'reportType é obrigatório' })
    }

    const validTypes: ReportType[] = [
      'diagnostic',
      'strategic',
      'advanced',
      'tactical',
      'operational',
      'final',
    ]
    if (!validTypes.includes(reportType as ReportType)) {
      return res.status(400).json({ error: 'reportType inválido' })
    }

    if (!state || typeof state !== 'object') {
      return res.status(400).json({ error: 'state é obrigatório' })
    }

    // Obter API key da OpenAI das variáveis de ambiente
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error('OPENAI_API_KEY não configurada')
      return res
        .status(500)
        .json({ error: 'Configuração do servidor incompleta' })
    }

    console.log(
      `Gerando relatório ${reportType} para clínica ${clinicId}...`,
    )

    // Gerar relatório usando OpenAI
    const reportData = await generateReportWithAI({
      reportType: reportType as ReportType,
      state,
      apiKey,
    })

    // Validar estrutura do relatório
    const isValid = validateReportStructure(
      reportType as ReportType,
      reportData,
    )
    if (!isValid) {
      console.error('Relatório gerado com estrutura inválida:', reportData)
      return res.status(500).json({
        error: 'Relatório gerado possui estrutura inválida',
      })
    }

    console.log(`Relatório ${reportType} gerado com sucesso!`)

    // Salvar relatório no banco de dados
    try {
      await pool.query(
        `INSERT INTO reports (clinic_id, report_type, report_data, generated_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (clinic_id, report_type)
         DO UPDATE SET report_data = $3, generated_at = $4, created_at = NOW()`,
        [clinicId, reportType, JSON.stringify(reportData), reportData.generatedAt],
      )
      console.log(`Relatório ${reportType} salvo no banco de dados`)
    } catch (dbError: any) {
      console.error('Erro ao salvar relatório no banco:', dbError)
      // Continua mesmo com erro de salvamento no banco
    }

      // Retornar relatório gerado
      return res.status(200).json({
        success: true,
        reportType,
        data: reportData,
      })
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error)
      return res.status(500).json({
        error: error.message || 'Erro ao gerar relatório',
      })
    }
  })
}
