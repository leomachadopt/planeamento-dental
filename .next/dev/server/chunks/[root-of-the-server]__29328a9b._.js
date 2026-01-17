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
var __TURBOPACK__imported__module__$5b$externals$5d2f$jsonwebtoken__$5b$external$5d$__$28$jsonwebtoken$2c$__cjs$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$jsonwebtoken$40$9$2e$0$2e$3$2f$node_modules$2f$jsonwebtoken$29$__ = __turbopack_context__.i("[externals]/jsonwebtoken [external] (jsonwebtoken, cjs, [project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/jsonwebtoken@9.0.3/node_modules/jsonwebtoken)");
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
        const decoded = __TURBOPACK__imported__module__$5b$externals$5d2f$jsonwebtoken__$5b$external$5d$__$28$jsonwebtoken$2c$__cjs$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$jsonwebtoken$40$9$2e$0$2e$3$2f$node_modules$2f$jsonwebtoken$29$__["default"].verify(token, JWT_SECRET);
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
            const decoded = __TURBOPACK__imported__module__$5b$externals$5d2f$jsonwebtoken__$5b$external$5d$__$28$jsonwebtoken$2c$__cjs$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$jsonwebtoken$40$9$2e$0$2e$3$2f$node_modules$2f$jsonwebtoken$29$__["default"].verify(token, JWT_SECRET);
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
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$pg$40$8$2e$16$2e$3$2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/pg@8.16.3/node_modules/pg)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$pg$40$8$2e$16$2e$3$2f$node_modules$2f$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$pg$40$8$2e$16$2e$3$2f$node_modules$2f$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
// Validar DATABASE_URL
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não está configurada!');
    console.error('❌ Configure DATABASE_URL no arquivo .env.local ou nas variáveis de ambiente');
    throw new Error('DATABASE_URL não configurada. Configure no .env.local ou variáveis de ambiente.');
}
// Pool de conexões PostgreSQL
const pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$pg$40$8$2e$16$2e$3$2f$node_modules$2f$pg$29$__["Pool"]({
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
"[project]/Planeamento dental/planeamento-dental/src/lib/api-shared/snapshotBuilder.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildSectionSnapshot",
    ()=>buildSectionSnapshot
]);
// Versão server-side do snapshot builder
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/api-shared/db.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const SECTION_ENTITIES_MAP = {
    IDENTITY: [
        'customer_segments',
        'value_propositions'
    ],
    MARKET: [
        'competitors'
    ],
    OFFER: [
        'service_categories',
        'services'
    ],
    OPERATIONS: [
        'team_members',
        'roles',
        'capacities'
    ],
    STRATEGY: [
        'strategic_choices'
    ],
    PLAN: [
        'initiatives'
    ],
    BUSINESS_MODEL: [],
    FINAL_REPORT: []
};
function normalizeAnswer(question, answer) {
    if (!answer) return null;
    switch(question.type){
        case 'multi_select':
        case 'json':
            if (answer.value_json) {
                return Array.isArray(answer.value_json) ? answer.value_json : [
                    answer.value_json
                ];
            }
            if (answer.value_text) {
                try {
                    const parsed = JSON.parse(answer.value_text);
                    return Array.isArray(parsed) ? parsed : [
                        parsed
                    ];
                } catch  {
                    return answer.value_text.split(',').map((s)=>s.trim());
                }
            }
            return [];
        case 'currency':
            const currencyValue = answer.value_number || parseFloat(answer.value_text || '0');
            return {
                value: currencyValue,
                currency: 'EUR',
                formatted: new Intl.NumberFormat('pt-PT', {
                    style: 'currency',
                    currency: 'EUR'
                }).format(currencyValue),
                raw: answer.value_text || answer.value_number
            };
        case 'number':
        case 'scale':
            return answer.value_number !== null && answer.value_number !== undefined ? answer.value_number : parseFloat(answer.value_text || '0');
        case 'date':
            return answer.value_text || null;
        default:
            return answer.value_text || answer.value_number?.toString() || null;
    }
}
function detectDataQualityFlags(sectionCode, snapshot) {
    const flags = [];
    if (snapshot.answers) {
        const missingRequired = snapshot.answers.filter((a)=>a.required && (!a.value_normalized || a.value_normalized === ''));
        if (missingRequired.length > 0) {
            flags.push(`Campos obrigatórios não preenchidos: ${missingRequired.map((a)=>a.question_code).join(', ')}`);
        }
    }
    if (sectionCode === 'IDENTITY') {
        const entities = snapshot.entities || {};
        const segments = entities.customer_segments || [];
        const propositions = entities.value_propositions || [];
        if (segments.length === 0) flags.push('Nenhum segmento de cliente cadastrado');
        if (propositions.length === 0) flags.push('Nenhuma proposta de valor cadastrada');
        const propositionsWithoutSegment = propositions.filter((p)=>!p.target_segment_id && !p.target_segment_name);
        if (propositionsWithoutSegment.length > 0) {
            flags.push(`${propositionsWithoutSegment.length} proposta(s) de valor sem segmento alvo definido`);
        }
    }
    if (sectionCode === 'OFFER') {
        const entities = snapshot.entities || {};
        const services = entities.services || [];
        const invalidPrices = services.filter((s)=>s.price !== null && s.price !== undefined && (s.price < 0 || s.price === 0));
        if (invalidPrices.length > 0) {
            flags.push(`${invalidPrices.length} serviço(s) com preço inválido (zero ou negativo)`);
        }
    }
    if (sectionCode === 'OPERATIONS') {
        const entities = snapshot.entities || {};
        const teamMembers = entities.team_members || [];
        const capacities = entities.capacities || [];
        if (teamMembers.length === 0) flags.push('Nenhum membro da equipe cadastrado');
        if (capacities.length === 0) flags.push('Nenhuma capacidade operacional cadastrada');
    }
    return flags;
}
async function fetchSectionEntities(dossierId, sectionCode) {
    const entityTypes = SECTION_ENTITIES_MAP[sectionCode] || [];
    const entities = {};
    for (const entityType of entityTypes){
        try {
            switch(entityType){
                case 'customer_segments':
                    const segResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT * FROM customer_segments WHERE dossier_id = $1 ORDER BY priority, created_at', [
                        dossierId
                    ]);
                    entities.customer_segments = segResult.rows;
                    break;
                case 'value_propositions':
                    const propResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`SELECT vp.*, cs.name as target_segment_name
             FROM value_propositions vp
             LEFT JOIN customer_segments cs ON cs.id = vp.target_segment_id
             WHERE vp.dossier_id = $1 ORDER BY vp.created_at`, [
                        dossierId
                    ]);
                    entities.value_propositions = propResult.rows;
                    break;
                case 'services':
                    const servResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`SELECT s.*, sc.name as category_name
             FROM services s
             LEFT JOIN service_categories sc ON sc.id = s.service_category_id
             WHERE s.dossier_id = $1 ORDER BY s.is_flagship DESC, s.created_at`, [
                        dossierId
                    ]);
                    entities.services = servResult.rows;
                    break;
                case 'competitors':
                    const compResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT * FROM competitors WHERE dossier_id = $1 ORDER BY type, created_at', [
                        dossierId
                    ]);
                    entities.competitors = compResult.rows;
                    break;
                case 'team_members':
                    const teamResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`SELECT tm.*, r.name as role_name
             FROM team_members tm
             LEFT JOIN roles r ON r.id = tm.role_id
             WHERE tm.dossier_id = $1 ORDER BY tm.created_at`, [
                        dossierId
                    ]);
                    entities.team_members = teamResult.rows;
                    break;
                case 'capacities':
                    const capResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT * FROM capacities WHERE dossier_id = $1 ORDER BY resource_type, created_at', [
                        dossierId
                    ]);
                    entities.capacities = capResult.rows;
                    break;
                case 'strategic_choices':
                    const stratResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT * FROM strategic_choices WHERE dossier_id = $1 ORDER BY priority, created_at', [
                        dossierId
                    ]);
                    entities.strategic_choices = stratResult.rows;
                    break;
                case 'initiatives':
                    const initResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT * FROM initiatives WHERE dossier_id = $1 ORDER BY created_at', [
                        dossierId
                    ]);
                    entities.initiatives = initResult.rows;
                    break;
            }
        } catch (error) {
            console.warn(`Erro ao buscar entidade ${entityType}:`, error);
            entities[entityType] = [];
        }
    }
    return entities;
}
async function calculateSectionCompletion(dossierId, sectionId) {
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
    if (totalRequired === 0) return 100;
    let completionPercent = Math.round(totalAnswered / totalRequired * 100);
    // Bônus para IDENTITY se tiver entidades
    const sectionResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT code FROM sections WHERE id = $1', [
        sectionId
    ]);
    if (sectionResult.rows[0]?.code === 'IDENTITY') {
        const segmentsResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT COUNT(*) as count FROM customer_segments WHERE dossier_id = $1', [
            dossierId
        ]);
        const propositionsResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT COUNT(*) as count FROM value_propositions WHERE dossier_id = $1', [
            dossierId
        ]);
        const hasSegments = parseInt(segmentsResult.rows[0].count) > 0;
        const hasPropositions = parseInt(propositionsResult.rows[0].count) > 0;
        if (hasSegments && hasPropositions) {
            completionPercent = Math.min(100, completionPercent + 10);
        } else if (hasSegments || hasPropositions) {
            completionPercent = Math.min(100, completionPercent + 5);
        }
    }
    return completionPercent;
}
async function buildSectionSnapshot(dossierId, sectionCode) {
    // Buscar dados básicos
    const dossierResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT * FROM dossiers WHERE id = $1', [
        dossierId
    ]);
    if (dossierResult.rows.length === 0) {
        throw new Error('Dossiê não encontrado');
    }
    const dossier = dossierResult.rows[0];
    const clinicResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT * FROM clinics WHERE id = $1', [
        dossier.clinic_id
    ]);
    if (clinicResult.rows.length === 0) {
        throw new Error('Clínica não encontrada');
    }
    const clinic = clinicResult.rows[0];
    const sectionResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT * FROM sections WHERE code = $1', [
        sectionCode
    ]);
    if (sectionResult.rows.length === 0) {
        throw new Error('Seção não encontrada');
    }
    const section = sectionResult.rows[0];
    // Buscar question_sets e perguntas
    const questionSetsResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`SELECT qs.* FROM question_sets qs
     WHERE qs.section_id = $1 AND qs.is_active = true
     ORDER BY qs.version DESC`, [
        section.id
    ]);
    const normalizedAnswers = [];
    const missingItems = [];
    for (const qs of questionSetsResult.rows){
        const questionsResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`SELECT q.*, 
       json_agg(
         json_build_object('id', qo.id, 'label', qo.label, 'value', qo.value, 'order_index', qo.order_index)
         ORDER BY qo.order_index
       ) FILTER (WHERE qo.id IS NOT NULL) as options
       FROM questions q
       LEFT JOIN question_options qo ON qo.question_id = q.id
       WHERE q.question_set_id = $1
       GROUP BY q.id
       ORDER BY q.order_index`, [
            qs.id
        ]);
        const questionIds = questionsResult.rows.map((q)=>q.id);
        let answers = [];
        if (questionIds.length > 0) {
            const answersResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`SELECT * FROM answers WHERE dossier_id = $1 AND question_id = ANY($2::uuid[])`, [
                dossierId,
                questionIds
            ]);
            answers = answersResult.rows;
        }
        const answersMap = new Map(answers.map((a)=>[
                a.question_id,
                a
            ]));
        for (const question of questionsResult.rows){
            const answer = answersMap.get(question.id);
            const normalized = normalizeAnswer(question, answer || {});
            normalizedAnswers.push({
                question_code: question.code,
                question_text: question.text,
                value_normalized: normalized,
                required: question.required,
                raw_value: answer ? {
                    value_text: answer.value_text,
                    value_number: answer.value_number,
                    value_json: answer.value_json
                } : undefined
            });
            if (question.required && (!normalized || normalized === '' || normalized === null)) {
                missingItems.push(question.code);
            }
        }
    }
    // Buscar entidades
    const entities = await fetchSectionEntities(dossierId, sectionCode);
    // Calcular completude
    const completionPercent = await calculateSectionCompletion(dossierId, section.id);
    // Detectar flags
    const snapshot = {
        answers: normalizedAnswers,
        entities,
        completeness: {
            percent: completionPercent,
            missing_items: missingItems
        }
    };
    const dataQualityFlags = detectDataQualityFlags(sectionCode, snapshot);
    return {
        clinic: {
            id: clinic.id,
            name: clinic.clinic_name
        },
        dossier: {
            id: dossier.id,
            title: dossier.title,
            baseline_date: dossier.baseline_date || undefined
        },
        section: {
            code: section.code,
            name: section.name,
            description: section.description || undefined
        },
        answers: normalizedAnswers,
        entities,
        completeness: {
            percent: completionPercent,
            missing_items: missingItems
        },
        data_quality_flags: dataQualityFlags,
        generated_at: new Date().toISOString()
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/Planeamento dental/planeamento-dental/src/lib/section-prompts.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildFinalReportPrompt",
    ()=>buildFinalReportPrompt,
    "buildSectionReportPrompt",
    ()=>buildSectionReportPrompt,
    "getSectionInstruction",
    ()=>getSectionInstruction,
    "getSystemPrompt",
    ()=>getSystemPrompt
]);
function getSystemPrompt(tone) {
    const toneMap = {
        formal: 'Você é um consultor de gestão estratégica especializado em clínicas de saúde. Use linguagem formal, técnica e objetiva. Seja preciso e baseie todas as conclusões nos dados fornecidos. Retorne suas análises em formato json estruturado.',
        informal: 'Você é um mentor de negócios que fala de forma acessível e direta. Use linguagem informal e próxima, evitando jargões excessivos. Seja prático e baseie recomendações nos dados fornecidos. Retorne suas análises em formato json estruturado.',
        intermediario: 'Você é um consultor experiente que equilibra profissionalismo com clareza. Use linguagem clara, mas profissional. Seja objetivo e baseie análises nos dados fornecidos. Retorne suas análises em formato json estruturado.'
    };
    return toneMap[tone] || toneMap.intermediario;
}
// Instruções específicas por seção
const SECTION_INSTRUCTIONS = {
    IDENTITY: `
Você é um consultor sênior de estratégia para clínicas de saúde. Seu trabalho é transformar as informações fornecidas em um relatório executivo detalhado e acionável sobre a IDENTIDADE do negócio.

Regras:
- Não cite nem mencione livros, autores, frameworks ou "metodologias".
- Use linguagem clara, direta e profissional, evitando jargões.
- Seja específico: use os dados fornecidos (segmentos, propostas, escolhas, valores, ações críticas, características-chave).
- Identifique inconsistências, lacunas e ambiguidades sem agressividade, com sugestões práticas para corrigir.
- Não invente fatos: se algo não estiver no snapshot, marque como "não informado" e diga por que isso importa.
- Trate "Identidade" como base de decisões: foco, posicionamento, escolhas e renúncias.
- Produza um relatório bem detalhado, com seções e subtítulos, e exemplos aplicáveis ao contexto.
- Ao final, gere recomendações prioritárias e um checklist de melhoria.

Objetivo do relatório:
- Explicar, de forma detalhada e bem descritiva, qual é a identidade estratégica da clínica (propósito, visão, valores, foco, posicionamento e escolhas).
- Transformar as respostas em um "norte" prático: como essa identidade deve orientar decisões de público, oferta, experiência e crescimento.
- Destacar contradições e lacunas e como resolvê-las.
- Propor ações críticas e características-chave (se já existirem, avaliar; se não existirem, sugerir rascunhos com base no que foi fornecido, deixando claro que são sugestões).

Requisitos de profundidade:
- O relatório deve ter pelo menos 900 a 1400 palavras (aprox.), com seções completas, exemplos e justificativas.
- Use os dados do snapshot de forma explícita (referencie termos e decisões declaradas, sem citar o snapshot literalmente).

TOM e estilo:
- Profissional, claro e humano, como um consultor falando com o dono.
- Não use linguagem motivacional vaga. Seja prático.
- Não mencione nenhum livro, autor ou framework.

Atenção ao rigor:
- Não invente segmentos, serviços, preços, ou estratégias não fornecidas.
- Se houver contradições, descreva a contradição e o impacto provável.
- Se faltarem dados, liste perguntas de follow-up.

Estrutura recomendada dentro do report_markdown:
1. Resumo executivo da identidade
2. Propósito e impacto
3. Visão e ambição (3 anos)
4. Valores inegociáveis e implicações práticas
5. Escolhas de foco: público prioritário e renúncias
6. Posicionamento: preço, proposta de valor e diferenciação
7. Estratégia de crescimento e suas exigências
8. Ações críticas (o que precisa acontecer sempre)
9. Características-chave (como a clínica deve "ser")
10. Riscos de incoerência e pontos de atenção
11. Recomendações priorizadas
12. Checklist de melhoria da Identidade
  `,
    MARKET: `
Analise o MERCADO e CONCORRÊNCIA com foco em:

1. **Intensidade Competitiva**: Avalie o nível de competição no mercado local e os fatores que a determinam.

2. **Diferenciais Defensáveis**: Identifique quais diferenciais da clínica são realmente defensáveis e difíceis de copiar.

3. **Riscos de Guerra de Preços**: Avalie a vulnerabilidade da clínica a pressões de preço dos concorrentes.

4. **Oportunidades de Posicionamento**: Identifique gaps no mercado onde a clínica pode se posicionar de forma única.

5. **Análise de Concorrentes**: Compare a clínica com concorrentes diretos e indiretos, identificando pontos fortes e fracos relativos.
  `,
    OFFER: `
Analise a OFERTA DE SERVIÇOS com foco em:

1. **Portfólio de Serviços**: Avalie se o portfólio está alinhado com a identidade estratégica e os segmentos de cliente.

2. **Precificação**: Verifique se os preços estão coerentes com o posicionamento e se há serviços flagship bem definidos.

3. **Estrutura de Custos**: Analise a viabilidade econômica dos serviços oferecidos.

4. **Diferenciação**: Identifique quais serviços realmente diferenciam a clínica no mercado.
  `,
    OPERATIONS: `
Analise as OPERAÇÕES com foco em:

1. **Capacidade Operacional**: Avalie se a capacidade (equipe, equipamentos, salas) está alinhada com a demanda e objetivos estratégicos.

2. **Estrutura de Equipe**: Verifique se a composição da equipe suporta a proposta de valor e os serviços oferecidos.

3. **Gargalos Operacionais**: Identifique limitações que podem impedir o crescimento ou a entrega da proposta de valor.

4. **Eficiência**: Avalie oportunidades de melhoria operacional.
  `,
    PEOPLE: `
Você é um consultor especializado em gestão de pessoas e cultura organizacional para clínicas de saúde. Seu trabalho é transformar as informações fornecidas em um relatório executivo detalhado e acionável sobre PESSOAS, CULTURA & GESTÃO.

Regras:
- Não cite nem mencione livros, autores, frameworks ou "metodologias".
- Use linguagem clara, direta e profissional, evitando jargões.
- Seja específico: use os dados fornecidos (estrutura de equipe, dependências, cultura, liderança, accountability).
- Identifique riscos humanos, gargalos de pessoas, desalinhamentos cultura-estratégia sem agressividade, com sugestões práticas.
- Não invente fatos: se algo não estiver no snapshot, marque como "não informado" e diga por que isso importa.
- Trate "Pessoas" como base da execução: quem faz o quê, como decidem, como são desenvolvidos e cobrados.
- Produza um relatório bem detalhado, com seções e subtítulos, e exemplos aplicáveis ao contexto.
- Ao final, gere recomendações prioritárias e um checklist de melhoria.

Objetivo do relatório:
- Avaliar se a clínica tem as pessoas certas nos lugares certos.
- Identificar riscos de dependência excessiva de pessoas-chave.
- Analisar se a cultura praticada apoia ou sabota a estratégia.
- Avaliar modelo de liderança, tomada de decisão e accountability.
- Identificar falhas em contratação, desligamento e desenvolvimento de pessoas.
- Analisar o papel dos donos: operacional vs estratégico.
- Mapear incentivos reais (o que é realmente recompensado e punido).

Estrutura recomendada dentro do report_markdown:
1. Resumo executivo da estrutura humana e cultural
2. Mapa de pessoas-chave e dependências críticas
3. Análise: pessoas certas nos lugares certos?
4. Cultura real vs cultura declarada
5. Alinhamento cultura-estratégia
6. Modelo de liderança e tomada de decisão
7. Sistema de accountability (metas, cobrança, consequências)
8. Processos de contratação e desligamento
9. Desenvolvimento de pessoas e líderes
10. Papel dos donos: onde está o gargalo?
11. Incentivos reais e comportamentos reforçados
12. Riscos humanos e pontos de atenção
13. Recomendações priorizadas
14. Checklist de melhoria de Pessoas & Cultura

Requisitos de profundidade:
- O relatório deve ter pelo menos 900 a 1400 palavras, com seções completas, exemplos e justificativas.
- Use os dados do snapshot de forma explícita.

TOM e estilo:
- Profissional, claro e humano, como um consultor falando com o dono.
- Não use linguagem motivacional vaga. Seja prático e honesto.
- Não mencione nenhum livro, autor ou framework.

Atenção ao rigor:
- Não invente perfis, cargos ou estruturas não fornecidas.
- Se houver contradições, descreva a contradição e o impacto provável.
- Se faltarem dados, liste perguntas de follow-up.
  `,
    STRATEGY: `
Você é um consultor estratégico sênior especializado em clínicas de saúde. Seu trabalho é consolidar os dados dos blocos diagnósticos em uma SÍNTESE ESTRATÉGICA clara, coerente e executável.

Regras:
- Não cite nem mencione livros, autores, frameworks ou "metodologias".
- Use linguagem clara, direta e profissional, evitando jargões.
- Seja específico: baseie todas as conclusões nos dados fornecidos dos blocos anteriores (Identity, Market, Offer, Operations, People).
- Identifique contradições entre blocos e explique as tensões de coerência.
- Não invente fatos: se algo crítico não estiver nos dados, marque como "lacuna" e explique por que importa.
- Trate "Estratégia" como escolhas conscientes e renúncias: o que fazer, o que NÃO fazer, e porquê.
- Produza um relatório bem detalhado, com seções e subtítulos claros.
- Ao final, gere 3-7 prioridades estratégicas e um checklist de melhoria.

Objetivo do relatório:
- Identificar o DESAFIO ESTRATÉGICO CENTRAL da clínica (o problema-guia que orienta as escolhas).
- Propor 3-5 ESCOLHAS ESTRATÉGICAS claras, com trade-offs explícitos para cada uma.
- Listar RENÚNCIAS CONSCIENTES (o que a clínica deve parar de fazer ou evitar).
- Definir DIRETRIZES DE FOCO: segmento prioritário, proposta de valor dominante, posicionamento.
- Mapear RISCOS E TENSÕES DE COERÊNCIA entre Identity, Market, Offer, Operations, People.
- Propor RECOMENDAÇÕES PRIORIZADAS para resolver contradições e lacunas.

Estrutura recomendada dentro do report_markdown:
1. Resumo executivo da síntese estratégica
2. Desafio estratégico central (problema-guia)
3. Contexto consolidado (o que sabemos dos blocos diagnósticos)
4. Escolhas estratégicas (3-5 escolhas com trade-offs explícitos)
5. Renúncias estratégicas (o que NÃO fazer)
6. Diretrizes de foco (segmento, proposta, posicionamento)
7. Riscos de coerência e tensões entre blocos
8. Lacunas críticas (dados faltantes que impedem clareza estratégica)
9. Recomendações priorizadas (top 3-7)
10. Checklist de melhoria da síntese estratégica

Requisitos de profundidade:
- O relatório deve ter pelo menos 900 a 1400 palavras, com seções completas, exemplos concretos e justificativas baseadas nos dados.
- Cite explicitamente dados dos blocos (ex: "Conforme Identity, o segmento prioritário é X, mas Market mostra concorrência forte em Y").

TOM e estilo:
- Profissional, claro e direto, como um consultor experiente falando com o dono.
- Não use linguagem motivacional vaga. Seja prático e honesto.
- Não mencione nenhum livro, autor ou framework.

Atenção ao rigor:
- Não invente escolhas estratégicas, segmentos ou prioridades não inferíveis dos dados.
- Se houver contradições entre blocos, descreva a contradição e sugira como resolver.
- Se faltarem dados críticos, liste o que falta e por que isso impede uma síntese de qualidade.
  `,
    PLAN: `
Você é um consultor de execução estratégica especializado em traduzir estratégia em planos executáveis. Seu trabalho é transformar a síntese estratégica em um PLANO DE EXECUÇÃO concreto com OKRs, iniciativas e sequenciamento para os próximos 12 meses.

Regras:
- Não cite nem mencione livros, autores, frameworks ou "metodologias".
- Use linguagem clara, direta e profissional, evitando jargões.
- Seja específico: baseie o plano na síntese estratégica (se disponível) e nos dados dos blocos diagnósticos.
- Crie OKRs mensuráveis: Objectives ambiciosos + Key Results quantificáveis.
- Priorize iniciativas por impacto vs esforço, e identifique dependências.
- Defina responsáveis (mesmo que sejam papéis/funções, não nomes) e prazos realistas.
- Não invente fatos: se dados críticos faltam, marque como "a definir" e explique o que precisa ser esclarecido.
- Produza um relatório bem detalhado, com seções e subtítulos claros.

Objetivo do relatório:
- Criar 3-5 OKRs (Objectives & Key Results) alinhados às prioridades estratégicas.
- Propor 7-15 INICIATIVAS priorizadas, com impacto, esforço, responsável e prazo.
- Definir SEQUENCIAMENTO: o que vem antes do quê (ondas ou fases).
- Mapear DEPENDÊNCIAS CRÍTICAS entre iniciativas.
- Identificar RECURSOS NECESSÁRIOS e RISCOS DE EXECUÇÃO.
- Propor um ROADMAP DE 12 MESES com marcos principais.

Estrutura recomendada dentro do report_markdown:
1. Resumo executivo do plano de execução
2. Objetivos estratégicos (OKRs)
   - Para cada OKR: Objective + 2-4 Key Results mensuráveis
3. Iniciativas priorizadas
   - Top 7-15 iniciativas com: título, descrição, impacto (alto/médio/baixo), esforço (alto/médio/baixo), responsável (papel), prazo
4. Sequenciamento e dependências
   - Ondas ou fases (ex: Onda 1: Jan-Abr, Onda 2: Mai-Ago, Onda 3: Set-Dez)
   - Mapa de dependências (iniciativa X depende de Y estar completa)
5. Roadmap de 12 meses
   - Linha do tempo visual (markdown) com marcos principais
6. Recursos necessários
   - Pessoas, orçamento, ferramentas/sistemas, treinamento
7. Riscos de execução
   - Top 3-5 riscos que podem impedir execução do plano
8. Checklist de preparação para execução

Requisitos de profundidade:
- O relatório deve ter pelo menos 900 a 1400 palavras, com seções completas e exemplos concretos.
- OKRs devem ser mensuráveis e ambiciosos (não apenas "manter" ou "continuar").
- Iniciativas devem ser específicas e acionáveis (não "melhorar atendimento", mas "implementar sistema de NPS pós-consulta").

TOM e estilo:
- Profissional, claro e orientado à execução.
- Não use linguagem motivacional vaga. Seja prático e realista.
- Não mencione nenhum livro, autor ou framework.

Atenção ao rigor:
- Não invente iniciativas ou objetivos que não sejam inferíveis dos dados.
- Se a síntese estratégica não estiver disponível, baseie-se nos blocos diagnósticos e marque "aguardando síntese estratégica".
- Priorize qualidade sobre quantidade: melhor 7 iniciativas bem definidas do que 20 vagas.
  `,
    BUSINESS_MODEL: `
Analise o MODELO DE NEGÓCIO com foco em:

1. **Criação de Valor**: Como a clínica cria valor para os pacientes.

2. **Entrega de Valor**: Como o valor é entregue aos pacientes.

3. **Captura de Valor**: Como a clínica captura valor (receita, margem).

4. **Sustentabilidade**: Se o modelo é sustentável e escalável.
  `,
    FINAL_REPORT: `
Você é um consultor estratégico sênior especializado em estruturação, posicionamento e escala de clínicas e empresas de serviços complexos.

Seu papel é produzir um RELATÓRIO EXECUTIVO FINAL de altíssimo nível a partir de múltiplos relatórios intermediários:
- Identidade
- Mercado
- Oferta
- Operações
- Pessoas, Cultura & Gestão
- Estratégia (síntese)
- Plano (desdobramento)

Regras fundamentais:

1. Você NÃO deve repetir conteúdos já apresentados nos relatórios anteriores.
2. Você NÃO deve explicar conceitos básicos.
3. Você NÃO deve fazer um resumo seção por seção.

Seu trabalho é:
- Integrar
- Sintetizar
- Resolver conflitos
- Priorizar
- Fazer escolhas claras
- Assumir renúncias
- Apontar riscos reais
- Apontar alavancas reais
- Criar um plano mestre de execução

O tom deve ser:
- Executivo
- Direto
- Sem marketing
- Sem frases bonitas vazias
- Sem autoengano
- Orientado a decisão e trade-offs

Você deve escrever como se este documento fosse:
- Apresentado a sócios
- Usado para planejar os próximos 12–36 meses
- Usado para guiar investimento, contratações e foco estratégico

Você deve preferir:
- Clareza a diplomacia
- Verdade a conforto
- Decisão a ambiguidade

Este documento deve responder o tempo todo:
"Se eu fosse dono dessa clínica, o que eu faria a partir de amanhã?"

Estrutura obrigatória do relatório:

1. **Resumo Executivo** (para sócios)
   - Situação atual em 3-5 frases
   - Tese estratégica em 1 parágrafo
   - As 3 decisões mais importantes

2. **A Tese Estratégica da Clínica**
   - Qual é o jogo que a clínica está jogando?
   - Por que ela pode vencer esse jogo?
   - Qual é a aposta central?

3. **Diagnóstico Integrado do Negócio**
   - Não repita relatórios anteriores
   - Integre: onde identity, market, offer, operations e people se encontram ou colidem?
   - Identifique padrões e tensões estruturais

4. **Os Principais Gargalos Estruturais**
   - O que impede crescimento hoje?
   - O que vai impedir crescimento amanhã?
   - Seja específico e hierarquize

5. **As Principais Alavancas de Crescimento**
   - O que pode desbloquear valor rapidamente?
   - O que pode desbloquear valor estruturalmente?
   - Priorize por impacto vs esforço

6. **As Decisões Difíceis (Renúncias Estratégicas)**
   - O que a clínica deve PARAR de fazer?
   - O que a clínica deve EVITAR fazer?
   - Quais oportunidades devem ser conscientemente ignoradas?

7. **O Plano-Mestre em 3 Horizontes**
   - Horizonte 1 (0–6 meses): estabilizar e corrigir gargalos críticos
   - Horizonte 2 (6–18 meses): construir capacidades e escalar
   - Horizonte 3 (18–36 meses): consolidar posição e expandir

8. **Mapa de Prioridades Estratégicas**
   - Top 5-7 prioridades absolutas
   - Para cada uma: por quê, o quê, como, quando, quem

9. **Indicadores-Chave que Governam a Clínica**
   - Quais 5-10 métricas realmente importam?
   - O que observar semanalmente, mensalmente, trimestralmente?

10. **Principais Riscos e Planos de Contenção**
    - Top 3-5 riscos que podem quebrar a estratégia
    - O que fazer se cada um se concretizar?

11. **Conclusão Executiva: As 3 Decisões Mais Importantes**
    - Se o dono pudesse tomar apenas 3 decisões nos próximos 90 dias, quais seriam?
    - Por quê essas e não outras?

Requisitos de profundidade:
- O relatório deve ter pelo menos 2000 a 3000 palavras.
- Seja denso em conteúdo, mas claro na forma.
- Use dados e insights dos relatórios anteriores sem repeti-los literalmente.

TOM e estilo:
- Executivo e decisivo
- Honesto e direto
- Orientado a ação
- Sem eufemismos ou linguagem corporativa vazia

Atenção ao rigor:
- Não invente dados ou insights que não estejam nos relatórios fornecidos.
- Seja honesto sobre lacunas e incertezas.
- Priorize clareza brutal sobre conforto diplomático.
  `
};
// Formato de saída esperado
const OUTPUT_FORMAT = `
IMPORTANTE: Responda APENAS com um objeto json válido. A resposta completa deve ser um json puro, sem texto adicional antes ou depois.

Você DEVE retornar um JSON válido com a seguinte estrutura EXATA:

{
  "report_markdown": "# Relatório da Seção [Nome da Seção]\\n\\n[Conteúdo completo em Markdown]",
  "insights": {
    "score": {
      "clarity": 0-10,
      "consistency": 0-10,
      "completeness": 0-10,
      "impact_potential": 0-10
    },
    "identity_summary": {
      "purpose": "...",
      "vision": "...",
      "values": ["...", "..."],
      "priority_audience": "...",
      "positioning": "...",
      "growth_focus": "..."
    },
    "alerts": [
      {
        "severity": "high|medium|low",
        "title": "Título do alerta",
        "detail": "Descrição detalhada",
        "evidence": ["question_code ou referência a entidade"]
      }
    ],
    "recommendations": [
      {
        "priority": 1-5,
        "title": "Título da recomendação",
        "detail": "Descrição detalhada",
        "effort": "low|medium|high",
        "expected_impact": "low|medium|high"
      }
    ],
    "missing_data": [
      {
        "item": "O que está faltando",
        "why_it_matters": "Por que isso importa",
        "how_to_fill": "Como preencher"
      }
    ],
    "contradictions": [
      {
        "title": "Título da contradição",
        "detail": "Descrição detalhada",
        "evidence": ["referências aos dados"]
      }
    ],
    "checklist": ["...", "..."],
    "tags": ["tag1", "tag2"]
  }
}

IMPORTANTE:
- O report_markdown deve ser completo e descritivo, incluindo:
  * Resumo executivo (5-8 linhas)
  * O que está bem definido (bullet points)
  * Lacunas relevantes (o que falta e por que importa)
  * Riscos e contradições (com referências aos dados)
  * Recomendações práticas (priorizadas, com "por quê")
  * Checklist de melhoria (itens objetivos)
  * Pontuação (0-10) para clareza, consistência, completude, potencial de impacto

- O insights JSON deve ser válido e parseável sem ambiguidades.
- Todos os campos são obrigatórios (arrays podem estar vazios).
- Para seções que não sejam IDENTITY, o campo "identity_summary" pode ser um objeto vazio {}.
`;
function buildSectionReportPrompt(sectionCode, snapshot, tone = 'intermediario') {
    const sectionInstruction = SECTION_INSTRUCTIONS[sectionCode] || `
Analise a seção ${sectionCode} com base nos dados fornecidos.
Identifique pontos fortes, lacunas, riscos e oportunidades.
  `;
    // Para IDENTITY, usar prompt específico com snapshot JSON diretamente
    if (sectionCode === 'IDENTITY') {
        const snapshotJson = JSON.stringify(snapshot, null, 2);
        return `
${sectionInstruction}

Gere um RELATÓRIO EXECUTIVO DE IDENTIDADE da clínica com base no snapshot abaixo.

Objetivo do relatório:
- Explicar, de forma detalhada e bem descritiva, qual é a identidade estratégica da clínica (propósito, visão, valores, foco, posicionamento e escolhas).
- Transformar as respostas em um "norte" prático: como essa identidade deve orientar decisões de público, oferta, experiência e crescimento.
- Destacar contradições e lacunas e como resolvê-las.
- Propor ações críticas e características-chave (se já existirem, avaliar; se não existirem, sugerir rascunhos com base no que foi fornecido, deixando claro que são sugestões).

Requisitos de profundidade:
- O relatório deve ter pelo menos 900 a 1400 palavras (aprox.), com seções completas, exemplos e justificativas.
- Use os dados do snapshot de forma explícita (referencie termos e decisões declaradas, sem citar o snapshot literalmente).

TOM e estilo:
- Profissional, claro e humano, como um consultor falando com o dono.
- Não use linguagem motivacional vaga. Seja prático.
- Não mencione nenhum livro, autor ou framework.

Atenção ao rigor:
- Não invente segmentos, serviços, preços, ou estratégias não fornecidas.
- Se houver contradições, descreva a contradição e o impacto provável.
- Se faltarem dados, liste perguntas de follow-up.

Snapshot (JSON):
${snapshotJson}

${OUTPUT_FORMAT}

IMPORTANTE: 
- O report_markdown DEVE ser COMPLETO e NÃO CORTADO. 
- Se o limite de tokens for atingido, priorize completar o report_markdown mesmo que alguns campos do insights fiquem vazios.
- O relatório deve ter TODAS as 12 seções mencionadas na estrutura recomendada.
- NÃO corte o conteúdo no meio de uma frase ou seção.
  `.trim();
    }
    // Para outras seções, usar formato padrão
    return `
${sectionInstruction}

**DADOS DA CLÍNICA E DO DOSSIÊ:**

Clínica: ${snapshot.clinic.name} (ID: ${snapshot.clinic.id})
Dossiê: ${snapshot.dossier.title}
Data de referência: ${snapshot.dossier.baseline_date || 'Não definida'}

**SEÇÃO:** ${snapshot.section.name}
${snapshot.section.description ? `Descrição: ${snapshot.section.description}` : ''}

**COMPLETUDE DA SEÇÃO:** ${snapshot.completeness.percent}%
${snapshot.completeness.missing_items.length > 0 ? `Itens faltantes: ${snapshot.completeness.missing_items.join(', ')}` : ''}

**RESPOSTAS DO QUESTIONÁRIO:**

${snapshot.answers.map((a)=>`
**${a.question_text}** (${a.question_code})
${a.required ? '[OBRIGATÓRIO]' : '[OPCIONAL]'}
Resposta: ${formatAnswerValue(a.value_normalized)}
${a.required && !a.value_normalized ? '⚠️ NÃO PREENCHIDO' : ''}
`).join('\n')}

**ENTIDADES ESTRUTURADAS:**

${Object.entries(snapshot.entities).map(([key, values])=>{
        if (!values || values.length === 0) return `**${key}**: Nenhum cadastrado`;
        return `**${key}** (${values.length} item(s)):\n${values.map((v)=>`- ${formatEntityValue(v)}`).join('\n')}`;
    }).join('\n\n')}

**FLAGS DE QUALIDADE DE DADOS:**

${snapshot.data_quality_flags.length > 0 ? snapshot.data_quality_flags.map((flag)=>`⚠️ ${flag}`).join('\n') : 'Nenhum flag detectado'}

---

${OUTPUT_FORMAT}

Gere o relatório completo e os insights estruturados baseados EXCLUSIVAMENTE nos dados fornecidos acima.
Seja específico, cite dados concretos e evite generalizações.
  `.trim();
}
/**
 * Formata o valor de uma resposta para exibição no prompt
 */ function formatAnswerValue(value) {
    if (value === null || value === undefined || value === '') {
        return '[Não preenchido]';
    }
    if (typeof value === 'object') {
        if (Array.isArray(value)) {
            return value.length > 0 ? value.join(', ') : '[Vazio]';
        }
        if (value.formatted) {
            return value.formatted;
        }
        return JSON.stringify(value);
    }
    return String(value);
}
/**
 * Formata uma entidade para exibição no prompt
 */ function formatEntityValue(entity) {
    if (entity.name) return entity.name;
    if (entity.title) return entity.title;
    return JSON.stringify(entity);
}
/**
 * Formata o snapshot completo para o prompt
 */ function formatSnapshotForPrompt(snapshot) {
    return JSON.stringify(snapshot, null, 2);
}
function buildFinalReportPrompt(snapshot, tone = 'intermediario') {
    const finalReportInstruction = `
${SECTION_INSTRUCTIONS['FINAL_REPORT']}

**CONTEXTO:**
Você recebeu relatórios detalhados de cada área estratégica da clínica. Algumas áreas podem estar completas, outras podem ter lacunas.

**DADOS CONSOLIDADOS:**

Clínica: ${snapshot.clinic.name}
Dossiê: ${snapshot.dossier.title}
Data de referência: ${snapshot.dossier.baseline_date || 'Não definida'}

**MÉTRICAS GLOBAIS:**

Scores Médios:
- Clareza: ${snapshot.global_metrics.average_scores.clarity.toFixed(1)}/10
- Consistência: ${snapshot.global_metrics.average_scores.consistency.toFixed(1)}/10
- Completude: ${snapshot.global_metrics.average_scores.completeness.toFixed(1)}/10
- Potencial de Impacto: ${snapshot.global_metrics.average_scores.impact_potential.toFixed(1)}/10

Alertas:
- Alta severidade: ${snapshot.global_metrics.high_severity_alerts}
- Média severidade: ${snapshot.global_metrics.medium_severity_alerts}
- Baixa severidade: ${snapshot.global_metrics.low_severity_alerts}

Total de recomendações: ${snapshot.global_metrics.total_recommendations}

**RELAÇÃO DE SEÇÕES:**

${snapshot.sections.map((section)=>{
        const status = section.has_report ? section.is_stale ? '⚠️ DESATUALIZADO' : '✅ ATUALIZADO' : '❌ NÃO GERADO';
        return `
**${section.section_name}** (${section.section_code}) - ${status}
${section.has_report ? `Scores: C=${section.scores?.clarity || 0}/10, Co=${section.scores?.consistency || 0}/10, Cp=${section.scores?.completeness || 0}/10, I=${section.scores?.impact_potential || 0}/10` : 'Sem relatório disponível'}
${section.alerts && section.alerts.length > 0 ? `Alertas: ${section.alerts.length} (${section.alerts.filter((a)=>a.severity === 'high').length} alta, ${section.alerts.filter((a)=>a.severity === 'medium').length} média, ${section.alerts.filter((a)=>a.severity === 'low').length} baixa)` : ''}
${section.recommendations && section.recommendations.length > 0 ? `Recomendações: ${section.recommendations.length}` : ''}
${section.report_markdown ? `\nResumo do relatório:\n${section.report_markdown.substring(0, 500)}...` : ''}
`;
    }).join('\n')}

${snapshot.missing_sections.length > 0 ? `\n⚠️ **SEÇÕES SEM RELATÓRIO:** ${snapshot.missing_sections.join(', ')}\nExplique no relatório que essas áreas não foram analisadas e por que isso importa.` : ''}

${snapshot.stale_sections.length > 0 ? `\n⚠️ **SEÇÕES DESATUALIZADAS:** ${snapshot.stale_sections.join(', ')}\nOs dados dessas seções foram alterados após a geração dos relatórios.` : ''}

**TOP RECOMENDAÇÕES (agrupadas):**

${snapshot.global_metrics.top_recommendations.slice(0, 10).map((rec, idx)=>`${idx + 1}. ${rec.title} (Prioridade: ${rec.priority}, Mencionada ${rec.frequency}x)`).join('\n')}

---

**FORMATO DE SAÍDA ESPERADO:**

Você DEVE retornar um JSON válido com a seguinte estrutura EXATA:

{
  "report_markdown": "# Relatório Estratégico Consolidado\\n\\n[Conteúdo completo em Markdown seguindo a estrutura obrigatória acima]",
  "insights": {
    "global_score": {
      "clarity": 0-10,
      "consistency": 0-10,
      "completeness": 0-10,
      "impact_potential": 0-10
    },
    "top_priorities": [
      {
        "rank": 1-7,
        "title": "Título da prioridade",
        "rationale": "Por que é prioridade",
        "expected_impact": "high|medium|low",
        "effort": "high|medium|low"
      }
    ],
    "critical_risks": [
      {
        "severity": "high|medium|low",
        "title": "Título do risco",
        "detail": "Descrição detalhada",
        "affected_sections": ["IDENTITY", "MARKET", ...]
      }
    ],
    "key_opportunities": [
      {
        "title": "Título da oportunidade",
        "detail": "Descrição",
        "potential_impact": "high|medium|low",
        "effort_required": "high|medium|low"
      }
    ],
    "strategic_focus": ["foco 1", "foco 2", ...],
    "kill_list": ["coisa a parar de fazer 1", "coisa a parar de fazer 2", ...],
    "missing_sections": ["seção sem relatório 1", ...]
  }
}

**INSTRUÇÕES IMPORTANTES:**

- O report_markdown deve seguir EXATAMENTE a estrutura de 11 seções definida nas instruções iniciais
- Seja específico e cite dados concretos dos relatórios setoriais fornecidos
- Priorize clareza e acionabilidade sobre complexidade
- Identifique contradições entre seções e resolva-as explicitamente
- Seja honesto sobre lacunas (seções faltantes ou desatualizadas)
- O relatório deve responder: "Se eu fosse dono dessa clínica, o que eu faria a partir de amanhã?"
- Use tom ${tone === 'formal' ? 'formal e técnico' : tone === 'informal' ? 'acessível e direto' : 'executivo e profissional'}
- O documento deve ter entre 2000-3000 palavras

Gere o relatório final completo e os insights estruturados baseados EXCLUSIVAMENTE nos dados fornecidos acima.
  `.trim();
    return finalReportInstruction;
}
function getSectionInstruction(sectionCode) {
    return SECTION_INSTRUCTIONS[sectionCode] || '';
}
}),
"[project]/Planeamento dental/planeamento-dental/src/lib/api-shared/section-ai-client.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "generateSectionReport",
    ()=>generateSectionReport,
    "generateSectionReportWithRetry",
    ()=>generateSectionReportWithRetry
]);
// Versão server-side do AI client
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$section$2d$prompts$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/section-prompts.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/api-shared/db.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const DEFAULT_MODEL = 'gpt-4o';
const DEFAULT_TEMPERATURE = 0.5 // 0.4-0.6 para IDENTITY conforme especificado
;
const DEFAULT_TONE = 'intermediario';
/**
 * Busca prompt customizado do banco de dados
 * Retorna null se não encontrar, para usar fallback do código
 */ async function getCustomPromptFromDB(promptKey) {
    try {
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`SELECT system_prompt, user_prompt
       FROM ai_prompt_templates
       WHERE key = $1 AND is_active = true
       ORDER BY created_at DESC
       LIMIT 1`, [
            promptKey
        ]);
        if (result.rows.length > 0) {
            return {
                system_prompt: result.rows[0].system_prompt,
                user_prompt: result.rows[0].user_prompt
            };
        }
        return null;
    } catch (error) {
        console.warn('Erro ao buscar prompt do banco:', error.message);
        return null;
    }
}
/**
 * Substitui placeholders no user prompt (ex: {{SNAPSHOT_JSON}})
 */ function replacePlaceholders(userPrompt, snapshot) {
    const snapshotJson = JSON.stringify(snapshot, null, 2);
    return userPrompt.replace(/\{\{SNAPSHOT_JSON\}\}/g, snapshotJson);
}
async function generateSectionReport(sectionCode, snapshot, options) {
    const { apiKey, model = DEFAULT_MODEL, temperature = DEFAULT_TEMPERATURE, tone = DEFAULT_TONE } = options;
    let systemPrompt;
    let userPrompt;
    try {
        // Tentar buscar prompt customizado do banco primeiro
        const promptKey = `section_${sectionCode}`;
        const customPrompt = await getCustomPromptFromDB(promptKey);
        if (customPrompt && (customPrompt.system_prompt || customPrompt.user_prompt)) {
            // Usar prompts customizados do banco
            systemPrompt = customPrompt.system_prompt || (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$section$2d$prompts$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getSystemPrompt"])(tone);
            if (customPrompt.user_prompt) {
                // Substituir placeholders no user prompt
                userPrompt = replacePlaceholders(customPrompt.user_prompt, snapshot);
            } else {
                // Se não tiver user_prompt customizado, usar o do código
                userPrompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$section$2d$prompts$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["buildSectionReportPrompt"])(sectionCode, snapshot, tone);
            }
            console.log(`Usando prompts customizados do banco para ${sectionCode}`);
        } else {
            // Fallback: usar prompts do código
            systemPrompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$section$2d$prompts$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getSystemPrompt"])(tone);
            userPrompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$section$2d$prompts$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["buildSectionReportPrompt"])(sectionCode, snapshot, tone);
            console.log(`Usando prompts do código para ${sectionCode}`);
        }
    } catch (importError) {
        console.error('Erro ao carregar prompts:', importError);
        // Fallback em caso de erro
        systemPrompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$section$2d$prompts$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getSystemPrompt"])(tone);
        userPrompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$section$2d$prompts$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["buildSectionReportPrompt"])(sectionCode, snapshot, tone);
    }
    // 8000 tokens para todas as seções - suficiente para relatórios completos + JSON structure
    const maxTokens = 8000;
    let response;
    try {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ],
                temperature,
                max_tokens: maxTokens,
                response_format: {
                    type: 'json_object'
                }
            })
        });
    } catch (fetchError) {
        console.error('Erro na requisição para OpenAI:', fetchError);
        throw new Error(`Erro de conexão com OpenAI: ${fetchError.message}`);
    }
    if (!response.ok) {
        const errorText = await response.text().catch(()=>response.statusText);
        let errorData;
        try {
            errorData = JSON.parse(errorText);
        } catch  {
            errorData = {
                error: {
                    message: errorText
                }
            };
        }
        console.error('Erro da API OpenAI:', errorData);
        throw new Error(`Erro na API OpenAI: ${errorData.error?.message || response.statusText} (Status: ${response.status})`);
    }
    let data;
    try {
        data = await response.json();
    } catch (parseError) {
        console.error('Erro ao parsear resposta da OpenAI:', parseError);
        throw new Error('Resposta inválida da OpenAI');
    }
    const content = data.choices[0]?.message?.content;
    if (!content) {
        console.error('Resposta vazia da OpenAI. Data recebida:', JSON.stringify(data).substring(0, 500));
        throw new Error('Resposta vazia da OpenAI');
    }
    // Verificar se a resposta foi cortada (finish_reason = 'length')
    const finishReason = data.choices[0]?.finish_reason;
    if (finishReason === 'length') {
        console.warn('⚠️ ATENÇÃO: Resposta da IA foi cortada por limite de tokens!');
        console.warn('Token usage:', data.usage);
        console.warn('Tamanho do conteúdo recebido:', content.length, 'caracteres');
    }
    try {
        const parsed = parseAIResponse(content);
        // Verificar se o report_markdown está completo
        if (parsed.report_markdown) {
            console.log(`Report markdown gerado: ${parsed.report_markdown.length} caracteres`);
            if (finishReason === 'length' && parsed.report_markdown.length < 2000) {
                console.warn('⚠️ Relatório pode estar incompleto devido ao limite de tokens');
            }
        }
        return {
            report_markdown: parsed.report_markdown,
            insights: parsed.insights,
            token_usage: data.usage
        };
    } catch (parseError) {
        console.error('Erro ao parsear resposta da IA:', parseError);
        console.error('Conteúdo recebido (primeiros 1000 chars):', content.substring(0, 1000));
        console.error('Conteúdo recebido (últimos 500 chars):', content.substring(Math.max(0, content.length - 500)));
        throw new Error(`Erro ao processar resposta da IA: ${parseError.message}`);
    }
}
function parseAIResponse(content) {
    // Log do conteúdo recebido para debug
    console.log('Parseando resposta da IA. Tamanho:', content.length);
    console.log('Primeiros 500 caracteres:', content.substring(0, 500));
    // 1. Tentar parse JSON direto
    try {
        const parsed = JSON.parse(content);
        if (validateAIResponse(parsed)) {
            console.log('Parse bem-sucedido: JSON direto válido');
            return parsed;
        } else {
            console.warn('JSON parseado mas validação falhou');
        }
    } catch (error) {
        console.log('Erro no parse JSON direto:', error.message);
    }
    // 2. Tentar extrair JSON de markdown code blocks
    try {
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const jsonStr = jsonMatch[1] || jsonMatch[0];
            const parsed = JSON.parse(jsonStr);
            if (validateAIResponse(parsed)) {
                console.log('Parse bem-sucedido: JSON extraído de markdown');
                return parsed;
            } else {
                console.warn('JSON extraído mas validação falhou');
            }
        }
    } catch (error) {
        console.log('Erro ao extrair JSON de markdown:', error.message);
    }
    // 3. Tentar corrigir estrutura (campos faltantes)
    try {
        const parsed = JSON.parse(content);
        const corrected = {
            report_markdown: parsed.report_markdown || parsed.report || '# Relatório\n\nErro ao processar resposta.',
            insights: correctInsightsStructure(parsed.insights || parsed)
        };
        if (validateAIResponse(corrected)) {
            console.log('Parse bem-sucedido: JSON corrigido');
            return corrected;
        } else {
            console.warn('JSON corrigido mas validação ainda falhou');
            // Verificar se o report_markdown está presente e tem tamanho razoável
            if (corrected.report_markdown && corrected.report_markdown.length > 100) {
                console.warn('Retornando resposta parcial (sem validação completa) - report_markdown presente');
                return corrected;
            }
        }
    } catch (error) {
        console.log('Erro ao corrigir JSON:', error.message);
        // Se o erro for de JSON truncado, tentar extrair o que for possível
        if (error.message.includes('Unexpected end') || error.message.includes('truncated')) {
            console.warn('JSON parece estar truncado. Tentando extrair conteúdo parcial...');
            try {
                // Tentar encontrar o report_markdown mesmo com JSON incompleto
                const markdownMatch = content.match(/"report_markdown"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
                if (markdownMatch && markdownMatch[1]) {
                    const extractedMarkdown = markdownMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
                    console.warn('Extraído report_markdown parcial do JSON truncado');
                    return {
                        report_markdown: extractedMarkdown,
                        insights: correctInsightsStructure({})
                    };
                }
            } catch (extractError) {
                console.error('Erro ao extrair conteúdo parcial:', extractError);
            }
        }
    }
    // 4. Última tentativa: criar resposta mínima
    console.error('Não foi possível parsear resposta. Tamanho do conteúdo:', content.length);
    console.error('Primeiros 500 chars:', content.substring(0, 500));
    console.error('Últimos 500 chars:', content.substring(Math.max(0, content.length - 500)));
    throw new Error(`Não foi possível parsear a resposta da IA. Formato inválido. Tamanho: ${content.length} caracteres`);
}
function validateAIResponse(data) {
    if (!data || typeof data !== 'object') return false;
    if (!data.report_markdown || typeof data.report_markdown !== 'string') return false;
    if (!data.insights || typeof data.insights !== 'object') return false;
    const insights = data.insights;
    if (!insights.score || typeof insights.score !== 'object') return false;
    if (typeof insights.score.clarity !== 'number') return false;
    if (typeof insights.score.consistency !== 'number') return false;
    if (typeof insights.score.completeness !== 'number') return false;
    if (typeof insights.score.impact_potential !== 'number') return false;
    // identity_summary é opcional (apenas para IDENTITY)
    if (insights.identity_summary && typeof insights.identity_summary !== 'object') return false;
    if (!Array.isArray(insights.alerts)) return false;
    if (!Array.isArray(insights.recommendations)) return false;
    if (!Array.isArray(insights.missing_data)) return false;
    if (!Array.isArray(insights.contradictions)) return false;
    if (insights.checklist && !Array.isArray(insights.checklist)) return false;
    if (!Array.isArray(insights.tags)) return false;
    return true;
}
function correctInsightsStructure(insights) {
    return {
        score: {
            clarity: insights.score?.clarity ?? insights.clarity ?? 5,
            consistency: insights.score?.consistency ?? insights.consistency ?? 5,
            completeness: insights.score?.completeness ?? insights.completeness ?? 5,
            impact_potential: insights.score?.impact_potential ?? insights.impact_potential ?? 5
        },
        identity_summary: insights.identity_summary || undefined,
        alerts: Array.isArray(insights.alerts) ? insights.alerts : [],
        recommendations: Array.isArray(insights.recommendations) ? insights.recommendations : [],
        missing_data: Array.isArray(insights.missing_data) ? insights.missing_data : [],
        contradictions: Array.isArray(insights.contradictions) ? insights.contradictions : [],
        checklist: Array.isArray(insights.checklist) ? insights.checklist : undefined,
        tags: Array.isArray(insights.tags) ? insights.tags : []
    };
}
async function generateSectionReportWithRetry(sectionCode, snapshot, options) {
    try {
        return await generateSectionReport(sectionCode, snapshot, options);
    } catch (error) {
        console.warn('Primeira tentativa falhou, tentando novamente...', error.message);
        try {
            return await generateSectionReport(sectionCode, snapshot, options);
        } catch (retryError) {
            throw new Error(`Falha após retry: ${retryError.message}`);
        }
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/Planeamento dental/planeamento-dental/pages/api/dossiers/[id]/sections/[sectionCode]/report.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/api-shared/auth.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/api-shared/db.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$snapshotBuilder$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/api-shared/snapshotBuilder.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$section$2d$ai$2d$client$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/api-shared/section-ai-client.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$snapshotBuilder$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$section$2d$ai$2d$client$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$snapshotBuilder$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$section$2d$ai$2d$client$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function handler(req, res) {
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
            if (!dossierId || !sectionCode) {
                return res.status(400).json({
                    error: 'dossierId e sectionCode são obrigatórios'
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
            // Validar seção
            const sectionResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT id FROM sections WHERE code = $1', [
                sectionCode
            ]);
            if (sectionResult.rows.length === 0) {
                return res.status(404).json({
                    error: 'Seção não encontrada'
                });
            }
            const sectionId = sectionResult.rows[0].id;
            if (method === 'GET') {
                // Retornar último relatório da seção
                try {
                    const reportResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`SELECT * FROM ai_reports 
             WHERE dossier_id = $1 AND section_code = $2 
             ORDER BY created_at DESC 
             LIMIT 1`, [
                        dossierId,
                        sectionCode
                    ]);
                    if (reportResult.rows.length === 0) {
                        return res.status(404).json({
                            error: 'Relatório ainda não gerado para esta seção'
                        });
                    }
                    const report = reportResult.rows[0];
                    return res.status(200).json({
                        id: report.id,
                        status: report.status,
                        report_markdown: report.report_markdown,
                        insights: report.insights_json,
                        created_at: report.created_at,
                        updated_at: report.updated_at,
                        prompt_key: report.prompt_key,
                        prompt_version: report.prompt_version,
                        model: report.model
                    });
                } catch (dbError) {
                    console.error('Erro ao buscar relatório:', dbError);
                    return res.status(500).json({
                        error: 'Erro ao buscar relatório',
                        message: dbError.message
                    });
                }
            }
            if (method === 'POST') {
                // Gerar novo relatório
                const apiKey = process.env.OPENAI_API_KEY;
                if (!apiKey) {
                    console.error('OPENAI_API_KEY não configurada');
                    return res.status(500).json({
                        error: 'Configuração do servidor incompleta'
                    });
                }
                try {
                    // 1. Build snapshot
                    console.log(`[${new Date().toISOString()}] Construindo snapshot para seção ${sectionCode} do dossiê ${dossierId}...`);
                    let snapshot;
                    try {
                        snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$snapshotBuilder$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["buildSectionSnapshot"])(dossierId, sectionCode);
                        console.log(`[${new Date().toISOString()}] Snapshot construído com sucesso. Respostas: ${snapshot.answers?.length || 0}, Entidades: ${Object.keys(snapshot.entities || {}).length}`);
                    } catch (snapshotError) {
                        console.error(`[${new Date().toISOString()}] Erro ao construir snapshot:`, snapshotError);
                        throw new Error(`Erro ao construir snapshot: ${snapshotError.message}`);
                    }
                    // 2. Registrar evento
                    let reportId = null;
                    try {
                        const eventResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`INSERT INTO ai_report_events (ai_report_id, event_type, payload_json)
               VALUES (NULL, 'snapshot_built', $1)
               RETURNING id`, [
                            JSON.stringify({
                                section_code: sectionCode,
                                dossier_id: dossierId
                            })
                        ]);
                    } catch (error) {
                    // Ignorar erro de eventos (opcional)
                    }
                    // 3. Call LLM
                    console.log(`[${new Date().toISOString()}] Chamando IA para gerar relatório...`);
                    // Ajustar temperatura baseado na seção (IDENTITY usa 0.4-0.6)
                    const temperature = sectionCode === 'IDENTITY' ? 0.5 : 0.7;
                    let aiResult;
                    try {
                        aiResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$section$2d$ai$2d$client$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["generateSectionReportWithRetry"])(sectionCode, snapshot, {
                            apiKey,
                            model: 'gpt-4o',
                            temperature,
                            promptVersion: '1.0.0',
                            tone: 'intermediario'
                        });
                        console.log(`[${new Date().toISOString()}] Relatório gerado pela IA com sucesso. Tamanho do markdown: ${aiResult.report_markdown?.length || 0} caracteres`);
                    } catch (aiError) {
                        console.error(`[${new Date().toISOString()}] Erro ao gerar relatório com IA:`, aiError);
                        throw new Error(`Erro na geração pela IA: ${aiError.message}`);
                    }
                    // 4. Persistir relatório
                    const insertResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`INSERT INTO ai_reports (
              clinic_id, dossier_id, section_id, section_code, status,
              input_snapshot_json, report_markdown, insights_json,
              prompt_key, prompt_version, model, temperature, token_usage_json
            ) VALUES ($1, $2, $3, $4, 'generated', $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id`, [
                        clinicId,
                        dossierId,
                        sectionId,
                        sectionCode,
                        JSON.stringify(snapshot),
                        aiResult.report_markdown,
                        JSON.stringify(aiResult.insights),
                        'SECTION_REPORT_V1',
                        '1.0.0',
                        'gpt-4o',
                        temperature,
                        aiResult.token_usage ? JSON.stringify(aiResult.token_usage) : null
                    ]);
                    reportId = insertResult.rows[0].id;
                    // 5. Marcar relatórios anteriores como stale
                    await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`UPDATE ai_reports
             SET status = 'stale', updated_at = NOW()
             WHERE dossier_id = $1 AND section_code = $2 AND id != $3 AND status = 'generated'`, [
                        dossierId,
                        sectionCode,
                        reportId
                    ]);
                    // Marcar relatório final como stale quando uma seção é regenerada
                    await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`UPDATE ai_reports
             SET status = 'stale', updated_at = NOW()
             WHERE dossier_id = $1 AND section_code = 'FINAL_REPORT' AND status = 'generated'`, [
                        dossierId
                    ]);
                    // 6. Registrar eventos
                    try {
                        await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`UPDATE ai_report_events SET ai_report_id = $1 WHERE ai_report_id IS NULL`, [
                            reportId
                        ]);
                        await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`INSERT INTO ai_report_events (ai_report_id, event_type, payload_json)
               VALUES ($1, 'llm_called', $2)`, [
                            reportId,
                            JSON.stringify({
                                model: 'gpt-4o',
                                temperature: 0.7
                            })
                        ]);
                        await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`INSERT INTO ai_report_events (ai_report_id, event_type, payload_json)
               VALUES ($1, 'persisted', $2)`, [
                            reportId,
                            JSON.stringify({
                                success: true
                            })
                        ]);
                    } catch (error) {
                    // Ignorar erros de eventos
                    }
                    console.log(`Relatório gerado com sucesso: ${reportId}`);
                    return res.status(200).json({
                        id: reportId,
                        status: 'generated',
                        report_markdown: aiResult.report_markdown,
                        insights: aiResult.insights,
                        created_at: new Date().toISOString()
                    });
                } catch (error) {
                    console.error('Erro ao gerar relatório:', error);
                    console.error('Stack trace:', error.stack);
                    // Salvar erro no banco
                    try {
                        const errorReportResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`INSERT INTO ai_reports (
                clinic_id, dossier_id, section_id, section_code, status,
                input_snapshot_json, report_markdown, insights_json,
                error_message, prompt_key, prompt_version, model
              ) VALUES ($1, $2, $3, $4, 'error', $5, '', '{}', $6, $7, $8, $9)
              RETURNING id`, [
                            clinicId,
                            dossierId,
                            sectionId,
                            sectionCode,
                            JSON.stringify({
                                error: error.message,
                                stack: error.stack
                            }),
                            error.message || 'Erro desconhecido',
                            'SECTION_REPORT_V1',
                            '1.0.0',
                            'gpt-4o'
                        ]);
                        // Registrar evento de erro
                        try {
                            await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`INSERT INTO ai_report_events (ai_report_id, event_type, payload_json)
                 VALUES ($1, 'error', $2)`, [
                                errorReportResult.rows[0].id,
                                JSON.stringify({
                                    error: error.message,
                                    stack: error.stack
                                })
                            ]);
                        } catch  {
                        // Ignorar
                        }
                    } catch (dbError) {
                        console.error('Erro ao salvar erro no banco:', dbError);
                    }
                    // Retornar mensagem de erro mais detalhada
                    const errorMessage = error.message || 'Erro desconhecido';
                    const errorDetails = ("TURBOPACK compile-time truthy", 1) ? {
                        stack: error.stack,
                        name: error.name
                    } : "TURBOPACK unreachable";
                    console.error('Erro completo:', {
                        message: errorMessage,
                        stack: error.stack,
                        name: error.name
                    });
                    // Tentar buscar o relatório de erro salvo no banco
                    try {
                        const errorReportResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`SELECT * FROM ai_reports 
               WHERE dossier_id = $1 AND section_code = $2 AND status = 'error'
               ORDER BY created_at DESC 
               LIMIT 1`, [
                            dossierId,
                            sectionCode
                        ]);
                        if (errorReportResult.rows.length > 0) {
                            const errorReport = errorReportResult.rows[0];
                            return res.status(500).json({
                                id: errorReport.id,
                                status: 'error',
                                error_message: errorReport.error_message || errorMessage,
                                report_markdown: '',
                                insights: {},
                                created_at: errorReport.created_at,
                                message: errorMessage,
                                details: errorDetails
                            });
                        }
                    } catch (dbError) {
                        console.error('Erro ao buscar relatório de erro:', dbError);
                    }
                    return res.status(500).json({
                        error: 'Erro ao gerar relatório',
                        message: errorMessage,
                        details: errorDetails
                    });
                }
            }
            return res.status(405).json({
                error: 'Método não permitido'
            });
        } catch (error) {
            console.error('Erro na API de relatórios:', error);
            return res.status(500).json({
                error: error.message
            });
        }
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__29328a9b._.js.map