-- Migração 004: Atualização das Perguntas da Seção Identidade
-- Atualiza textos, help_texts e adiciona novas perguntas conforme contexto completo

DO $$
DECLARE
  v_section_id UUID;
  v_question_set_id UUID;
BEGIN
  -- Obter ID da seção IDENTITY
  SELECT id INTO v_section_id FROM sections WHERE code = 'IDENTITY';
  
  IF v_section_id IS NULL THEN
    RAISE NOTICE 'Seção IDENTITY não encontrada. Execute o seed inicial primeiro.';
    RETURN;
  END IF;
  
  -- Buscar question_set ativo da seção IDENTITY
  SELECT id INTO v_question_set_id 
  FROM question_sets 
  WHERE section_id = v_section_id 
    AND is_active = true 
  ORDER BY version DESC 
  LIMIT 1;
  
  IF v_question_set_id IS NULL THEN
    RAISE NOTICE 'Question set ativo não encontrado para IDENTITY. Execute o seed inicial primeiro.';
    RETURN;
  END IF;
  
  -- ============================================
  -- ATUALIZAR PERGUNTAS EXISTENTES
  -- ============================================
  
  -- Pergunta 1: Razão de Existir (Propósito)
  UPDATE questions 
  SET text = 'Razão de Existir (Propósito)',
      help_text = 'Em uma única frase, por que a clínica existe além de ganhar dinheiro? Que impacto real ela quer gerar na vida dos pacientes? Pense no resultado na vida do paciente, não no procedimento. Pense no "depois do tratamento".',
      ai_importance_weight = 0.9
  WHERE question_set_id = v_question_set_id 
    AND code = 'IDENTITY_REASON';
  
  -- Pergunta 2: Visão de Futuro (Reconhecimento em 3 anos)
  UPDATE questions 
  SET text = 'Visão de Futuro (Reconhecimento em 3 anos)',
      help_text = 'Daqui a 3 anos, como você quer que as pessoas descrevam sua clínica quando falarem dela? Pense em reputação, não em tamanho. Complete mentalmente a frase: "Essa é aquela clínica que…"',
      ai_importance_weight = 0.9
  WHERE question_set_id = v_question_set_id 
    AND code = 'IDENTITY_RECOGNITION_GOAL';
  
  -- Pergunta 3: Valores Inegociáveis
  UPDATE questions 
  SET text = 'Valores Inegociáveis',
      help_text = 'Quais comportamentos e atitudes são inegociáveis na clínica? O que nunca deve acontecer, mesmo que gere lucro? Pense em situações reais: O que você não aceitaria de um profissional? Que tipo de paciente você prefere perder do que atender mal?',
      ai_importance_weight = 0.8
  WHERE question_set_id = v_question_set_id 
    AND code = 'IDENTITY_VALUES';
  
  -- Pergunta 4: Público Prioritário deste Ciclo
  UPDATE questions 
  SET text = 'Público Prioritário deste Ciclo',
      help_text = 'Entre todos os segmentos que você atende, qual será o PRIORITÁRIO nos próximos 12–24 meses? E qual você conscientemente NÃO vai priorizar? Escolha um foco principal e diga também qual tipo de paciente vai virar secundário.',
      ai_importance_weight = 0.9
  WHERE question_set_id = v_question_set_id 
    AND code = 'IDENTITY_PRIORITY_AUDIENCE';
  
  -- Pergunta 5: Posicionamento de Preço
  UPDATE questions 
  SET text = 'Posicionamento de Preço',
      help_text = 'Como a clínica escolhe se posicionar em relação ao preço médio do mercado local?',
      ai_importance_weight = 0.7
  WHERE question_set_id = v_question_set_id 
    AND code = 'IDENTITY_PRICE_POSITIONING';
  
  -- Pergunta 6: Principal Motor de Crescimento
  UPDATE questions 
  SET text = 'Principal Motor de Crescimento',
      help_text = 'Qual será o motor de crescimento principal da clínica neste ciclo?',
      ai_importance_weight = 0.8
  WHERE question_set_id = v_question_set_id 
    AND code = 'IDENTITY_STRATEGY_FOCUS';
  
  -- Pergunta 7: Mudanças Necessárias
  UPDATE questions 
  SET text = 'Mudanças Necessárias',
      help_text = 'O que vai precisar mudar para sustentar essa estratégia? Divida em: Pessoas, Processos, Oferta/Serviços',
      required = true,
      ai_importance_weight = 0.6
  WHERE question_set_id = v_question_set_id 
    AND code = 'IDENTITY_STRATEGY_FOCUS_COMPLEMENT';
  
  -- ============================================
  -- INSERIR NOVAS PERGUNTAS
  -- ============================================
  
  -- Pergunta 5.1: Justificativa do Posicionamento de Preço
  INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
  SELECT v_question_set_id, 'IDENTITY_PRICE_POSITIONING_JUSTIFICATION', 
         'O que justifica esse posicionamento?',
         'O que justifica esse posicionamento? (técnica, experiência, estrutura, tempo de sessão, especialização, etc.)',
         'textarea', true, 6, 0.6
  WHERE NOT EXISTS (
    SELECT 1 FROM questions 
    WHERE question_set_id = v_question_set_id 
      AND code = 'IDENTITY_PRICE_POSITIONING_JUSTIFICATION'
  );
  
  -- Pergunta 6.1: Motor Secundário de Crescimento
  INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
  SELECT v_question_set_id, 'IDENTITY_STRATEGY_FOCUS_SECONDARY',
         'Motor Secundário de Crescimento',
         'Qual será o motor secundário de crescimento?',
         'single_select', true, 8, 0.7
  WHERE NOT EXISTS (
    SELECT 1 FROM questions 
    WHERE question_set_id = v_question_set_id 
      AND code = 'IDENTITY_STRATEGY_FOCUS_SECONDARY'
  );
  
  -- Pergunta 8: Ações Críticas da Clínica
  INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
  SELECT v_question_set_id, 'IDENTITY_CRITICAL_ACTIONS',
         'Ações Críticas da Clínica',
         'Quais são as 3 coisas que a clínica precisa fazer EXCEPCIONALMENTE BEM, todos os dias, para cumprir sua missão? Isso define o que realmente importa na operação.',
         'textarea', true, 10, 0.9
  WHERE NOT EXISTS (
    SELECT 1 FROM questions 
    WHERE question_set_id = v_question_set_id 
      AND code = 'IDENTITY_CRITICAL_ACTIONS'
  );
  
  -- Pergunta 9: Características-Chave da Clínica
  INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
  SELECT v_question_set_id, 'IDENTITY_KEY_CHARACTERISTICS',
         'Características-Chave da Clínica',
         'Quais são as 3 características que a clínica precisa TER como identidade no dia a dia? Isso define o jeito de ser da clínica, não só o que ela faz.',
         'textarea', true, 11, 0.9
  WHERE NOT EXISTS (
    SELECT 1 FROM questions 
    WHERE question_set_id = v_question_set_id 
      AND code = 'IDENTITY_KEY_CHARACTERISTICS'
  );
  
  -- Pergunta 10: O que a clínica NÃO quer ser
  INSERT INTO questions (question_set_id, code, text, help_text, type, required, order_index, ai_importance_weight)
  SELECT v_question_set_id, 'IDENTITY_WHAT_NOT_TO_BE',
         'O que a clínica NÃO quer ser',
         'Que tipo de clínica você NÃO quer construir, mesmo que isso pareça dar dinheiro? Toda boa estratégia tem uma lista do que não fazer.',
         'textarea', true, 12, 0.8
  WHERE NOT EXISTS (
    SELECT 1 FROM questions 
    WHERE question_set_id = v_question_set_id 
      AND code = 'IDENTITY_WHAT_NOT_TO_BE'
  );
  
  -- ============================================
  -- ATUALIZAR/INSERIR OPÇÕES PARA PERGUNTAS DE SELEÇÃO
  -- ============================================
  
  -- Atualizar opções de Posicionamento de Preço
  UPDATE question_options 
  SET label = 'Mais acessível (custo-benefício)'
  WHERE question_id IN (
    SELECT id FROM questions 
    WHERE question_set_id = v_question_set_id 
      AND code = 'IDENTITY_PRICE_POSITIONING'
  ) AND value = 'Mais acessível';
  
  UPDATE question_options 
  SET label = 'Intermediário (equilíbrio)'
  WHERE question_id IN (
    SELECT id FROM questions 
    WHERE question_set_id = v_question_set_id 
      AND code = 'IDENTITY_PRICE_POSITIONING'
  ) AND value = 'Intermediário';
  
  -- Atualizar opções de Principal Motor de Crescimento
  UPDATE question_options 
  SET label = 'Mais valor por paciente (ticket médio)'
  WHERE question_id IN (
    SELECT id FROM questions 
    WHERE question_set_id = v_question_set_id 
      AND code = 'IDENTITY_STRATEGY_FOCUS'
  ) AND value = 'Mais valor por paciente';
  
  -- Inserir opções para Motor Secundário de Crescimento
  INSERT INTO question_options (question_id, label, value, order_index)
  SELECT q.id, 'Mais pacientes (volume)', 'Mais pacientes', 1
  FROM questions q 
  WHERE q.code = 'IDENTITY_STRATEGY_FOCUS_SECONDARY' 
    AND q.question_set_id = v_question_set_id
    AND NOT EXISTS (
      SELECT 1 FROM question_options qo 
      WHERE qo.question_id = q.id AND qo.value = 'Mais pacientes'
    );
  
  INSERT INTO question_options (question_id, label, value, order_index)
  SELECT q.id, 'Mais valor por paciente (ticket médio)', 'Mais valor por paciente', 2
  FROM questions q 
  WHERE q.code = 'IDENTITY_STRATEGY_FOCUS_SECONDARY' 
    AND q.question_set_id = v_question_set_id
    AND NOT EXISTS (
      SELECT 1 FROM question_options qo 
      WHERE qo.question_id = q.id AND qo.value = 'Mais valor por paciente'
    );
  
  RAISE NOTICE 'Migração concluída: Perguntas da seção Identidade atualizadas com sucesso.';
  
END $$;


