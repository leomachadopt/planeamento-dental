/**
 * Script para popular prompts customizados de IDENTITY no banco de dados
 * Executa o seed 008_seed_identity_prompts.sql
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import pg from 'pg'

const { Pool } = pg

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Carregar DATABASE_URL
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('❌ DATABASE_URL não está configurada!')
  console.error('Configure DATABASE_URL no arquivo .env.local ou nas variáveis de ambiente')
  process.exit(1)
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

async function seedIdentityPrompts() {
  try {
    console.log('📝 Carregando seed de prompts de IDENTITY...')
    
    // Ler arquivo SQL
    const sqlPath = join(__dirname, '../database/seeds/008_seed_identity_prompts.sql')
    const sql = readFileSync(sqlPath, 'utf-8')
    
    console.log('💾 Executando seed...')
    await pool.query(sql)
    
    console.log('✅ Prompts de IDENTITY populados com sucesso!')
    
    // Verificar se foi inserido
    const result = await pool.query(
      `SELECT key, version, section_code, 
              LENGTH(system_prompt) as system_len, 
              LENGTH(user_prompt) as user_len,
              is_active
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
      console.log(`   Ativo: ${prompt.is_active}`)
    } else {
      console.warn('⚠️  Nenhum prompt encontrado após inserção')
    }
    
  } catch (error) {
    console.error('❌ Erro ao popular prompts:', error)
    throw error
  } finally {
    await pool.end()
  }
}

seedIdentityPrompts()
  .then(() => {
    console.log('\n✨ Concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Falha ao executar seed:', error)
    process.exit(1)
  })


