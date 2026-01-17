-- Migração 007: Atualização da Estrutura da Pergunta 2 - Visão de Futuro
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
  
  -- Buscar ID da pergunta IDENTITY_RECOGNITION_GOAL
  SELECT id INTO v_question_id
  FROM questions
  WHERE question_set_id = v_question_set_id
    AND code = 'IDENTITY_RECOGNITION_GOAL';
  
  IF v_question_id IS NULL THEN
    RAISE NOTICE 'Pergunta IDENTITY_RECOGNITION_GOAL não encontrada.';
    RETURN;
  END IF;
  
  -- ============================================
  -- ATUALIZAR PERGUNTA 2: VISÃO DE FUTURO
  -- ============================================
  
  UPDATE questions 
  SET 
    text = 'Visão de Futuro da Clínica (Reconhecimento em 3 anos)',
    help_text = 'Daqui a 3 anos, quando alguém falar da sua clínica, o que você quer que essa pessoa diga espontaneamente? Como você quer que a clínica seja conhecida e lembrada?',
    validation_schema = jsonb_build_object(
      'minLength', 200,
      'maxLength', 600,
      'required', true,
      'rules', jsonb_build_array(
        'Deve falar de posição no mercado, não de vaidade',
        'Deve falar de tipo de caso resolvido, não de tecnologia',
        'Deve falar de confiança e reconhecimento, não de números',
        'Deve soar como algo que um paciente ou outro médico diria'
      )
    ),
    ai_importance_weight = 0.9
  WHERE id = v_question_id;
  
  RAISE NOTICE 'Pergunta 2 atualizada com sucesso.';
  
END $$;

