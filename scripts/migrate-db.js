import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

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

async function migrateDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ Erro: DATABASE_URL não configurada!');
    console.error('Configure a variável DATABASE_URL no arquivo .env.local');
    process.exit(1);
  }

  const schemaPath = path.join(__dirname, '../database/schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Erro: Arquivo não encontrado: ${schemaPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('🔄 Executando migração do banco de dados...');
  console.log(`📄 Arquivo: ${schemaPath}`);

  try {
    await pool.query(sql);
    console.log('✅ Migração executada com sucesso!');
    console.log('\n📋 Tabelas criadas:');
    console.log('   - clinics');
    console.log('   - clinic_configs');
    console.log('   - porter_analysis');
    console.log('   - rumelt_diagnosis');
    console.log('   - operational_assessments');
    console.log('   - market_assessments');
    console.log('   - manager_visions');
    console.log('   - manager_problems');
    console.log('   - manager_opportunities');
    console.log('   - identities');
    console.log('   - blue_ocean_items');
    console.log('   - jtbd_items');
    console.log('   - okrs');
    console.log('   - key_results');
    console.log('   - actions');
    console.log('   - reports');
    console.log('   - users (autenticação)');
    console.log('   - user_sessions (autenticação)');
    console.log('\n💡 Próximo passo: Execute "pnpm db:create-admin" para criar o usuário admin');
  } catch (error) {
    console.error('\n❌ Erro na migração:', error.message);
    if (error.code === '42P01') {
      console.error('\n💡 Dica: Algumas tabelas podem já existir. Isso é normal.');
      console.error('   O script usa CREATE TABLE IF NOT EXISTS, então pode continuar.');
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateDatabase();

