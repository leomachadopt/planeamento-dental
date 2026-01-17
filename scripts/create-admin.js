import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function createAdmin() {
  const email = process.argv[2] || 'admin@clinique.ai';
  const password = process.argv[3] || 'admin123';
  const name = process.argv[4] || 'Administrador';

  if (!process.env.DATABASE_URL) {
    console.error('❌ Erro: DATABASE_URL não configurada!');
    console.error('Configure a variável DATABASE_URL no arquivo .env.local');
    process.exit(1);
  }

  console.log('🔐 Criando usuário administrador...');
  console.log(`Email: ${email}`);
  console.log(`Nome: ${name}`);

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) 
       DO UPDATE SET password_hash = $2, name = $3, role = $4
       RETURNING id, email, name, role, created_at`,
      [email, passwordHash, name, 'admin']
    );

    console.log('\n✅ Admin criado/atualizado com sucesso!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Usuário:', result.rows[0]);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n📧 Email: ${email}`);
    console.log(`🔑 Senha: ${password}`);
    console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    if (error.code === '42P01') {
      console.error('\n💡 Dica: Execute primeiro o schema.sql completo no banco de dados.');
      console.error('   Execute: psql $DATABASE_URL -f database/schema.sql');
    } else if (error.code === '23505') {
      console.error('\n💡 O email já existe. Use outro email ou o script atualizou a senha.');
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createAdmin();

