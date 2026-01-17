module.exports=[70406,(e,o,t)=>{o.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},47044,(e,o,t)=>{o.exports=e.x("jsonwebtoken-cc89c121a8bdfb14",()=>require("jsonwebtoken-cc89c121a8bdfb14"))},21503,e=>e.a(async(o,t)=>{try{let o=await e.y("pg-519b72043f8edc04");e.n(o),t()}catch(e){t(e)}},!0),64104,e=>e.a(async(o,t)=>{try{var s=e.i(21503),n=o([s]);if([s]=n.then?(await n)():n,!process.env.DATABASE_URL)throw console.error("❌ DATABASE_URL não está configurada!"),console.error("❌ Configure DATABASE_URL no arquivo .env.local ou nas variáveis de ambiente"),Error("DATABASE_URL não configurada. Configure no .env.local ou variáveis de ambiente.");let r=new s.Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1},max:20,idleTimeoutMillis:3e4,connectionTimeoutMillis:2e3});r.on("connect",()=>{console.log("✅ Conectado ao banco de dados Neon")}),r.on("error",e=>{console.error("❌ Erro no pool de conexões:",e)}),e.s(["default",0,r]),t()}catch(e){t(e)}},!1),63963,e=>{"use strict";var o=e.i(47044);let t=process.env.JWT_SECRET||"your-secret-key-change-in-production";function s(e,s,n){let r=e.headers.authorization,a=r&&r.split(" ")[1];if(!a)return s.status(401).json({error:"Token não fornecido"});try{e.user=o.default.verify(a,t),n()}catch(e){return s.status(403).json({error:"Token inválido ou expirado"})}}function n(e,o,t){if(e.user?.role!=="admin")return o.status(403).json({error:"Acesso negado. Admin necessário."});t()}process.env.JWT_SECRET||console.warn("⚠️  JWT_SECRET não configurado! Usando valor padrão inseguro."),e.s(["authenticateToken",()=>s,"requireAdmin",()=>n])},39588,e=>e.a(async(o,t)=>{try{var s=e.i(63963),n=e.i(64104),r=o([n]);async function a(e,o){return(o.setHeader("Access-Control-Allow-Credentials","true"),o.setHeader("Access-Control-Allow-Origin","*"),o.setHeader("Access-Control-Allow-Methods","GET,POST,OPTIONS"),o.setHeader("Access-Control-Allow-Headers","X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"),"OPTIONS"===e.method)?void o.status(200).end():(0,s.authenticateToken)(e,o,()=>(0,s.requireAdmin)(e,o,async()=>{try{let{method:t}=e;if("GET"===t){let t,{sectionCode:s,questionSetId:r}=e.query;console.log("📋 Buscando perguntas:",{sectionCode:s,questionSetId:r});let a=!1;try{let e=await n.default.query(`
              SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'question_contexts'
              )
            `);a=e.rows[0]?.exists||!1}catch{a=!1}let i=`
            SELECT 
              q.id,
              q.code,
              q.text,
              q.help_text,
              q.type,
              q.required,
              q.order_index,
              q.validation_schema,
              q.ai_importance_weight,
              q.created_at,
              q.question_set_id,
              qs.section_id,
              qs.name as question_set_name,
              s.code as section_code,
              s.name as section_name
          `;a?i+=`,
              qc.why,
              qc.consequences,
              qc.how_to_answer,
              qc.good_examples,
              qc.bad_examples,
              qc.show_why,
              qc.show_consequences,
              qc.show_how_to_answer,
              qc.show_good_examples,
              qc.show_bad_examples
            FROM questions q
            JOIN question_sets qs ON qs.id = q.question_set_id
            JOIN sections s ON s.id = qs.section_id
            LEFT JOIN question_contexts qc ON qc.question_id = q.id
            WHERE qs.is_active = true
          `:i+=`
            FROM questions q
            JOIN question_sets qs ON qs.id = q.question_set_id
            JOIN sections s ON s.id = qs.section_id
            WHERE qs.is_active = true
          `;let l=[],d=1;if(s&&(i+=` AND s.code = $${d}`,l.push(s),d++),r){let e=Array.isArray(r)?r[0]:r;i+=` AND q.question_set_id = $${d}`,l.push(e),d++,console.log("🔍 Filtrando por questionSetId:",e)}i+=" ORDER BY q.order_index";try{console.log("🔍 Executando query:",i.substring(0,200)+"..."),console.log("📊 Parâmetros:",l),t=await n.default.query(i,l),console.log(`✅ Query executada com sucesso. ${t.rows.length} perguntas encontradas.`)}catch(e){throw console.error("❌ Erro na query SQL:",e),console.error("📝 Query completa:",i),console.error("📊 Parâmetros:",l),console.error("🔍 Stack trace:",e.stack),Error(`Erro ao executar query: ${e.message}`)}console.log(`📦 Processando ${t.rows.length} perguntas...`);let c=await Promise.all(t.rows.map(async(e,o)=>{if(0===o&&console.log("📋 Primeira pergunta (amostra):",{id:e.id,code:e.code,text:e.text?.substring(0,50),type:e.type,hasContext:!!(e.why||e.consequences||e.how_to_answer)}),"single_select"===e.type||"multi_select"===e.type){let o=await n.default.query("SELECT * FROM question_options WHERE question_id = $1 ORDER BY order_index",[e.id]);e.options=o.rows.map(e=>({id:e.id,label:e.label,value:e.value,order_index:e.order_index}))}if(e.validation_schema){if("string"==typeof e.validation_schema)try{e.validation_schema=JSON.parse(e.validation_schema)}catch{e.validation_schema=null}}else e.validation_schema=null;if(a){if(null!==e.why&&void 0!==e.why||null!==e.consequences&&void 0!==e.consequences||null!==e.how_to_answer&&void 0!==e.how_to_answer||null!==e.good_examples&&void 0!==e.good_examples||null!==e.bad_examples&&void 0!==e.bad_examples){let o=e=>{if(!e)return[];if(Array.isArray(e))return e;if("string"==typeof e)try{let o=JSON.parse(e);return Array.isArray(o)?o:[]}catch{return[e]}return[]};e.context={why:e.why||void 0,consequences:o(e.consequences),how_to_answer:e.how_to_answer||void 0,good_examples:o(e.good_examples),bad_examples:o(e.bad_examples),show_why:void 0===e.show_why||null===e.show_why||e.show_why,show_consequences:void 0===e.show_consequences||null===e.show_consequences||e.show_consequences,show_how_to_answer:void 0===e.show_how_to_answer||null===e.show_how_to_answer||e.show_how_to_answer,show_good_examples:void 0===e.show_good_examples||null===e.show_good_examples||e.show_good_examples,show_bad_examples:void 0===e.show_bad_examples||null===e.show_bad_examples||e.show_bad_examples}}else e.context=void 0;"why"in e&&delete e.why,"consequences"in e&&delete e.consequences,"how_to_answer"in e&&delete e.how_to_answer,"good_examples"in e&&delete e.good_examples,"bad_examples"in e&&delete e.bad_examples,"show_why"in e&&delete e.show_why,"show_consequences"in e&&delete e.show_consequences,"show_how_to_answer"in e&&delete e.show_how_to_answer,"show_good_examples"in e&&delete e.show_good_examples,"show_bad_examples"in e&&delete e.show_bad_examples}else e.context=void 0;return e}));console.log(`✅ Processamento conclu\xeddo. Retornando ${c.length} perguntas.`);try{return o.status(200).json(c)}catch(e){throw console.error("❌ Erro ao serializar JSON:",e),console.error("📋 Primeira pergunta (amostra):",JSON.stringify(c[0],null,2)),Error(`Erro ao serializar resposta: ${e.message}`)}}if("POST"===t){let{question_set_id:t,code:s,text:r,help_text:a,type:i,required:l,order_index:d,validation_schema:c,ai_importance_weight:u,options:_,context:h}=e.body;if(console.log("📝 Dados recebidos no POST:",{question_set_id:t,code:s,text:r?.substring(0,50),type:i,order_index:d,validation_schema:c,hasOptions:!!_,hasContext:!!h}),!t||!s||!r||!i)return o.status(400).json({error:"Campos obrigatórios: question_set_id, code, text, type"});let w=await n.default.query("SELECT id, text FROM questions WHERE question_set_id = $1 AND code = $2",[t,s]);if(w.rows.length>0)return o.status(409).json({error:"Já existe uma pergunta com este código neste question set",existingId:w.rows[0].id,existingText:w.rows[0].text,message:"Use a edição para atualizar a pergunta existente ou altere o código."});let p=null;if(c&&"object"==typeof c){let e=Object.fromEntries(Object.entries(c).filter(([e,o])=>null!=o&&""!==o));Object.keys(e).length>0&&(p=JSON.stringify(e))}let q=(await n.default.query(`INSERT INTO questions (
              question_set_id, code, text, help_text, type, required,
              order_index, validation_schema, ai_importance_weight
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *`,[t,s,r,a||null,i,l||!1,void 0!==d?d:0,p,u||.5])).rows[0];if(("single_select"===i||"multi_select"===i)&&_&&Array.isArray(_))for(let e of _)await n.default.query(`INSERT INTO question_options (question_id, label, value, order_index)
                 VALUES ($1, $2, $3, $4)`,[q.id,e.label,e.value,e.order_index||0]);let m=!1;try{let e=await n.default.query(`
              SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'question_contexts'
              )
            `);m=e.rows[0]?.exists||!1}catch{m=!1}h&&m&&await n.default.query(`INSERT INTO question_contexts (
                question_id, why, consequences, how_to_answer, 
                good_examples, bad_examples,
                show_why, show_consequences, show_how_to_answer,
                show_good_examples, show_bad_examples
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,[q.id,h.why||null,h.consequences&&Array.isArray(h.consequences)?h.consequences:null,h.how_to_answer||null,h.good_examples&&Array.isArray(h.good_examples)?h.good_examples:null,h.bad_examples&&Array.isArray(h.bad_examples)?h.bad_examples:null,void 0===h.show_why||h.show_why,void 0===h.show_consequences||h.show_consequences,void 0===h.show_how_to_answer||h.show_how_to_answer,void 0===h.show_good_examples||h.show_good_examples,void 0===h.show_bad_examples||h.show_bad_examples]);let x="SELECT q.* FROM questions q WHERE q.id = $1";m&&(x=`SELECT q.*, qc.*
             FROM questions q
             LEFT JOIN question_contexts qc ON qc.question_id = q.id
             WHERE q.id = $1`);let y=(await n.default.query(x,[q.id])).rows[0];return("single_select"===y.type||"multi_select"===y.type)&&(y.options=(await n.default.query("SELECT * FROM question_options WHERE question_id = $1 ORDER BY order_index",[q.id])).rows),o.status(201).json(y)}return o.status(405).json({error:"Method not allowed"})}catch(t){return console.error("❌ Erro na API de perguntas:",t),console.error("🔍 Stack trace:",t.stack),console.error("📋 Request body:",JSON.stringify(e.body,null,2)),console.error("📋 Request method:",e.method),o.status(500).json({error:t.message||"Erro interno do servidor",details:void 0})}}))}[n]=r.then?(await r)():r,e.s(["default",()=>a]),t()}catch(e){t(e)}},!1),55158,e=>e.a(async(o,t)=>{try{var s=e.i(93957),n=e.i(72664),r=e.i(61471),a=e.i(65751),i=e.i(39588),l=e.i(90078),d=e.i(57218),c=e.i(2576),u=o([i]);[i]=u.then?(await u)():u;let h=(0,a.hoist)(i,"default"),w=(0,a.hoist)(i,"config"),p=new r.PagesAPIRouteModule({definition:{kind:n.RouteKind.PAGES_API,page:"/api/admin/questions/index",pathname:"/api/admin/questions",bundlePath:"",filename:""},userland:i,distDir:".next",relativeProjectDir:""});async function _(e,o,t){p.isDev&&(0,c.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let n="/api/admin/questions/index";n=n.replace(/\/index$/,"")||"/";let r=await p.prepare(e,o,{srcPage:n});if(!r){o.statusCode=400,o.end("Bad Request"),null==t.waitUntil||t.waitUntil.call(t,Promise.resolve());return}let{query:a,params:i,prerenderManifest:u,routerServerContext:_}=r;try{let t=e.method||"GET",s=(0,l.getTracer)(),r=s.getActiveScopeSpan(),c=p.instrumentationOnRequestError.bind(p),h=async r=>p.render(e,o,{query:{...a,...i},params:i,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:u.preview,propagateError:!1,dev:p.isDev,page:"/api/admin/questions/index",internalRevalidate:null==_?void 0:_.revalidate,onError:(...o)=>c(e,...o)}).finally(()=>{if(!r)return;r.setAttributes({"http.status_code":o.statusCode,"next.rsc":!1});let e=s.getRootSpanAttributes();if(!e)return;if(e.get("next.span_type")!==d.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${e.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=e.get("next.route");if(a){let e=`${t} ${a}`;r.setAttributes({"next.route":a,"http.route":a,"next.span_name":e}),r.updateName(e)}else r.updateName(`${t} ${n}`)});r?await h(r):await s.withPropagatedContext(e.headers,()=>s.trace(d.BaseServerSpan.handleRequest,{spanName:`${t} ${n}`,kind:l.SpanKind.SERVER,attributes:{"http.method":t,"http.target":e.url}},h))}catch(e){if(p.isDev)throw e;(0,s.sendError)(o,500,"Internal Server Error")}finally{null==t.waitUntil||t.waitUntil.call(t,Promise.resolve())}}e.s(["config",0,w,"default",0,h,"handler",()=>_]),t()}catch(e){t(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__4e2836ea._.js.map