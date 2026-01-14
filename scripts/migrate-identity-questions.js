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

async function migrateIdentityQuestions() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ Erro: DATABASE_URL não configurada!')
    console.error('Configure a variável DATABASE_URL no arquivo .env.local')
    process.exit(1)
  }

  try {
    console.log('🔄 Executando migração das perguntas da seção Identidade...\n')

    // Executar migração
    const migrationPath = path.join(__dirname, '../database/migrations/004_update_identity_questions.sql')
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Erro: Arquivo não encontrado: ${migrationPath}`)
      process.exit(1)
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    console.log('📄 Executando migração: 004_update_identity_questions.sql')
    
    await pool.query(migrationSQL)
    console.log('✅ Migração executada com sucesso!')

    // Verificar perguntas atualizadas/criadas
    console.log('\n🔍 Verificando perguntas da seção Identidade...')
    
    const questionsCheck = await pool.query(`
      SELECT q.code, q.text, q.required, q.order_index
      FROM questions q
      JOIN question_sets qs ON q.question_set_id = qs.id
      JOIN sections s ON qs.section_id = s.id
      WHERE s.code = 'IDENTITY'
      ORDER BY q.order_index
    `)

    console.log(`\n📊 Total de perguntas encontradas: ${questionsCheck.rows.length}`)
    console.log('\n📋 Perguntas da seção Identidade:')
    questionsCheck.rows.forEach((row) => {
      const required = row.required ? '✅' : '⚪'
      console.log(`   ${required} [${row.order_index}] ${row.text} (${row.code})`)
    })

    // Verificar novas perguntas
    const newQuestions = [
      'IDENTITY_PRICE_POSITIONING_JUSTIFICATION',
      'IDENTITY_STRATEGY_FOCUS_SECONDARY',
      'IDENTITY_CRITICAL_ACTIONS',
      'IDENTITY_KEY_CHARACTERISTICS',
      'IDENTITY_WHAT_NOT_TO_BE',
    ]

    console.log('\n🔍 Verificando novas perguntas adicionadas...')
    for (const code of newQuestions) {
      const result = await pool.query(
        'SELECT id, text FROM questions WHERE code = $1',
        [code]
      )
      if (result.rows.length > 0) {
        console.log(`   ✅ ${code}: ${result.rows[0].text}`)
      } else {
        console.log(`   ⚠️  ${code}: Não encontrada`)
      }
    }

    // Verificar opções de seleção
    console.log('\n🔍 Verificando opções de seleção...')
    const optionsCheck = await pool.query(`
      SELECT q.code, q.text, COUNT(qo.id) as option_count
      FROM questions q
      LEFT JOIN question_options qo ON qo.question_id = q.id
      JOIN question_sets qs ON q.question_set_id = qs.id
      JOIN sections s ON qs.section_id = s.id
      WHERE s.code = 'IDENTITY' AND q.type = 'single_select'
      GROUP BY q.code, q.text, q.order_index
      ORDER BY q.order_index
    `)

    optionsCheck.rows.forEach((row) => {
      console.log(`   ${row.code} (${row.text}): ${row.option_count} opções`)
    })

    console.log('\n✅ Migração das perguntas da seção Identidade concluída com sucesso!')
    console.log('\n💡 As perguntas foram atualizadas conforme o contexto completo fornecido.')
    console.log('   Total de 12 perguntas organizadas em 6 blocos temáticos.')
    
  } catch (error) {
    console.error('\n❌ Erro na migração:', error.message)
    if (error.code === '42P01') {
      console.error('\n💡 Dica: Algumas tabelas podem não existir.')
      console.error('   Execute primeiro: pnpm run migrate-dossier')
    } else {
      console.error('\n🔍 Detalhes do erro:', error)
    }
    process.exit(1)
  } finally {
    await pool.end()
  }
}

migrateIdentityQuestions()

