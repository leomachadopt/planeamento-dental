-- Seeds: Mercado
-- Insere subseções, question_set v1 e perguntas iniciais para a seção Mercado

-- ============================================
-- 1. INSERIR SUBSEÇÕES PARA MARKET
-- ============================================
INSERT INTO subsections (section_id, code, name, order_index, description)
SELECT s.id, 'MARKET_ANALYSIS', 'Análise de Mercado', 1, 'Características, tamanho e dinâmica do mercado local'
FROM sections s WHERE s.code = 'MARKET'
ON CONFLICT (section_id, code) DO NOTHING;

INSERT INTO subsections (section_id, code, name, order_index, description)
SELECT s.id, 'MARKET_COMPETITORS', 'Concorrência', 2, 'Análise dos concorrentes diretos e indiretos'
FROM sections s WHERE s.code = 'MARKET'
ON CONFLICT (section_id, code) DO NOTHING;

INSERT INTO subsections (section_id, code, name, order_index, description)
SELECT s.id, 'MARKET_OPPORTUNITIES', 'Oportunidades', 3, 'Oportunidades de crescimento e expansão no mercado'
FROM sections s WHERE s.code = 'MARKET'
ON CONFLICT (section_id, code) DO NOTHING;

-- ============================================
-- 2. CRIAR QUESTION_SET V1 PARA MARKET
-- ============================================
DO $$
DECLARE
  v_section_id UUID;
  v_subsection_id UUID;
  v_question_set_id UUID;
BEGIN
  -- Obter IDs de section e subsection
  SELECT id INTO v_section_id FROM sections WHERE code = 'MARKET';
  SELECT id INTO v_subsection_id FROM subsections WHERE section_id = v_section_id AND code = 'MARKET_ANALYSIS';
  
  -- Criar question_set se não existir
  INSERT INTO question_sets (section_id, subsection_id, name, version, is_active)
  VALUES (v_section_id, v_subsection_id, 'Questionário Mercado v1', 1, true)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_question_set_id;
  
  -- Se não retornou ID, buscar o existente
  IF v_question_set_id IS NULL THEN
    SELECT id INTO v_question_set_id FROM question_sets 
    WHERE section_id = v_section_id AND subsection_id = v_subsection_id AND version = 1;
  END IF;
  
  -- ============================================
  -- 3. INSERIR PERGUNTAS INICIAIS (10 perguntas)
  -- ============================================
  IF v_question_set_id IS NOT NULL THEN
    -- Pergunta 1: Tamanho do mercado
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'MARKET_SIZE', 'Qual é o tamanho do mercado local?', 'Descreva o mercado geográfico atendido pela clínica. Quantas pessoas potencialmente precisam de serviços odontológicos nessa região?', 'textarea', true, 1, 0.9)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 2: Taxa de crescimento
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'MARKET_GROWTH_RATE', 'Qual é a taxa de crescimento do mercado?', 'O mercado está crescendo, estável ou em declínio? Qual a velocidade dessa mudança?', 'single_select', true, 2, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 3: Tendências do mercado
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'MARKET_TRENDS', 'Quais são as principais tendências do mercado?', 'Identifique tendências relevantes: envelhecimento populacional, aumento de consciência sobre saúde bucal, novas tecnologias, mudanças de comportamento, etc.', 'textarea', true, 3, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 4: Número de concorrentes
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'MARKET_COMPETITORS_COUNT', 'Quantos concorrentes diretos existem?', 'Quantas outras clínicas odontológicas competem diretamente no mesmo mercado geográfico?', 'text', true, 4, 0.7)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 5: Diferenciais dos concorrentes
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'MARKET_COMPETITORS_DIFFERENTIATION', 'Quais são os principais diferenciais dos concorrentes?', 'O que os concorrentes fazem bem? Quais são seus pontos fortes e como se posicionam?', 'textarea', true, 5, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 6: Diferenciação da clínica
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'MARKET_OUR_DIFFERENTIATION', 'Como a clínica se diferencia da concorrência?', 'Quais são os principais diferenciais competitivos da clínica? O que a torna única no mercado?', 'textarea', true, 6, 0.9)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 7: Barreiras de entrada
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'MARKET_BARRIERS', 'Quais são as principais barreiras de entrada no mercado?', 'O que dificulta a entrada de novos concorrentes? (ex: investimento inicial, regulamentação, localização, reputação)', 'textarea', true, 7, 0.7)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 8: Oportunidades de expansão
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'MARKET_EXPANSION_OPPORTUNITIES', 'Existem oportunidades de expansão?', 'Há espaço para crescimento no mercado atual ou em novos mercados?', 'single_select', true, 8, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 9: Ameaças do mercado
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'MARKET_THREATS', 'Quais são as principais ameaças do mercado?', 'Identifique ameaças: novos concorrentes, mudanças regulatórias, crise econômica, mudanças tecnológicas, etc.', 'textarea', true, 9, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 10: Participação de mercado
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'MARKET_SHARE', 'Qual é a participação de mercado estimada?', 'Qual a participação aproximada da clínica no mercado local? (ex: 5%, 10%, líder de mercado, etc.)', 'text', true, 10, 0.7)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- ============================================
    -- 4. INSERIR OPÇÕES PARA PERGUNTAS DE SELEÇÃO
    -- ============================================
    
    -- Opções para Taxa de Crescimento
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Crescimento acelerado (acima de 10% ao ano)', 'Crescimento acelerado', 1
    FROM questions q WHERE q.code = 'MARKET_GROWTH_RATE' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Crescimento moderado (3-10% ao ano)', 'Crescimento moderado', 2
    FROM questions q WHERE q.code = 'MARKET_GROWTH_RATE' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Estável (0-3% ao ano)', 'Estável', 3
    FROM questions q WHERE q.code = 'MARKET_GROWTH_RATE' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Em declínio (negativo)', 'Em declínio', 4
    FROM questions q WHERE q.code = 'MARKET_GROWTH_RATE' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    -- Opções para Oportunidades de Expansão
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Sim, muitas oportunidades claras', 'Sim, muitas', 1
    FROM questions q WHERE q.code = 'MARKET_EXPANSION_OPPORTUNITIES' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Sim, algumas oportunidades', 'Sim, algumas', 2
    FROM questions q WHERE q.code = 'MARKET_EXPANSION_OPPORTUNITIES' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Poucas oportunidades', 'Poucas', 3
    FROM questions q WHERE q.code = 'MARKET_EXPANSION_OPPORTUNITIES' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Não, mercado saturado', 'Não, saturado', 4
    FROM questions q WHERE q.code = 'MARKET_EXPANSION_OPPORTUNITIES' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
  END IF;
END $$;



