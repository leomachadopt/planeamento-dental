/**
 * Script para executar migração 008: question_contexts
 * Cria a tabela question_contexts para armazenar contexto detalhado das perguntas
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

async function migrateQuestionContext() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ Erro: DATABASE_URL não configurada!')
    console.error('Configure a variável DATABASE_URL no arquivo .env.local')
    process.exit(1)
  }

  try {
    console.log('🚀 Iniciando migração de question_contexts...\n')

    // Verificar se a tabela já existe
    console.log('🔍 Verificando se a tabela question_contexts já existe...')
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'question_contexts'
      )
    `)

    if (tableCheck.rows[0]?.exists) {
      console.log('⚠️  A tabela question_contexts já existe. Pulando migração.')
      console.log('💡 Se deseja recriar a tabela, delete-a manualmente primeiro.')
      return
    }

    // Executar migração 008
    console.log('📄 Executando migração: 008_add_question_context.sql')
    const migrationPath = path.join(__dirname, '../database/migrations/008_add_question_context.sql')
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Erro: Arquivo não encontrado: ${migrationPath}`)
      process.exit(1)
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')
    await pool.query(migrationSQL)
    console.log('✅ Migração executada com sucesso!\n')

    // Verificar criação da tabela
    console.log('🔍 Verificando tabela criada...')
    const verifyResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'question_contexts'
      )
    `)

    if (verifyResult.rows[0]?.exists) {
      console.log('✅ Tabela question_contexts criada com sucesso!')
      
      // Verificar colunas
      const columnsResult = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'question_contexts'
        ORDER BY ordinal_position
      `)
      
      console.log('\n📋 Colunas da tabela:')
      columnsResult.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`)
      })
      
      // Verificar índice
      const indexResult = await pool.query(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'question_contexts'
      `)
      
      if (indexResult.rows.length > 0) {
        console.log('\n📊 Índices criados:')
        indexResult.rows.forEach(idx => {
          console.log(`   - ${idx.indexname}`)
        })
      }
    } else {
      console.warn('⚠️  Tabela question_contexts não foi criada')
    }

    console.log('\n✨ Migração concluída com sucesso!')

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

migrateQuestionContext()
  .then(() => {
    console.log('\n✅ Processo finalizado!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Falha ao executar migração:', error)
    process.exit(1)
  })

