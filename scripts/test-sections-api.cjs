const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
})

async function testSectionsAPI() {
  try {
    console.log('🧪 Testando API de seções (simulação)...\n')

    // Buscar seção IDENTITY
    const sectionResult = await pool.query(
      'SELECT * FROM sections WHERE code = $1',
      ['IDENTITY']
    )

    if (sectionResult.rows.length === 0) {
      console.log('❌ Seção IDENTITY não encontrada')
      return
    }

    const section = sectionResult.rows[0]
    console.log('✅ Seção:', section.name)
    console.log()

    // Buscar question_sets ativos (mesma lógica da API)
    const questionSetsResult = await pool.query(
      `SELECT DISTINCT ON (qs.subsection_id, qs.section_id)
       qs.*, sub.code as subsection_code, sub.name as subsection_name
       FROM question_sets qs
       LEFT JOIN subsections sub ON sub.id = qs.subsection_id
       WHERE qs.section_id = $1 AND qs.is_active = true
       ORDER BY qs.subsection_id, qs.section_id, qs.version DESC`,
      [section.id]
    )

    console.log(`📦 Question Sets ativos retornados pela API: ${questionSetsResult.rows.length}`)

    for (const qs of questionSetsResult.rows) {
      console.log(`\n   📋 ${qs.name}`)
      console.log(`      ID: ${qs.id}`)
      console.log(`      Subsection: ${qs.subsection_name || 'N/A'}`)
      console.log(`      Version: ${qs.version}`)

      // Buscar perguntas (mesma lógica da API)
      const questionsResult = await pool.query(
        `SELECT q.*,
         json_agg(
           json_build_object('id', qo.id, 'label', qo.label, 'value', qo.value, 'order_index', qo.order_index)
           ORDER BY qo.order_index
         ) FILTER (WHERE qo.id IS NOT NULL) as options
         FROM questions q
         LEFT JOIN question_options qo ON qo.question_id = q.id
         WHERE q.question_set_id = $1
         GROUP BY q.id
         ORDER BY q.order_index`,
        [qs.id]
      )

      console.log(`\n      🔍 Perguntas retornadas: ${questionsResult.rows.length}`)

      questionsResult.rows.forEach((q, index) => {
        const text = q.text.length > 60 ? q.text.substring(0, 60) + '...' : q.text
        console.log(`\n      ${index + 1}. ${q.code} [ordem: ${q.order_index}]`)
        console.log(`         "${text}"`)
        console.log(`         Tipo: ${q.type}, Requerida: ${q.required}`)

        if (q.options && q.options.length > 0) {
          console.log(`         Opções (${q.options.length}):`)
          q.options.forEach(opt => {
            console.log(`           - ${opt.label} (${opt.value})`)
          })
        }
      })
    }

  } catch (error) {
    console.error('❌ Erro:', error.message)
    console.error(error.stack)
  } finally {
    await pool.end()
  }
}

testSectionsAPI()
