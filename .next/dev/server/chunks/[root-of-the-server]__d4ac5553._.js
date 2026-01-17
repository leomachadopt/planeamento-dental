module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/Planeamento dental/planeamento-dental/src/lib/api-shared/auth.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authenticateToken",
    ()=>authenticateToken,
    "optionalAuth",
    ()=>optionalAuth,
    "requireAdmin",
    ()=>requireAdmin
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$jsonwebtoken__$5b$external$5d$__$28$jsonwebtoken$2c$__cjs$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$jsonwebtoken$29$__ = __turbopack_context__.i("[externals]/jsonwebtoken [external] (jsonwebtoken, cjs, [project]/Planeamento dental/planeamento-dental/node_modules/jsonwebtoken)");
;
// Usar variável de ambiente ou fallback
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
if (!process.env.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET não configurado! Usando valor padrão inseguro.');
}
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            error: 'Token não fornecido'
        });
    }
    try {
        const decoded = __TURBOPACK__imported__module__$5b$externals$5d2f$jsonwebtoken__$5b$external$5d$__$28$jsonwebtoken$2c$__cjs$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$jsonwebtoken$29$__["default"].verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            error: 'Token inválido ou expirado'
        });
    }
}
function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({
            error: 'Acesso negado. Admin necessário.'
        });
    }
    next();
}
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        try {
            const decoded = __TURBOPACK__imported__module__$5b$externals$5d2f$jsonwebtoken__$5b$external$5d$__$28$jsonwebtoken$2c$__cjs$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$jsonwebtoken$29$__["default"].verify(token, JWT_SECRET);
            req.user = decoded;
        } catch (error) {
        // Token inválido, mas continua sem autenticação
        }
    }
    next();
}
}),
"[project]/Planeamento dental/planeamento-dental/src/lib/api-shared/db.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// Módulo compartilhado para API routes
// Este arquivo só roda no servidor (Node.js)
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/Planeamento dental/planeamento-dental/node_modules/pg)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
// Validar DATABASE_URL
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não está configurada!');
    console.error('❌ Configure DATABASE_URL no arquivo .env.local ou nas variáveis de ambiente');
    throw new Error('DATABASE_URL não configurada. Configure no .env.local ou variáveis de ambiente.');
}
// Pool de conexões PostgreSQL
const pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$pg$29$__["Pool"]({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});
pool.on('connect', ()=>{
    console.log('✅ Conectado ao banco de dados Neon');
});
pool.on('error', (err)=>{
    console.error('❌ Erro no pool de conexões:', err);
});
const __TURBOPACK__default__export__ = pool;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/Planeamento dental/planeamento-dental/src/lib/api-shared/staleTracking.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getSectionForEntity",
    ()=>getSectionForEntity,
    "getSectionForQuestion",
    ()=>getSectionForQuestion,
    "markFinalReportAsStale",
    ()=>markFinalReportAsStale,
    "markSectionReportsAsStale",
    ()=>markSectionReportsAsStale
]);
// Função para marcar relatórios como stale quando dados são alterados
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/api-shared/db.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
async function markSectionReportsAsStale(dossierId, sectionCode) {
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`UPDATE ai_reports 
       SET status = 'stale', updated_at = NOW()
       WHERE dossier_id = $1 AND section_code = $2 AND status = 'generated'`, [
            dossierId,
            sectionCode
        ]);
    } catch (error) {
        console.error('Erro ao marcar relatórios como stale:', error);
    // Não lançar erro para não quebrar o fluxo principal
    }
}
function getSectionForEntity(entityType) {
    const entitySectionMap = {
        customer_segments: 'IDENTITY',
        value_propositions: 'IDENTITY',
        competitors: 'MARKET',
        service_categories: 'OFFER',
        services: 'OFFER',
        team_members: 'OPERATIONS',
        roles: 'OPERATIONS',
        capacities: 'OPERATIONS',
        strategic_choices: 'STRATEGY',
        initiatives: 'PLAN'
    };
    return entitySectionMap[entityType] || null;
}
async function getSectionForQuestion(questionId) {
    try {
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`SELECT s.code 
       FROM sections s
       JOIN question_sets qs ON qs.section_id = s.id
       JOIN questions q ON q.question_set_id = qs.id
       WHERE q.id = $1`, [
            questionId
        ]);
        if (result.rows.length > 0) {
            return result.rows[0].code;
        }
    } catch (error) {
        console.error('Erro ao buscar seção da pergunta:', error);
    }
    return null;
}
async function markFinalReportAsStale(dossierId) {
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`UPDATE ai_reports 
       SET status = 'stale', updated_at = NOW()
       WHERE dossier_id = $1 AND section_code = 'FINAL_REPORT' AND status = 'generated'`, [
            dossierId
        ]);
    } catch (error) {
        console.error('Erro ao marcar relatório final como stale:', error);
    // Não lançar erro para não quebrar o fluxo principal
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/Planeamento dental/planeamento-dental/src/lib/api-shared/sectionCompletion.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "updateSectionCompletion",
    ()=>updateSectionCompletion
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/api-shared/db.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
async function updateSectionCompletion(dossierId, sectionCode) {
    // 1. Buscar section_id pelo code
    const sectionResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT id FROM sections WHERE code = $1', [
        sectionCode
    ]);
    if (sectionResult.rows.length === 0) {
        console.warn(`Seção ${sectionCode} não encontrada`);
        return;
    }
    const sectionId = sectionResult.rows[0].id;
    // 2. Calcular completion_percent base (required questions respondidas / total required)
    const requiredQuestionsResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`SELECT COUNT(*) as total FROM questions q
     JOIN question_sets qs ON qs.id = q.question_set_id
     WHERE qs.section_id = $1 AND q.required = true`, [
        sectionId
    ]);
    const answeredResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`SELECT COUNT(*) as total FROM answers a
     JOIN questions q ON q.id = a.question_id
     JOIN question_sets qs ON qs.id = q.question_set_id
     WHERE qs.section_id = $1 AND a.dossier_id = $2 
     AND (a.value_text IS NOT NULL AND a.value_text != '' 
          OR a.value_number IS NOT NULL 
          OR a.value_json IS NOT NULL)`, [
        sectionId,
        dossierId
    ]);
    const totalRequired = parseInt(requiredQuestionsResult.rows[0].total);
    const totalAnswered = parseInt(answeredResult.rows[0].total);
    // Se não há perguntas required, considera 100% se não há perguntas, ou 0% se há mas nenhuma respondida
    let completionPercent = 0;
    if (totalRequired === 0) {
        // Verificar se há perguntas não-required respondidas
        const allQuestionsResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`SELECT COUNT(*) as total FROM questions q
       JOIN question_sets qs ON qs.id = q.question_set_id
       WHERE qs.section_id = $1`, [
            sectionId
        ]);
        const totalQuestions = parseInt(allQuestionsResult.rows[0].total);
        completionPercent = totalQuestions === 0 ? 100 : 0;
    } else {
        completionPercent = Math.round(totalAnswered / totalRequired * 100);
    }
    // 3. Aplicar bônus por entidades mínimas
    if (sectionCode === 'IDENTITY') {
        const segmentsResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT COUNT(*) as count FROM customer_segments WHERE dossier_id = $1 AND status = $2', [
            dossierId,
            'active'
        ]);
        const propositionsResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT COUNT(*) as count FROM value_propositions WHERE dossier_id = $1 AND status = $2', [
            dossierId,
            'active'
        ]);
        const hasSegments = parseInt(segmentsResult.rows[0].count) >= 1;
        const hasPropositions = parseInt(propositionsResult.rows[0].count) >= 1;
        if (hasSegments && hasPropositions) {
            completionPercent = Math.min(100, completionPercent + 10);
        } else if (hasSegments || hasPropositions) {
            completionPercent = Math.min(100, completionPercent + 5);
        }
    } else if (sectionCode === 'MARKET') {
        const competitorsResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT COUNT(*) as count FROM competitors WHERE dossier_id = $1 AND status = $2', [
            dossierId,
            'active'
        ]);
        const hasCompetitors = parseInt(competitorsResult.rows[0].count) >= 1;
        if (hasCompetitors) {
            completionPercent = Math.min(100, completionPercent + 10);
        }
    } else if (sectionCode === 'OFFER') {
        const servicesResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT COUNT(*) as count FROM services WHERE dossier_id = $1 AND status = $2', [
            dossierId,
            'active'
        ]);
        const hasServices = parseInt(servicesResult.rows[0].count) >= 1;
        if (hasServices) {
            completionPercent = Math.min(100, completionPercent + 10);
        }
    } else if (sectionCode === 'OPERATIONS') {
        const teamMembersResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT COUNT(*) as count FROM team_members WHERE dossier_id = $1 AND status = $2', [
            dossierId,
            'active'
        ]);
        const capacitiesResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT COUNT(*) as count FROM capacities WHERE dossier_id = $1 AND status = $2', [
            dossierId,
            'active'
        ]);
        const hasTeamMembers = parseInt(teamMembersResult.rows[0].count) >= 1;
        const hasCapacities = parseInt(capacitiesResult.rows[0].count) >= 1;
        if (hasTeamMembers || hasCapacities) {
            completionPercent = Math.min(100, completionPercent + 10);
        }
    } else if (sectionCode === 'STRATEGY') {
        const strategicChoicesResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT COUNT(*) as count FROM strategic_choices WHERE dossier_id = $1 AND status = $2', [
            dossierId,
            'active'
        ]);
        const hasStrategicChoices = parseInt(strategicChoicesResult.rows[0].count) >= 1;
        if (hasStrategicChoices) {
            completionPercent = Math.min(100, completionPercent + 10);
        }
    } else if (sectionCode === 'PLAN') {
        const initiativesResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT COUNT(*) as count FROM initiatives WHERE dossier_id = $1 AND status = $2', [
            dossierId,
            'active'
        ]);
        const hasInitiatives = parseInt(initiativesResult.rows[0].count) >= 1;
        if (hasInitiatives) {
            completionPercent = Math.min(100, completionPercent + 10);
        }
    }
    // 4. Determinar status baseado no completion_percent
    let status;
    if (completionPercent === 0) {
        status = 'not_started';
    } else if (completionPercent === 100) {
        status = 'complete';
    } else {
        status = 'in_progress';
    }
    // 5. Persistir no banco
    await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`INSERT INTO dossier_sections_status (dossier_id, section_id, completion_percent, status, last_updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (dossier_id, section_id)
     DO UPDATE SET 
       completion_percent = EXCLUDED.completion_percent,
       status = EXCLUDED.status,
       last_updated_at = NOW()`, [
        dossierId,
        sectionId,
        completionPercent,
        status
    ]);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/Planeamento dental/planeamento-dental/pages/api/dossiers/[id]/answers.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/api-shared/auth.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/api-shared/db.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$staleTracking$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/api-shared/staleTracking.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$sectionCompletion$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/api-shared/sectionCompletion.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$staleTracking$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$sectionCompletion$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$staleTracking$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$sectionCompletion$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["authenticateToken"])(req, res, async ()=>{
        try {
            const { method } = req;
            const authReq = req;
            const user = authReq.user;
            const dossierId = req.query.id;
            const sectionCode = req.query.sectionCode;
            if (!dossierId) {
                return res.status(400).json({
                    error: 'ID do dossiê é obrigatório'
                });
            }
            // Validar acesso ao dossiê
            const dossierResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT clinic_id FROM dossiers WHERE id = $1', [
                dossierId
            ]);
            if (dossierResult.rows.length === 0) {
                return res.status(404).json({
                    error: 'Dossiê não encontrado'
                });
            }
            const clinicId = dossierResult.rows[0].clinic_id;
            if (user.role !== 'admin' && user.clinicId !== clinicId) {
                return res.status(403).json({
                    error: 'Acesso negado a este dossiê'
                });
            }
            if (method === 'GET') {
                // Obter respostas por seção ou todas
                let query = `
          SELECT a.*, q.code as question_code, q.text as question_text, q.type as question_type
          FROM answers a
          JOIN questions q ON q.id = a.question_id
          WHERE a.dossier_id = $1
        `;
                const params = [
                    dossierId
                ];
                if (sectionCode) {
                    query += `
            AND q.question_set_id IN (
              SELECT qs.id FROM question_sets qs
              JOIN sections s ON s.id = qs.section_id
              WHERE s.code = $2
            )
          `;
                    params.push(sectionCode);
                }
                query += ' ORDER BY q.order_index';
                const result = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(query, params);
                return res.status(200).json(result.rows);
            }
            if (method === 'POST') {
                // Upsert de respostas (array)
                const { answers } = req.body;
                if (!Array.isArray(answers)) {
                    return res.status(400).json({
                        error: 'answers deve ser um array'
                    });
                }
                // Validar que todas as perguntas existem e pertencem ao dossiê
                const questionIds = answers.map((a)=>a.questionId).filter(Boolean);
                if (questionIds.length === 0) {
                    return res.status(400).json({
                        error: 'Nenhuma pergunta válida fornecida'
                    });
                }
                const questionsCheck = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT id, code, type FROM questions WHERE id = ANY($1::uuid[])', [
                    questionIds
                ]);
                if (questionsCheck.rows.length !== questionIds.length) {
                    return res.status(400).json({
                        error: 'Uma ou mais perguntas não foram encontradas'
                    });
                }
                // Processar cada resposta
                const upsertPromises = answers.map(async (answer)=>{
                    try {
                        const { questionId, valueText, valueNumber, valueJson, source } = answer;
                        // Determinar qual campo usar baseado no tipo da pergunta
                        const question = questionsCheck.rows.find((q)=>q.id === questionId);
                        if (!question) return null;
                        let finalValueText = null;
                        let finalValueNumber = null;
                        let finalValueJson = null;
                        if (question.type === 'number' || question.type === 'currency' || question.type === 'scale') {
                            finalValueNumber = valueNumber !== undefined ? valueNumber : valueText ? parseFloat(valueText) : null;
                        } else if (question.type === 'json' || question.type === 'multi_select') {
                            // Para tipos JSON, priorizar valueJson
                            if (valueJson !== undefined && valueJson !== null) {
                                finalValueJson = valueJson;
                            } else if (valueText) {
                                // Se tiver valueText, tentar fazer parse, mas capturar erro
                                try {
                                    finalValueJson = JSON.parse(valueText);
                                } catch (parseError) {
                                    // WORKAROUND: Para perguntas configuradas incorretamente como json/multi_select
                                    // mas que estão sendo usadas como textarea, salvar como texto mesmo
                                    console.warn(`⚠️ Pergunta ${question.code} é tipo ${question.type} mas recebeu texto simples. Salvando como value_text.`);
                                    finalValueText = valueText;
                                    finalValueJson = null;
                                }
                            } else {
                                finalValueJson = null;
                            }
                        } else {
                            finalValueText = valueText !== undefined ? valueText : valueNumber ? String(valueNumber) : null;
                        }
                        return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`INSERT INTO answers (dossier_id, question_id, value_text, value_number, value_json, source, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6, NOW())
               ON CONFLICT (dossier_id, question_id)
               DO UPDATE SET
                 value_text = EXCLUDED.value_text,
                 value_number = EXCLUDED.value_number,
                 value_json = EXCLUDED.value_json,
                 source = EXCLUDED.source,
                 updated_at = NOW()
               RETURNING *`, [
                            dossierId,
                            questionId,
                            finalValueText,
                            finalValueNumber,
                            finalValueJson,
                            source || 'user'
                        ]);
                    } catch (error) {
                        // Log do erro específico mas não falhar toda a operação
                        console.error(`Erro ao processar resposta da pergunta ${answer.questionId}:`, error.message);
                        throw error // Re-throw para que o erro seja capturado no catch principal
                        ;
                    }
                });
                const results = await Promise.all(upsertPromises.filter(Boolean));
                const savedAnswers = results.map((r)=>r.rows[0]).filter(Boolean);
                // Marcar relatórios como stale para as seções afetadas
                const affectedSections = new Set();
                for (const answer of savedAnswers){
                    const sectionCode = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$staleTracking$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getSectionForQuestion"])(answer.question_id);
                    if (sectionCode) {
                        affectedSections.add(sectionCode);
                    }
                }
                // Se sectionCode foi fornecido, usar ele diretamente
                if (sectionCode) {
                    affectedSections.add(sectionCode);
                }
                // Marcar todos os relatórios das seções afetadas como stale
                for (const sectionCodeToMark of affectedSections){
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$staleTracking$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["markSectionReportsAsStale"])(dossierId, sectionCodeToMark);
                }
                // Marcar relatório final como stale se alguma seção foi afetada
                if (affectedSections.size > 0) {
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$staleTracking$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["markFinalReportAsStale"])(dossierId);
                }
                // Atualizar completude das seções afetadas
                for (const sectionCodeToUpdate of affectedSections){
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$sectionCompletion$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["updateSectionCompletion"])(dossierId, sectionCodeToUpdate);
                }
                return res.status(200).json({
                    saved: savedAnswers.length,
                    answers: savedAnswers
                });
            }
            return res.status(405).json({
                error: 'Método não permitido'
            });
        } catch (error) {
            console.error('Erro na API de respostas:', error);
            return res.status(500).json({
                error: error.message
            });
        }
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d4ac5553._.js.map