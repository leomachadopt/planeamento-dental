# 🚀 COMO USAR O APLICATIVO - GUIA RÁPIDO

## 📝 RESUMO

O aplicativo agora está **100% integrado** com:
- ✅ Banco de dados PostgreSQL (Neon)
- ✅ OpenAI GPT-4 para geração de relatórios inteligentes
- ✅ Sem dados mockados

---

## 🏁 INÍCIO RÁPIDO

### 1. Executar o Servidor

```bash
# Opção 1: Com Vercel CLI (RECOMENDADO para usar OpenAI)
vercel dev

# Opção 2: Apenas frontend (sem geração de relatórios com IA)
npm run dev
```

### 2. Acessar o Aplicativo

Abra: `http://localhost:3000` (Vercel) ou `http://localhost:5173` (Vite)

---

## 📋 FLUXO DE USO

### **Passo 1: Criar ou Selecionar Clínica**

1. No **header** do aplicativo, você verá um **dropdown**
2. Clique para ver lista de clínicas existentes
3. Opções:
   - **Nova Clínica**: Digite o nome e crie
   - **Selecionar existente**: Escolha da lista

> ⚠️ **Importante**: Sempre selecione/crie uma clínica antes de preencher dados!

---

### **Passo 2: Preencher os Questionários**

Navegue pelos módulos na **sidebar** e preencha:

#### **Módulo 1: Setup Wizard** ⚙️
- Tipo de clínica
- Localização
- Público-alvo
- Estágio atual
- Objetivo 2026

#### **Módulo 2A: Avaliação Operacional** 🏥
- Serviços oferecidos
- Infraestrutura
- Equipe
- Processos

#### **Módulo 2B: Avaliação de Mercado** 📊
- Descrição do mercado
- Concorrentes
- Pontos fortes e fracos
- Canais de aquisição

#### **Módulo 2C: Visão do Gestor** 👔
- Problemas principais
- Oportunidades
- Metas 2026
- Avaliações (processos, financeiro, satisfação)

#### **Módulo 3A: Identidade Estratégica** 🎯
- Razão de existir
- Valores
- Posicionamento de preço
- Foco estratégico

#### **Módulo 3B: Blue Ocean** 🌊
- Eliminar
- Reduzir
- Elevar
- Criar

#### **Módulo 3C: Jobs to be Done** 💼
- Jobs funcionais
- Jobs emocionais
- Jobs sociais

---

### **Passo 3: Gerar Relatórios com IA** 🤖

Após preencher os dados, vá para as páginas de relatórios:

#### **Relatórios Disponíveis:**

1. **📊 Diagnóstico Situacional** (`/diagnostic`)
   - Botão: "Gerar Diagnóstico com IA"
   - Tempo: ~15-20 segundos
   - Conteúdo: SWOT, análise operacional, insights

2. **🎯 Direcionamento Estratégico** (`/strategy`)
   - Botão: "Gerar Direcionamento Estratégico com IA"
   - Tempo: ~15-20 segundos
   - Conteúdo: Missão, visão, valores, BSC

3. **🔬 Análise Avançada** (`/advanced-analysis`)
   - Botão: "Gerar Análise Avançada com IA"
   - Tempo: ~20-25 segundos
   - Conteúdo: Porter, PESTEL, Políticas Orientadoras

4. **📈 Plano Tático** (`/tactical-plan`)
   - Botão: "Gerar Plano Tático com IA"
   - Tempo: ~15-20 segundos
   - Conteúdo: OKRs, KPIs, Iniciativas

5. **⚙️ Plano Operacional** (`/operational-plan`)
   - Botão: "Gerar Plano Operacional com IA"
   - Tempo: ~20-25 segundos
   - Conteúdo: Rotinas, SOPs, Checklists, Calendário

6. **📘 Relatório Final** (`/final-report`)
   - Botão: "Gerar Relatório Final com IA"
   - Tempo: ~25-30 segundos
   - Conteúdo: Consolidação completa de tudo

#### **Como Gerar:**

1. Clique no botão "Gerar... com IA"
2. Aguarde o loading (IA trabalhando)
3. Relatório aparece automaticamente
4. É salvo no banco de dados
5. Para regenerar, clique em "Regerar"

---

### **Passo 4: Salvar Dados** 💾

O aplicativo tem **salvamento automático** ao:
- Gerar relatórios (salva automaticamente)
- Usar o botão "Salvar" no header (manual)

> 💡 **Dica**: Clique em "Salvar" no header sempre que preencher dados importantes!

---

## 🎨 CUSTOMIZAÇÃO

### **Tom do Relatório**

Configurável no **Setup Wizard**:
- **Formal**: Linguagem técnica e corporativa
- **Informal**: Linguagem acessível e direta
- **Intermediário**: Equilíbrio entre os dois

### **Tamanho do Relatório**

- **Resumido (20 páginas)**: Conteúdo conciso
- **Detalhado (40 páginas)**: Análise profunda

---

## ⚡ DICAS DE USO

### ✅ Boas Práticas

1. **Preencha todos os questionários** antes de gerar relatórios
2. **Use dados reais** para melhores resultados da IA
3. **Salve frequentemente** para não perder dados
4. **Gere relatórios na ordem** (1 → 2 → 3 → 4 → 5 → Final)

### ⚠️ Evite

1. **Não feche o navegador** durante geração de relatórios
2. **Não gere múltiplos relatórios ao mesmo tempo**
3. **Não deixe de selecionar uma clínica** antes de começar

---

## 🐛 TROUBLESHOOTING

### Erro: "Nenhuma clínica selecionada"
**Solução**: Clique no dropdown no header e selecione/crie uma clínica

### Erro: "Erro ao gerar relatório"
**Possíveis causas**:
1. OpenAI API key inválida ou expirada
2. Limite de uso da OpenAI atingido
3. Dados insuficientes preenchidos

**Solução**:
1. Verifique a chave da OpenAI no `.env`
2. Verifique saldo em https://platform.openai.com/usage
3. Preencha mais dados nos questionários

### Relatório não aparece
**Solução**:
1. Aguarde o loading terminar completamente
2. Verifique o console do navegador (F12) para erros
3. Tente regenerar

### Dados não salvam
**Solução**:
1. Verifique se tem uma clínica selecionada
2. Verifique conexão com banco de dados
3. Veja logs do servidor (`vercel dev`)

---

## 📊 MONITORAMENTO

### Custos OpenAI

Cada relatório custa aproximadamente:
- **Diagnóstico**: ~$0.03-0.05
- **Estratégico**: ~$0.04-0.06
- **Avançado**: ~$0.05-0.08
- **Tático**: ~$0.03-0.05
- **Operacional**: ~$0.05-0.08
- **Final**: ~$0.08-0.12

**Total por clínica completa**: ~$0.30-0.50

Monitore em: https://platform.openai.com/usage

---

## 🚀 DEPLOY

### Deploy na Vercel

```bash
# Login
vercel login

# Deploy
vercel --prod
```

### Configurar Variáveis

No dashboard da Vercel:
1. Vá em **Settings** → **Environment Variables**
2. Adicione:
   - `DATABASE_URL`: Sua URL do Neon
   - `OPENAI_API_KEY`: Sua chave OpenAI

---

## 📞 SUPORTE

### Logs

```bash
# Ver logs locais
vercel dev --debug

# Ver logs de produção
vercel logs
```

### Documentação

- OpenAI: https://platform.openai.com/docs
- Neon: https://neon.tech/docs
- Vercel: https://vercel.com/docs

---

**Desenvolvido com ❤️ usando Claude Code + GPT-4**
