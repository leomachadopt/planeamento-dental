# 🔧 DEBUG: HARD REFRESH

## 🧪 COMO TESTAR HARD REFRESH

### **1. Teste Manual Completo:**

```bash
# 1. Abra o DevTools (F12) → Console
# 2. Execute o app
vercel dev

# 3. Selecione/crie uma clínica
# 4. Preencha alguns dados
# 5. Aguarde auto-save (veja toast)

# 6. Verifique localStorage:
localStorage.getItem('currentClinicId')
# Deve retornar o ID da clínica (ex: "abc-123-def")

# 7. Faça HARD REFRESH:
# - Windows/Linux: Ctrl + Shift + R
# - Mac: Cmd + Shift + R

# 8. Observe os logs no console:
# Deve ver:
# 🔍 Verificando auto-load: { savedClinicId: "abc-123", ... }
# 🔄 Carregando última clínica selecionada: abc-123
# ✅ Dados carregados com sucesso!

# 9. Verifique se dados aparecem na tela
```

### **2. Verificar localStorage após Hard Refresh:**

```javascript
// No console do navegador APÓS hard refresh
console.log('currentClinicId:', localStorage.getItem('currentClinicId'))
// Deve retornar o ID (não deve ser null)

// Verificar todos os dados no localStorage
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i)
  console.log(key, ':', localStorage.getItem(key))
}
```

---

## 🐛 POSSÍVEIS PROBLEMAS

### **Problema 1: localStorage é limpo no hard refresh**
**Sintoma:** `localStorage.getItem('currentClinicId')` retorna `null`

**Causa:** Configuração do navegador ou extensão

**Solução:**
1. Verifique se não tem extensões que limpam dados
2. Verifique configurações do navegador
3. Teste em modo anônimo

---

### **Problema 2: Race condition no carregamento**
**Sintoma:** localStorage tem ID, mas dados não carregam

**Causa:** Hook executa antes da store estar pronta

**Solução:** ✅ Já implementada
- Hook agora usa `useRef` para evitar múltiplas execuções
- Logs detalhados mostram cada etapa

---

### **Problema 3: API não responde rápido o suficiente**
**Sintoma:** Erro "Failed to fetch" no console

**Causa:** Vercel dev pode estar lento na primeira requisição

**Solução:**
1. Aguarde alguns segundos
2. Verifique se API está rodando: http://localhost:3000/api/clinics
3. Reinicie `vercel dev` se necessário

---

## 📊 LOGS ESPERADOS NO CONSOLE

### **Hard Refresh Bem-Sucedido:**

```
🔍 Verificando auto-load: {
  savedClinicId: "abc-123-def",
  currentClinicId: null,
  isLoading: false
}
🔄 Carregando última clínica selecionada: abc-123-def
[API Request] GET /api/clinic/abc-123-def
✅ Conectado ao banco de dados Neon
✅ Dados carregados com sucesso!
```

### **Hard Refresh com Problema:**

```
🔍 Verificando auto-load: {
  savedClinicId: null,  ← PROBLEMA!
  currentClinicId: null,
  isLoading: false
}
ℹ️ Nenhuma clínica salva no localStorage
```

---

## 🔧 COMANDOS DE DEBUG

### **Resetar tudo e testar do zero:**

```javascript
// No console do navegador
localStorage.clear()
location.reload()

// Agora selecione uma clínica e teste hard refresh
```

### **Forçar salvamento no localStorage:**

```javascript
// Simular seleção de clínica
localStorage.setItem('currentClinicId', 'test-clinic-id-123')
location.reload()

// Deve carregar automaticamente
```

### **Ver estado completo da store:**

```javascript
// No console
console.log(window.useStrategyStore.getState())
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

Após hard refresh:

- [ ] localStorage ainda tem `currentClinicId`
- [ ] Console mostra logs de auto-load
- [ ] API é chamada (Network tab no DevTools)
- [ ] Dados aparecem na tela
- [ ] Botão "Salvar" mostra status correto

---

## 🎯 SE AINDA NÃO FUNCIONAR

### **Última tentativa:**

```bash
# 1. Pare o servidor
# Ctrl+C no terminal

# 2. Limpe cache do Vercel
rm -rf .vercel

# 3. Reinstale dependências
pnpm install

# 4. Execute novamente
vercel dev

# 5. Teste do zero
```

### **Reportar problema:**

Se ainda não funcionar, forneça:
1. Screenshot do console com logs
2. Screenshot do localStorage (DevTools → Application → Local Storage)
3. Screenshot do Network tab mostrando requisições
4. Navegador e versão

---

**Status:** 🔍 **Em Teste**
**Data:** 03/01/2026
