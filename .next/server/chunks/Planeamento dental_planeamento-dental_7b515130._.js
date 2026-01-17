module.exports=[76387,e=>e.a(async(r,t)=>{try{var a=e.i(64104),o=r([a]);async function s(e){let r=await a.default.query("SELECT * FROM dossiers WHERE id = $1",[e]);if(0===r.rows.length)throw Error("Dossiê não encontrado");let t=r.rows[0],o=await a.default.query("SELECT * FROM clinics WHERE id = $1",[t.clinic_id]);if(0===o.rows.length)throw Error("Clínica não encontrada");let s=o.rows[0],i=await a.default.query("SELECT * FROM sections WHERE code != 'FINAL_REPORT' ORDER BY order_index"),n=[],l=[],c=[],d=0,p=0,u=0,m=0,_=0,g=0,x=0,f=0,E=[];for(let r of i.rows){let t=await a.default.query(`SELECT * FROM ai_reports 
       WHERE dossier_id = $1 AND section_code = $2 
       ORDER BY created_at DESC 
       LIMIT 1`,[e,r.code]),o=t.rows.length>0,s=o?t.rows[0]:null,i=s?.status==="stale";i&&c.push(r.code),o||l.push(r.code);let y=null,h=null,A=[],S=[],R=[];if(s)try{y="string"==typeof s.insights_json?JSON.parse(s.insights_json):s.insights_json,h=y?.score||{},A=y?.alerts||[],S=y?.recommendations||[],R=y?.missing_data||[],void 0!==h.clarity&&(d+=h.clarity,p+=h.consistency||0,u+=h.completeness||0,m+=h.impact_potential||0,_++),A.forEach(e=>{"high"===e.severity?g++:"medium"===e.severity?x++:"low"===e.severity&&f++}),S.forEach(e=>{E.push({title:e.title||"",priority:e.priority||0})})}catch(e){console.warn(`Erro ao parsear insights da se\xe7\xe3o ${r.code}:`,e)}n.push({section_code:r.code,section_name:r.name,report_markdown:s?.report_markdown||void 0,insights:y||void 0,scores:h||void 0,alerts:A.length>0?A:void 0,recommendations:S.length>0?S:void 0,missing_data:R.length>0?R:void 0,is_stale:i,has_report:o})}let y={clarity:_>0?d/_:0,consistency:_>0?p/_:0,completeness:_>0?u/_:0,impact_potential:_>0?m/_:0},h=new Map;E.forEach(e=>{let r=e.title.toLowerCase().trim(),t=h.get(r);t?(t.frequency++,t.priority=Math.max(t.priority,e.priority)):h.set(r,{title:e.title,priority:e.priority,frequency:1})});let A=Array.from(h.values()).sort((e,r)=>r.priority!==e.priority?r.priority-e.priority:r.frequency-e.frequency).slice(0,10);return{clinic:{id:s.id,name:s.clinic_name},dossier:{id:t.id,title:t.title,baseline_date:t.baseline_date||void 0},sections:n,global_metrics:{average_scores:y,high_severity_alerts:g,medium_severity_alerts:x,low_severity_alerts:f,total_recommendations:E.length,top_recommendations:A},missing_sections:l,stale_sections:c,generated_at:new Date().toISOString()}}[a]=o.then?(await o)():o,e.s(["buildFinalSnapshot",()=>s]),t()}catch(e){t(e)}},!1),23580,e=>{"use strict";async function r(e,r){let a,{apiKey:o,model:s="gpt-4o",temperature:i=.7,tone:n="intermediario"}=r,l=(a={formal:"Você é um consultor de gestão estratégica especializado em clínicas de saúde. Use linguagem formal, técnica e objetiva. Seja preciso e baseie todas as conclusões nos dados fornecidos.",informal:"Você é um mentor de negócios que fala de forma acessível e direta. Use linguagem informal e próxima, evitando jargões excessivos. Seja prático e baseie recomendações nos dados fornecidos.",intermediario:"Você é um consultor experiente que equilibra profissionalismo com clareza. Use linguagem clara, mas profissional. Seja objetivo e baseie análises nos dados fornecidos."})[n]||a.intermediario,c=function(e,r="intermediario"){return`
Voc\xea \xe9 um consultor s\xeanior de gest\xe3o estrat\xe9gica que recebeu todos os relat\xf3rios setoriais de uma cl\xednica de sa\xfade.
Sua miss\xe3o \xe9 escrever o PARECER FINAL EXECUTIVO para o dono da cl\xednica e/ou investidores.

Este documento ser\xe1 o documento estrat\xe9gico oficial do neg\xf3cio, consolidando todas as an\xe1lises setoriais em uma narrativa \xfanica, clara e acion\xe1vel.

**CONTEXTO:**
Voc\xea recebeu relat\xf3rios detalhados de cada \xe1rea estrat\xe9gica da cl\xednica. Algumas \xe1reas podem estar completas, outras podem ter lacunas.
Sua tarefa \xe9:
1. Consolidar os achados em uma narrativa executiva \xfanica
2. Identificar as 3-7 prioridades estrat\xe9gicas mais importantes
3. Mapear riscos cr\xedticos e oportunidades
4. Criar um roadmap de alto n\xedvel para os pr\xf3ximos 12-24 meses
5. Ser claro sobre o que N\xc3O fazer (kill list)

**ESTRUTURA OBRIGAT\xd3RIA DO RELAT\xd3RIO:**

1. **CAPA**
   - Nome da cl\xednica: ${e.clinic.name}
   - Nome do dossi\xea: ${e.dossier.title}
   - Data: ${new Date().toLocaleDateString("pt-PT")}
   - Subt\xedtulo: "Relat\xf3rio Estrat\xe9gico Consolidado"

2. **SUM\xc1RIO EXECUTIVO** (1-2 p\xe1ginas equivalentes)
   - Diagn\xf3stico geral da situa\xe7\xe3o atual
   - 3-5 grandes conclus\xf5es principais
   - Vis\xe3o geral do estado de sa\xfade do neg\xf3cio

3. **MAPA DE SA\xdaDE DO NEG\xd3CIO**
   - Vis\xe3o geral por \xe1rea (Identidade, Mercado, Oferta, Opera\xe7\xf5es, Estrat\xe9gia, Plano)
   - Pontos fortes e fracos de cada \xe1rea
   - Scores m\xe9dios de clareza, consist\xeancia, completude e potencial de impacto

4. **PRINCIPAIS RISCOS ESTRAT\xc9GICOS**
   - Lista priorizada de riscos
   - Impacto de cada risco e por que s\xe3o perigosos
   - Se\xe7\xf5es afetadas por cada risco

5. **PRINCIPAIS OPORTUNIDADES**
   - Oportunidades identificadas
   - Potencial de impacto
   - Esfor\xe7o necess\xe1rio

6. **AS 3-7 PRIORIDADES ESTRAT\xc9GICAS**
   Para cada prioridade, incluir:
   - Contexto e situa\xe7\xe3o atual
   - Por que \xe9 prioridade
   - Impacto esperado (alto/m\xe9dio/baixo)
   - Esfor\xe7o necess\xe1rio (alto/m\xe9dio/baixo)
   - Racional por tr\xe1s da prioriza\xe7\xe3o

7. **ROADMAP DE ALTO N\xcdVEL (12-24 MESES)**
   - Fases ou ondas de implementa\xe7\xe3o
   - O que vem antes do qu\xea (depend\xeancias)
   - Marcos principais
   - Timeline aproximada

8. **O QUE N\xc3O FAZER**
   - Cortes estrat\xe9gicos necess\xe1rios
   - Focos a abandonar
   - Ren\xfancias estrat\xe9gicas conscientes
   - Atividades que n\xe3o agregam valor

9. **AP\xcaNDICE**
   - Resumo executivo de cada se\xe7\xe3o analisada
   - Refer\xeancias aos relat\xf3rios setoriais completos

**DADOS CONSOLIDADOS:**

Cl\xednica: ${e.clinic.name}
Dossi\xea: ${e.dossier.title}
Data de refer\xeancia: ${e.dossier.baseline_date||"Não definida"}

**M\xc9TRICAS GLOBAIS:**

Scores M\xe9dios:
- Clareza: ${e.global_metrics.average_scores.clarity.toFixed(1)}/10
- Consist\xeancia: ${e.global_metrics.average_scores.consistency.toFixed(1)}/10
- Completude: ${e.global_metrics.average_scores.completeness.toFixed(1)}/10
- Potencial de Impacto: ${e.global_metrics.average_scores.impact_potential.toFixed(1)}/10

Alertas:
- Alta severidade: ${e.global_metrics.high_severity_alerts}
- M\xe9dia severidade: ${e.global_metrics.medium_severity_alerts}
- Baixa severidade: ${e.global_metrics.low_severity_alerts}

Total de recomenda\xe7\xf5es: ${e.global_metrics.total_recommendations}

**RELA\xc7\xc3O DE SE\xc7\xd5ES:**

${e.sections.map(e=>{let r=e.has_report?e.is_stale?"⚠️ DESATUALIZADO":"✅ ATUALIZADO":"❌ NÃO GERADO";return`
**${e.section_name}** (${e.section_code}) - ${r}
${e.has_report?`Scores: C=${e.scores?.clarity||0}/10, Co=${e.scores?.consistency||0}/10, Cp=${e.scores?.completeness||0}/10, I=${e.scores?.impact_potential||0}/10`:"Sem relatório disponível"}
${e.alerts&&e.alerts.length>0?`Alertas: ${e.alerts.length} (${e.alerts.filter(e=>"high"===e.severity).length} alta, ${e.alerts.filter(e=>"medium"===e.severity).length} m\xe9dia, ${e.alerts.filter(e=>"low"===e.severity).length} baixa)`:""}
${e.recommendations&&e.recommendations.length>0?`Recomenda\xe7\xf5es: ${e.recommendations.length}`:""}
${e.report_markdown?`
Resumo do relat\xf3rio:
${e.report_markdown.substring(0,500)}...`:""}
`}).join("\n")}

${e.missing_sections.length>0?`
⚠️ **SE\xc7\xd5ES SEM RELAT\xd3RIO:** ${e.missing_sections.join(", ")}
Explique no relat\xf3rio que essas \xe1reas n\xe3o foram analisadas e por que isso importa.`:""}

${e.stale_sections.length>0?`
⚠️ **SE\xc7\xd5ES DESATUALIZADAS:** ${e.stale_sections.join(", ")}
Os dados dessas se\xe7\xf5es foram alterados ap\xf3s a gera\xe7\xe3o dos relat\xf3rios.`:""}

**TOP RECOMENDA\xc7\xd5ES (agrupadas):**

${e.global_metrics.top_recommendations.slice(0,10).map((e,r)=>`${r+1}. ${e.title} (Prioridade: ${e.priority}, Mencionada ${e.frequency}x)`).join("\n")}

---

**FORMATO DE SA\xcdDA ESPERADO:**

Voc\xea DEVE retornar um JSON v\xe1lido com a seguinte estrutura EXATA:

{
  "report_markdown": "# Relat\xf3rio Estrat\xe9gico Consolidado\\n\\n[Conte\xfado completo em Markdown seguindo a estrutura obrigat\xf3ria acima]",
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
        "title": "T\xedtulo da prioridade",
        "rationale": "Por que \xe9 prioridade",
        "expected_impact": "high|medium|low",
        "effort": "high|medium|low"
      }
    ],
    "critical_risks": [
      {
        "severity": "high|medium|low",
        "title": "T\xedtulo do risco",
        "detail": "Descri\xe7\xe3o detalhada",
        "affected_sections": ["IDENTITY", "MARKET", ...]
      }
    ],
    "key_opportunities": [
      {
        "title": "T\xedtulo da oportunidade",
        "detail": "Descri\xe7\xe3o",
        "potential_impact": "high|medium|low",
        "effort_required": "high|medium|low"
      }
    ],
    "strategic_focus": ["foco 1", "foco 2", ...],
    "kill_list": ["coisa a parar de fazer 1", "coisa a parar de fazer 2", ...],
    "missing_sections": ["se\xe7\xe3o sem relat\xf3rio 1", ...]
  }
}

**INSTRU\xc7\xd5ES IMPORTANTES:**

- O report_markdown deve seguir EXATAMENTE a estrutura obrigat\xf3ria listada acima
- Seja espec\xedfico e cite dados concretos dos relat\xf3rios setoriais
- Priorize clareza e acionabilidade sobre complexidade
- Identifique contradi\xe7\xf5es entre se\xe7\xf5es e resolva-as
- Seja honesto sobre lacunas (se\xe7\xf5es faltantes)
- O relat\xf3rio deve ser \xfatil tanto para o dono da cl\xednica quanto para investidores
- Use linguagem ${"formal"===r?"formal e técnica":"informal"===r?"acessível e direta":"clara e profissional"}
- O documento deve ter entre 15-25 p\xe1ginas equivalentes quando impresso

Gere o relat\xf3rio final completo e os insights estruturados baseados EXCLUSIVAMENTE nos dados fornecidos acima.
  `.trim()}(e,n),d=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${o}`},body:JSON.stringify({model:s,messages:[{role:"system",content:l},{role:"user",content:c}],temperature:i,max_tokens:8e3,response_format:{type:"json_object"}})});if(!d.ok){let e=await d.json().catch(()=>({error:{message:d.statusText}}));throw Error(`Erro na API OpenAI: ${e.error?.message||d.statusText}`)}let p=await d.json(),u=p.choices[0]?.message?.content;if(!u)throw Error("Resposta vazia da OpenAI");let m=function(e){try{let r=JSON.parse(e);if(t(r))return r}catch(e){}try{let r=e.match(/```json\s*([\s\S]*?)\s*```/)||e.match(/\{[\s\S]*\}/);if(r){let e=r[1]||r[0],a=JSON.parse(e);if(t(a))return a}}catch(e){}try{var r;let a=JSON.parse(e),o={report_markdown:a.report_markdown||a.report||"# Relatório Final\n\nErro ao processar resposta.",insights:(r=a.insights||a,{global_score:{clarity:r.global_score?.clarity??r.clarity??5,consistency:r.global_score?.consistency??r.consistency??5,completeness:r.global_score?.completeness??r.completeness??5,impact_potential:r.global_score?.impact_potential??r.impact_potential??5},top_priorities:Array.isArray(r.top_priorities)?r.top_priorities:[],critical_risks:Array.isArray(r.critical_risks)?r.critical_risks:[],key_opportunities:Array.isArray(r.key_opportunities)?r.key_opportunities:[],strategic_focus:Array.isArray(r.strategic_focus)?r.strategic_focus:[],kill_list:Array.isArray(r.kill_list)?r.kill_list:[],missing_sections:Array.isArray(r.missing_sections)?r.missing_sections:[]})};if(t(o))return o}catch(e){}throw Error("Não foi possível parsear a resposta da IA. Formato inválido.")}(u);return{report_markdown:m.report_markdown,insights:m.insights,token_usage:p.usage}}function t(e){if(!e||"object"!=typeof e||!e.report_markdown||"string"!=typeof e.report_markdown||!e.insights||"object"!=typeof e.insights)return!1;let r=e.insights;return!!r.global_score&&"object"==typeof r.global_score&&"number"==typeof r.global_score.clarity&&"number"==typeof r.global_score.consistency&&"number"==typeof r.global_score.completeness&&"number"==typeof r.global_score.impact_potential&&!!Array.isArray(r.top_priorities)&&!!Array.isArray(r.critical_risks)&&!!Array.isArray(r.key_opportunities)&&!!Array.isArray(r.strategic_focus)&&!!Array.isArray(r.kill_list)&&!!Array.isArray(r.missing_sections)&&!0}async function a(e,t){try{return await r(e,t)}catch(a){console.warn("Primeira tentativa falhou, tentando novamente...",a.message);try{return await r(e,t)}catch(e){throw Error(`Falha ap\xf3s retry: ${e.message}`)}}}e.s(["generateFinalReportWithRetry",()=>a])},68513,e=>e.a(async(r,t)=>{try{var a=e.i(63963),o=e.i(64104),s=e.i(76387),i=e.i(23580),n=r([o,s]);async function l(e,r){return(r.setHeader("Access-Control-Allow-Credentials","true"),r.setHeader("Access-Control-Allow-Origin","*"),r.setHeader("Access-Control-Allow-Methods","GET,OPTIONS,PATCH,DELETE,POST,PUT"),r.setHeader("Access-Control-Allow-Headers","X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"),"OPTIONS"===e.method)?void r.status(200).end():(0,a.authenticateToken)(e,r,async()=>{try{let{method:t}=e,a=e.user,n=e.query.id;if(!n)return r.status(400).json({error:"ID do dossiê é obrigatório"});let l=await o.default.query("SELECT clinic_id FROM dossiers WHERE id = $1",[n]);if(0===l.rows.length)return r.status(404).json({error:"Dossiê não encontrado"});let c=l.rows[0].clinic_id;if("admin"!==a.role&&a.clinicId!==c)return r.status(403).json({error:"Acesso negado a este dossiê"});let d=await o.default.query("SELECT id FROM sections WHERE code = $1",["FINAL_REPORT"]);if(0===d.rows.length)return r.status(404).json({error:"Seção FINAL_REPORT não encontrada"});let p=d.rows[0].id;if("GET"===t){let e=await o.default.query(`SELECT * FROM ai_reports 
           WHERE dossier_id = $1 AND section_code = 'FINAL_REPORT'
           ORDER BY created_at DESC 
           LIMIT 1`,[n]);if(0===e.rows.length)return r.status(404).json({error:"Relatório final ainda não gerado"});let t=e.rows[0];return r.status(200).json({id:t.id,status:t.status,report_markdown:t.report_markdown,insights:t.insights_json,created_at:t.created_at,updated_at:t.updated_at,prompt_key:t.prompt_key,prompt_version:t.prompt_version,model:t.model})}if("POST"===t){let e=await o.default.query(`SELECT COUNT(DISTINCT section_code) as count 
           FROM ai_reports 
           WHERE dossier_id = $1 AND section_code != 'FINAL_REPORT'`,[n]);if(0===parseInt(e.rows[0].count))return r.status(400).json({error:"É necessário ter pelo menos um relatório de seção gerado antes de gerar o relatório final"});let t=process.env.OPENAI_API_KEY;if(!t)return console.error("OPENAI_API_KEY não configurada"),r.status(500).json({error:"Configuração do servidor incompleta"});try{console.log(`Construindo snapshot global para relat\xf3rio final...`);let e=await (0,s.buildFinalSnapshot)(n),a=null;try{await o.default.query(`INSERT INTO ai_report_events (ai_report_id, event_type, payload_json)
               VALUES (NULL, 'snapshot_built', $1)
               RETURNING id`,[JSON.stringify({section_code:"FINAL_REPORT",dossier_id:n})])}catch(e){}console.log(`Chamando IA para gerar relat\xf3rio final...`);let l=await (0,i.generateFinalReportWithRetry)(e,{apiKey:t,model:"gpt-4o",temperature:.7,promptVersion:"1.0.0",tone:"intermediario"});a=(await o.default.query(`INSERT INTO ai_reports (
              clinic_id, dossier_id, section_id, section_code, status,
              input_snapshot_json, report_markdown, insights_json,
              prompt_key, prompt_version, model, temperature, token_usage_json
            ) VALUES ($1, $2, $3, 'FINAL_REPORT', 'generated', $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id`,[c,n,p,JSON.stringify(e),l.report_markdown,JSON.stringify(l.insights),"FINAL_REPORT_V1","1.0.0","gpt-4o",.7,l.token_usage?JSON.stringify(l.token_usage):null])).rows[0].id,await o.default.query(`UPDATE ai_reports 
             SET status = 'stale', updated_at = NOW()
             WHERE dossier_id = $1 AND section_code = 'FINAL_REPORT' AND id != $2 AND status = 'generated'`,[n,a]);try{await o.default.query("UPDATE ai_report_events SET ai_report_id = $1 WHERE ai_report_id IS NULL",[a]),await o.default.query(`INSERT INTO ai_report_events (ai_report_id, event_type, payload_json)
               VALUES ($1, 'llm_called', $2)`,[a,JSON.stringify({model:"gpt-4o",temperature:.7})]),await o.default.query(`INSERT INTO ai_report_events (ai_report_id, event_type, payload_json)
               VALUES ($1, 'persisted', $2)`,[a,JSON.stringify({success:!0})])}catch(e){}return console.log(`Relat\xf3rio final gerado com sucesso: ${a}`),r.status(200).json({id:a,status:"generated",report_markdown:l.report_markdown,insights:l.insights,created_at:new Date().toISOString()})}catch(e){console.error("Erro ao gerar relatório final:",e);try{let r=await o.default.query(`INSERT INTO ai_reports (
                clinic_id, dossier_id, section_id, section_code, status,
                input_snapshot_json, report_markdown, insights_json,
                error_message, prompt_key, prompt_version, model
              ) VALUES ($1, $2, $3, 'FINAL_REPORT', 'error', $4, '', '{}', $5, $6, $7, $8)
              RETURNING id`,[c,n,p,JSON.stringify({error:"Snapshot não pôde ser construído"}),e.message,"FINAL_REPORT_V1","1.0.0","gpt-4o"]);try{await o.default.query(`INSERT INTO ai_report_events (ai_report_id, event_type, payload_json)
                 VALUES ($1, 'error', $2)`,[r.rows[0].id,JSON.stringify({error:e.message})])}catch{}}catch(e){console.error("Erro ao salvar erro no banco:",e)}return r.status(500).json({error:"Erro ao gerar relatório final",message:e.message})}}return r.status(405).json({error:"Método não permitido"})}catch(e){return console.error("Erro na API de relatório final:",e),r.status(500).json({error:e.message})}})}[o,s]=n.then?(await n)():n,e.s(["default",()=>l]),t()}catch(e){t(e)}},!1),37489,e=>e.a(async(r,t)=>{try{var a=e.i(93957),o=e.i(72664),s=e.i(61471),i=e.i(65751),n=e.i(68513),l=e.i(90078),c=e.i(57218),d=e.i(2576),p=r([n]);[n]=p.then?(await p)():p;let m=(0,i.hoist)(n,"default"),_=(0,i.hoist)(n,"config"),g=new s.PagesAPIRouteModule({definition:{kind:o.RouteKind.PAGES_API,page:"/api/dossiers/[id]/final-report",pathname:"/api/dossiers/[id]/final-report",bundlePath:"",filename:""},userland:n,distDir:".next",relativeProjectDir:""});async function u(e,r,t){g.isDev&&(0,d.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let o="/api/dossiers/[id]/final-report";o=o.replace(/\/index$/,"")||"/";let s=await g.prepare(e,r,{srcPage:o});if(!s){r.statusCode=400,r.end("Bad Request"),null==t.waitUntil||t.waitUntil.call(t,Promise.resolve());return}let{query:i,params:n,prerenderManifest:p,routerServerContext:u}=s;try{let t=e.method||"GET",a=(0,l.getTracer)(),s=a.getActiveScopeSpan(),d=g.instrumentationOnRequestError.bind(g),m=async s=>g.render(e,r,{query:{...i,...n},params:n,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:p.preview,propagateError:!1,dev:g.isDev,page:"/api/dossiers/[id]/final-report",internalRevalidate:null==u?void 0:u.revalidate,onError:(...r)=>d(e,...r)}).finally(()=>{if(!s)return;s.setAttributes({"http.status_code":r.statusCode,"next.rsc":!1});let e=a.getRootSpanAttributes();if(!e)return;if(e.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${e.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let i=e.get("next.route");if(i){let e=`${t} ${i}`;s.setAttributes({"next.route":i,"http.route":i,"next.span_name":e}),s.updateName(e)}else s.updateName(`${t} ${o}`)});s?await m(s):await a.withPropagatedContext(e.headers,()=>a.trace(c.BaseServerSpan.handleRequest,{spanName:`${t} ${o}`,kind:l.SpanKind.SERVER,attributes:{"http.method":t,"http.target":e.url}},m))}catch(e){if(g.isDev)throw e;(0,a.sendError)(r,500,"Internal Server Error")}finally{null==t.waitUntil||t.waitUntil.call(t,Promise.resolve())}}e.s(["config",0,_,"default",0,m,"handler",()=>u]),t()}catch(e){t(e)}},!1)];

//# sourceMappingURL=Planeamento%20dental_planeamento-dental_7b515130._.js.map