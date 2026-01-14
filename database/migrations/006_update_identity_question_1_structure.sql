-- Migração 006: Atualização da Estrutura da Pergunta 1 - Razão de Existir
-- Atualiza texto, help_text, validation_schema e adiciona estrutura completa conforme especificação

DO $$
DECLARE
  v_section_id UUID;
  v_question_set_id UUID;
  v_question_id UUID;
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
  
  -- Buscar ID da pergunta IDENTITY_REASON
  SELECT id INTO v_question_id
  FROM questions
  WHERE question_set_id = v_question_set_id
    AND code = 'IDENTITY_REASON';
  
  IF v_question_id IS NULL THEN
    RAISE NOTICE 'Pergunta IDENTITY_REASON não encontrada.';
    RETURN;
  END IF;
  
  -- ============================================
  -- ATUALIZAR PERGUNTA 1: RAZÃO DE EXISTIR
  -- ============================================
  
  UPDATE questions 
  SET 
    text = 'Razão de Existir da Clínica (Propósito)',
    help_text = 'Em uma ou duas frases: por que sua clínica existe além de ganhar dinheiro? Que transformação real ela gera na vida dos pacientes?',
    validation_schema = jsonb_build_object(
      'minLength', 200,
      'maxLength', 600,
      'required', true,
      'rules', jsonb_build_array(
        'Deve responder claramente: Para quem você existe?',
        'Deve responder claramente: Que mudança você provoca?',
        'Deve responder claramente: Por que isso importa?'
      )
    ),
    ai_importance_weight = 0.9
  WHERE id = v_question_id;
  
  RAISE NOTICE 'Pergunta 1 atualizada com sucesso.';
  
END $$;

