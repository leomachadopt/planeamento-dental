/**
 * @deprecated Esta API foi substituída pelo sistema de dossiês.
 * Use /api/dossiers/:dossierId para acessar dados do dossiê.
 * 
 * Este arquivo é mantido apenas para compatibilidade temporária.
 * Será removido em versão futura.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateToken, AuthRequest } from '@/lib/api-shared/auth'
import pool from '@/lib/api-shared/db'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
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

      // Verificar se o usuário tem acesso à clínica
      if (user.role !== 'admin' && user.clinicId !== id) {
        return res.status(403).json({ error: 'Acesso negado a esta clínica' })
      }

      const { method } = req

      if (method === 'GET') {
        // Retornar apenas dados básicos da clínica
        const clinicResult = await pool.query('SELECT * FROM clinics WHERE id = $1', [id])
        if (clinicResult.rows.length === 0) {
          return res.status(404).json({ error: 'Clínica não encontrada' })
        }
        const clinic = clinicResult.rows[0]
        return res.status(200).json({
          clinicName: clinic.clinic_name,
          id: clinic.id,
        })
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
