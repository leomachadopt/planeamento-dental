import pg from 'pg'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// JSON com as perguntas do bloco PEOPLE (corrigido)
const blockData = {
  "code": "PEOPLE_CULTURE_MANAGEMENT",
  "name": "Bloco 6 — Pessoas, Cultura & Gestão",
  "description": "Avalia se a clínica tem as pessoas certas, cultura clara, liderança funcional e sistema de gestão capaz de sustentar a estratégia e a operação.",
  "questions": [
    {
      "code": "PEOPLE_TEAM_MAP",
      "text": "Quem são hoje as pessoas-chave da clínica e qual é o papel real de cada uma no funcionamento do negócio?",
      "help_text": "Inclua donos, líderes, clínicos e funções críticas.",
      "type": "textarea",
      "required": true,
      "ai_importance_weight": 1.0,
      "validation_schema": { "min_length": 300, "max_length": 1500 },
      "context": {
        "why": "Você não gerencia um organograma — você gerencia pessoas e dependências reais.",
        "consequences": ["Risco oculto se alguém sair.", "Sobrecarga invisível.", "Decisões concentradas demais — time travado por gargalos humanos."],
        "how_to_answer": "Liste as pessoas e explique o que realmente depende de cada uma.",
        "good_examples": ["A clínica depende fortemente de duas pessoas para diagnóstico e de uma para gestão financeira.", "Sem a coordenadora, a operação perde controle."],
        "bad_examples": ["Temos uma equipe boa.", "Todos fazem de tudo.", "É uma equipe enxuta.", "Não sei."]
      }
    },
    {
      "code": "PEOPLE_KEY_DEPENDENCIES",
      "text": "De quais pessoas específicas a clínica depende demais hoje?",
      "help_text": "Identifique riscos de centralização.",
      "type": "textarea",
      "required": true,
      "ai_importance_weight": 1.0,
      "validation_schema": { "min_length": 220, "max_length": 900 },
      "context": {
        "why": "Negócio que depende de pessoas específicas é frágil.",
        "consequences": ["Risco alto de colapso.", "Impossibilidade de escalar.", "Estresse e sobrecarga.", "Decisões lentas."],
        "how_to_answer": "Nomeie funções e explique o risco.",
        "good_examples": ["Tudo passa por uma única pessoa.", "Só uma pessoa sabe fazer X."],
        "bad_examples": ["Não dependemos de ninguém.", "Todo mundo é importante.", "Não sei.", "A equipe é unida."]
      }
    },
    {
      "code": "PEOPLE_RIGHT_WRONG_SEATS",
      "text": "Você sente que hoje tem as pessoas certas nos lugares certos?",
      "help_text": "Explique onde sim e onde não.",
      "type": "textarea",
      "required": true,
      "ai_importance_weight": 0.95,
      "validation_schema": { "min_length": 220, "max_length": 900 },
      "context": {
        "why": "Pessoa errada no lugar errado destrói sistema.",
        "consequences": ["Retrabalho.", "Conflito.", "Queda de padrão.", "Gestão vira bombeiro."],
        "how_to_answer": "Seja honesto: onde há desalinhamento de perfil vs função.",
        "good_examples": ["Temos bons clínicos em cargos de gestão sem perfil.", "Temos gente boa em funções erradas."],
        "bad_examples": ["Sim, está tudo certo.", "Acho que sim.", "Depende.", "Não sei."]
      }
    },
    {
      "code": "PEOPLE_CULTURE_DEFINITION",
      "text": "Se você tivesse que descrever a cultura real da clínica hoje, como ela é de verdade?",
      "help_text": "Não descreva a cultura desejada — descreva a praticada.",
      "type": "textarea",
      "required": true,
      "ai_importance_weight": 0.9,
      "validation_schema": { "min_length": 250, "max_length": 1000 },
      "context": {
        "why": "Cultura é o que acontece quando ninguém está olhando.",
        "consequences": ["Valores viram cartaz.", "Comportamento real segue incentivos errados.", "Contratações erradas.", "Padrão instável."],
        "how_to_answer": "Descreva comportamentos reais tolerados e reforçados.",
        "good_examples": ["Cultura é muito dependente dos donos.", "Cultura de apagar incêndio.", "Cultura de responsabilidade forte."],
        "bad_examples": ["Temos uma cultura ótima.", "Nossa cultura é de excelência.", "Somos uma família.", "Não sei."]
      }
    },
    {
      "code": "PEOPLE_CULTURE_SUPPORTS_STRATEGY",
      "text": "A cultura atual ajuda ou atrapalha a estratégia da clínica?",
      "help_text": "Explique como.",
      "type": "textarea",
      "required": true,
      "ai_importance_weight": 0.95,
      "validation_schema": { "min_length": 220, "max_length": 900 },
      "context": {
        "why": "Cultura sempre vence estratégia.",
        "consequences": ["Plano nunca sai do papel.", "Execução fraca.", "Desalinhamento crônico.", "Frustração da liderança."],
        "how_to_answer": "Diga onde a cultura puxa para frente e onde puxa para trás.",
        "good_examples": ["Temos cultura de cuidado, mas fraca em processo.", "Temos cultura de esforço, mas fraca em padrão."],
        "bad_examples": ["Ajuda.", "Atrapalha.", "Depende.", "Não sei."]
      }
    },
    {
      "code": "PEOPLE_LEADERSHIP_MODEL",
      "text": "Como funciona hoje a liderança e a tomada de decisão na clínica?",
      "help_text": "Centralizada? Compartilhada? Confusa?",
      "type": "textarea",
      "required": true,
      "ai_importance_weight": 0.95,
      "validation_schema": { "min_length": 220, "max_length": 900 },
      "context": {
        "why": "Modelo de liderança define velocidade e qualidade de execução.",
        "consequences": ["Decisão lenta.", "Conflitos.", "Ambiguidade.", "Desresponsabilização."],
        "how_to_answer": "Explique quem decide o quê e como.",
        "good_examples": ["Tudo passa pelos donos.", "Algumas áreas já têm autonomia."],
        "bad_examples": ["Funciona.", "Normal.", "Depende.", "Não sei."]
      }
    },
    {
      "code": "PEOPLE_ACCOUNTABILITY",
      "text": "As pessoas têm metas claras e são cobradas de forma objetiva?",
      "help_text": "Explique se existe gestão por resultado ou só por esforço.",
      "type": "textarea",
      "required": true,
      "ai_importance_weight": 0.9,
      "validation_schema": { "min_length": 200, "max_length": 900 },
      "context": {
        "why": "Sem meta clara, padrão cai.",
        "consequences": ["Zona de conforto.", "Mediocridade tolerada.", "Conflitos pessoais.", "Gestão emocional."],
        "how_to_answer": "Descreva se existem metas, indicadores e consequências.",
        "good_examples": ["Temos metas para recepção e conversão, mas não para área clínica.", "Quase não existe cobrança estruturada."],
        "bad_examples": ["Confiamos nas pessoas.", "Não gostamos de cobrar.", "Depende.", "Não sei."]
      }
    },
    {
      "code": "PEOPLE_HIRING_FIRING",
      "text": "Quão rigoroso é hoje o processo de contratação e desligamento?",
      "help_text": "Explique se a clínica é exigente ou permissiva.",
      "type": "textarea",
      "required": true,
      "ai_importance_weight": 0.85,
      "validation_schema": { "min_length": 200, "max_length": 900 },
      "context": {
        "why": "Quem entra errado estraga cultura; quem fica errado destrói padrão.",
        "consequences": ["Time médio.", "Conflitos.", "Cultura fraca.", "Baixa performance."],
        "how_to_answer": "Explique critérios, testes e decisões difíceis.",
        "good_examples": ["Somos fracos em desligar.", "Contratamos mais por urgência do que por perfil."],
        "bad_examples": ["Quando precisa, contrata.", "Nunca mandamos ninguém embora.", "Depende.", "Não sei."]
      }
    },
    {
      "code": "PEOPLE_DEVELOPMENT",
      "text": "Como a clínica desenvolve pessoas e líderes internamente?",
      "help_text": "Treinamento, feedback, plano de crescimento.",
      "type": "textarea",
      "required": true,
      "ai_importance_weight": 0.85,
      "validation_schema": { "min_length": 200, "max_length": 900 },
      "context": {
        "why": "Sem desenvolvimento, o teto da clínica é o time atual.",
        "consequences": ["Estagnação.", "Dependência de contratação externa.", "Perda de talentos.", "Crescimento limitado."],
        "how_to_answer": "Explique rituais, planos e acompanhamento.",
        "good_examples": ["Treinamos só quando surge problema.", "Não temos plano estruturado."],
        "bad_examples": ["Aprendem na prática.", "Cada um corre atrás.", "Depende.", "Não sei."]
      }
    },
    {
      "code": "PEOPLE_OWNER_ROLE",
      "text": "Hoje os donos trabalham mais no negócio ou no negócio?",
      "help_text": "Explique onde está o tempo e a energia.",
      "type": "textarea",
      "required": true,
      "ai_importance_weight": 1.0,
      "validation_schema": { "min_length": 200, "max_length": 900 },
      "context": {
        "why": "Negócio só cresce quando dono sai do operacional crítico.",
        "consequences": ["Empresa travada.", "Dependência crônica.", "Esgotamento.", "Falta de visão estratégica."],
        "how_to_answer": "Descreva a agenda real dos donos.",
        "good_examples": ["Donos ainda são gargalo de decisão e diagnóstico.", "Pouco tempo para estratégia."],
        "bad_examples": ["Fazemos de tudo.", "Trabalhamos muito.", "Depende.", "Não sei."]
      }
    },
    {
      "code": "PEOPLE_CULTURE_PROMISE",
      "text": "Que tipo de comportamento é realmente recompensado e punido na clínica hoje?",
      "help_text": "Observe a prática, não o discurso.",
      "type": "textarea",
      "required": true,
      "ai_importance_weight": 0.9,
      "validation_schema": { "min_length": 220, "max_length": 900 },
      "context": {
        "why": "Incentivos reais moldam cultura real.",
        "consequences": ["Valores de fachada.", "Comportamento errado reforçado.", "Time confuso.", "Padrão cai."],
        "how_to_answer": "Descreva exemplos reais.",
        "good_examples": ["Quem apaga o fogo é valorizado.", "Quem segue processo nem sempre é reconhecido."],
        "bad_examples": ["Valorizamos todos.", "Depende.", "Não sei.", "Somos justos."]
      }
    }
  ]
}

async function importQuestions() {
  const client = await pool.connect()

  try {
    console.log('🚀 Importando perguntas do bloco PEOPLE...')
    console.log(`📋 Bloco: ${blockData.code}`)
    console.log(`📊 Perguntas: ${blockData.questions.length}`)

    // Extrair código da seção
    const sectionCode = blockData.code.split('_')[0]
    console.log(`🔍 Seção extraída: ${sectionCode}`)

    // Buscar seção
    const sectionResult = await client.query(
      'SELECT id, code, name FROM sections WHERE code = $1',
      [sectionCode]
    )

    if (sectionResult.rows.length === 0) {
      console.error(`❌ Seção '${sectionCode}' não encontrada`)
      process.exit(1)
    }

    const section = sectionResult.rows[0]
    console.log(`✅ Seção encontrada: ${section.name} (${section.id})`)

    // Verificar se já existe um question_set com este código
    let questionSet
    const existingQuestionSetResult = await client.query(
      `SELECT id, name, version FROM question_sets
       WHERE section_id = $1 AND code = $2 AND is_active = true
       ORDER BY version DESC LIMIT 1`,
      [section.id, blockData.code]
    )

    if (existingQuestionSetResult.rows.length > 0) {
      questionSet = existingQuestionSetResult.rows[0]
      console.log(`📦 Question Set existente encontrado: ${questionSet.name} (v${questionSet.version})`)
    } else {
      // Criar novo question_set
      const newQuestionSetResult = await client.query(
        `INSERT INTO question_sets (section_id, code, name, description, version, is_active)
         VALUES ($1, $2, $3, $4, 1, true)
         RETURNING id, name, version`,
        [section.id, blockData.code, blockData.name, blockData.description]
      )
      questionSet = newQuestionSetResult.rows[0]
      console.log(`✅ Novo Question Set criado: ${questionSet.name} (${questionSet.id})`)
    }

    // Verificar se a tabela question_contexts existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'question_contexts'
      )
    `)
    const hasQuestionContexts = tableCheck.rows[0]?.exists || false
    console.log(`📋 Tabela question_contexts existe: ${hasQuestionContexts}`)

    // Importar perguntas
    const importedQuestions = []
    const skippedQuestions = []

    for (let i = 0; i < blockData.questions.length; i++) {
      const questionData = blockData.questions[i]

      try {
        console.log(`\n📝 Processando pergunta ${i + 1}/${blockData.questions.length}: ${questionData.code}`)

        // Verificar se já existe pergunta com este código
        const existingQuestion = await client.query(
          'SELECT id, text FROM questions WHERE question_set_id = $1 AND code = $2',
          [questionSet.id, questionData.code]
        )

        if (existingQuestion.rows.length > 0) {
          console.log(`⚠️  Pergunta já existe: ${questionData.code}`)
          skippedQuestions.push({
            code: questionData.code,
            reason: 'Já existe'
          })
          continue
        }

        // Processar validation_schema
        let processedValidationSchema = null
        if (questionData.validation_schema && typeof questionData.validation_schema === 'object') {
          const cleaned = Object.fromEntries(
            Object.entries(questionData.validation_schema).filter(([_, v]) => v !== undefined && v !== null && v !== '')
          )
          if (Object.keys(cleaned).length > 0) {
            processedValidationSchema = JSON.stringify(cleaned)
          }
        }

        // Inserir pergunta
        const questionResult = await client.query(
          `INSERT INTO questions (
            question_set_id, code, text, help_text, type, required,
            order_index, validation_schema, ai_importance_weight
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *`,
          [
            questionSet.id,
            questionData.code,
            questionData.text,
            questionData.help_text || null,
            questionData.type,
            questionData.required || false,
            i,
            processedValidationSchema,
            questionData.ai_importance_weight || 0.5,
          ]
        )

        const question = questionResult.rows[0]
        console.log(`✅ Pergunta criada: ${question.code} (${question.id})`)

        // Inserir contexto se houver e se a tabela existir
        if (questionData.context && hasQuestionContexts) {
          const ctx = questionData.context
          await client.query(
            `INSERT INTO question_contexts (
              question_id, why, consequences, how_to_answer,
              good_examples, bad_examples,
              show_why, show_consequences, show_how_to_answer,
              show_good_examples, show_bad_examples
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              question.id,
              ctx.why || null,
              ctx.consequences && Array.isArray(ctx.consequences) ? ctx.consequences : null,
              ctx.how_to_answer || null,
              ctx.good_examples && Array.isArray(ctx.good_examples) ? ctx.good_examples : null,
              ctx.bad_examples && Array.isArray(ctx.bad_examples) ? ctx.bad_examples : null,
              true,
              true,
              true,
              true,
              true
            ]
          )
          console.log(`   ✅ Contexto criado`)
        }

        importedQuestions.push({
          id: question.id,
          code: question.code,
          text: question.text
        })

      } catch (error) {
        console.error(`❌ Erro ao processar pergunta ${questionData.code}:`, error.message)
      }
    }

    console.log('\n✅ Importação concluída')
    console.log(`   Importadas: ${importedQuestions.length}`)
    console.log(`   Ignoradas: ${skippedQuestions.length}`)

  } catch (error) {
    console.error('❌ Erro na importação:', error.message)
    console.error('🔍 Stack trace:', error.stack)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

importQuestions()
