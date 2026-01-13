# Solução para Erro no Navegador

## Problema

O PostgreSQL (`pg`) não funciona diretamente no navegador porque:
- Usa módulos Node.js (`events`, `Buffer`) que não existem no navegador
- Precisa de conexão TCP direta, bloqueada por segurança no navegador

## Solução Implementada

Criamos uma **API Backend** (serverless functions) que faz a ponte entre o frontend e o banco de dados.

### Arquitetura

```
Frontend (React) 
    ↓ HTTP (fetch)
API Routes (Vercel Serverless Functions)
    ↓ PostgreSQL
Banco de Dados Neon
```

## Arquivos Criados

1. **`api/clinics.ts`** - Endpoint para listar e criar clínicas
2. **`api/clinic/[id].ts`** - Endpoint para carregar/salvar dados de uma clínica
3. **`src/lib/api.ts`** - Cliente HTTP para o frontend

## Como Funciona

### Desenvolvimento Local

1. As API routes precisam ser executadas em um servidor Node.js
2. O Vite está configurado com proxy para `/api` → servidor backend
3. Você precisa iniciar um servidor backend separado OU usar Vercel CLI

### Opção 1: Usar Vercel CLI (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Iniciar servidor de desenvolvimento
vercel dev
```

Isso iniciará:
- Frontend na porta 8080 (ou outra configurada)
- API routes na porta 3000

### Opção 2: Deploy na Vercel

1. Faça push do código para GitHub
2. Conecte o repositório na Vercel
3. Configure a variável de ambiente `DATABASE_URL` na Vercel
4. Deploy automático!

## Variáveis de Ambiente

### Vercel (Produção)
Configure `DATABASE_URL` nas variáveis de ambiente da Vercel:
```
DATABASE_URL=postgresql://usuario:senha@host/database?sslmode=require
```

### Desenvolvimento Local
Crie `.env.local`:
```
DATABASE_URL=postgresql://usuario:senha@host/database?sslmode=require
VITE_API_URL=http://localhost:3000
```

## Próximos Passos

1. **Implementar saveAllClinicData completo** na API route
   - Atualmente está simplificado
   - Precisa usar todas as funções do `clinicService`

2. **Testar localmente com Vercel CLI**
   ```bash
   vercel dev
   ```

3. **Deploy na Vercel**
   - Conectar repositório
   - Configurar variáveis de ambiente
   - Deploy!

## Notas Importantes

- ✅ O frontend agora usa `fetch` ao invés de `pg` diretamente
- ✅ As API routes rodam apenas no servidor (Node.js)
- ✅ O `pg` não é mais importado no frontend
- ⚠️ A implementação de `saveAllClinicData` na API route está simplificada e precisa ser completada

## Troubleshooting

### Erro: "Cannot find module 'pg'"
- Certifique-se de que `pg` está instalado: `npm install pg`

### Erro: "API route not found"
- Verifique se está usando `vercel dev` ou se as rotas estão no diretório `api/`

### Erro de CORS
- As API routes já têm headers CORS configurados
- Se ainda houver erro, verifique a configuração do proxy no `vite.config.ts`




