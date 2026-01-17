import pg from 'pg'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function reorderSections() {
  const client = await pool.connect()

  try {
    console.log('🚀 Reordenando seções...')

    // Nova ordem desejada:
    // 1. IDENTITY
    // 2. BUSINESS_MODEL
    // 3. MARKET
    // 4. OFFER
    // 5. OPERATIONS
    // 6. PEOPLE (entre Operações e Estratégia)
    // 7. STRATEGY
    // 8. PLAN
    // 9. FINAL_REPORT

    const sectionOrder = [
      { code: 'IDENTITY', order: 1 },
      { code: 'BUSINESS_MODEL', order: 2 },
      { code: 'MARKET', order: 3 },
      { code: 'OFFER', order: 4 },
      { code: 'OPERATIONS', order: 5 },
      { code: 'PEOPLE', order: 6 },
      { code: 'STRATEGY', order: 7 },
      { code: 'PLAN', order: 8 },
      { code: 'FINAL_REPORT', order: 9 },
    ]

    for (const section of sectionOrder) {
      const result = await client.query(
        'UPDATE sections SET order_index = $1 WHERE code = $2 RETURNING code, name, order_index',
        [section.order, section.code]
      )

      if (result.rows.length > 0) {
        const updated = result.rows[0]
        console.log(`✅ ${updated.code}: ${updated.name} → ordem ${updated.order_index}`)
      } else {
        console.log(`⚠️  Seção ${section.code} não encontrada`)
      }
    }

    console.log('\n✅ Reordenamento concluído!')

  } catch (error) {
    console.error('❌ Erro ao reordenar seções:', error.message)
    console.error('🔍 Stack trace:', error.stack)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

reorderSections()
