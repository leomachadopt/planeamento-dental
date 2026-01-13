# Scripts de Banco de Dados

Este diretório contém os scripts SQL necessários para configurar o banco de dados.

## Schema SQL

O arquivo `schema.sql` contém todas as definições de tabelas, índices e constraints necessários para o funcionamento do aplicativo.

## Como Executar

### Opção 1: Via Interface Web do Neon

1. Acesse o dashboard do Neon (https://console.neon.tech)
2. Selecione seu projeto
3. Vá em "SQL Editor"
4. Cole o conteúdo do arquivo `schema.sql`
5. Clique em "Run" para executar

### Opção 2: Via psql (Linha de Comando)

```bash
# Substitua pela sua string de conexão
psql 'postgresql://usuario:senha@host:porta/database?sslmode=require' -f schema.sql
```

### Opção 3: Via Node.js (Script)

Você pode criar um script Node.js para executar o schema:

```javascript
import { readFileSync } from 'fs'
import pool from '../src/lib/db.js'

const schema = readFileSync('./database/schema.sql', 'utf-8')
await pool.query(schema)
console.log('Schema executado com sucesso!')
```

## Verificação

Após executar o schema, você pode verificar se as tabelas foram criadas:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Você deve ver as seguintes tabelas:
- actions
- blue_ocean_items
- clinic_configs
- clinics
- identities
- jtbd_items
- key_results
- manager_opportunities
- manager_problems
- manager_visions
- market_assessments
- okrs
- operational_assessments
- porter_analysis
- reports
- rumelt_diagnosis

## Troubleshooting

Se encontrar erros ao executar o schema:

1. **Erro de permissão**: Certifique-se de que o usuário tem permissões para criar tabelas
2. **Tabelas já existem**: Use `DROP TABLE IF EXISTS` antes de criar, ou remova manualmente as tabelas antigas
3. **Erro de sintaxe**: Verifique se está usando PostgreSQL 12+ (Neon usa versões recentes)




