import { Pool } from 'pg';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function updateAdminEmail() {
  const oldEmail = process.argv[2] || 'admin@clinique.ai';
  const newEmail = process.argv[3] || 'leomachadopt@gmail.com';

  if (!process.env.DATABASE_URL) {
    console.error('❌ Erro: DATABASE_URL não configurada!');
    console.error('Configure a variável DATABASE_URL no arquivo .env.local');
    process.exit(1);
  }

  console.log('🔄 Atualizando email do administrador...');
  console.log(`De: ${oldEmail}`);
  console.log(`Para: ${newEmail}`);

  try {
    const result = await pool.query(
      `UPDATE users 
       SET email = $1, updated_at = NOW()
       WHERE email = $2 AND role = 'admin'
       RETURNING id, email, name, role`,
      [newEmail.toLowerCase(), oldEmail.toLowerCase()]
    );

    if (result.rows.length === 0) {
      console.error(`\n❌ Erro: Usuário admin com email "${oldEmail}" não encontrado.`);
      console.error('💡 Verifique se o email está correto ou se o usuário existe.');
      process.exit(1);
    }

    console.log('\n✅ Email atualizado com sucesso!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Usuário:', result.rows[0]);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    if (error.code === '23505') {
      console.error(`\n💡 O email "${newEmail}" já está em uso por outro usuário.`);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updateAdminEmail();



