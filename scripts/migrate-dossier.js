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

async function migrateDossierSystem() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ Erro: DATABASE_URL não configurada!')
    console.error('Configure a variável DATABASE_URL no arquivo .env.local')
    process.exit(1)
  }

  try {
    console.log('🔄 Executando migração do sistema de Dossiê...\n')

    // 1. Executar migração principal
    const migrationPath = path.join(__dirname, '../database/migrations/001_create_dossier_system.sql')
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Erro: Arquivo não encontrado: ${migrationPath}`)
      process.exit(1)
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    console.log('📄 Executando migração: 001_create_dossier_system.sql')
    
    await pool.query(migrationSQL)
    console.log('✅ Migração executada com sucesso!')
    console.log('\n📋 Tabelas criadas:')
    console.log('   - dossiers')
    console.log('   - sections')
    console.log('   - subsections')
    console.log('   - dossier_sections_status')
    console.log('   - question_sets')
    console.log('   - questions')
    console.log('   - question_options')
    console.log('   - answers')
    console.log('   - customer_segments')
    console.log('   - value_propositions')
    console.log('   - service_categories')
    console.log('   - services')
    console.log('   - competitors')
    console.log('   - roles')
    console.log('   - team_members')
    console.log('   - capacities')

    // 2. Executar seeds
    const seedsPath = path.join(__dirname, '../database/seeds/001_initial_dossier_structure.sql')
    
    if (!fs.existsSync(seedsPath)) {
      console.error(`❌ Erro: Arquivo não encontrado: ${seedsPath}`)
      process.exit(1)
    }

    const seedsSQL = fs.readFileSync(seedsPath, 'utf8')
    console.log('\n📄 Executando seeds: 001_initial_dossier_structure.sql')
    
    await pool.query(seedsSQL)
    console.log('✅ Seeds executados com sucesso!')
    console.log('\n📋 Dados iniciais criados:')
    console.log('   - 8 seções principais')
    console.log('   - 3 subseções de Identidade')
    console.log('   - 1 question_set v1 para Identidade')
    console.log('   - 7 perguntas iniciais')
    console.log('   - Opções para perguntas de seleção')

    // 3. Verificar se tudo foi criado corretamente
    console.log('\n🔍 Verificando criação das tabelas...')
    
    const tablesCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'dossiers', 'sections', 'subsections', 'dossier_sections_status',
        'question_sets', 'questions', 'question_options', 'answers',
        'customer_segments', 'value_propositions', 'service_categories',
        'services', 'competitors', 'roles', 'team_members', 'capacities'
      )
      ORDER BY table_name
    `)

    console.log(`✅ ${tablesCheck.rows.length} tabelas encontradas:`)
    tablesCheck.rows.forEach((row) => {
      console.log(`   - ${row.table_name}`)
    })

    // Verificar seções criadas
    const sectionsCheck = await pool.query('SELECT COUNT(*) as count FROM sections')
    console.log(`\n📊 Seções criadas: ${sectionsCheck.rows[0].count}`)

    // Verificar perguntas criadas
    const questionsCheck = await pool.query('SELECT COUNT(*) as count FROM questions')
    console.log(`📊 Perguntas criadas: ${questionsCheck.rows[0].count}`)

    console.log('\n✅ Migração do sistema de Dossiê concluída com sucesso!')
    console.log('\n💡 Próximo passo: O sistema está pronto para uso!')
    console.log('   Você pode criar dossiês através da interface do aplicativo.')
    
  } catch (error) {
    console.error('\n❌ Erro na migração:', error.message)
    if (error.code === '42P01') {
      console.error('\n💡 Dica: Algumas tabelas podem já existir. Isso é normal.')
      console.error('   O script usa CREATE TABLE IF NOT EXISTS, então pode continuar.')
    } else if (error.code === '23505') {
      console.error('\n💡 Dica: Alguns dados podem já existir (seeds duplicados).')
      console.error('   O script usa ON CONFLICT DO NOTHING, então pode continuar.')
    } else {
      console.error('\n🔍 Detalhes do erro:', error)
    }
    process.exit(1)
  } finally {
    await pool.end()
  }
}

migrateDossierSystem()




