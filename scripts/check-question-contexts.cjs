const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
})

async function checkContexts() {
  try {
    console.log('🔍 Verificando contextos das perguntas IDENTITY...\n')

    // Buscar perguntas do question_set ativo
    const questionsResult = await pool.query(`
      SELECT q.id, q.code, q.text
      FROM questions q
      JOIN question_sets qs ON qs.id = q.question_set_id
      JOIN sections s ON s.id = qs.section_id
      WHERE s.code = 'IDENTITY' AND qs.is_active = true
      ORDER BY q.order_index
    `)

    console.log(`📝 Perguntas encontradas: ${questionsResult.rows.length}\n`)

    for (const question of questionsResult.rows) {
      const text = question.text.length > 50 ? question.text.substring(0, 50) + '...' : question.text
      console.log(`\n📌 ${question.code}`)
      console.log(`   "${text}"`)
      console.log(`   ID: ${question.id}`)

      // Buscar contexto
      const contextResult = await pool.query(`
        SELECT *
        FROM question_contexts
        WHERE question_id = $1
      `, [question.id])

      if (contextResult.rows.length === 0) {
        console.log('   ❌ SEM CONTEXTO')
      } else {
        const ctx = contextResult.rows[0]
        console.log('   ✅ Contexto encontrado:')
        console.log(`      - why: ${ctx.why ? '✓' : '✗'} (${ctx.why ? ctx.why.length : 0} chars)`)
        console.log(`      - consequences: ${ctx.consequences ? ctx.consequences.length : 0} items`)
        console.log(`      - how_to_answer: ${ctx.how_to_answer ? '✓' : '✗'} (${ctx.how_to_answer ? ctx.how_to_answer.length : 0} chars)`)
        console.log(`      - good_examples: ${ctx.good_examples ? ctx.good_examples.length : 0} items`)
        console.log(`      - bad_examples: ${ctx.bad_examples ? ctx.bad_examples.length : 0} items`)
        console.log(`      Flags de exibição:`)
        console.log(`        show_why: ${ctx.show_why}`)
        console.log(`        show_consequences: ${ctx.show_consequences}`)
        console.log(`        show_how_to_answer: ${ctx.show_how_to_answer}`)
        console.log(`        show_good_examples: ${ctx.show_good_examples}`)
        console.log(`        show_bad_examples: ${ctx.show_bad_examples}`)
      }
    }

    console.log('\n\n📊 Resumo:')
    const totalWithContext = await pool.query(`
      SELECT COUNT(DISTINCT qc.question_id) as count
      FROM question_contexts qc
      JOIN questions q ON q.id = qc.question_id
      JOIN question_sets qs ON qs.id = q.question_set_id
      JOIN sections s ON s.id = qs.section_id
      WHERE s.code = 'IDENTITY' AND qs.is_active = true
    `)

    console.log(`   Perguntas com contexto: ${totalWithContext.rows[0].count} de ${questionsResult.rows.length}`)

  } catch (error) {
    console.error('❌ Erro:', error.message)
    console.error(error.stack)
  } finally {
    await pool.end()
  }
}

checkContexts()
