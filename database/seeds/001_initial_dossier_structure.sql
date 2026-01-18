-- Seeds Iniciais: Estrutura do Dossiê
-- Insere seções, subseções, question_set v1 e perguntas iniciais para a seção Identidade

-- ============================================
-- 1. INSERIR SEÇÕES PRINCIPAIS
-- ============================================
INSERT INTO sections (code, name, order_index, description) VALUES
('IDENTITY', 'Identidade', 1, 'Definir quem a clínica é, por que ela existe, para quem ela existe e como ela escolhe competir. Base de todas as decisões estratégicas.'),
('BUSINESS', 'Modelo de Negócio', 2, 'Como a clínica cria, entrega e captura valor'),
('MARKET', 'Mercado', 3, 'Análise de mercado, concorrentes e oportunidades'),
('OFFER', 'Oferta', 4, 'Serviços, categorias e propostas de valor'),
('OPERATIONS', 'Operações', 5, 'Processos, capacidade e equipe'),
('STRATEGY', 'Estratégia', 6, 'Direcionamento estratégico e objetivos'),
('PLAN', 'Plano', 7, 'Planejamento tático e operacional'),
('FINAL_REPORT', 'Relatório Final', 8, 'Consolidação do dossiê')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 2. INSERIR SUBSEÇÕES PARA IDENTIDADE
-- ============================================
INSERT INTO subsections (section_id, code, name, order_index, description)
SELECT s.id, 'IDENTITY_PURPOSE', 'Propósito e Razão de Existir', 1, 'Definição do propósito organizacional'
FROM sections s WHERE s.code = 'IDENTITY'
ON CONFLICT (section_id, code) DO NOTHING;

INSERT INTO subsections (section_id, code, name, order_index, description)
SELECT s.id, 'IDENTITY_POSITIONING', 'Posicionamento e Identidade Futura', 2, 'Como queremos ser reconhecidos'
FROM sections s WHERE s.code = 'IDENTITY'
ON CONFLICT (section_id, code) DO NOTHING;

INSERT INTO subsections (section_id, code, name, order_index, description)
SELECT s.id, 'IDENTITY_VALUES', 'Valores e Princípios', 3, 'Valores inegociáveis da organização'
FROM sections s WHERE s.code = 'IDENTITY'
ON CONFLICT (section_id, code) DO NOTHING;

-- ============================================
-- 3. CRIAR QUESTION_SET V1 PARA IDENTIDADE
-- ============================================
DO $$
DECLARE
  v_section_id UUID;
  v_subsection_id UUID;
  v_question_set_id UUID;
BEGIN
  -- Obter IDs de section e subsection
  SELECT id INTO v_section_id FROM sections WHERE code = 'IDENTITY';
  SELECT id INTO v_subsection_id FROM subsections WHERE section_id = v_section_id AND code = 'IDENTITY_PURPOSE';
  
  -- Criar question_set se não existir
  INSERT INTO question_sets (section_id, subsection_id, name, version, is_active)
  VALUES (v_section_id, v_subsection_id, 'Questionário Identidade v1', 1, true)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_question_set_id;
  
  -- Se não retornou ID, buscar o existente
  IF v_question_set_id IS NULL THEN
    SELECT id INTO v_question_set_id FROM question_sets 
    WHERE section_id = v_section_id AND subsection_id = v_subsection_id AND version = 1;
  END IF;
  
  -- ============================================
  -- 4. INSERIR/ATUALIZAR PERGUNTAS (12 perguntas)
  -- ============================================
  IF v_question_set_id IS NOT NULL THEN
    -- BLOCO 1 — PROPÓSITO, VISÃO E VALORES
    
    -- Pergunta 1: Razão de Existir (Propósito)
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'IDENTITY_REASON', 'Razão de Existir (Propósito)', 'Em uma única frase, por que a clínica existe além de ganhar dinheiro? Que impacto real ela quer gerar na vida dos pacientes? Pense no resultado na vida do paciente, não no procedimento. Pense no "depois do tratamento".', 'textarea', true, 1, 0.9)
    ON CONFLICT (question_set_id, code) DO UPDATE SET
      text = EXCLUDED.text,
      help_text = EXCLUDED.help_text,
      ai_importance_weight = EXCLUDED.ai_importance_weight;
    
    -- Pergunta 2: Visão de Futuro (Reconhecimento em 3 anos)
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'IDENTITY_RECOGNITION_GOAL', 'Visão de Futuro (Reconhecimento em 3 anos)', 'Daqui a 3 anos, como você quer que as pessoas descrevam sua clínica quando falarem dela? Pense em reputação, não em tamanho. Complete mentalmente a frase: "Essa é aquela clínica que…"', 'textarea', true, 2, 0.9)
    ON CONFLICT (question_set_id, code) DO UPDATE SET
      text = EXCLUDED.text,
      help_text = EXCLUDED.help_text,
      ai_importance_weight = EXCLUDED.ai_importance_weight;
    
    -- Pergunta 3: Valores Inegociáveis
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'IDENTITY_VALUES', 'Valores Inegociáveis', 'Quais comportamentos e atitudes são inegociáveis na clínica? O que nunca deve acontecer, mesmo que gere lucro? Pense em situações reais: O que você não aceitaria de um profissional? Que tipo de paciente você prefere perder do que atender mal?', 'textarea', true, 3, 0.8)
    ON CONFLICT (question_set_id, code) DO UPDATE SET
      text = EXCLUDED.text,
      help_text = EXCLUDED.help_text,
      ai_importance_weight = EXCLUDED.ai_importance_weight;
    
    -- BLOCO 2 — PARA QUEM EXISTIMOS
    
    -- Pergunta 4: Público Prioritário deste Ciclo
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'IDENTITY_PRIORITY_AUDIENCE', 'Público Prioritário deste Ciclo', 'Entre todos os segmentos que você atende, qual será o PRIORITÁRIO nos próximos 12–24 meses? E qual você conscientemente NÃO vai priorizar? Escolha um foco principal e diga também qual tipo de paciente vai virar secundário.', 'textarea', true, 4, 0.9)
    ON CONFLICT (question_set_id, code) DO UPDATE SET
      text = EXCLUDED.text,
      help_text = EXCLUDED.help_text,
      ai_importance_weight = EXCLUDED.ai_importance_weight;
    
    -- BLOCO 3 — COMO GERAMOS VALOR
    
    -- Pergunta 5: Posicionamento de Preço
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'IDENTITY_PRICE_POSITIONING', 'Posicionamento de Preço', 'Como a clínica escolhe se posicionar em relação ao preço médio do mercado local?', 'single_select', true, 5, 0.7)
    ON CONFLICT (question_set_id, code) DO UPDATE SET
      text = EXCLUDED.text,
      help_text = EXCLUDED.help_text,
      ai_importance_weight = EXCLUDED.ai_importance_weight;
    
    -- Pergunta 5.1: Justificativa do Posicionamento de Preço (complementar obrigatória)
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'IDENTITY_PRICE_POSITIONING_JUSTIFICATION', 'O que justifica esse posicionamento?', 'O que justifica esse posicionamento? (técnica, experiência, estrutura, tempo de sessão, especialização, etc.)', 'textarea', true, 6, 0.6)
    ON CONFLICT (question_set_id, code) DO UPDATE SET
      text = EXCLUDED.text,
      help_text = EXCLUDED.help_text,
      ai_importance_weight = EXCLUDED.ai_importance_weight;
    
    -- BLOCO 4 — COMO VAMOS CRESCER
    
    -- Pergunta 6: Principal Motor de Crescimento
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'IDENTITY_STRATEGY_FOCUS', 'Principal Motor de Crescimento', 'Qual será o motor de crescimento principal da clínica neste ciclo?', 'single_select', true, 7, 0.8)
    ON CONFLICT (question_set_id, code) DO UPDATE SET
      text = EXCLUDED.text,
      help_text = EXCLUDED.help_text,
      ai_importance_weight = EXCLUDED.ai_importance_weight;
    
    -- Pergunta 6.1: Motor Secundário de Crescimento
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'IDENTITY_STRATEGY_FOCUS_SECONDARY', 'Motor Secundário de Crescimento', 'Qual será o motor secundário de crescimento?', 'single_select', true, 8, 0.7)
    ON CONFLICT (question_set_id, code) DO UPDATE SET
      text = EXCLUDED.text,
      help_text = EXCLUDED.help_text,
      ai_importance_weight = EXCLUDED.ai_importance_weight;
    
    -- Pergunta 7: Mudanças Necessárias
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'IDENTITY_STRATEGY_FOCUS_COMPLEMENT', 'Mudanças Necessárias', 'O que vai precisar mudar para sustentar essa estratégia? Divida em: Pessoas, Processos, Oferta/Serviços', 'textarea', true, 9, 0.6)
    ON CONFLICT (question_set_id, code) DO UPDATE SET
      text = EXCLUDED.text,
      help_text = EXCLUDED.help_text,
      required = EXCLUDED.required,
      ai_importance_weight = EXCLUDED.ai_importance_weight;
    
    -- BLOCO 5 — O CORAÇÃO DO FLIGHT PLAN
    
    -- Pergunta 8: Ações Críticas da Clínica
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'IDENTITY_CRITICAL_ACTIONS', 'Ações Críticas da Clínica', 'Quais são as 3 coisas que a clínica precisa fazer EXCEPCIONALMENTE BEM, todos os dias, para cumprir sua missão? Isso define o que realmente importa na operação.', 'textarea', true, 10, 0.9)
    ON CONFLICT (question_set_id, code) DO UPDATE SET
      text = EXCLUDED.text,
      help_text = EXCLUDED.help_text,
      ai_importance_weight = EXCLUDED.ai_importance_weight;
    
    -- Pergunta 9: Características-Chave da Clínica
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'IDENTITY_KEY_CHARACTERISTICS', 'Características-Chave da Clínica', 'Quais são as 3 características que a clínica precisa TER como identidade no dia a dia? Isso define o jeito de ser da clínica, não só o que ela faz.', 'textarea', true, 11, 0.9)
    ON CONFLICT (question_set_id, code) DO UPDATE SET
      text = EXCLUDED.text,
      help_text = EXCLUDED.help_text,
      ai_importance_weight = EXCLUDED.ai_importance_weight;
    
    -- BLOCO 6 — COERÊNCIA E FOCO
    
    -- Pergunta 10: O que a clínica NÃO quer ser
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'IDENTITY_WHAT_NOT_TO_BE', 'O que a clínica NÃO quer ser', 'Que tipo de clínica você NÃO quer construir, mesmo que isso pareça dar dinheiro? Toda boa estratégia tem uma lista do que não fazer.', 'textarea', true, 12, 0.8)
    ON CONFLICT (question_set_id, code) DO UPDATE SET
      text = EXCLUDED.text,
      help_text = EXCLUDED.help_text,
      ai_importance_weight = EXCLUDED.ai_importance_weight;
    
    -- ============================================
    -- 5. INSERIR/ATUALIZAR OPÇÕES PARA PERGUNTAS DE SELEÇÃO
    -- ============================================
    
    -- Opções para Posicionamento de Preço
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Mais acessível (custo-benefício)', 'Mais acessível', 1
    FROM questions q WHERE q.code = 'IDENTITY_PRICE_POSITIONING' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Intermediário (equilíbrio)', 'Intermediário', 2
    FROM questions q WHERE q.code = 'IDENTITY_PRICE_POSITIONING' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Premium / exclusivo (alto valor agregado)', 'Premium / exclusivo', 3
    FROM questions q WHERE q.code = 'IDENTITY_PRICE_POSITIONING' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    -- Opções para Principal Motor de Crescimento
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Mais pacientes (volume)', 'Mais pacientes', 1
    FROM questions q WHERE q.code = 'IDENTITY_STRATEGY_FOCUS' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Mais valor por paciente (ticket médio)', 'Mais valor por paciente', 2
    FROM questions q WHERE q.code = 'IDENTITY_STRATEGY_FOCUS' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    -- Opções para Motor Secundário de Crescimento
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Mais pacientes (volume)', 'Mais pacientes', 1
    FROM questions q WHERE q.code = 'IDENTITY_STRATEGY_FOCUS_SECONDARY' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Mais valor por paciente (ticket médio)', 'Mais valor por paciente', 2
    FROM questions q WHERE q.code = 'IDENTITY_STRATEGY_FOCUS_SECONDARY' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
  END IF;
END $$;



