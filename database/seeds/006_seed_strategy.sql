-- Seeds: Estratégia
-- Insere subseções, question_set v1 e perguntas iniciais para a seção Estratégia

-- ============================================
-- 1. INSERIR SUBSEÇÕES PARA STRATEGY
-- ============================================
INSERT INTO subsections (section_id, code, name, order_index, description)
SELECT s.id, 'STRATEGY_DIRECTION', 'Direcionamento Estratégico', 1, 'Rumo e direção estratégica da clínica'
FROM sections s WHERE s.code = 'STRATEGY'
ON CONFLICT (section_id, code) DO NOTHING;

INSERT INTO subsections (section_id, code, name, order_index, description)
SELECT s.id, 'STRATEGY_OBJECTIVES', 'Objetivos e Metas', 2, 'Objetivos estratégicos e metas de longo prazo'
FROM sections s WHERE s.code = 'STRATEGY'
ON CONFLICT (section_id, code) DO NOTHING;

INSERT INTO subsections (section_id, code, name, order_index, description)
SELECT s.id, 'STRATEGY_CHOICES', 'Escolhas Estratégicas', 3, 'Decisões estratégicas fundamentais'
FROM sections s WHERE s.code = 'STRATEGY'
ON CONFLICT (section_id, code) DO NOTHING;

-- ============================================
-- 2. CRIAR QUESTION_SET V1 PARA STRATEGY
-- ============================================
DO $$
DECLARE
  v_section_id UUID;
  v_subsection_id UUID;
  v_question_set_id UUID;
BEGIN
  -- Obter IDs de section e subsection
  SELECT id INTO v_section_id FROM sections WHERE code = 'STRATEGY';
  SELECT id INTO v_subsection_id FROM subsections WHERE section_id = v_section_id AND code = 'STRATEGY_DIRECTION';
  
  -- Criar question_set se não existir
  INSERT INTO question_sets (section_id, subsection_id, name, version, is_active)
  VALUES (v_section_id, v_subsection_id, 'Questionário Estratégia v1', 1, true)
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
    -- Pergunta 1: Direção estratégica
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'STRATEGY_DIRECTION', 'Qual é a direção estratégica da clínica?', 'Para onde a clínica quer ir? Qual é o rumo estratégico nos próximos anos?', 'textarea', true, 1, 0.9)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 2: Objetivos estratégicos
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'STRATEGY_OBJECTIVES', 'Quais são os objetivos estratégicos principais?', 'Liste os principais objetivos estratégicos de longo prazo da clínica: crescimento, qualidade, expansão, inovação, etc.', 'textarea', true, 2, 0.9)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 3: Horizonte de planejamento
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'STRATEGY_PLANNING_HORIZON', 'Qual é o horizonte de planejamento?', 'Qual o período de tempo considerado no planejamento estratégico?', 'single_select', true, 3, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 4: Escolhas estratégicas fundamentais
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'STRATEGY_FUNDAMENTAL_CHOICES', 'Quais são as escolhas estratégicas fundamentais?', 'Quais são as decisões estratégicas mais importantes que a clínica precisa fazer? (ex: expandir, especializar, inovar, etc.)', 'textarea', true, 4, 0.9)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 5: Priorização de iniciativas
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'STRATEGY_INITIATIVES_PRIORITIZATION', 'Como a clínica prioriza iniciativas?', 'Qual o critério usado para decidir quais iniciativas são mais importantes? (impacto, urgência, recursos, etc.)', 'textarea', true, 5, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 6: Riscos estratégicos
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'STRATEGY_RISKS', 'Quais são os principais riscos estratégicos?', 'Identifique os principais riscos que podem impactar a estratégia: concorrência, mudanças regulatórias, crise econômica, etc.', 'textarea', true, 6, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 7: Medição de sucesso
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'STRATEGY_SUCCESS_METRICS', 'Como a clínica mede o sucesso estratégico?', 'Quais indicadores ou métricas são usados para avaliar se a estratégia está funcionando?', 'textarea', true, 7, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 8: Alianças e parcerias
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'STRATEGY_PARTNERSHIPS', 'Existem alianças ou parcerias estratégicas?', 'A clínica possui parcerias estratégicas com outras empresas, profissionais ou instituições?', 'single_select', true, 8, 0.7)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 9: Estratégia de crescimento
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'STRATEGY_GROWTH_STRATEGY', 'Qual é a estratégia de crescimento?', 'Como a clínica planeja crescer? Expansão geográfica, novos serviços, mais pacientes, etc.', 'single_select', true, 9, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 10: Desafios estratégicos
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'STRATEGY_CHALLENGES', 'Quais são os principais desafios estratégicos?', 'Quais são os maiores desafios que a clínica enfrenta para alcançar seus objetivos estratégicos?', 'textarea', true, 10, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- ============================================
    -- 4. INSERIR OPÇÕES PARA PERGUNTAS DE SELEÇÃO
    -- ============================================
    
    -- Opções para Horizonte de Planejamento
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Curto prazo (1 ano)', '1 ano', 1
    FROM questions q WHERE q.code = 'STRATEGY_PLANNING_HORIZON' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Médio prazo (2-3 anos)', '2-3 anos', 2
    FROM questions q WHERE q.code = 'STRATEGY_PLANNING_HORIZON' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Longo prazo (4-5 anos)', '4-5 anos', 3
    FROM questions q WHERE q.code = 'STRATEGY_PLANNING_HORIZON' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Muito longo prazo (5+ anos)', '5+ anos', 4
    FROM questions q WHERE q.code = 'STRATEGY_PLANNING_HORIZON' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    -- Opções para Alianças e Parcerias
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Sim, temos parcerias estratégicas ativas', 'Sim, ativas', 1
    FROM questions q WHERE q.code = 'STRATEGY_PARTNERSHIPS' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Parcialmente, algumas parcerias', 'Parcialmente', 2
    FROM questions q WHERE q.code = 'STRATEGY_PARTNERSHIPS' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Não, operamos de forma independente', 'Não, independente', 3
    FROM questions q WHERE q.code = 'STRATEGY_PARTNERSHIPS' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    -- Opções para Estratégia de Crescimento
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Crescimento orgânico (mais pacientes no mesmo local)', 'Orgânico', 1
    FROM questions q WHERE q.code = 'STRATEGY_GROWTH_STRATEGY' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Expansão geográfica (novos locais)', 'Expansão geográfica', 2
    FROM questions q WHERE q.code = 'STRATEGY_GROWTH_STRATEGY' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Diversificação (novos serviços)', 'Diversificação', 3
    FROM questions q WHERE q.code = 'STRATEGY_GROWTH_STRATEGY' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Misto (combinação de estratégias)', 'Misto', 4
    FROM questions q WHERE q.code = 'STRATEGY_GROWTH_STRATEGY' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
  END IF;
END $$;


