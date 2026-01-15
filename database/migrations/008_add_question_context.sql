-- Migração 008: Adicionar tabela de contexto das perguntas
-- Permite armazenar contexto detalhado (why, consequences, examples) para cada pergunta
-- e controlar quais partes do contexto são exibidas

CREATE TABLE IF NOT EXISTS question_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  
  -- Conteúdo do contexto
  why TEXT,
  consequences TEXT[], -- Array de strings
  how_to_answer TEXT,
  good_examples TEXT[], -- Array de strings
  bad_examples TEXT[], -- Array de strings
  
  -- Configuração de visibilidade (quais partes mostrar)
  show_why BOOLEAN DEFAULT true,
  show_consequences BOOLEAN DEFAULT true,
  show_how_to_answer BOOLEAN DEFAULT true,
  show_good_examples BOOLEAN DEFAULT true,
  show_bad_examples BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(question_id)
);

CREATE INDEX IF NOT EXISTS idx_question_contexts_question_id ON question_contexts(question_id);

-- Comentários para documentação
COMMENT ON TABLE question_contexts IS 'Armazena contexto detalhado e orientações para cada pergunta do questionário';
COMMENT ON COLUMN question_contexts.why IS 'Explicação do porquê a pergunta é importante';
COMMENT ON COLUMN question_contexts.consequences IS 'Lista de consequências de não responder bem';
COMMENT ON COLUMN question_contexts.how_to_answer IS 'Orientações de como responder bem';
COMMENT ON COLUMN question_contexts.good_examples IS 'Exemplos de boas respostas';
COMMENT ON COLUMN question_contexts.bad_examples IS 'Exemplos de respostas ruins';
COMMENT ON COLUMN question_contexts.show_why IS 'Se deve mostrar a seção "Por que estamos perguntando isso?"';
COMMENT ON COLUMN question_contexts.show_consequences IS 'Se deve mostrar a seção "O que acontece sem isso?"';
COMMENT ON COLUMN question_contexts.show_how_to_answer IS 'Se deve mostrar a seção "Como responder bem?"';
COMMENT ON COLUMN question_contexts.show_good_examples IS 'Se deve mostrar exemplos de boas respostas';
COMMENT ON COLUMN question_contexts.show_bad_examples IS 'Se deve mostrar exemplos de respostas ruins';

