-- Migração 003: Remover tabelas do sistema antigo de execução/planejamento
-- Este script remove todas as tabelas relacionadas ao sistema antigo de:
-- - Execução e PDCA (actions, okrs, key_results)
-- - Sistema antigo de relatórios (reports - substituído por ai_reports)
-- - Configuração antiga (clinic_configs)
-- - Diagnósticos antigos (porter_analysis, rumelt_diagnosis)
-- - Avaliações antigas (operational_assessments, market_assessments, manager_visions, etc.)
-- - Identidade e estratégia antigas (identities, blue_ocean_items, jtbd_items)

-- IMPORTANTE: Antes de executar esta migração, verifique se há dados importantes
-- que precisam ser migrados para o sistema de dossiês (answers, entidades).

-- ============================================
-- REMOVER TABELAS DE EXECUÇÃO E PDCA
-- ============================================

DROP TABLE IF EXISTS actions CASCADE;
DROP TABLE IF EXISTS key_results CASCADE;
DROP TABLE IF EXISTS okrs CASCADE;

-- ============================================
-- REMOVER SISTEMA ANTIGO DE RELATÓRIOS
-- ============================================

DROP TABLE IF EXISTS reports CASCADE; -- Sistema antigo (substituído por ai_reports)

-- ============================================
-- REMOVER CONFIGURAÇÃO ANTIGA
-- ============================================

DROP TABLE IF EXISTS clinic_configs CASCADE;

-- ============================================
-- REMOVER DIAGNÓSTICOS ANTIGOS
-- ============================================

DROP TABLE IF EXISTS porter_analysis CASCADE;
DROP TABLE IF EXISTS rumelt_diagnosis CASCADE;

-- ============================================
-- REMOVER AVALIAÇÕES ANTIGAS
-- ============================================

DROP TABLE IF EXISTS operational_assessments CASCADE;
DROP TABLE IF EXISTS market_assessments CASCADE;
DROP TABLE IF EXISTS manager_visions CASCADE;
DROP TABLE IF EXISTS manager_problems CASCADE;
DROP TABLE IF EXISTS manager_opportunities CASCADE;

-- ============================================
-- REMOVER IDENTIDADE E ESTRATÉGIA ANTIGAS
-- ============================================

DROP TABLE IF EXISTS identities CASCADE;
DROP TABLE IF EXISTS blue_ocean_items CASCADE;
DROP TABLE IF EXISTS jtbd_items CASCADE;

-- ============================================
-- REMOVER ÍNDICES RELACIONADOS
-- ============================================

DROP INDEX IF EXISTS idx_clinic_configs_clinic_id;
DROP INDEX IF EXISTS idx_porter_clinic_id;
DROP INDEX IF EXISTS idx_rumelt_clinic_id;
DROP INDEX IF EXISTS idx_okrs_clinic_id;
DROP INDEX IF EXISTS idx_actions_clinic_id;
DROP INDEX IF EXISTS idx_reports_clinic_id;
DROP INDEX IF EXISTS idx_blue_ocean_clinic_id;
DROP INDEX IF EXISTS idx_jtbd_clinic_id;
DROP INDEX IF EXISTS idx_identities_clinic_id;

-- ============================================
-- NOTAS
-- ============================================
-- 
-- Tabelas MANTIDAS (sistema novo de documentação):
-- - clinics
-- - dossiers
-- - sections, subsections
-- - question_sets, questions, question_options, answers
-- - customer_segments, value_propositions, services, service_categories
-- - competitors, roles, team_members, capacities
-- - strategic_choices, initiatives
-- - ai_reports, ai_report_events, ai_prompt_templates
-- - users, user_sessions


