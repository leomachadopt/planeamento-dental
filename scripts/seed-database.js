// Script para executar todos os seeds do banco de dados
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
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
})

async function seedDatabase() {
  console.log('🚀 Iniciando execução de seeds...\n')

  if (!process.env.DATABASE_URL) {
    console.error('❌ Erro: DATABASE_URL não configurada nas variáveis de ambiente')
    process.exit(1)
  }

  const seedsDir = path.join(__dirname, '../database/seeds')
  const seedFiles = [
    '001_initial_dossier_structure.sql',
    '002_seed_business_model.sql',
    '003_seed_market.sql',
    '004_seed_offer.sql',
    '005_seed_operations.sql',
    '006_seed_strategy.sql',
    '007_seed_plan.sql',
  ]

  try {
    for (const seedFile of seedFiles) {
      const seedPath = path.join(seedsDir, seedFile)
      
      if (!fs.existsSync(seedPath)) {
        console.warn(`⚠️  Arquivo não encontrado: ${seedFile}`)
        continue
      }

      console.log(`📄 Executando: ${seedFile}...`)
      const seedSQL = fs.readFileSync(seedPath, 'utf-8')
      await pool.query(seedSQL)
      console.log(`✅ ${seedFile} executado com sucesso\n`)
    }

    console.log('✨ Todos os seeds foram executados com sucesso!')
    
    // Verificar seções criadas
    console.log('\n🔍 Verificando seções criadas...')
    const sectionsResult = await pool.query('SELECT code, name FROM sections ORDER BY order_index')
    console.log(`   ✅ ${sectionsResult.rows.length} seções encontradas:`)
    sectionsResult.rows.forEach((s) => {
      console.log(`      - ${s.code}: ${s.name}`)
    })

    // Verificar subseções
    console.log('\n🔍 Verificando subseções criadas...')
    const subsectionsResult = await pool.query(
      `SELECT s.code as section_code, sub.code as subsection_code, sub.name as subsection_name
       FROM subsections sub
       JOIN sections s ON s.id = sub.section_id
       ORDER BY s.order_index, sub.order_index`
    )
    console.log(`   ✅ ${subsectionsResult.rows.length} subseções encontradas`)

    // Verificar question_sets
    console.log('\n🔍 Verificando question_sets criados...')
    const questionSetsResult = await pool.query(
      `SELECT s.code as section_code, qs.name, qs.version, qs.is_active
       FROM question_sets qs
       JOIN sections s ON s.id = qs.section_id
       ORDER BY s.order_index`
    )
    console.log(`   ✅ ${questionSetsResult.rows.length} question_sets encontrados:`)
    questionSetsResult.rows.forEach((qs) => {
      console.log(`      - ${qs.section_code}: ${qs.name} (v${qs.version}, ${qs.is_active ? 'ativo' : 'inativo'})`)
    })

    // Verificar perguntas
    console.log('\n🔍 Verificando perguntas criadas...')
    const questionsResult = await pool.query(
      `SELECT s.code as section_code, COUNT(q.id) as question_count
       FROM questions q
       JOIN question_sets qs ON qs.id = q.question_set_id
       JOIN sections s ON s.id = qs.section_id
       GROUP BY s.code, s.order_index
       ORDER BY s.order_index`
    )
    console.log(`   ✅ Total de perguntas por seção:`)
    questionsResult.rows.forEach((q) => {
      console.log(`      - ${q.section_code}: ${q.question_count} perguntas`)
    })

    console.log('\n🎯 Seeds concluídos com sucesso!')
  } catch (error) {
    console.error('\n❌ Erro durante a execução dos seeds:', error)
    console.error('\nDetalhes:', error.message)
    if (error.code) {
      console.error('Código do erro:', error.code)
    }
    process.exit(1)
  } finally {
    await pool.end()
  }
}

seedDatabase()

