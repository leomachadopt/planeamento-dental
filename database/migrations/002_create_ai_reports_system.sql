-- Migração 002: Sistema de Relatórios por IA por Seção
-- Cria tabelas para armazenar relatórios gerados por IA, eventos de auditoria e templates de prompts

-- ============================================
-- 1. TABELA PRINCIPAL: AI_REPORTS
-- ============================================
CREATE TABLE IF NOT EXISTS ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  section_code VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'stale', 'error')),
  input_snapshot_json JSONB NOT NULL,
  report_markdown TEXT NOT NULL,
  insights_json JSONB NOT NULL,
  prompt_key VARCHAR(100) NOT NULL DEFAULT 'SECTION_REPORT_V1',
  prompt_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  model VARCHAR(50) NOT NULL DEFAULT 'gpt-4o',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  token_usage_json JSONB,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_reports_dossier_section ON ai_reports(clinic_id, dossier_id, section_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_reports_status ON ai_reports(status);
CREATE INDEX IF NOT EXISTS idx_ai_reports_section_code ON ai_reports(section_code);

-- ============================================
-- 2. TABELA DE EVENTOS (AUDITORIA)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_report_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_report_id UUID REFERENCES ai_reports(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('snapshot_built', 'llm_called', 'llm_response_parsed', 'persisted', 'error')),
  payload_json JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_report_events_report_id ON ai_report_events(ai_report_id);

-- ============================================
-- 3. TABELA DE TEMPLATES DE PROMPTS (OPCIONAL)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL,
  version VARCHAR(20) NOT NULL,
  template_text TEXT NOT NULL,
  section_code VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(key, version)
);

CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_key ON ai_prompt_templates(key);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_active ON ai_prompt_templates(is_active);

-- ============================================
-- 4. ENTIDADES ADICIONAIS PARA STRATEGY E PLAN
-- ============================================

-- Escolhas Estratégicas
CREATE TABLE IF NOT EXISTS strategic_choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  rationale TEXT,
  priority INTEGER CHECK (priority >= 1 AND priority <= 5),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_strategic_choices_dossier ON strategic_choices(clinic_id, dossier_id);

-- Iniciativas
CREATE TABLE IF NOT EXISTS initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  owner VARCHAR(255),
  timeframe VARCHAR(100),
  dependency_json JSONB,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_initiatives_dossier ON initiatives(clinic_id, dossier_id);

