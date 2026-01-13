// Módulo compartilhado para API routes
// Este arquivo só roda no servidor (Node.js)

import { Pool } from 'pg'

// Pool de conexões PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados Neon')
})

pool.on('error', (err) => {
  console.error('❌ Erro no pool de conexões:', err)
})

export default pool




