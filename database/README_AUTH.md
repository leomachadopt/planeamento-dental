# Sistema de Autenticação - Implementado ✅

## 📋 O que foi criado

### 1. Tabelas do Banco de Dados

As seguintes tabelas foram adicionadas ao schema:

- **users**: Armazena os usuários do sistema
  - Campos: id, email, password_hash, name, role, clinic_id, is_active, last_login, created_at, updated_at
  - Roles: 'admin' ou 'user'
  
- **user_sessions**: Armazena sessões/tokens (para blacklist futura)
  - Campos: id, user_id, token_hash, expires_at, created_at

### 2. Scripts de Migração

- **`scripts/migrate-db.js`**: Executa o schema completo no banco
  - Comando: `pnpm db:migrate`
  
- **`scripts/create-admin.js`**: Cria usuário administrador
  - Comando: `pnpm db:create-admin [email] [senha] [nome]`
  - Exemplo: `pnpm db:create-admin admin@clinique.ai admin123 "Administrador"`

### 3. Arquivos SQL

- **`database/schema.sql`**: Schema completo incluindo autenticação
- **`database/auth_schema.sql`**: Apenas tabelas de autenticação (para casos onde o schema principal já existe)

## 🚀 Como usar

### Executar Migração

```bash
# Executa todo o schema (incluindo autenticação)
pnpm db:migrate
```

### Criar Usuário Admin

```bash
# Criar admin padrão
pnpm db:create-admin

# Criar admin customizado
pnpm db:create-admin seu@email.com senha123 "Seu Nome"
```

## 🔐 Credenciais Padrão

Após executar a migração e criar o admin:

- **Email**: admin@clinique.ai
- **Senha**: admin123

⚠️ **IMPORTANTE**: Altere a senha após o primeiro login!

## 📝 Próximos Passos

1. ✅ Schema SQL executado
2. ✅ Usuário admin criado
3. ⏳ Implementar rotas de API de autenticação
4. ⏳ Implementar componentes de login/registro
5. ⏳ Implementar proteção de rotas
6. ⏳ Implementar painel administrativo

## 🔍 Verificar Tabelas

Para verificar se as tabelas foram criadas:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'user_sessions')
ORDER BY table_name;
```

## 🛠️ Troubleshooting

### Erro: "relation clinics does not exist"

Execute primeiro o schema completo:
```bash
pnpm db:migrate
```

### Erro: "DATABASE_URL não configurada"

Certifique-se de que o arquivo `.env.local` existe e contém:
```env
DATABASE_URL=sua_connection_string_aqui
```




