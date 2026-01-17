# 🔧 SOLUÇÃO: ERRO 500 AO CRIAR CLÍNICA

## 🐛 ERRO

```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Erro ao carregar clínicas: Error: Erro desconhecido
```

---

## 🔍 CAUSA RAIZ

**Problema:** Vercel Dev não está carregando as variáveis de ambiente do arquivo `.env`

**Consequência:**
- `process.env.DATABASE_URL` = `undefined`
- Pool de conexão PostgreSQL falha
- API retorna erro 500

---

## ✅ SOLUÇÃO

### **Passo 1: Parar o Servidor**

```bash
# Pressione Ctrl+C no terminal onde está rodando vercel dev
```

### **Passo 2: Verificar Arquivos de Ambiente**

Você deve ter **AMBOS** os arquivos:

```bash
# Verifique
ls -la .env .env.local

# Deve mostrar:
# .env        ← Arquivo principal
# .env.local  ← Arquivo para Vercel Dev
```

### **Passo 3: Garantir que .env.local existe**

```bash
# Já criei para você, mas verifique o conteúdo:
cat .env.local
```

Deve conter:
```env
DATABASE_URL=postgresql://neondb_owner:npg_MHmiVaQ1rgC5@ep-polished-shape-abrhnz6l-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
OPENAI_API_KEY=sk-proj-...
```

### **Passo 4: Limpar Cache do Vercel**

```bash
# Remova pasta de cache
rm -rf .vercel
```

### **Passo 5: Reiniciar Vercel Dev**

```bash
# Execute novamente
vercel dev

# Aguarde carregar completamente
# Deve mostrar: Ready! Available at http://localhost:3000
```

### **Passo 6: Testar Criação de Clínica**

```bash
# Abra http://localhost:3000
# Clique em "Nova Clínica"
# Digite um nome
# Clique em "Criar Clínica"
# ✅ Deve funcionar!
```

---

## 🧪 TESTE DE CONEXÃO COM BANCO

### **Testar manualmente se banco está acessível:**

```bash
# No terminal (em outra aba)
curl http://localhost:3000/api/clinics

# Deve retornar:
# [] (array vazio se não há clínicas)
# ou
# [{"id": "...", "clinic_name": "..."}] (se há clínicas)

# Se retornar erro 500, veja os logs no terminal do vercel dev
```

---

## 🐛 TROUBLESHOOTING

### **Erro persiste após reiniciar?**

**1. Verifique logs do Vercel Dev:**

```bash
# No terminal onde está rodando vercel dev, procure por:
❌ Erro no pool de conexões: ...
# ou
Error: Connection refused
# ou
Error: getaddrinfo ENOTFOUND
```

**2. Teste conexão com banco diretamente:**

```bash
# Instale psql se não tiver
# Mac:
brew install postgresql

# Teste conexão:
psql "postgresql://neondb_owner:npg_MHmiVaQ1rgC5@ep-polished-shape-abrhnz6l-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

# Se conectar: ✅ Banco está acessível
# Se erro: ❌ Problema de rede ou credenciais
```

**3. Verifique se variáveis estão sendo carregadas:**

Adicione log temporário em `api/_shared/db.ts`:

```typescript
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'LOADED ✅' : 'MISSING ❌')
```

Reinicie e observe os logs.

---

### **Porta 3000 já em uso?**

```bash
# Verifique o que está usando a porta
lsof -i :3000

# Mate o processo
kill -9 <PID>

# Ou use outra porta
vercel dev --listen 3001
```

---

### **Erro de CORS (secondary error)?**

```
Access to fetch at 'https://api.goskip.dev/...' has been blocked by CORS
```

**Isso é um erro secundário** de alguma extensão do navegador (Goskip).
- Desative extensões temporariamente
- Ou ignore (não afeta a funcionalidade)

---

## 📋 CHECKLIST DE VALIDAÇÃO

Após solução:

- [ ] `.env.local` existe com DATABASE_URL
- [ ] `vercel dev` iniciou sem erros
- [ ] Console mostra: `✅ Conectado ao banco de dados Neon`
- [ ] `curl http://localhost:3000/api/clinics` retorna array
- [ ] Consegue criar clínica pela UI
- [ ] Consegue listar clínicas

---

## 🎯 SOLUÇÃO ALTERNATIVA (SE TUDO FALHAR)

### **Usar npm run dev + proxy:**

Se Vercel Dev não funcionar, use Vite diretamente:

```bash
# 1. Pare vercel dev
# 2. Execute apenas o frontend
npm run dev

# 3. Configure proxy no vite.config.ts:
server: {
  proxy: {
    '/api': {
      target: 'https://seuapp.vercel.app',
      changeOrigin: true
    }
  }
}
```

**Nota:** Isso requer deploy na Vercel primeiro.

---

## 📝 ARQUIVOS IMPORTANTES

```
planeamento-dental/
├── .env              ← Variáveis (ignorado pelo git)
├── .env.local        ← Variáveis (Vercel Dev)
├── .env.example      ← Template
├── api/
│   ├── _shared/
│   │   └── db.ts     ← Pool de conexão PostgreSQL
│   ├── clinics.ts    ← API de clínicas
│   └── clinic/
│       └── [id].ts   ← API de clínica específica
└── vercel.json       ← Config Vercel
```

---

## ✅ RESUMO

**Causa:** Vercel Dev não carregava variáveis de ambiente

**Solução:**
1. ✅ Criar `.env.local` com DATABASE_URL
2. ✅ Limpar cache: `rm -rf .vercel`
3. ✅ Reiniciar: `vercel dev`
4. ✅ Testar criação de clínica

---

**Status:** 🔧 **Aguardando Teste**
**Data:** 03/01/2026

**Próximo passo:** Reinicie `vercel dev` e teste criar uma clínica!
