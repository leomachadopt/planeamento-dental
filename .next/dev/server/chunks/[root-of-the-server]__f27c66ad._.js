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
"[project]/Planeamento dental/planeamento-dental/pages/api/admin/questions/[id].ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/api-shared/auth.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/api-shared/db.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["authenticateToken"])(req, res, ()=>{
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"])(req, res, async ()=>{
            try {
                const { method } = req;
                const { id } = req.query;
                if (!id || typeof id !== 'string') {
                    return res.status(400).json({
                        error: 'ID da pergunta é obrigatório'
                    });
                }
                if (method === 'GET') {
                    // Verificar se a tabela question_contexts existe
                    let hasQuestionContexts = false;
                    try {
                        const tableCheck = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`
              SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'question_contexts'
              )
            `);
                        hasQuestionContexts = tableCheck.rows[0]?.exists || false;
                    } catch  {
                        hasQuestionContexts = false;
                    }
                    let questionQuery = `SELECT q.* FROM questions q WHERE q.id = $1`;
                    if (hasQuestionContexts) {
                        questionQuery = `SELECT q.*, qc.*
             FROM questions q
             LEFT JOIN question_contexts qc ON qc.question_id = q.id
             WHERE q.id = $1`;
                    }
                    const questionResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(questionQuery, [
                        id
                    ]);
                    if (questionResult.rows.length === 0) {
                        return res.status(404).json({
                            error: 'Pergunta não encontrada'
                        });
                    }
                    const question = questionResult.rows[0];
                    // Buscar opções
                    if (question.type === 'single_select' || question.type === 'multi_select') {
                        const optionsResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT * FROM question_options WHERE question_id = $1 ORDER BY order_index', [
                            id
                        ]);
                        question.options = optionsResult.rows;
                    }
                    // Parse validation_schema
                    if (question.validation_schema && typeof question.validation_schema === 'string') {
                        try {
                            question.validation_schema = JSON.parse(question.validation_schema);
                        } catch  {
                            question.validation_schema = null;
                        }
                    }
                    return res.status(200).json(question);
                }
                if (method === 'PUT') {
                    const { code, text, help_text, type, required, order_index, validation_schema, ai_importance_weight, options, context } = req.body;
                    // Atualizar pergunta
                    await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`UPDATE questions SET
              code = $1, text = $2, help_text = $3, type = $4,
              required = $5, order_index = $6, validation_schema = $7,
              ai_importance_weight = $8
            WHERE id = $9`, [
                        code,
                        text,
                        help_text || null,
                        type,
                        required,
                        order_index,
                        validation_schema ? JSON.stringify(validation_schema) : null,
                        ai_importance_weight || 0.5,
                        id
                    ]);
                    // Atualizar opções
                    if (type === 'single_select' || type === 'multi_select') {
                        // Deletar opções antigas
                        await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('DELETE FROM question_options WHERE question_id = $1', [
                            id
                        ]);
                        // Inserir novas opções
                        if (options && Array.isArray(options) && options.length > 0) {
                            for (const option of options){
                                await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`INSERT INTO question_options (question_id, label, value, order_index)
                   VALUES ($1, $2, $3, $4)`, [
                                    id,
                                    option.label,
                                    option.value,
                                    option.order_index || 0
                                ]);
                            }
                        }
                    } else {
                        // Se mudou de tipo que tinha opções para um que não tem, deletar opções
                        await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('DELETE FROM question_options WHERE question_id = $1', [
                            id
                        ]);
                    }
                    // Verificar se a tabela question_contexts existe
                    let hasQuestionContexts = false;
                    try {
                        const tableCheck = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`
              SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'question_contexts'
              )
            `);
                        hasQuestionContexts = tableCheck.rows[0]?.exists || false;
                    } catch  {
                        hasQuestionContexts = false;
                    }
                    // Atualizar ou criar contexto (apenas se a tabela existir)
                    if (context !== undefined && hasQuestionContexts) {
                        const contextResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT id FROM question_contexts WHERE question_id = $1', [
                            id
                        ]);
                        if (contextResult.rows.length > 0) {
                            // Atualizar
                            await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`UPDATE question_contexts SET
                  why = $1, consequences = $2, how_to_answer = $3,
                  good_examples = $4, bad_examples = $5,
                  show_why = $6, show_consequences = $7, show_how_to_answer = $8,
                  show_good_examples = $9, show_bad_examples = $10,
                  updated_at = NOW()
                WHERE question_id = $11`, [
                                context.why || null,
                                context.consequences && Array.isArray(context.consequences) ? context.consequences : null,
                                context.how_to_answer || null,
                                context.good_examples && Array.isArray(context.good_examples) ? context.good_examples : null,
                                context.bad_examples && Array.isArray(context.bad_examples) ? context.bad_examples : null,
                                context.show_why !== undefined ? context.show_why : true,
                                context.show_consequences !== undefined ? context.show_consequences : true,
                                context.show_how_to_answer !== undefined ? context.show_how_to_answer : true,
                                context.show_good_examples !== undefined ? context.show_good_examples : true,
                                context.show_bad_examples !== undefined ? context.show_bad_examples : true,
                                id
                            ]);
                        } else if (context && (context.why || context.how_to_answer || context.consequences || context.good_examples || context.bad_examples)) {
                            // Criar apenas se houver conteúdo
                            await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query(`INSERT INTO question_contexts (
                  question_id, why, consequences, how_to_answer,
                  good_examples, bad_examples,
                  show_why, show_consequences, show_how_to_answer,
                  show_good_examples, show_bad_examples
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`, [
                                id,
                                context.why || null,
                                context.consequences && Array.isArray(context.consequences) ? context.consequences : null,
                                context.how_to_answer || null,
                                context.good_examples && Array.isArray(context.good_examples) ? context.good_examples : null,
                                context.bad_examples && Array.isArray(context.bad_examples) ? context.bad_examples : null,
                                context.show_why !== undefined ? context.show_why : true,
                                context.show_consequences !== undefined ? context.show_consequences : true,
                                context.show_how_to_answer !== undefined ? context.show_how_to_answer : true,
                                context.show_good_examples !== undefined ? context.show_good_examples : true,
                                context.show_bad_examples !== undefined ? context.show_bad_examples : true
                            ]);
                        }
                    }
                    return res.status(200).json({
                        success: true
                    });
                }
                if (method === 'DELETE') {
                    // Deletar pergunta (cascata deleta contexto e opções)
                    const deleteResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('DELETE FROM questions WHERE id = $1 RETURNING id', [
                        id
                    ]);
                    if (deleteResult.rows.length === 0) {
                        return res.status(404).json({
                            error: 'Pergunta não encontrada'
                        });
                    }
                    return res.status(200).json({
                        success: true
                    });
                }
                return res.status(405).json({
                    error: 'Method not allowed'
                });
            } catch (error) {
                console.error('Erro na API de perguntas:', error);
                return res.status(500).json({
                    error: error.message || 'Erro interno do servidor'
                });
            }
        });
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f27c66ad._.js.map