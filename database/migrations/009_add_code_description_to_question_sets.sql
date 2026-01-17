-- Migração 009: Adicionar code e description à tabela question_sets
-- Necessário para suportar importação em lote de perguntas por código único

-- Adicionar coluna code (único por question_set)
ALTER TABLE question_sets
ADD COLUMN IF NOT EXISTS code VARCHAR(100);

-- Adicionar coluna description
ALTER TABLE question_sets
ADD COLUMN IF NOT EXISTS description TEXT;

-- Criar índice para melhor performance nas buscas por código
CREATE INDEX IF NOT EXISTS idx_question_sets_code ON question_sets(code);

-- Adicionar constraint de unicidade para section_id + code (quando code não é null)
-- Isso garante que não haverá duplicatas de question_sets com o mesmo código dentro de uma seção
CREATE UNIQUE INDEX IF NOT EXISTS idx_question_sets_section_code
ON question_sets(section_id, code)
WHERE code IS NOT NULL;
