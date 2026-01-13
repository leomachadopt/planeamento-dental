-- Seeds Iniciais: Estrutura do Dossiê
-- Insere seções, subseções, question_set v1 e perguntas iniciais para a seção Identidade

-- ============================================
-- 1. INSERIR SEÇÕES PRINCIPAIS
-- ============================================
INSERT INTO sections (code, name, order_index, description) VALUES
('IDENTITY', 'Identidade', 1, 'Fundação estratégica: propósito, valores, posicionamento'),
('BUSINESS_MODEL', 'Modelo de Negócio', 2, 'Como a clínica cria, entrega e captura valor'),
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
  -- 4. INSERIR PERGUNTAS INICIAIS (7 perguntas)
  -- ============================================
  IF v_question_set_id IS NOT NULL THEN
    -- Pergunta 1: Razão de Existir
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'IDENTITY_REASON', 'Razão de Existir (Propósito)', 'Em uma única frase, por que a clínica existe além do lucro? Qual impacto ela busca gerar na vida dos pacientes?', 'textarea', true, 1, 0.9)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 2: Identidade Futura
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'IDENTITY_RECOGNITION_GOAL', 'Identidade Futura (Reconhecimento)', 'Em até 3 anos, como você quer que a clínica seja reconhecida pelo mercado?', 'textarea', true, 2, 0.9)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 3: Valores
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'IDENTITY_VALUES', 'Valores Inegociáveis', 'Quais valores são inegociáveis na clínica? O que nunca será tolerado, mesmo que gere lucro?', 'textarea', true, 3, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 4: Público Prioritário
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'IDENTITY_PRIORITY_AUDIENCE', 'Público Prioritário (2026)', 'Qual é o tipo de paciente que a clínica quer priorizar em 2026?', 'textarea', true, 4, 0.9)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 5: Posicionamento de Preço
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'IDENTITY_PRICE_POSITIONING', 'Posicionamento de Preço', 'Como a clínica escolhe se posicionar em relação ao preço médio do mercado local?', 'single_select', true, 5, 0.7)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 6: Foco do Crescimento
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'IDENTITY_STRATEGY_FOCUS', 'Foco do Crescimento', 'Qual será o principal motor de crescimento da clínica neste ciclo?', 'single_select', true, 6, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 7: Mudanças Necessárias
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'IDENTITY_STRATEGY_FOCUS_COMPLEMENT', 'Mudanças Necessárias', 'O que precisará mudar na clínica para sustentar essa escolha?', 'textarea', false, 7, 0.6)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- ============================================
    -- 5. INSERIR OPÇÕES PARA PERGUNTAS DE SELEÇÃO
    -- ============================================
    
    -- Opções para Posicionamento de Preço
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Mais acessível (foco em custo-benefício)', 'Mais acessível', 1
    FROM questions q WHERE q.code = 'IDENTITY_PRICE_POSITIONING' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Intermediário (equilíbrio preço x valor)', 'Intermediário', 2
    FROM questions q WHERE q.code = 'IDENTITY_PRICE_POSITIONING' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Premium / exclusivo (alto valor agregado)', 'Premium / exclusivo', 3
    FROM questions q WHERE q.code = 'IDENTITY_PRICE_POSITIONING' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    -- Opções para Foco do Crescimento
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Mais pacientes (volume)', 'Mais pacientes', 1
    FROM questions q WHERE q.code = 'IDENTITY_STRATEGY_FOCUS' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Mais valor por paciente (ticket médio maior)', 'Mais valor por paciente', 2
    FROM questions q WHERE q.code = 'IDENTITY_STRATEGY_FOCUS' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

