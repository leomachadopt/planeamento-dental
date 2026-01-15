// Contexto completo das perguntas da seção Identidade
// Serve como guia para o usuário responder cada pergunta

export interface QuestionContext {
  why: string // Por que estamos perguntando isso
  howToAnswer?: string // Como responder bem
  goodExamples?: string[] // Exemplos bons
  badExamples?: string[] // Exemplos ruins
  consequences?: string[] // O que acontece sem isso
}

export const identityQuestionsContext: Record<string, QuestionContext> = {
  IDENTITY_REASON: {
    why: 'Essa é a bússola moral e estratégica da clínica. Uma clínica sem propósito claro tende a: aceitar qualquer tipo de paciente, fazer qualquer tipo de procedimento, tomar decisões só por dinheiro (não por direção), e perder identidade, foco e diferenciação ao longo do tempo. O propósito serve como critério de decisão, define quem você ajuda de verdade, define o que você aceita e o que você recusa fazer, e dá coerência para toda a estratégia.',
    consequences: [
      'Aceitar qualquer tipo de paciente',
      'Fazer qualquer tipo de procedimento',
      'Tomar decisões só por dinheiro, não por direção',
      'Perder identidade, foco e diferenciação ao longo do tempo',
    ],
    howToAnswer: 'Pense: ❌ Não no procedimento ✅ No resultado na vida do paciente. Complete mentalmente a frase: "Depois de passar pela nossa clínica, a vida do paciente é diferente porque…" Boas respostas geralmente: falam de transformação humana, falam de impacto real, não falam de tecnologia/tecnicas/especialidades, não parecem texto de marketing.',
    goodExamples: [
      'Existimos para devolver às pessoas a confiança em sorrir, comer e viver bem, ajudando pacientes que já perderam a esperança a recuperar não só a função mastigatória, mas também a autoestima, a segurança e a vontade de se relacionar, através de tratamentos éticos, humanos e duradouros.',
      'Nossa clínica existe para transformar histórias de frustração com a própria saúde bucal em histórias de reconquista de qualidade de vida, segurança pessoal e bem-estar, cuidando de cada paciente como um projeto único, e não como um procedimento isolado.',
    ],
    badExamples: [
      'Oferecer odontologia de qualidade com excelência e tecnologia.',
      'Atender nossos pacientes da melhor forma possível.',
      'Ser referência em tratamentos odontológicos.',
      'Cuidar do sorriso das pessoas.',
    ],
  },
  IDENTITY_RECOGNITION_GOAL: {
    why: 'Essa pergunta define para onde você está levando o negócio. Sem uma visão clara: a clínica cresce "para qualquer lado", aceita qualquer tipo de projeto/parceria/paciente, compra equipamentos e contrata pessoas sem critério estratégico, e confunde crescimento com progresso. A visão serve como filtro de decisão, define o que você vai construir (e o que não vai), dá direção para investimentos/marketing/estrutura, e cria coerência entre o hoje e o futuro desejado.',
    consequences: [
      'A clínica cresce "para qualquer lado"',
      'Aceita qualquer tipo de projeto, parceria ou paciente',
      'Compra equipamentos e contrata pessoas sem critério estratégico',
      'Confunde crescimento com progresso',
    ],
    howToAnswer: 'Pense menos em: ❌ Tamanho ❌ Faturamento ❌ Quantidade de unidades. E mais em: ✅ Reputação ✅ Tipo de problema que você resolve ✅ Como as pessoas descrevem você para outras. Complete mentalmente: "Essa é aquela clínica que…" Boas respostas: falam de posição no mercado (não de vaidade), falam de tipo de caso resolvido (não de tecnologia), falam de confiança e reconhecimento (não de números), soam como algo que um paciente ou outro médico diria.',
    goodExamples: [
      'Essa é aquela clínica que resolve casos que ninguém mais resolve.',
      'Essa é a clínica mais confiável para reabilitação de coluna da cidade.',
      'Essa é a clínica onde todo mundo indica de olhos fechados.',
    ],
    badExamples: [
      'Ser a maior rede de clínicas da região.',
      'Ter faturamento de X milhões.',
      'Ter 10 unidades em 3 anos.',
      'Ser referência em tecnologia de ponta.',
    ],
  },
  IDENTITY_VALUES: {
    why: 'Valores não são frases bonitas na parede. Eles são critérios de decisão difíceis.',
    howToAnswer: 'Pense em situações reais: O que você não aceitaria de um profissional? Que tipo de paciente você prefere perder do que atender mal?',
    goodExamples: [
      'Nunca prometer resultado que não sabemos entregar.',
      'Nunca tratar paciente com pressa ou descaso.',
      'Nunca sacrificar qualidade técnica por volume.',
    ],
  },
  IDENTITY_PRIORITY_AUDIENCE: {
    why: 'Toda estratégia é uma escolha e uma renúncia. Se você não escolhe: sua agenda escolhe, o mercado escolhe, o acaso escolhe.',
    howToAnswer: 'Escolha um foco principal. Diga também qual tipo de paciente vai virar secundário.',
    goodExamples: [
      'Vamos priorizar mulheres 40+ com dor crônica de coluna. Vamos deixar de focar em atendimentos rápidos e genéricos de convênio.',
    ],
  },
  IDENTITY_PRICE_POSITIONING: {
    why: 'Preço é posicionamento estratégico, não só número.',
  },
  IDENTITY_PRICE_POSITIONING_JUSTIFICATION: {
    why: 'A justificativa do posicionamento de preço demonstra o valor real oferecido pela clínica.',
  },
  IDENTITY_STRATEGY_FOCUS: {
    why: 'Essas duas estratégias (volume vs. valor) exigem clínicas completamente diferentes.',
  },
  IDENTITY_STRATEGY_FOCUS_SECONDARY: {
    why: 'O motor secundário complementa a estratégia principal e ajuda a balancear o crescimento.',
  },
  IDENTITY_STRATEGY_FOCUS_COMPLEMENT: {
    why: 'Estratégia sem mudança é fantasia.',
    howToAnswer: 'Divida em: Pessoas, Processos, Oferta/Serviços',
  },
  IDENTITY_CRITICAL_ACTIONS: {
    why: 'Isso define o que realmente importa na operação.',
    goodExamples: [
      'Garantir que todo paciente saia com plano claro de tratamento.',
      'Reduzir faltas e abandono de tratamento.',
      'Manter padrão técnico alto em todas as sessões.',
    ],
  },
  IDENTITY_KEY_CHARACTERISTICS: {
    why: 'Isso define o jeito de ser da clínica, não só o que ela faz.',
    goodExamples: [
      'Acolhedora, mas extremamente técnica.',
      'Pontual e organizada.',
      'Exigente com resultado.',
    ],
  },
  IDENTITY_WHAT_NOT_TO_BE: {
    why: 'Toda boa estratégia tem uma lista do que não fazer.',
  },
}

