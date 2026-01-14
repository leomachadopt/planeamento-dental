-- Migração 006: Adicionar campos system_prompt e user_prompt à tabela ai_prompt_templates
-- Permite separar SYSTEM PROMPT e USER PROMPT nos templates

-- Adicionar colunas se não existirem
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_prompt_templates' 
    AND column_name = 'system_prompt'
  ) THEN
    ALTER TABLE ai_prompt_templates ADD COLUMN system_prompt TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_prompt_templates' 
    AND column_name = 'user_prompt'
  ) THEN
    ALTER TABLE ai_prompt_templates ADD COLUMN user_prompt TEXT;
  END IF;
END $$;

-- Migrar dados existentes: se template_text existe mas system_prompt/user_prompt não, copiar para user_prompt
UPDATE ai_prompt_templates
SET user_prompt = template_text
WHERE user_prompt IS NULL AND template_text IS NOT NULL AND template_text != '';

-- Comentário sobre a estrutura
COMMENT ON COLUMN ai_prompt_templates.system_prompt IS 'Prompt do sistema (role: system) enviado à IA';
COMMENT ON COLUMN ai_prompt_templates.user_prompt IS 'Prompt do usuário (role: user) enviado à IA';
COMMENT ON COLUMN ai_prompt_templates.template_text IS 'Campo legado mantido para compatibilidade';

