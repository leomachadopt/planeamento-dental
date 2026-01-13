import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
})

async function migrateAIReportsSystem() {
  console.log('🚀 Iniciando migração do sistema de relatórios por IA...\n')

  if (!process.env.DATABASE_URL) {
    console.error('❌ Erro: DATABASE_URL não configurada nas variáveis de ambiente')
    process.exit(1)
  }

  try {
    // 1. Ler e executar migração
    const migrationPath = path.join(__dirname, '../database/migrations/002_create_ai_reports_system.sql')
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Erro: Arquivo de migração não encontrado: ${migrationPath}`)
      process.exit(1)
    }

    console.log('📄 Lendo arquivo de migração...')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    console.log('⚙️  Executando migração SQL...')
    await pool.query(migrationSQL)
    console.log('✅ Migração executada com sucesso!\n')

    // 2. Verificar criação das tabelas
    console.log('🔍 Verificando tabelas criadas...')
    const tablesToCheck = [
      'ai_reports',
      'ai_report_events',
      'ai_prompt_templates',
      'strategic_choices',
      'initiatives',
    ]

    for (const tableName of tablesToCheck) {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`,
        [tableName],
      )

      if (result.rows[0].exists) {
        console.log(`  ✅ Tabela ${tableName} criada`)
      } else {
        console.log(`  ⚠️  Tabela ${tableName} não encontrada`)
      }
    }

    // 3. Verificar índices
    console.log('\n🔍 Verificando índices criados...')
    const indexesToCheck = [
      'idx_ai_reports_dossier_section',
      'idx_ai_reports_status',
      'idx_ai_reports_section_code',
      'idx_ai_report_events_report_id',
      'idx_strategic_choices_dossier',
      'idx_initiatives_dossier',
    ]

    for (const indexName of indexesToCheck) {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM pg_indexes 
          WHERE schemaname = 'public' 
          AND indexname = $1
        )`,
        [indexName],
      )

      if (result.rows[0].exists) {
        console.log(`  ✅ Índice ${indexName} criado`)
      } else {
        console.log(`  ⚠️  Índice ${indexName} não encontrado`)
      }
    }

    console.log('\n✨ Migração do sistema de relatórios por IA concluída com sucesso!')
    console.log('\n📊 Tabelas criadas:')
    console.log('   - ai_reports (relatórios gerados por IA)')
    console.log('   - ai_report_events (eventos de auditoria)')
    console.log('   - ai_prompt_templates (templates de prompts)')
    console.log('   - strategic_choices (escolhas estratégicas)')
    console.log('   - initiatives (iniciativas do plano)')
    console.log('\n🎯 Próximos passos:')
    console.log('   1. Configure OPENAI_API_KEY nas variáveis de ambiente')
    console.log('   2. Teste a geração de relatórios na seção Identidade')
    console.log('   3. Verifique o stale tracking ao alterar dados\n')
  } catch (error) {
    console.error('\n❌ Erro durante a migração:', error)
    console.error('\nDetalhes:', error.message)
    if (error.code) {
      console.error('Código do erro:', error.code)
    }
    process.exit(1)
  } finally {
    await pool.end()
  }
}

migrateAIReportsSystem()

