-- Seeds: Plano
-- Insere subseções, question_set v1 e perguntas iniciais para a seção Plano

-- ============================================
-- 1. INSERIR SUBSEÇÕES PARA PLAN
-- ============================================
INSERT INTO subsections (section_id, code, name, order_index, description)
SELECT s.id, 'PLAN_TACTICAL', 'Plano Tático', 1, 'Iniciativas e ações táticas para execução estratégica'
FROM sections s WHERE s.code = 'PLAN'
ON CONFLICT (section_id, code) DO NOTHING;

INSERT INTO subsections (section_id, code, name, order_index, description)
SELECT s.id, 'PLAN_INITIATIVES', 'Iniciativas e Projetos', 2, 'Projetos e iniciativas prioritárias'
FROM sections s WHERE s.code = 'PLAN'
ON CONFLICT (section_id, code) DO NOTHING;

INSERT INTO subsections (section_id, code, name, order_index, description)
SELECT s.id, 'PLAN_TIMELINE', 'Cronograma e Prazos', 3, 'Timeline e marcos de execução'
FROM sections s WHERE s.code = 'PLAN'
ON CONFLICT (section_id, code) DO NOTHING;

-- ============================================
-- 2. CRIAR QUESTION_SET V1 PARA PLAN
-- ============================================
DO $$
DECLARE
  v_section_id UUID;
  v_subsection_id UUID;
  v_question_set_id UUID;
BEGIN
  -- Obter IDs de section e subsection
  SELECT id INTO v_section_id FROM sections WHERE code = 'PLAN';
  SELECT id INTO v_subsection_id FROM subsections WHERE section_id = v_section_id AND code = 'PLAN_TACTICAL';
  
  -- Criar question_set se não existir
  INSERT INTO question_sets (section_id, subsection_id, name, version, is_active)
  VALUES (v_section_id, v_subsection_id, 'Questionário Plano v1', 1, true)
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
    -- Pergunta 1: Iniciativas prioritárias
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'PLAN_PRIORITY_INITIATIVES', 'Quais são as iniciativas prioritárias?', 'Liste as principais iniciativas ou projetos que a clínica precisa executar para alcançar seus objetivos estratégicos.', 'textarea', true, 1, 0.9)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 2: Organização das iniciativas
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'PLAN_INITIATIVES_ORGANIZATION', 'Como as iniciativas estão organizadas?', 'Como as iniciativas são agrupadas ou categorizadas? Por área, por prioridade, por objetivo estratégico?', 'textarea', true, 2, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 3: Cronograma de execução
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'PLAN_EXECUTION_TIMELINE', 'Qual é o cronograma de execução?', 'Descreva o cronograma geral: quando cada iniciativa deve começar e terminar? Qual a sequência de execução?', 'textarea', true, 3, 0.9)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 4: Marcos principais
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'PLAN_MILESTONES', 'Quais são os principais marcos (milestones)?', 'Identifique os principais marcos ou entregas do plano: conclusão de projetos, atingimento de metas, eventos importantes, etc.', 'textarea', true, 4, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 5: Responsáveis
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'PLAN_RESPONSIBLES', 'Quem são os responsáveis pelas iniciativas?', 'Quem é responsável por cada iniciativa ou área do plano? Identifique os principais responsáveis.', 'textarea', true, 5, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 6: Dependências
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'PLAN_DEPENDENCIES', 'Quais são as dependências entre iniciativas?', 'Existem iniciativas que dependem de outras para começar ou serem concluídas? Identifique as principais dependências.', 'textarea', true, 6, 0.7)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 7: Acompanhamento de progresso
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'PLAN_PROGRESS_TRACKING', 'Como o progresso é acompanhado?', 'Como a clínica monitora o progresso das iniciativas? Reuniões periódicas, relatórios, indicadores, etc.', 'single_select', true, 7, 0.7)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 8: Recursos necessários
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'PLAN_REQUIRED_RESOURCES', 'Quais são os recursos necessários?', 'Quais recursos são necessários para executar o plano? Financeiros, humanos, equipamentos, tecnologia, etc.', 'textarea', true, 8, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 9: Riscos de execução
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'PLAN_EXECUTION_RISKS', 'Existem riscos de execução?', 'Quais são os principais riscos que podem impedir ou atrasar a execução do plano? Como podem ser mitigados?', 'textarea', true, 9, 0.7)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 10: Comunicação do plano
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'PLAN_COMMUNICATION_STRATEGY', 'Qual é a estratégia de comunicação do plano?', 'Como o plano é comunicado à equipe e stakeholders? Reuniões, documentos, apresentações, etc.', 'textarea', true, 10, 0.7)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- ============================================
    -- 4. INSERIR OPÇÕES PARA PERGUNTAS DE SELEÇÃO
    -- ============================================
    
    -- Opções para Acompanhamento de Progresso
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Reuniões periódicas formais', 'Reuniões formais', 1
    FROM questions q WHERE q.code = 'PLAN_PROGRESS_TRACKING' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Relatórios e indicadores', 'Relatórios e indicadores', 2
    FROM questions q WHERE q.code = 'PLAN_PROGRESS_TRACKING' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Acompanhamento informal', 'Acompanhamento informal', 3
    FROM questions q WHERE q.code = 'PLAN_PROGRESS_TRACKING' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Misto (reuniões + relatórios)', 'Misto', 4
    FROM questions q WHERE q.code = 'PLAN_PROGRESS_TRACKING' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
  END IF;
END $$;



