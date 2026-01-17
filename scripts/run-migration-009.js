import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const { Pool } = pg
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function runMigration() {
  const client = await pool.connect()

  try {
    console.log('🚀 Iniciando migração 009...')

    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../database/migrations/009_add_code_description_to_question_sets.sql'),
      'utf8'
    )

    await client.query(migrationSQL)

    console.log('✅ Migração 009 aplicada com sucesso!')
    console.log('   - Coluna "code" adicionada à tabela question_sets')
    console.log('   - Coluna "description" adicionada à tabela question_sets')
    console.log('   - Índices criados')

  } catch (error) {
    console.error('❌ Erro ao aplicar migração:', error.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

runMigration()
