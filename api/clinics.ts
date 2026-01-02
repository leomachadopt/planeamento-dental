import type { VercelRequest, VercelResponse } from '@vercel/node'
import pool from './_shared/db'

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
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    const { method } = req

    if (method === 'GET') {
      // Listar todas as clínicas
      const result = await pool.query(
        'SELECT * FROM clinics ORDER BY created_at DESC',
      )
      return res.status(200).json(result.rows)
    }

    if (method === 'POST') {
      // Criar nova clínica
      const { clinicName } = req.body
      if (!clinicName) {
        return res.status(400).json({ error: 'Nome da clínica é obrigatório' })
      }

      const result = await pool.query(
        'INSERT INTO clinics (clinic_name) VALUES ($1) RETURNING id',
        [clinicName],
      )
      return res.status(201).json({ id: result.rows[0].id })
    }

    return res.status(405).json({ error: 'Método não permitido' })
  } catch (error: any) {
    console.error('Erro na API:', error)
    return res.status(500).json({ error: error.message })
  }
}

