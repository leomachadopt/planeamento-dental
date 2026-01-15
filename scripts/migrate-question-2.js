import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

async function migrateQuestion2() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ Erro: DATABASE_URL não configurada!')
    console.error('Configure a variável DATABASE_URL no arquivo .env.local')
    process.exit(1)
  }

  try {
    console.log('🚀 Executando migração da Pergunta 2 (Visão de Futuro)...\n')

    const migrationPath = path.join(__dirname, '../database/migrations/007_update_identity_question_2_structure.sql')
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Erro: Arquivo não encontrado: ${migrationPath}`)
      process.exit(1)
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')
    await pool.query(migrationSQL)
    
    console.log('✅ Migração executada com sucesso!')
    console.log('\n📋 Pergunta 2 atualizada:')
    console.log('   - Título: Visão de Futuro da Clínica (Reconhecimento em 3 anos)')
    console.log('   - Validação: mínimo 200 caracteres, máximo 600 caracteres')
    console.log('   - Regras de qualidade adicionadas')
    
    // Verificar atualização
    const checkResult = await pool.query(`
      SELECT q.code, q.text, q.help_text, q.validation_schema
      FROM questions q
      JOIN question_sets qs ON q.question_set_id = qs.id
      JOIN sections s ON qs.section_id = s.id
      WHERE s.code = 'IDENTITY' AND q.code = 'IDENTITY_RECOGNITION_GOAL'
    `)
    
    if (checkResult.rows.length > 0) {
      const question = checkResult.rows[0]
      console.log('\n🔍 Verificação:')
      console.log(`   - Código: ${question.code}`)
      console.log(`   - Título: ${question.text}`)
      console.log(`   - Validação: ${JSON.stringify(question.validation_schema, null, 2)}`)
    }
    
    await pool.end()
  } catch (error) {
    console.error('\n❌ Erro na migração:', error.message)
    console.error(error.stack)
    await pool.end()
    process.exit(1)
  }
}

migrateQuestion2()

