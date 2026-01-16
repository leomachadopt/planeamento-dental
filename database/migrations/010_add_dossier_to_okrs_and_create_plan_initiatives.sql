-- Migração 010: Criar tabelas OKRs, key_results, actions e plan_initiatives para dossiês

-- Criar tabela OKRs (se não existir)
CREATE TABLE IF NOT EXISTS okrs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  objective TEXT NOT NULL,
  perspective VARCHAR(20) CHECK (perspective IN ('Financeira', 'Clientes', 'Processos', 'Aprendizado')),
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela key_results (se não existir)
CREATE TABLE IF NOT EXISTS key_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  okr_id UUID REFERENCES okrs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target NUMERIC NOT NULL,
  current NUMERIC DEFAULT 0,
  unit VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela actions (se não existir)
CREATE TABLE IF NOT EXISTS actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status VARCHAR(10) CHECK (status IN ('Plan', 'Do', 'Check', 'Act')),
  owner VARCHAR(255),
  deadline DATE,
  okr_id UUID REFERENCES okrs(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_okrs_clinic_id ON okrs(clinic_id);
CREATE INDEX IF NOT EXISTS idx_okrs_dossier_id ON okrs(dossier_id);
CREATE INDEX IF NOT EXISTS idx_key_results_okr_id ON key_results(okr_id);
CREATE INDEX IF NOT EXISTS idx_actions_clinic_id ON actions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_actions_dossier_id ON actions(dossier_id);
CREATE INDEX IF NOT EXISTS idx_actions_okr_id ON actions(okr_id);

-- Criar tabela de iniciativas de plano (mais específica que actions)
CREATE TABLE IF NOT EXISTS plan_initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  okr_id UUID REFERENCES okrs(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority INTEGER CHECK (priority >= 1 AND priority <= 5),
  impact VARCHAR(20) CHECK (impact IN ('high', 'medium', 'low')),
  effort VARCHAR(20) CHECK (effort IN ('high', 'medium', 'low')),
  owner_role VARCHAR(255),
  due_date DATE,
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'blocked', 'cancelled')),
  dependencies TEXT, -- IDs de outras iniciativas das quais esta depende, separados por vírgula
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plan_initiatives_dossier_id ON plan_initiatives(dossier_id);
CREATE INDEX IF NOT EXISTS idx_plan_initiatives_okr_id ON plan_initiatives(okr_id);
CREATE INDEX IF NOT EXISTS idx_plan_initiatives_status ON plan_initiatives(status);
