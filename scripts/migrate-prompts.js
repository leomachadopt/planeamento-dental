/**
 * Script para executar migração e seed de prompts
 * Executa a migração 006_add_system_user_prompts.sql e o seed 008_seed_identity_prompts.sql
 */

import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
})

async function migratePrompts() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ Erro: DATABASE_URL não configurada!')
    console.error('Configure a variável DATABASE_URL no arquivo .env.local')
    process.exit(1)
  }

  try {
    console.log('🚀 Iniciando migração de prompts...\n')

    // 1. Executar migração 006
    console.log('📄 Executando migração: 006_add_system_user_prompts.sql')
    const migrationPath = path.join(__dirname, '../database/migrations/006_add_system_user_prompts.sql')
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Erro: Arquivo não encontrado: ${migrationPath}`)
      process.exit(1)
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')
    await pool.query(migrationSQL)
    console.log('✅ Migração executada com sucesso!\n')

    // 2. Executar seed 008
    console.log('📄 Executando seed: 008_seed_identity_prompts.sql')
    const seedPath = path.join(__dirname, '../database/seeds/008_seed_identity_prompts.sql')
    
    if (!fs.existsSync(seedPath)) {
      console.error(`❌ Erro: Arquivo não encontrado: ${seedPath}`)
      process.exit(1)
    }

    const seedSQL = fs.readFileSync(seedPath, 'utf-8')
    await pool.query(seedSQL)
    console.log('✅ Seed executado com sucesso!\n')

    // 3. Verificar resultado
    console.log('🔍 Verificando prompts inseridos...')
    const result = await pool.query(
      `SELECT 
        key, 
        version, 
        section_code, 
        LENGTH(system_prompt) as system_len, 
        LENGTH(user_prompt) as user_len,
        is_active,
        created_at
      FROM ai_prompt_templates
      WHERE key = 'section_IDENTITY' AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1`
    )

    if (result.rows.length > 0) {
      const prompt = result.rows[0]
      console.log('\n📊 Prompt de IDENTITY ativo:')
      console.log(`   Key: ${prompt.key}`)
      console.log(`   Version: ${prompt.version}`)
      console.log(`   Section: ${prompt.section_code}`)
      console.log(`   System Prompt: ${prompt.system_len} caracteres`)
      console.log(`   User Prompt: ${prompt.user_len} caracteres`)
      console.log(`   Ativo: ${prompt.is_active ? 'Sim' : 'Não'}`)
      console.log(`   Criado em: ${prompt.created_at}`)
    } else {
      console.warn('⚠️  Nenhum prompt encontrado após inserção')
    }

    // 4. Verificar estrutura da tabela
    console.log('\n🔍 Verificando estrutura da tabela...')
    const columnsResult = await pool.query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'ai_prompt_templates' 
       AND column_name IN ('system_prompt', 'user_prompt')
       ORDER BY column_name`
    )

    if (columnsResult.rows.length === 2) {
      console.log('✅ Colunas system_prompt e user_prompt existem na tabela')
      columnsResult.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`)
      })
    } else {
      console.warn('⚠️  Colunas system_prompt ou user_prompt não encontradas')
    }

    console.log('\n✨ Migração e seed concluídos com sucesso!')

  } catch (error) {
    console.error('\n❌ Erro durante a execução:', error.message)
    if (error.stack) {
      console.error('\nStack trace:', error.stack)
    }
    throw error
  } finally {
    await pool.end()
  }
}

migratePrompts()
  .then(() => {
    console.log('\n✅ Processo finalizado!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Falha ao executar migração:', error)
    process.exit(1)
  })

