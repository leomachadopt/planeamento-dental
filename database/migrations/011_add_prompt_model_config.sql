-- Migration 011: Adicionar configurações de modelo aos prompts
-- Permite que cada prompt tenha sua própria configuração de temperature e max_tokens

-- Adicionar colunas de configuração do modelo à tabela ai_prompt_templates
ALTER TABLE ai_prompt_templates
ADD COLUMN IF NOT EXISTS temperature DECIMAL(3,2) DEFAULT 0.7,
ADD COLUMN IF NOT EXISTS max_tokens INTEGER DEFAULT 4000,
ADD COLUMN IF NOT EXISTS model VARCHAR(50) DEFAULT 'gpt-4o';

-- Comentários para documentação
COMMENT ON COLUMN ai_prompt_templates.temperature IS 'Temperatura do modelo (0.0-2.0). Valores mais altos = mais criativo';
COMMENT ON COLUMN ai_prompt_templates.max_tokens IS 'Número máximo de tokens na resposta';
COMMENT ON COLUMN ai_prompt_templates.model IS 'Modelo a ser usado (gpt-4o, gpt-4-turbo, etc)';
