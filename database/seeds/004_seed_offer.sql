-- Seeds: Oferta
-- Insere subseções, question_set v1 e perguntas iniciais para a seção Oferta

-- ============================================
-- 1. INSERIR SUBSEÇÕES PARA OFFER
-- ============================================
INSERT INTO subsections (section_id, code, name, order_index, description)
SELECT s.id, 'OFFER_SERVICES', 'Serviços Oferecidos', 1, 'Portfólio de serviços e procedimentos da clínica'
FROM sections s WHERE s.code = 'OFFER'
ON CONFLICT (section_id, code) DO NOTHING;

INSERT INTO subsections (section_id, code, name, order_index, description)
SELECT s.id, 'OFFER_VALUE', 'Proposta de Valor', 2, 'Valor único oferecido aos pacientes'
FROM sections s WHERE s.code = 'OFFER'
ON CONFLICT (section_id, code) DO NOTHING;

INSERT INTO subsections (section_id, code, name, order_index, description)
SELECT s.id, 'OFFER_PRICING', 'Precificação', 3, 'Estratégia de preços e pacotes'
FROM sections s WHERE s.code = 'OFFER'
ON CONFLICT (section_id, code) DO NOTHING;

-- ============================================
-- 2. CRIAR QUESTION_SET V1 PARA OFFER
-- ============================================
DO $$
DECLARE
  v_section_id UUID;
  v_subsection_id UUID;
  v_question_set_id UUID;
BEGIN
  -- Obter IDs de section e subsection
  SELECT id INTO v_section_id FROM sections WHERE code = 'OFFER';
  SELECT id INTO v_subsection_id FROM subsections WHERE section_id = v_section_id AND code = 'OFFER_SERVICES';
  
  -- Criar question_set se não existir
  INSERT INTO question_sets (section_id, subsection_id, name, version, is_active)
  VALUES (v_section_id, v_subsection_id, 'Questionário Oferta v1', 1, true)
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
    -- Pergunta 1: Serviços principais
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'OFFER_MAIN_SERVICES', 'Quais são os serviços principais oferecidos?', 'Liste os principais serviços e procedimentos oferecidos pela clínica: consultas, limpezas, tratamentos, implantes, ortodontia, etc.', 'textarea', true, 1, 0.9)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 2: Serviços flagship
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'OFFER_FLAGSHIP_SERVICES', 'Existem serviços carro-chefe (flagship)?', 'A clínica possui serviços que são especialmente importantes, diferenciados ou que geram mais receita?', 'single_select', true, 2, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 3: Organização em categorias
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'OFFER_SERVICE_CATEGORIES', 'Como os serviços são organizados em categorias?', 'Descreva como os serviços são agrupados: preventivos, restauradores, estéticos, cirúrgicos, etc.', 'textarea', true, 3, 0.7)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 4: Proposta de valor única
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'OFFER_UNIQUE_VALUE', 'Qual é a proposta de valor única da clínica?', 'O que torna a clínica única? Qual é a promessa de valor principal oferecida aos pacientes?', 'textarea', true, 4, 0.9)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 5: Benefícios aos pacientes
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'OFFER_PATIENT_BENEFITS', 'Quais benefícios os pacientes recebem?', 'Quais são os principais benefícios que os pacientes obtêm ao escolher esta clínica? (ex: qualidade, tecnologia, conforto, preço, etc.)', 'textarea', true, 5, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 6: Comunicação da proposta de valor
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'OFFER_VALUE_COMMUNICATION', 'Como a clínica comunica sua proposta de valor?', 'Como a clínica transmite sua proposta de valor aos pacientes? Através de marketing, boca a boca, site, redes sociais, etc.', 'textarea', true, 6, 0.7)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 7: Estratégia de precificação
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'OFFER_PRICING_STRATEGY', 'Qual é a estratégia de precificação?', 'Como a clínica define os preços? Baseado em custos, concorrência, valor percebido, ou outro critério?', 'single_select', true, 7, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 8: Pacotes e planos
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'OFFER_PACKAGES', 'Existem pacotes ou planos de tratamento?', 'A clínica oferece pacotes, planos de tratamento, ou programas de fidelidade?', 'single_select', true, 8, 0.7)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 9: Agregação de valor
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'OFFER_VALUE_ADDITION', 'Como a clínica agrega valor aos serviços?', 'Além do serviço básico, o que a clínica oferece para agregar valor? (ex: atendimento personalizado, tecnologia avançada, ambiente acolhedor, etc.)', 'textarea', true, 9, 0.8)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- Pergunta 10: Serviços mais rentáveis
    INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
    VALUES (v_question_set_id, 'OFFER_MOST_PROFITABLE', 'Quais são os serviços mais rentáveis?', 'Quais serviços ou procedimentos geram maior margem de lucro ou receita para a clínica?', 'textarea', true, 10, 0.7)
    ON CONFLICT (question_set_id, code) DO NOTHING;
    
    -- ============================================
    -- 4. INSERIR OPÇÕES PARA PERGUNTAS DE SELEÇÃO
    -- ============================================
    
    -- Opções para Serviços Flagship
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Sim, temos serviços flagship bem definidos', 'Sim, bem definidos', 1
    FROM questions q WHERE q.code = 'OFFER_FLAGSHIP_SERVICES' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Parcialmente, alguns serviços se destacam', 'Parcialmente', 2
    FROM questions q WHERE q.code = 'OFFER_FLAGSHIP_SERVICES' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Não, todos os serviços têm importância similar', 'Não, similar', 3
    FROM questions q WHERE q.code = 'OFFER_FLAGSHIP_SERVICES' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    -- Opções para Estratégia de Precificação
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Baseado em custos (custo + margem)', 'Baseado em custos', 1
    FROM questions q WHERE q.code = 'OFFER_PRICING_STRATEGY' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Baseado em concorrência (alinhado ao mercado)', 'Baseado em concorrência', 2
    FROM questions q WHERE q.code = 'OFFER_PRICING_STRATEGY' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Baseado em valor percebido (premium)', 'Baseado em valor', 3
    FROM questions q WHERE q.code = 'OFFER_PRICING_STRATEGY' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Misto (combinação de critérios)', 'Misto', 4
    FROM questions q WHERE q.code = 'OFFER_PRICING_STRATEGY' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    -- Opções para Pacotes e Planos
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Sim, oferecemos pacotes e planos', 'Sim, oferecemos', 1
    FROM questions q WHERE q.code = 'OFFER_PACKAGES' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Parcialmente, alguns pacotes', 'Parcialmente', 2
    FROM questions q WHERE q.code = 'OFFER_PACKAGES' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
    
    INSERT INTO question_options (question_id, label, value, order_index)
    SELECT q.id, 'Não, serviços avulsos apenas', 'Não, avulsos', 3
    FROM questions q WHERE q.code = 'OFFER_PACKAGES' AND q.question_set_id = v_question_set_id
    ON CONFLICT DO NOTHING;
  END IF;
END $$;



