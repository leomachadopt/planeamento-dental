-- Seeds: Operações
-- Insere subseções, question_set v1 e perguntas iniciais para a seção Operações

-- ============================================
-- 1. INSERIR SUBSEÇÕES PARA OPERATIONS
-- ============================================
INSERT INTO subsections (section_id, code, name, order_index, description)
SELECT s.id, 'OPERATIONS_PROCESSES', 'Processos Operacionais', 1, 'Fluxos e processos principais da clínica'
FROM sections s WHERE s.code = 'OPERATIONS'
ON CONFLICT (section_id, code) DO NOTHING;

INSERT INTO subsections (section_id, code, name, order_index, description)
SELECT s.id, 'OPERATIONS_CAPACITY', 'Capacidade e Recursos', 2, 'Recursos físicos, equipamentos e capacidade de atendimento'
FROM sections s WHERE s.code = 'OPERATIONS'
ON CONFLICT (section_id, code) DO NOTHING;

INSERT INTO subsections (section_id, code, name, order_index, description)
SELECT s.id, 'OPERATIONS_TEAM', 'Equipe e Organização', 3, 'Estrutura organizacional e equipe'
FROM sections s WHERE s.code = 'OPERATIONS'
ON CONFLICT (section_id, code) DO NOTHING;

-- ============================================
-- 2. CRIAR QUESTION_SET V1 PARA OPERATIONS
-- ============================================
DO $$
DECLARE
  v_section_id UUID;
  v_subsection_id UUID;
  v_question_set_id UUID;
BEGIN
  -- Obter IDs de section e subsection
  SELECT id INTO v_section_id FROM sections WHERE code = 'OPERATIONS';
  SELECT id INTO v_subsection_id FROM subsections WHERE section_id = v_section_id AND code = 'OPERATIONS_PROCESSES';
  
  -- Criar question_set se não existir
  INSERT INTO question_sets (section_id, subsection_id, name, version, is_active)
  VALUES (v_section_id, v_subsection_id, 'Questionário Operações v1', 1, true)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_question_set_id;
  
  -- Se não retornou ID, buscar o existente
  IF v_question_set_id IS NULL THEN
    SELECT id INTO v_question_set_id FROM question_sets 
    WHERE section_id = v_section_id AND subsection_id = v_subsection_id AND version = 1;
  END IF;
  
  -- ============================================
  -- 3. INSERIR PERGUNTAS INICIAIS (12 perguntas)
  -- ============================================
  IF v_question_set_id IS NOT NULL THEN
    -- Pergunta 1: Processos principais
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'OPERATIONS_MAIN_PROCESSES', 'Quais são os processos operacionais principais?', 'Liste os principais processos: agendamento, atendimento, limpeza, tratamento, pagamento, etc.', 'textarea', true, 1, 0.9)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 2: Fluxo de atendimento
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'OPERATIONS_PATIENT_FLOW', 'Como é o fluxo de atendimento ao paciente?', 'Descreva o caminho do paciente desde a chegada até a saída: recepção, triagem, atendimento, pagamento, etc.', 'textarea', true, 2, 0.9)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 3: Processos críticos
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'OPERATIONS_CRITICAL_PROCESSES', 'Quais são os processos críticos da clínica?', 'Identifique processos que, se falharem, impactam significativamente a operação: esterilização, controle de infecção, gestão de emergências, etc.', 'textarea', true, 3, 0.9)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 4: Capacidade diária
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'OPERATIONS_DAILY_CAPACITY', 'Qual é a capacidade de atendimento diária?', 'Quantos pacientes a clínica consegue atender por dia? (número aproximado)', 'text', true, 4, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 5: Número de consultórios
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'OPERATIONS_CONSULTING_ROOMS', 'Quantos consultórios a clínica possui?', 'Número total de consultórios disponíveis para atendimento', 'text', true, 5, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 6: Recursos e equipamentos
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'OPERATIONS_RESOURCES', 'Quais são os principais recursos e equipamentos?', 'Liste os principais equipamentos e recursos: raio-X, aparelhos, materiais, tecnologia, etc.', 'textarea', true, 6, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 7: Organização da equipe
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'OPERATIONS_TEAM_ORGANIZATION', 'Como a equipe está organizada?', 'Descreva a estrutura organizacional: hierarquia, departamentos, áreas de atuação, etc.', 'textarea', true, 7, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 8: Número de profissionais
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'OPERATIONS_PROFESSIONALS_COUNT', 'Quantos profissionais trabalham na clínica?', 'Número total de profissionais: dentistas, auxiliares, recepcionistas, etc.', 'text', true, 8, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 9: Estrutura de cargos
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'OPERATIONS_ROLES_STRUCTURE', 'Qual é a estrutura de cargos e funções?', 'Descreva os principais cargos e suas responsabilidades: dentista, auxiliar, recepcionista, coordenador, etc.', 'textarea', true, 9, 0.7)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 10: Processos de qualidade
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'OPERATIONS_QUALITY_PROCESSES', 'Existem processos de qualidade implementados?', 'A clínica possui processos formais de controle de qualidade, certificações, ou protocolos padronizados?', 'single_select', true, 10, 0.7)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 11: Gestão de agenda
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'OPERATIONS_SCHEDULE_MANAGEMENT', 'Como a clínica gerencia a agenda?', 'Como é feito o agendamento e controle de horários? Sistema manual, software, aplicativo, etc.', 'single_select', true, 11, 0.7)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 12: Gargalos operacionais
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'OPERATIONS_BOTTLENECKS', 'Quais são os principais gargalos operacionais?', 'Identifique pontos que limitam a capacidade ou eficiência da operação: falta de consultórios, profissionais, equipamentos, processos lentos, etc.', 'textarea', true, 12, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- ============================================
    -- 4. INSERIR OPÇÕES PARA PERGUNTAS DE SELEÇÃO
    -- ============================================
    
    -- Opções para Processos de Qualidade
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Sim, processos formais e certificações', 'Sim, formais', 1
    FROM questions q WHERE q.code = 'OPERATIONS_QUALITY_PROCESSES' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Parcialmente, alguns protocolos', 'Parcialmente', 2
    FROM questions q WHERE q.code = 'OPERATIONS_QUALITY_PROCESSES' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Não, processos informais', 'Não, informais', 3
    FROM questions q WHERE q.code = 'OPERATIONS_QUALITY_PROCESSES' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    -- Opções para Gestão de Agenda
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Sistema de software especializado', 'Software especializado', 1
    FROM questions q WHERE q.code = 'OPERATIONS_SCHEDULE_MANAGEMENT' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Planilha ou sistema básico', 'Planilha ou básico', 2
    FROM questions q WHERE q.code = 'OPERATIONS_SCHEDULE_MANAGEMENT' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Agenda física ou manual', 'Agenda física', 3
    FROM questions q WHERE q.code = 'OPERATIONS_SCHEDULE_MANAGEMENT' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Misto (físico + digital)', 'Misto', 4
    FROM questions q WHERE q.code = 'OPERATIONS_SCHEDULE_MANAGEMENT' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
  END IF;
END $$;



