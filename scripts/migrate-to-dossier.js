/**
 * Script de Migração: Converter dados existentes para o novo modelo de Dossiê
 * 
 * Este script:
 * 1. Cria um dossiê "Dossiê 2026 - Migrado" para cada clínica existente
 * 2. Migra dados de clinic_configs para answers (mapeando campos para códigos de perguntas)
 * 3. Migra dados de identities para answers
 * 4. Cria entidades básicas a partir de dados existentes quando possível
 * 
 * Uso: node scripts/migrate-to-dossier.js
 */

import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

// Mapeamento de campos de clinic_configs para códigos de perguntas
const CONFIG_TO_QUESTION_CODE = {
  nome_clinica: 'IDENTITY_CLINIC_NAME', // Se existir no futuro
  publico_principal: 'IDENTITY_PRIORITY_AUDIENCE',
  estagio_clinica: 'IDENTITY_STAGE', // Se existir no futuro
  objetivo_geral_2026: 'IDENTITY_GOALS_2026', // Se existir no futuro
  tom_linguagem: 'IDENTITY_TONE', // Se existir no futuro
}

// Mapeamento de campos de identities para códigos de perguntas
const IDENTITY_TO_QUESTION_CODE = {
  reason: 'IDENTITY_REASON',
  recognition_goal: 'IDENTITY_RECOGNITION_GOAL',
  values: 'IDENTITY_VALUES',
  priority_audience: 'IDENTITY_PRIORITY_AUDIENCE',
  price_positioning: 'IDENTITY_PRICE_POSITIONING',
  strategy_focus: 'IDENTITY_STRATEGY_FOCUS',
  strategy_focus_complement: 'IDENTITY_STRATEGY_FOCUS_COMPLEMENT',
}

async function migrateClinicToDossier(clinicId) {
  console.log(`\n📋 Migrando clínica ${clinicId}...`)

  try {
    // 1. Verificar se já existe um dossiê migrado
    const existingDossier = await pool.query(
      `SELECT id FROM dossiers 
       WHERE clinic_id = $1 AND title LIKE '%Migrado%' 
       LIMIT 1`,
      [clinicId],
    )

    let dossierId
    if (existingDossier.rows.length > 0) {
      console.log(`  ⚠️  Dossiê migrado já existe, usando existente`)
      dossierId = existingDossier.rows[0].id
    } else {
      // 2. Criar novo dossiê
      const dossierResult = await pool.query(
        `INSERT INTO dossiers (clinic_id, title, status, version_number, baseline_date)
         VALUES ($1, 'Dossiê 2026 - Migrado', 'draft', 1, CURRENT_DATE)
         RETURNING id`,
        [clinicId],
      )
      dossierId = dossierResult.rows[0].id
      console.log(`  ✅ Dossiê criado: ${dossierId}`)

      // 3. Inicializar status das seções
      const sections = await pool.query('SELECT id FROM sections ORDER BY order_index')
      for (const section of sections.rows) {
        await pool.query(
          `INSERT INTO dossier_sections_status (dossier_id, section_id, status, completion_percent)
           VALUES ($1, $2, 'not_started', 0)
           ON CONFLICT (dossier_id, section_id) DO NOTHING`,
          [dossierId, section.id],
        )
      }
    }

    // 4. Migrar dados de clinic_configs para answers
    const configResult = await pool.query(
      'SELECT * FROM clinic_configs WHERE clinic_id = $1',
      [clinicId],
    )

    if (configResult.rows.length > 0) {
      const config = configResult.rows[0]
      console.log(`  📝 Migrando configuração inicial...`)

      // Buscar question_set ativo de Identidade
      const questionSetResult = await pool.query(
        `SELECT qs.id FROM question_sets qs
         JOIN sections s ON s.id = qs.section_id
         WHERE s.code = 'IDENTITY' AND qs.is_active = true
         ORDER BY qs.version DESC
         LIMIT 1`,
      )

      if (questionSetResult.rows.length > 0) {
        const questionSetId = questionSetResult.rows[0].id

        // Migrar publico_principal para IDENTITY_PRIORITY_AUDIENCE
        if (config.publico_principal) {
          const questionResult = await pool.query(
            `SELECT id FROM questions 
             WHERE question_set_id = $1 AND code = 'IDENTITY_PRIORITY_AUDIENCE'`,
            [questionSetId],
          )

          if (questionResult.rows.length > 0) {
            const questionId = questionResult.rows[0].id
            await pool.query(
              `INSERT INTO answers (dossier_id, question_id, value_text, source)
               VALUES ($1, $2, $3, 'import')
               ON CONFLICT (dossier_id, question_id) 
               DO UPDATE SET value_text = EXCLUDED.value_text, updated_at = NOW()`,
              [dossierId, questionId, config.publico_principal],
            )
            console.log(`    ✅ Migrado: publico_principal`)
          }
        }
      }
    }

    // 5. Migrar dados de identities para answers
    const identityResult = await pool.query(
      'SELECT * FROM identities WHERE clinic_id = $1',
      [clinicId],
    )

    if (identityResult.rows.length > 0) {
      const identity = identityResult.rows[0]
      console.log(`  🎯 Migrando identidade estratégica...`)

      // Buscar question_set ativo de Identidade
      const questionSetResult = await pool.query(
        `SELECT qs.id FROM question_sets qs
         JOIN sections s ON s.id = qs.section_id
         WHERE s.code = 'IDENTITY' AND qs.is_active = true
         ORDER BY qs.version DESC
         LIMIT 1`,
      )

      if (questionSetResult.rows.length > 0) {
        const questionSetId = questionSetResult.rows[0].id

        // Migrar cada campo de identity
        for (const [field, questionCode] of Object.entries(IDENTITY_TO_QUESTION_CODE)) {
          const value = identity[field]
          if (value && value.trim()) {
            const questionResult = await pool.query(
              `SELECT id FROM questions 
               WHERE question_set_id = $1 AND code = $2`,
              [questionSetId, questionCode],
            )

            if (questionResult.rows.length > 0) {
              const questionId = questionResult.rows[0].id
              await pool.query(
                `INSERT INTO answers (dossier_id, question_id, value_text, source)
                 VALUES ($1, $2, $3, 'import')
                 ON CONFLICT (dossier_id, question_id) 
                 DO UPDATE SET value_text = EXCLUDED.value_text, updated_at = NOW()`,
                [dossierId, questionId, value],
              )
              console.log(`    ✅ Migrado: ${field} -> ${questionCode}`)
            }
          }
        }
      }
    }

    // 6. Recalcular completude da seção Identidade
    const sectionResult = await pool.query(
      "SELECT id FROM sections WHERE code = 'IDENTITY'",
    )
    if (sectionResult.rows.length > 0) {
      const sectionId = sectionResult.rows[0].id
      
      // Contar perguntas required e respostas
      const requiredQuestionsResult = await pool.query(
        `SELECT COUNT(*) as total FROM questions q
         JOIN question_sets qs ON qs.id = q.question_set_id
         JOIN sections s ON s.id = qs.section_id
         WHERE s.id = $1 AND q.required = true`,
        [sectionId],
      )

      const answeredResult = await pool.query(
        `SELECT COUNT(*) as total FROM answers a
         JOIN questions q ON q.id = a.question_id
         JOIN question_sets qs ON qs.id = q.question_set_id
         JOIN sections s ON s.id = qs.section_id
         WHERE s.id = $1 AND a.dossier_id = $2 
         AND (a.value_text IS NOT NULL AND a.value_text != '' 
              OR a.value_number IS NOT NULL 
              OR a.value_json IS NOT NULL)`,
        [sectionId, dossierId],
      )

      const totalRequired = parseInt(requiredQuestionsResult.rows[0].total)
      const totalAnswered = parseInt(answeredResult.rows[0].total)
      const completionPercent = totalRequired > 0 
        ? Math.round((totalAnswered / totalRequired) * 100) 
        : 0

      await pool.query(
        `UPDATE dossier_sections_status 
         SET completion_percent = $1, 
             status = CASE 
               WHEN $1 = 100 THEN 'complete'
               WHEN $1 > 0 THEN 'in_progress'
               ELSE 'not_started'
             END,
             last_updated_at = NOW()
         WHERE dossier_id = $2 AND section_id = $3`,
        [completionPercent, dossierId, sectionId],
      )

      console.log(`  📊 Completude da seção Identidade: ${completionPercent}%`)
    }

    console.log(`  ✅ Migração concluída para clínica ${clinicId}`)
    return { clinicId, dossierId, success: true }
  } catch (error) {
    console.error(`  ❌ Erro ao migrar clínica ${clinicId}:`, error.message)
    return { clinicId, success: false, error: error.message }
  }
}

async function main() {
  console.log('🚀 Iniciando migração de dados para o novo modelo de Dossiê...\n')

  try {
    // Buscar todas as clínicas
    const clinicsResult = await pool.query('SELECT id, clinic_name FROM clinics ORDER BY created_at')
    const clinics = clinicsResult.rows

    if (clinics.length === 0) {
      console.log('⚠️  Nenhuma clínica encontrada para migrar.')
      return
    }

    console.log(`📊 Encontradas ${clinics.length} clínica(s) para migrar\n`)

    const results = []
    for (const clinic of clinics) {
      const result = await migrateClinicToDossier(clinic.id)
      results.push(result)
    }

    // Resumo
    console.log('\n' + '='.repeat(50))
    console.log('📊 RESUMO DA MIGRAÇÃO')
    console.log('='.repeat(50))
    
    const successful = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    console.log(`✅ Sucesso: ${successful}`)
    console.log(`❌ Falhas: ${failed}`)
    console.log(`📋 Total: ${results.length}`)

    if (failed > 0) {
      console.log('\n⚠️  Clínicas com falha na migração:')
      results
        .filter((r) => !r.success)
        .forEach((r) => {
          console.log(`  - Clínica ${r.clinicId}: ${r.error}`)
        })
    }

    console.log('\n✅ Migração concluída!')
  } catch (error) {
    console.error('❌ Erro fatal na migração:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()




