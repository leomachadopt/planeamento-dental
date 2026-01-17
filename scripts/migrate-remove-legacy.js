// Script para executar a migração de remoção de tabelas antigas
import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function removeLegacyTables() {
  const DB_URL = process.env.DATABASE_URL

  if (!DB_URL) {
    console.error('❌ DATABASE_URL não encontrada no .env')
    process.exit(1)
  }

  try {
    console.log('🚀 Iniciando remoção de tabelas antigas...\n')
    const migrationPath = path.join(__dirname, '../database/migrations/003_remove_legacy_tables.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    console.log('📄 Lendo arquivo de migração...')
    console.log('⚙️  Executando migração SQL...')
    await pool.query(migrationSQL)
    console.log('✅ Migração executada com sucesso!\n')
    console.log('📋 Tabelas removidas:')
    console.log('   - actions, key_results, okrs (execução/PDCA)')
    console.log('   - reports (sistema antigo)')
    console.log('   - clinic_configs')
    console.log('   - porter_analysis, rumelt_diagnosis')
    console.log('   - operational_assessments, market_assessments')
    console.log('   - manager_visions, manager_problems, manager_opportunities')
    console.log('   - identities, blue_ocean_items, jtbd_items')
    console.log('\n✅ Sistema antigo removido. Sistema de documentação ativo.')
  } catch (error) {
    console.error('\n❌ Erro na migração:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

removeLegacyTables()

