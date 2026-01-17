module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
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
"[project]/Planeamento dental/planeamento-dental/pages/api/auth/login.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$jsonwebtoken__$5b$external$5d$__$28$jsonwebtoken$2c$__cjs$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$jsonwebtoken$40$9$2e$0$2e$3$2f$node_modules$2f$jsonwebtoken$29$__ = __turbopack_context__.i("[externals]/jsonwebtoken [external] (jsonwebtoken, cjs, [project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/jsonwebtoken@9.0.3/node_modules/jsonwebtoken)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$bcryptjs__$5b$external$5d$__$28$bcryptjs$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$bcryptjs$40$3$2e$0$2e$3$2f$node_modules$2f$bcryptjs$29$__ = __turbopack_context__.i("[externals]/bcryptjs [external] (bcryptjs, esm_import, [project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/bcryptjs@3.0.3/node_modules/bcryptjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/api-shared/db.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$bcryptjs__$5b$external$5d$__$28$bcryptjs$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$bcryptjs$40$3$2e$0$2e$3$2f$node_modules$2f$bcryptjs$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$bcryptjs__$5b$external$5d$__$28$bcryptjs$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$bcryptjs$40$3$2e$0$2e$3$2f$node_modules$2f$bcryptjs$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
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
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Método não permitido'
        });
    }
    try {
        console.log('=== INÍCIO DO LOGIN ===');
        console.log('Request method:', req.method);
        console.log('Request body exists:', !!req.body);
        console.log('Request body type:', typeof req.body);
        console.log('Request body:', req.body);
        // Parse do body se necessário
        let body = req.body;
        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch (e) {
                console.error('Erro ao parsear body:', e);
                return res.status(400).json({
                    error: 'Body inválido'
                });
            }
        }
        const { email, password } = body || {};
        if (!email || !password) {
            console.log('Email ou senha faltando:', {
                hasEmail: !!email,
                hasPassword: !!password
            });
            return res.status(400).json({
                error: 'Email e senha são obrigatórios'
            });
        }
        console.log('Tentativa de login para:', email.toLowerCase());
        console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
        console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
        console.log('JWT_SECRET exists:', !!JWT_SECRET);
        // Verificar se o pool está configurado
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"]) {
            throw new Error('Pool de conexões não está inicializado');
        }
        // Buscar usuário
        console.log('Executando query no banco...');
        let userResult;
        try {
            userResult = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('SELECT id, email, password_hash, name, role, clinic_id, is_active FROM users WHERE email = $1', [
                email.toLowerCase()
            ]);
            console.log('Query executada com sucesso');
        } catch (dbError) {
            console.error('❌ Erro na query do banco:', dbError);
            console.error('❌ DB Error message:', dbError?.message);
            console.error('❌ DB Error code:', dbError?.code);
            console.error('❌ DB Error detail:', dbError?.detail);
            console.error('❌ DB Error hint:', dbError?.hint);
            throw new Error('Erro ao conectar com o banco de dados: ' + dbError?.message);
        }
        console.log('Usuários encontrados:', userResult.rows.length);
        if (userResult.rows.length === 0) {
            return res.status(401).json({
                error: 'Credenciais inválidas'
            });
        }
        const user = userResult.rows[0];
        if (!user.is_active) {
            return res.status(403).json({
                error: 'Conta desativada. Entre em contato com o administrador.'
            });
        }
        // Verificar senha
        console.log('Verificando senha...');
        console.log('Password hash length:', user.password_hash?.length);
        let isValidPassword = false;
        try {
            console.log('Verificando senha com bcryptjs...');
            isValidPassword = await __TURBOPACK__imported__module__$5b$externals$5d2f$bcryptjs__$5b$external$5d$__$28$bcryptjs$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$bcryptjs$40$3$2e$0$2e$3$2f$node_modules$2f$bcryptjs$29$__["default"].compare(password, user.password_hash);
            console.log('Senha válida:', isValidPassword);
        } catch (bcryptError) {
            console.error('❌ Erro ao verificar senha:', bcryptError);
            console.error('❌ Bcrypt error message:', bcryptError?.message);
            console.error('❌ Bcrypt error stack:', bcryptError?.stack);
            throw new Error('Erro ao verificar senha: ' + bcryptError?.message);
        }
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Credenciais inválidas'
            });
        }
        // Atualizar último login
        await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2d$shared$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"].query('UPDATE users SET last_login = NOW() WHERE id = $1', [
            user.id
        ]);
        // Gerar token JWT
        console.log('Gerando token JWT...');
        const token = __TURBOPACK__imported__module__$5b$externals$5d2f$jsonwebtoken__$5b$external$5d$__$28$jsonwebtoken$2c$__cjs$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$jsonwebtoken$40$9$2e$0$2e$3$2f$node_modules$2f$jsonwebtoken$29$__["default"].sign({
            id: user.id,
            email: user.email,
            role: user.role,
            clinicId: user.clinic_id,
            name: user.name
        }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        });
        console.log('Token gerado com sucesso');
        console.log('=== LOGIN CONCLUÍDO COM SUCESSO ===');
        return res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                clinicId: user.clinic_id
            }
        });
    } catch (error) {
        console.error('❌ Erro no login:', error);
        console.error('❌ Stack trace:', error?.stack);
        console.error('❌ Error name:', error?.name);
        console.error('❌ Error code:', error?.code);
        // Em desenvolvimento, retornar mais detalhes
        const isDevelopment = ("TURBOPACK compile-time value", "development") === 'development' || !("TURBOPACK compile-time value", "development");
        return res.status(500).json({
            error: 'Erro interno do servidor',
            message: error?.message || 'Erro desconhecido',
            ...isDevelopment && {
                details: error?.stack,
                errorName: error?.name,
                errorCode: error?.code,
                hasDatabaseUrl: !!process.env.DATABASE_URL
            }
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__91bcc496._.js.map