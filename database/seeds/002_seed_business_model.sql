-- Seeds: Modelo de Negócio
-- Insere subseções, question_set v1 e perguntas iniciais para a seção Modelo de Negócio

-- ============================================
-- 1. INSERIR SUBSEÇÕES PARA BUSINESS_MODEL
-- ============================================
INSERT INTO subsections (section_id, code, name, order_index, description)
SELECT s.id, 'BUSINESS_MODEL_CANVAS', 'Canvas do Modelo de Negócio', 1, 'Visão geral de como a clínica cria, entrega e captura valor'
FROM sections s WHERE s.code = 'BUSINESS_MODEL'
ON CONFLICT (section_id, code) DO NOTHING;

INSERT INTO subsections (section_id, code, name, order_index, description)
SELECT s.id, 'BUSINESS_MODEL_REVENUE', 'Fontes de Receita', 2, 'Como a clínica gera receita e monetiza seus serviços'
FROM sections s WHERE s.code = 'BUSINESS_MODEL'
ON CONFLICT (section_id, code) DO NOTHING;

INSERT INTO subsections (section_id, code, name, order_index, description)
SELECT s.id, 'BUSINESS_MODEL_COSTS', 'Estrutura de Custos', 3, 'Principais custos fixos e variáveis da operação'
FROM sections s WHERE s.code = 'BUSINESS_MODEL'
ON CONFLICT (section_id, code) DO NOTHING;

-- ============================================
-- 2. CRIAR QUESTION_SET V1 PARA BUSINESS_MODEL
-- ============================================
DO $$
DECLARE
  v_section_id UUID;
  v_subsection_id UUID;
  v_question_set_id UUID;
BEGIN
  -- Obter IDs de section e subsection
  SELECT id INTO v_section_id FROM sections WHERE code = 'BUSINESS_MODEL';
  SELECT id INTO v_subsection_id FROM subsections WHERE section_id = v_section_id AND code = 'BUSINESS_MODEL_CANVAS';
  
  -- Criar question_set se não existir
  INSERT INTO question_sets (section_id, subsection_id, name, version, is_active)
  VALUES (v_section_id, v_subsection_id, 'Questionário Modelo de Negócio v1', 1, true)
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
    -- Pergunta 1: Como gera receita
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'BUSINESS_MODEL_REVENUE_GENERATION', 'Como a clínica gera receita?', 'Descreva o modelo de receita principal. A clínica cobra por consulta, por procedimento, tem planos mensais, ou outro modelo?', 'textarea', true, 1, 0.9)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 2: Fontes de receita
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'BUSINESS_MODEL_REVENUE_SOURCES', 'Quais são as principais fontes de receita?', 'Liste as diferentes formas de receita: consultas, procedimentos, exames, planos odontológicos, etc.', 'textarea', true, 2, 0.9)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 3: Ticket médio
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'BUSINESS_MODEL_AVERAGE_TICKET', 'Qual é o ticket médio por paciente?', 'Valor médio gasto por paciente por visita ou por mês. Se não souber exatamente, forneça uma estimativa.', 'text', true, 3, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 4: Frequência de retorno
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'BUSINESS_MODEL_RETURN_FREQUENCY', 'Qual é a frequência média de retorno dos pacientes?', 'Com que frequência os pacientes retornam à clínica? (ex: a cada 6 meses, anualmente, etc.)', 'text', true, 4, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 5: Captura de valor
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'BUSINESS_MODEL_VALUE_CAPTURE', 'Como a clínica captura valor do mercado?', 'Descreva como a clínica transforma seus serviços em receita. Qual é o mecanismo de monetização?', 'textarea', true, 5, 0.9)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 6: Modelo de precificação
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'BUSINESS_MODEL_PRICING_MODEL', 'Qual é o modelo de precificação predominante?', 'Como a clínica define os preços dos seus serviços?', 'single_select', true, 6, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 7: Receitas recorrentes
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'BUSINESS_MODEL_RECURRING_REVENUE', 'Existem receitas recorrentes?', 'A clínica possui fontes de receita recorrentes, como planos odontológicos, manutenções periódicas, ou depende principalmente de receitas pontuais?', 'single_select', true, 7, 0.7)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 8: Custos fixos
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'BUSINESS_MODEL_FIXED_COSTS', 'Quais são os principais custos fixos?', 'Liste os custos que não variam com o volume de atendimentos: aluguel, salários fixos, equipamentos, etc.', 'textarea', true, 8, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 9: Custos variáveis
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'BUSINESS_MODEL_VARIABLE_COSTS', 'Quais são os principais custos variáveis?', 'Liste os custos que variam com o volume de atendimentos: materiais odontológicos, comissões, insumos, etc.', 'textarea', true, 9, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 10: Margem de contribuição
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'BUSINESS_MODEL_CONTRIBUTION_MARGIN', 'Qual é a margem de contribuição estimada?', 'Diferença entre receita e custos variáveis, expressa como percentual ou valor. Se não souber exatamente, forneça uma estimativa.', 'text', true, 10, 0.7)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- ============================================
    -- 4. INSERIR OPÇÕES PARA PERGUNTAS DE SELEÇÃO
    -- ============================================
    
    -- Opções para Modelo de Precificação
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Preço fixo por serviço', 'Preço fixo', 1
    FROM questions q WHERE q.code = 'BUSINESS_MODEL_PRICING_MODEL' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Preço variável conforme complexidade', 'Preço variável', 2
    FROM questions q WHERE q.code = 'BUSINESS_MODEL_PRICING_MODEL' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Pacotes e planos de tratamento', 'Pacotes', 3
    FROM questions q WHERE q.code = 'BUSINESS_MODEL_PRICING_MODEL' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Misto (fixo + variável + pacotes)', 'Misto', 4
    FROM questions q WHERE q.code = 'BUSINESS_MODEL_PRICING_MODEL' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    -- Opções para Receitas Recorrentes
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Sim, receitas recorrentes são significativas', 'Sim, significativas', 1
    FROM questions q WHERE q.code = 'BUSINESS_MODEL_RECURRING_REVENUE' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Parcialmente (algumas receitas recorrentes)', 'Parcialmente', 2
    FROM questions q WHERE q.code = 'BUSINESS_MODEL_RECURRING_REVENUE' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Não, receitas principalmente pontuais', 'Não, pontuais', 3
    FROM questions q WHERE q.code = 'BUSINESS_MODEL_RECURRING_REVENUE' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
  END IF;
END $$;



