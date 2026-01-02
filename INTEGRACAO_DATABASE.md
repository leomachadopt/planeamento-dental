# Integração com Banco de Dados Neon

Este documento descreve a integração do aplicativo com o banco de dados PostgreSQL do Neon.

## 📋 Pré-requisitos

1. Conta no Neon (https://neon.tech)
2. Banco de dados criado no Neon
3. String de conexão do banco de dados

## 🚀 Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com a seguinte variável:

```env
VITE_DATABASE_URL=postgresql://usuario:senha@host:porta/database?sslmode=require
```

**Importante**: Use a string de conexão completa fornecida pelo Neon.

### 2. Executar o Schema SQL

Execute o arquivo `database/schema.sql` no seu banco de dados Neon para criar todas as tabelas necessárias.

Você pode fazer isso de duas formas:

#### Opção A: Via Interface Web do Neon
1. Acesse o dashboard do Neon
2. Vá em "SQL Editor"
3. Cole o conteúdo do arquivo `database/schema.sql`
4. Execute o script

#### Opção B: Via psql (linha de comando)
```bash
psql 'postgresql://neondb_owner:npg_MHmiVaQ1rgC5@ep-polished-shape-abrhnz6l-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' -f database/schema.sql
```

## 📊 Estrutura do Banco de Dados

O banco de dados contém as seguintes tabelas principais:

- **clinics**: Clínicas cadastradas
- **clinic_configs**: Configuração inicial de cada clínica
- **porter_analysis**: Análise de Porter (5 forças)
- **rumelt_diagnosis**: Diagnóstico de Rumelt
- **operational_assessments**: Avaliação operacional
- **market_assessments**: Avaliação de mercado
- **manager_visions**: Visão do gestor
- **identities**: Identidade estratégica
- **blue_ocean_items**: Itens do Blue Ocean
- **jtbd_items**: Jobs to be Done
- **okrs**: OKRs (Objectives and Key Results)
- **key_results**: Key Results dos OKRs
- **actions**: Ações/Itens de ação
- **reports**: Relatórios gerados (armazenados como JSON)

## 🔧 Uso no Aplicativo

### Criar Nova Clínica

```typescript
import { useStrategyStore } from '@/stores/useStrategyStore'

const { createNewClinic } = useStrategyStore()
const clinicId = await createNewClinic('Nome da Clínica')
```

### Carregar Dados de uma Clínica

```typescript
const { loadClinicData } = useStrategyStore()
await loadClinicData(clinicId)
```

### Salvar Dados Atuais

```typescript
const { saveClinicData } = useStrategyStore()
await saveClinicData()
```

### Auto-save (Opcional)

Você pode implementar auto-save adicionando um listener no store:

```typescript
// Exemplo: salvar automaticamente após mudanças
useStrategyStore.subscribe((state) => {
  if (state.currentClinicId && !state.isSaving) {
    // Debounce para evitar muitas chamadas
    const timeout = setTimeout(() => {
      state.saveClinicData()
    }, 2000)
    return () => clearTimeout(timeout)
  }
})
```

## 📝 Serviços Disponíveis

Todos os serviços estão em `src/services/clinicService.ts`:

- `createClinic()`: Criar nova clínica
- `getClinic()`: Obter dados de uma clínica
- `getAllClinics()`: Listar todas as clínicas
- `saveConfigInicial()`: Salvar configuração inicial
- `savePorterAnalysis()`: Salvar análise de Porter
- `saveRumeltDiagnosis()`: Salvar diagnóstico Rumelt
- `saveOperationalAssessment()`: Salvar avaliação operacional
- `saveMarketAssessment()`: Salvar avaliação de mercado
- `saveManagerVision()`: Salvar visão do gestor
- `saveIdentity()`: Salvar identidade estratégica
- `saveBlueOcean()`: Salvar Blue Ocean
- `saveJTBD()`: Salvar Jobs to be Done
- `saveOKRs()`: Salvar OKRs
- `saveActions()`: Salvar ações
- `saveReport()`: Salvar relatório
- `loadAllClinicData()`: Carregar todos os dados de uma clínica
- `saveAllClinicData()`: Salvar todos os dados de uma clínica

## ⚠️ Notas Importantes

1. **Segurança**: Nunca commite o arquivo `.env` com credenciais reais
2. **Performance**: O pool de conexões está configurado para até 20 conexões simultâneas
3. **Erros**: Todos os erros são logados no console e exibidos via toast para o usuário
4. **Validação**: O banco de dados possui constraints e validações para garantir integridade

## 🐛 Troubleshooting

### Erro de Conexão
- Verifique se a string de conexão está correta
- Confirme que o banco está acessível
- Verifique se o SSL está configurado corretamente

### Erro de Schema
- Certifique-se de que todas as tabelas foram criadas
- Verifique se os índices foram criados corretamente

### Erro ao Salvar
- Verifique os logs do console para mais detalhes
- Confirme que todos os campos obrigatórios estão preenchidos

## 📚 Recursos Adicionais

- [Documentação do Neon](https://neon.tech/docs)
- [Documentação do pg (PostgreSQL para Node.js)](https://node-postgres.com/)

