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

async function cleanupIdentityQuestions() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ Erro: DATABASE_URL não configurada!')
    console.error('Configure a variável DATABASE_URL no arquivo .env.local')
    process.exit(1)
  }

  try {
    console.log('🔄 Executando limpeza das perguntas da seção Identidade...\n')

    // Executar migração de limpeza
    const migrationPath = path.join(__dirname, '../database/migrations/005_cleanup_identity_questions.sql')
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Erro: Arquivo não encontrado: ${migrationPath}`)
      process.exit(1)
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    console.log('📄 Executando limpeza: 005_cleanup_identity_questions.sql')
    
    await pool.query(migrationSQL)
    console.log('✅ Limpeza executada com sucesso!')

    // Verificar resultado final
    console.log('\n🔍 Verificando perguntas finais da seção Identidade...')
    
    const questionsCheck = await pool.query(`
      SELECT q.code, q.text, q.required, q.order_index
      FROM questions q
      JOIN question_sets qs ON q.question_set_id = qs.id
      JOIN sections s ON qs.section_id = s.id
      WHERE s.code = 'IDENTITY' AND qs.is_active = true
      ORDER BY q.order_index
    `)

    console.log(`\n📊 Total de perguntas ativas: ${questionsCheck.rows.length}`)
    console.log('\n📋 Perguntas da seção Identidade (apenas ativas):')
    questionsCheck.rows.forEach((row) => {
      const required = row.required ? '✅' : '⚪'
      console.log(`   ${required} [${row.order_index}] ${row.text} (${row.code})`)
    })

    // Verificar question_sets
    console.log('\n🔍 Verificando question_sets...')
    const questionSetsCheck = await pool.query(`
      SELECT qs.id, qs.name, qs.version, qs.is_active, COUNT(q.id) as question_count
      FROM question_sets qs
      LEFT JOIN questions q ON q.question_set_id = qs.id
      JOIN sections s ON qs.section_id = s.id
      WHERE s.code = 'IDENTITY'
      GROUP BY qs.id, qs.name, qs.version, qs.is_active
      ORDER BY qs.is_active DESC, qs.version DESC
    `)

    questionSetsCheck.rows.forEach((row) => {
      const status = row.is_active ? '✅ ATIVO' : '⚪ Inativo'
      console.log(`   ${status} - ${row.name} (v${row.version}): ${row.question_count} perguntas`)
    })

    // Verificar opções de seleção
    console.log('\n🔍 Verificando opções de seleção...')
    const optionsCheck = await pool.query(`
      SELECT q.code, q.text, COUNT(qo.id) as option_count
      FROM questions q
      LEFT JOIN question_options qo ON qo.question_id = q.id
      JOIN question_sets qs ON q.question_set_id = qs.id
      JOIN sections s ON qs.section_id = s.id
      WHERE s.code = 'IDENTITY' AND qs.is_active = true AND q.type = 'single_select'
      GROUP BY q.code, q.text, q.order_index
      ORDER BY q.order_index
    `)

    optionsCheck.rows.forEach((row) => {
      console.log(`   ${row.code} (${row.text}): ${row.option_count} opções`)
    })

    console.log('\n✅ Limpeza das perguntas da seção Identidade concluída com sucesso!')
    console.log('\n💡 Apenas as 12 perguntas atualizadas estão ativas agora.')
    
  } catch (error) {
    console.error('\n❌ Erro na limpeza:', error.message)
    console.error('\n🔍 Detalhes do erro:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

cleanupIdentityQuestions()


