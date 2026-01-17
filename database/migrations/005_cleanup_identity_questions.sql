-- Migração 005: Limpeza e Reorganização das Perguntas da Seção Identidade
-- Remove perguntas antigas e mantém apenas as 12 perguntas atualizadas

DO $$
DECLARE
  v_section_id UUID;
  v_subsection_id UUID;
  v_question_set_id UUID;
  v_old_question_set_ids UUID[];
BEGIN
  -- Obter ID da seção IDENTITY
  SELECT id INTO v_section_id FROM sections WHERE code = 'IDENTITY';
  
  IF v_section_id IS NULL THEN
    RAISE NOTICE 'Seção IDENTITY não encontrada.';
    RETURN;
  END IF;
  
  -- Obter ID da subsection IDENTITY_PURPOSE
  SELECT id INTO v_subsection_id 
  FROM subsections 
  WHERE section_id = v_section_id AND code = 'IDENTITY_PURPOSE';
  
  -- ============================================
  -- 1. DESATIVAR TODOS OS QUESTION_SETS ANTIGOS
  -- ============================================
  UPDATE question_sets 
  SET is_active = false
  WHERE section_id = v_section_id;
  
  -- ============================================
  -- 2. CRIAR OU OBTER QUESTION_SET LIMPO
  -- ============================================
  -- Buscar question_set mais recente ou criar novo
  SELECT id INTO v_question_set_id 
  FROM question_sets 
  WHERE section_id = v_section_id 
    AND subsection_id = v_subsection_id
  ORDER BY version DESC, created_at DESC
  LIMIT 1;
  
  -- Se não existe, criar novo
  IF v_question_set_id IS NULL THEN
    INSERT INTO question_sets (section_id, subsection_id, name, version, is_active)
    VALUES (v_section_id, v_subsection_id, 'Questionário Identidade v2', 2, true)
    RETURNING id INTO v_question_set_id;
  ELSE
    -- Atualizar o existente para ser o ativo
    UPDATE question_sets 
    SET is_active = true, 
        name = 'Questionário Identidade v2',
        version = 2,
        updated_at = NOW()
    WHERE id = v_question_set_id;
    
    -- Remover todas as perguntas antigas deste question_set
    DELETE FROM question_options 
    WHERE question_id IN (
      SELECT id FROM questions WHERE question_set_id = v_question_set_id
    );
    
    DELETE FROM questions 
    WHERE question_set_id = v_question_set_id;
  END IF;
  
  -- ============================================
  -- 3. INSERIR APENAS AS 12 PERGUNTAS NOVAS
  -- ============================================
  
  -- BLOCO 1 — PROPÓSITO, VISÃO E VALORES
  
  -- Pergunta 1: Razão de Existir (Propósito)
  INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
  VALUES (v_question_set_id, 'IDENTITY_REASON', 
          'Razão de Existir (Propósito)', 
          'Em uma única frase, por que a clínica existe além de ganhar dinheiro? Que impacto real ela quer gerar na vida dos pacientes? Pense no resultado na vida do paciente, não no procedimento. Pense no "depois do tratamento".',
          'textarea', true, 1, 0.9);
  
  -- Pergunta 2: Visão de Futuro (Reconhecimento em 3 anos)
  INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
  VALUES (v_question_set_id, 'IDENTITY_RECOGNITION_GOAL', 
          'Visão de Futuro (Reconhecimento em 3 anos)', 
          'Daqui a 3 anos, como você quer que as pessoas descrevam sua clínica quando falarem dela? Pense em reputação, não em tamanho. Complete mentalmente a frase: "Essa é aquela clínica que…"',
          'textarea', true, 2, 0.9);
  
  -- Pergunta 3: Valores Inegociáveis
  INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
  VALUES (v_question_set_id, 'IDENTITY_VALUES', 
          'Valores Inegociáveis', 
          'Quais comportamentos e atitudes são inegociáveis na clínica? O que nunca deve acontecer, mesmo que gere lucro? Pense em situações reais: O que você não aceitaria de um profissional? Que tipo de paciente você prefere perder do que atender mal?',
          'textarea', true, 3, 0.8);
  
  -- BLOCO 2 — PARA QUEM EXISTIMOS
  
  -- Pergunta 4: Público Prioritário deste Ciclo
  INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
  VALUES (v_question_set_id, 'IDENTITY_PRIORITY_AUDIENCE', 
          'Público Prioritário deste Ciclo', 
          'Entre todos os segmentos que você atende, qual será o PRIORITÁRIO nos próximos 12–24 meses? E qual você conscientemente NÃO vai priorizar? Escolha um foco principal e diga também qual tipo de paciente vai virar secundário.',
          'textarea', true, 4, 0.9);
  
  -- BLOCO 3 — COMO GERAMOS VALOR
  
  -- Pergunta 5: Posicionamento de Preço
  INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
  VALUES (v_question_set_id, 'IDENTITY_PRICE_POSITIONING', 
          'Posicionamento de Preço', 
          'Como a clínica escolhe se posicionar em relação ao preço médio do mercado local?',
          'single_select', true, 5, 0.7);
  
  -- Pergunta 6: Justificativa do Posicionamento de Preço
  INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
  VALUES (v_question_set_id, 'IDENTITY_PRICE_POSITIONING_JUSTIFICATION', 
          'O que justifica esse posicionamento?', 
          'O que justifica esse posicionamento? (técnica, experiência, estrutura, tempo de sessão, especialização, etc.)',
          'textarea', true, 6, 0.6);
  
  -- BLOCO 4 — COMO VAMOS CRESCER
  
  -- Pergunta 7: Principal Motor de Crescimento
  INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
  VALUES (v_question_set_id, 'IDENTITY_STRATEGY_FOCUS', 
          'Principal Motor de Crescimento', 
          'Qual será o motor de crescimento principal da clínica neste ciclo?',
          'single_select', true, 7, 0.8);
  
  -- Pergunta 8: Motor Secundário de Crescimento
  INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
  VALUES (v_question_set_id, 'IDENTITY_STRATEGY_FOCUS_SECONDARY', 
          'Motor Secundário de Crescimento', 
          'Qual será o motor secundário de crescimento?',
          'single_select', true, 8, 0.7);
  
  -- Pergunta 9: Mudanças Necessárias
  INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
  VALUES (v_question_set_id, 'IDENTITY_STRATEGY_FOCUS_COMPLEMENT', 
          'Mudanças Necessárias', 
          'O que vai precisar mudar para sustentar essa estratégia? Divida em: Pessoas, Processos, Oferta/Serviços',
          'textarea', true, 9, 0.6);
  
  -- BLOCO 5 — O CORAÇÃO DO FLIGHT PLAN
  
  -- Pergunta 10: Ações Críticas da Clínica
  INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
  VALUES (v_question_set_id, 'IDENTITY_CRITICAL_ACTIONS', 
          'Ações Críticas da Clínica', 
          'Quais são as 3 coisas que a clínica precisa fazer EXCEPCIONALMENTE BEM, todos os dias, para cumprir sua missão? Isso define o que realmente importa na operação.',
          'textarea', true, 10, 0.9);
  
  -- Pergunta 11: Características-Chave da Clínica
  INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
  VALUES (v_question_set_id, 'IDENTITY_KEY_CHARACTERISTICS', 
          'Características-Chave da Clínica', 
          'Quais são as 3 características que a clínica precisa TER como identidade no dia a dia? Isso define o jeito de ser da clínica, não só o que ela faz.',
          'textarea', true, 11, 0.9);
  
  -- BLOCO 6 — COERÊNCIA E FOCO
  
  -- Pergunta 12: O que a clínica NÃO quer ser
  INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
  VALUES (v_question_set_id, 'IDENTITY_WHAT_NOT_TO_BE', 
          'O que a clínica NÃO quer ser', 
          'Que tipo de clínica você NÃO quer construir, mesmo que isso pareça dar dinheiro? Toda boa estratégia tem uma lista do que não fazer.',
          'textarea', true, 12, 0.8);
  
  -- ============================================
  -- 4. INSERIR OPÇÕES PARA PERGUNTAS DE SELEÇÃO
  -- ============================================
  
  -- Opções para Posicionamento de Preço
  INSERT INTO question_options (question_id, label, value, order_index)
  SELECT q.id, 'Mais acessível (custo-benefício)', 'Mais acessível', 1
  FROM questions q 
  WHERE q.code = 'IDENTITY_PRICE_POSITIONING' AND q.question_set_id = v_question_set_id;
  
  INSERT INTO question_options (question_id, label, value, order_index)
  SELECT q.id, 'Intermediário (equilíbrio)', 'Intermediário', 2
  FROM questions q 
  WHERE q.code = 'IDENTITY_PRICE_POSITIONING' AND q.question_set_id = v_question_set_id;
  
  INSERT INTO question_options (question_id, label, value, order_index)
  SELECT q.id, 'Premium / exclusivo (alto valor agregado)', 'Premium / exclusivo', 3
  FROM questions q 
  WHERE q.code = 'IDENTITY_PRICE_POSITIONING' AND q.question_set_id = v_question_set_id;
  
  -- Opções para Principal Motor de Crescimento
  INSERT INTO question_options (question_id, label, value, order_index)
  SELECT q.id, 'Mais pacientes (volume)', 'Mais pacientes', 1
  FROM questions q 
  WHERE q.code = 'IDENTITY_STRATEGY_FOCUS' AND q.question_set_id = v_question_set_id;
  
  INSERT INTO question_options (question_id, label, value, order_index)
  SELECT q.id, 'Mais valor por paciente (ticket médio)', 'Mais valor por paciente', 2
  FROM questions q 
  WHERE q.code = 'IDENTITY_STRATEGY_FOCUS' AND q.question_set_id = v_question_set_id;
  
  -- Opções para Motor Secundário de Crescimento
  INSERT INTO question_options (question_id, label, value, order_index)
  SELECT q.id, 'Mais pacientes (volume)', 'Mais pacientes', 1
  FROM questions q 
  WHERE q.code = 'IDENTITY_STRATEGY_FOCUS_SECONDARY' AND q.question_set_id = v_question_set_id;
  
  INSERT INTO question_options (question_id, label, value, order_index)
  SELECT q.id, 'Mais valor por paciente (ticket médio)', 'Mais valor por paciente', 2
  FROM questions q 
  WHERE q.code = 'IDENTITY_STRATEGY_FOCUS_SECONDARY' AND q.question_set_id = v_question_set_id;
  
  -- ============================================
  -- 5. REMOVER QUESTION_SETS ANTIGOS (OPCIONAL - COMENTADO POR SEGURANÇA)
  -- ============================================
  -- Descomente as linhas abaixo se quiser remover completamente os question_sets antigos
  -- (CUIDADO: Isso pode afetar respostas existentes se houver referências)
  
  /*
  SELECT array_agg(id) INTO v_old_question_set_ids
  FROM question_sets
  WHERE section_id = v_section_id 
    AND id != v_question_set_id
    AND is_active = false;
  
  IF array_length(v_old_question_set_ids, 1) > 0 THEN
    -- Remover opções e perguntas dos question_sets antigos
    DELETE FROM question_options 
    WHERE question_id IN (
      SELECT id FROM questions WHERE question_set_id = ANY(v_old_question_set_ids)
    );
    
    DELETE FROM questions 
    WHERE question_set_id = ANY(v_old_question_set_ids);
    
    -- Remover question_sets antigos
    DELETE FROM question_sets 
    WHERE id = ANY(v_old_question_set_ids);
  END IF;
  */
  
  RAISE NOTICE 'Limpeza concluída: Question set atualizado com 12 perguntas novas.';
  
END $$;


