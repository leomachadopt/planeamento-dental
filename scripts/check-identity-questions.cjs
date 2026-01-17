const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
})

async function checkQuestions() {
  try {
    console.log('🔍 Verificando perguntas da seção IDENTITY...\n')

    // Verificar seção IDENTITY
    const sectionResult = await pool.query(`
      SELECT id, code, name FROM sections WHERE code = 'IDENTITY'
    `)

    if (sectionResult.rows.length === 0) {
      console.log('❌ Seção IDENTITY não encontrada!')
      return
    }

    const section = sectionResult.rows[0]
    console.log('✅ Seção encontrada:', section.name)
    console.log('   ID:', section.id, '\n')

    // Verificar question_sets
    const qsResult = await pool.query(`
      SELECT qs.id, qs.name, qs.is_active, qs.version, s.name as subsection_name
      FROM question_sets qs
      LEFT JOIN subsections s ON s.id = qs.subsection_id
      WHERE qs.section_id = $1
      ORDER BY qs.version DESC
    `, [section.id])

    console.log(`📦 Question Sets encontrados: ${qsResult.rows.length}`)
    qsResult.rows.forEach(qs => {
      console.log(`   - ${qs.name} (${qs.subsection_name}) [v${qs.version}] ${qs.is_active ? '✓ ativo' : '✗ inativo'}`)
      console.log(`     ID: ${qs.id}`)
    })
    console.log()

    // Para cada question_set, verificar perguntas
    for (const qs of qsResult.rows) {
      const questionsResult = await pool.query(`
        SELECT
          q.id,
          q.code,
          q.text,
          q.type,
          q.order_index,
          q.required,
          (SELECT COUNT(*) FROM question_options WHERE question_id = q.id) as options_count
        FROM questions q
        WHERE q.question_set_id = $1
        ORDER BY q.order_index
      `, [qs.id])

      console.log(`📝 Perguntas do Question Set "${qs.name}": ${questionsResult.rows.length}`)

      if (questionsResult.rows.length > 0) {
        questionsResult.rows.forEach((q, index) => {
          const text = q.text.length > 50 ? q.text.substring(0, 50) + '...' : q.text
          console.log(`   ${index + 1}. [${q.order_index}] ${q.code}`)
          console.log(`      "${text}"`)
          console.log(`      Tipo: ${q.type}, Obrigatória: ${q.required}, Opções: ${q.options_count}`)
        })
      } else {
        console.log('   ❌ Nenhuma pergunta encontrada!')
      }
      console.log()
    }

    // Verificar se há perguntas órfãs (sem question_set ativo)
    const orphanResult = await pool.query(`
      SELECT
        q.id,
        q.code,
        q.question_set_id,
        qs.is_active,
        qs.name as question_set_name
      FROM questions q
      JOIN question_sets qs ON qs.id = q.question_set_id
      WHERE qs.section_id = $1 AND qs.is_active = false
    `, [section.id])

    if (orphanResult.rows.length > 0) {
      console.log(`⚠️  Perguntas em question_sets inativos: ${orphanResult.rows.length}`)
      orphanResult.rows.forEach(q => {
        console.log(`   - ${q.code} (Question Set: ${q.question_set_name})`)
      })
    }

  } catch (error) {
    console.error('❌ Erro:', error.message)
    console.error(error.stack)
  } finally {
    await pool.end()
  }
}

checkQuestions()
