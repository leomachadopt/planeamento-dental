import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const API_URL = 'http://localhost:3000'

// JSON com as perguntas do bloco PEOPLE (corrigido)
const blockData = {
  "block": {
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
        "options": [],
        "context": {
          "why": "Você não gerencia um organograma — você gerencia pessoas e dependências reais.",
          "consequences": [
            "Risco oculto se alguém sair.",
            "Sobrecarga invisível.",
            "Decisões concentradas demais — time travado por gargalos humanos."
          ],
          "how_to_answer": "Liste as pessoas e explique o que realmente depende de cada uma.",
          "good_examples": [
            "A clínica depende fortemente de duas pessoas para diagnóstico e de uma para gestão financeira.",
            "Sem a coordenadora, a operação perde controle."
          ],
          "bad_examples": [
            "Temos uma equipe boa.",
            "Todos fazem de tudo.",
            "É uma equipe enxuta.",
            "Não sei."
          ],
          "show_why": true, "show_consequences": true, "show_how_to_answer": true, "show_good_examples": true, "show_bad_examples": true
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
        "options": [],
        "context": {
          "why": "Negócio que depende de pessoas específicas é frágil.",
          "consequences": [
            "Risco alto de colapso.",
            "Impossibilidade de escalar.",
            "Estresse e sobrecarga.",
            "Decisões lentas."
          ],
          "how_to_answer": "Nomeie funções e explique o risco.",
          "good_examples": [
            "Tudo passa por uma única pessoa.",
            "Só uma pessoa sabe fazer X."
          ],
          "bad_examples": [
            "Não dependemos de ninguém.",
            "Todo mundo é importante.",
            "Não sei.",
            "A equipe é unida."
          ],
          "show_why": true, "show_consequences": true, "show_how_to_answer": true, "show_good_examples": true, "show_bad_examples": true
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
        "options": [],
        "context": {
          "why": "Pessoa errada no lugar errado destrói sistema.",
          "consequences": [
            "Retrabalho.",
            "Conflito.",
            "Queda de padrão.",
            "Gestão vira bombeiro."
          ],
          "how_to_answer": "Seja honesto: onde há desalinhamento de perfil vs função.",
          "good_examples": [
            "Temos bons clínicos em cargos de gestão sem perfil.",
            "Temos gente boa em funções erradas."
          ],
          "bad_examples": [
            "Sim, está tudo certo.",
            "Acho que sim.",
            "Depende.",
            "Não sei."
          ],
          "show_why": true, "show_consequences": true, "show_how_to_answer": true, "show_good_examples": true, "show_bad_examples": true
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
        "options": [],
        "context": {
          "why": "Cultura é o que acontece quando ninguém está olhando.",
          "consequences": [
            "Valores viram cartaz.",
            "Comportamento real segue incentivos errados.",
            "Contratações erradas.",
            "Padrão instável."
          ],
          "how_to_answer": "Descreva comportamentos reais tolerados e reforçados.",
          "good_examples": [
            "Cultura é muito dependente dos donos.",
            "Cultura de apagar incêndio.",
            "Cultura de responsabilidade forte."
          ],
          "bad_examples": [
            "Temos uma cultura ótima.",
            "Nossa cultura é de excelência.",
            "Somos uma família.",
            "Não sei."
          ],
          "show_why": true, "show_consequences": true, "show_how_to_answer": true, "show_good_examples": true, "show_bad_examples": true
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
        "options": [],
        "context": {
          "why": "Cultura sempre vence estratégia.",
          "consequences": [
            "Plano nunca sai do papel.",
            "Execução fraca.",
            "Desalinhamento crônico.",
            "Frustração da liderança."
          ],
          "how_to_answer": "Diga onde a cultura puxa para frente e onde puxa para trás.",
          "good_examples": [
            "Temos cultura de cuidado, mas fraca em processo.",
            "Temos cultura de esforço, mas fraca em padrão."
          ],
          "bad_examples": [
            "Ajuda.",
            "Atrapalha.",
            "Depende.",
            "Não sei."
          ],
          "show_why": true, "show_consequences": true, "show_how_to_answer": true, "show_good_examples": true, "show_bad_examples": true
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
        "options": [],
        "context": {
          "why": "Modelo de liderança define velocidade e qualidade de execução.",
          "consequences": [
            "Decisão lenta.",
            "Conflitos.",
            "Ambiguidade.",
            "Desresponsabilização."
          ],
          "how_to_answer": "Explique quem decide o quê e como.",
          "good_examples": [
            "Tudo passa pelos donos.",
            "Algumas áreas já têm autonomia."
          ],
          "bad_examples": [
            "Funciona.",
            "Normal.",
            "Depende.",
            "Não sei."
          ],
          "show_why": true, "show_consequences": true, "show_how_to_answer": true, "show_good_examples": true, "show_bad_examples": true
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
        "options": [],
        "context": {
          "why": "Sem meta clara, padrão cai.",
          "consequences": [
            "Zona de conforto.",
            "Mediocridade tolerada.",
            "Conflitos pessoais.",
            "Gestão emocional."
          ],
          "how_to_answer": "Descreva se existem metas, indicadores e consequências.",
          "good_examples": [
            "Temos metas para recepção e conversão, mas não para área clínica.",
            "Quase não existe cobrança estruturada."
          ],
          "bad_examples": [
            "Confiamos nas pessoas.",
            "Não gostamos de cobrar.",
            "Depende.",
            "Não sei."
          ],
          "show_why": true, "show_consequences": true, "show_how_to_answer": true, "show_good_examples": true, "show_bad_examples": true
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
        "options": [],
        "context": {
          "why": "Quem entra errado estraga cultura; quem fica errado destrói padrão.",
          "consequences": [
            "Time médio.",
            "Conflitos.",
            "Cultura fraca.",
            "Baixa performance."
          ],
          "how_to_answer": "Explique critérios, testes e decisões difíceis.",
          "good_examples": [
            "Somos fracos em desligar.",
            "Contratamos mais por urgência do que por perfil."
          ],
          "bad_examples": [
            "Quando precisa, contrata.",
            "Nunca mandamos ninguém embora.",
            "Depende.",
            "Não sei."
          ],
          "show_why": true, "show_consequences": true, "show_how_to_answer": true, "show_good_examples": true, "show_bad_examples": true
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
        "options": [],
        "context": {
          "why": "Sem desenvolvimento, o teto da clínica é o time atual.",
          "consequences": [
            "Estagnação.",
            "Dependência de contratação externa.",
            "Perda de talentos.",
            "Crescimento limitado."
          ],
          "how_to_answer": "Explique rituais, planos e acompanhamento.",
          "good_examples": [
            "Treinamos só quando surge problema.",
            "Não temos plano estruturado."
          ],
          "bad_examples": [
            "Aprendem na prática.",
            "Cada um corre atrás.",
            "Depende.",
            "Não sei."
          ],
          "show_why": true, "show_consequences": true, "show_how_to_answer": true, "show_good_examples": true, "show_bad_examples": true
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
        "options": [],
        "context": {
          "why": "Negócio só cresce quando dono sai do operacional crítico.",
          "consequences": [
            "Empresa travada.",
            "Dependência crônica.",
            "Esgotamento.",
            "Falta de visão estratégica."
          ],
          "how_to_answer": "Descreva a agenda real dos donos.",
          "good_examples": [
            "Donos ainda são gargalo de decisão e diagnóstico.",
            "Pouco tempo para estratégia."
          ],
          "bad_examples": [
            "Fazemos de tudo.",
            "Trabalhamos muito.",
            "Depende.",
            "Não sei."
          ],
          "show_why": true, "show_consequences": true, "show_how_to_answer": true, "show_good_examples": true, "show_bad_examples": true
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
        "options": [],
        "context": {
          "why": "Incentivos reais moldam cultura real.",
          "consequences": [
            "Valores de fachada.",
            "Comportamento errado reforçado.",
            "Time confuso.",
            "Padrão cai."
          ],
          "how_to_answer": "Descreva exemplos reais.",
          "good_examples": [
            "Quem apaga o fogo é valorizado.",
            "Quem segue processo nem sempre é reconhecido."
          ],
          "bad_examples": [
            "Valorizamos todos.",
            "Depende.",
            "Não sei.",
            "Somos justos."
          ],
          "show_why": true, "show_consequences": true, "show_how_to_answer": true, "show_good_examples": true, "show_bad_examples": true
        }
      }
    ]
  }
}

async function importQuestions() {
  try {
    console.log('🚀 Importando perguntas do bloco PEOPLE...')
    console.log(`📋 Total de perguntas: ${blockData.block.questions.length}`)

    const response = await fetch(`${API_URL}/api/admin/questions/bulk-import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ADMIN_TOKEN || 'admin-token-here'}`
      },
      body: JSON.stringify(blockData)
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('❌ Erro na importação:', result.error)
      console.error('   Detalhes:', result.details || result.hint)
      process.exit(1)
    }

    console.log('\n✅ Importação concluída com sucesso!')
    console.log(`   Importadas: ${result.summary.imported}`)
    console.log(`   Ignoradas: ${result.summary.skipped}`)
    console.log(`   Erros: ${result.summary.errors}`)

    if (result.summary.imported > 0) {
      console.log('\n📝 Perguntas importadas:')
      result.imported.forEach(q => {
        console.log(`   - ${q.code}`)
      })
    }

    if (result.summary.skipped > 0) {
      console.log('\n⚠️  Perguntas ignoradas:')
      result.skipped.forEach(q => {
        console.log(`   - ${q.code}: ${q.reason}`)
      })
    }

    if (result.summary.errors > 0) {
      console.log('\n❌ Erros:')
      result.errors.forEach(e => {
        console.log(`   - ${e.code}: ${e.error}`)
      })
    }

  } catch (error) {
    console.error('❌ Erro ao importar:', error.message)
    process.exit(1)
  }
}

importQuestions()
