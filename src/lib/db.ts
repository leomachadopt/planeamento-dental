// Este arquivo só deve ser usado no backend (API routes)
// Não importe isso no frontend!

import { Pool } from 'pg'

// Configuração do pool de conexões PostgreSQL
// Usa DATABASE_URL do ambiente (Vercel/Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.VITE_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Teste de conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados Neon')
})

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool de conexões:', err)
})

export default pool

