import pg from 'pg'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function createPeopleSection() {
  const client = await pool.connect()

  try {
    console.log('🚀 Criando seção PEOPLE...')

    // Verificar se a seção já existe
    const existingSection = await client.query(
      'SELECT id, name FROM sections WHERE code = $1',
      ['PEOPLE']
    )

    if (existingSection.rows.length > 0) {
      console.log('⚠️  Seção PEOPLE já existe:', existingSection.rows[0].name)
      console.log('   ID:', existingSection.rows[0].id)
      return
    }

    // Buscar o maior order_index atual
    const maxOrderResult = await client.query(
      'SELECT COALESCE(MAX(order_index), 0) as max_order FROM sections'
    )
    const nextOrder = maxOrderResult.rows[0].max_order + 1

    // Inserir a seção PEOPLE
    const result = await client.query(
      `INSERT INTO sections (code, name, order_index, description)
       VALUES ($1, $2, $3, $4)
       RETURNING id, code, name, order_index`,
      [
        'PEOPLE',
        'Pessoas, Cultura & Gestão',
        nextOrder,
        'Avalia se a clínica tem as pessoas certas, cultura clara, liderança funcional e sistema de gestão capaz de sustentar a estratégia e a operação.'
      ]
    )

    const section = result.rows[0]
    console.log('✅ Seção PEOPLE criada com sucesso!')
    console.log('   ID:', section.id)
    console.log('   Nome:', section.name)
    console.log('   Order:', section.order_index)

  } catch (error) {
    console.error('❌ Erro ao criar seção:', error.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

createPeopleSection()
