module.exports=[58697,e=>e.a(async(o,a)=>{try{var r=e.i(64104),s=o([r]);[r]=s.then?(await s)():s;let c={IDENTITY:["customer_segments","value_propositions"],MARKET:["competitors"],OFFER:["service_categories","services"],OPERATIONS:["team_members","roles","capacities"],STRATEGY:["strategic_choices"],PLAN:["initiatives"],BUSINESS_MODEL:[],FINAL_REPORT:[]};async function t(e,o){let a=c[o]||[],s={};for(let o of a)try{switch(o){case"customer_segments":s.customer_segments=(await r.default.query("SELECT * FROM customer_segments WHERE dossier_id = $1 ORDER BY priority, created_at",[e])).rows;break;case"value_propositions":s.value_propositions=(await r.default.query(`SELECT vp.*, cs.name as target_segment_name
             FROM value_propositions vp
             LEFT JOIN customer_segments cs ON cs.id = vp.target_segment_id
             WHERE vp.dossier_id = $1 ORDER BY vp.created_at`,[e])).rows;break;case"services":s.services=(await r.default.query(`SELECT s.*, sc.name as category_name
             FROM services s
             LEFT JOIN service_categories sc ON sc.id = s.service_category_id
             WHERE s.dossier_id = $1 ORDER BY s.is_flagship DESC, s.created_at`,[e])).rows;break;case"competitors":s.competitors=(await r.default.query("SELECT * FROM competitors WHERE dossier_id = $1 ORDER BY type, created_at",[e])).rows;break;case"team_members":s.team_members=(await r.default.query(`SELECT tm.*, r.name as role_name
             FROM team_members tm
             LEFT JOIN roles r ON r.id = tm.role_id
             WHERE tm.dossier_id = $1 ORDER BY tm.created_at`,[e])).rows;break;case"capacities":s.capacities=(await r.default.query("SELECT * FROM capacities WHERE dossier_id = $1 ORDER BY resource_type, created_at",[e])).rows;break;case"strategic_choices":s.strategic_choices=(await r.default.query("SELECT * FROM strategic_choices WHERE dossier_id = $1 ORDER BY priority, created_at",[e])).rows;break;case"initiatives":s.initiatives=(await r.default.query("SELECT * FROM initiatives WHERE dossier_id = $1 ORDER BY created_at",[e])).rows}}catch(e){console.warn(`Erro ao buscar entidade ${o}:`,e),s[o]=[]}return s}async function i(e,o){let a=await r.default.query(`SELECT COUNT(*) as total FROM questions q
     JOIN question_sets qs ON qs.id = q.question_set_id
     WHERE qs.section_id = $1 AND q.required = true`,[o]),s=await r.default.query(`SELECT COUNT(*) as total FROM answers a
     JOIN questions q ON q.id = a.question_id
     JOIN question_sets qs ON qs.id = q.question_set_id
     WHERE qs.section_id = $1 AND a.dossier_id = $2 
     AND (a.value_text IS NOT NULL AND a.value_text != '' 
          OR a.value_number IS NOT NULL 
          OR a.value_json IS NOT NULL)`,[o,e]),t=parseInt(a.rows[0].total),i=parseInt(s.rows[0].total);if(0===t)return 100;let n=Math.round(i/t*100),c=await r.default.query("SELECT code FROM sections WHERE id = $1",[o]);if(c.rows[0]?.code==="IDENTITY"){let o=await r.default.query("SELECT COUNT(*) as count FROM customer_segments WHERE dossier_id = $1",[e]),a=await r.default.query("SELECT COUNT(*) as count FROM value_propositions WHERE dossier_id = $1",[e]),s=parseInt(o.rows[0].count)>0,t=parseInt(a.rows[0].count)>0;s&&t?n=Math.min(100,n+10):(s||t)&&(n=Math.min(100,n+5))}return n}async function n(e,o){let a=await r.default.query("SELECT * FROM dossiers WHERE id = $1",[e]);if(0===a.rows.length)throw Error("Dossiê não encontrado");let s=a.rows[0],n=await r.default.query("SELECT * FROM clinics WHERE id = $1",[s.clinic_id]);if(0===n.rows.length)throw Error("Clínica não encontrada");let c=n.rows[0],d=await r.default.query("SELECT * FROM sections WHERE code = $1",[o]);if(0===d.rows.length)throw Error("Seção não encontrada");let l=d.rows[0],u=await r.default.query(`SELECT qs.* FROM question_sets qs
     WHERE qs.section_id = $1 AND qs.is_active = true
     ORDER BY qs.version DESC`,[l.id]),m=[],p=[];for(let o of u.rows){let a=await r.default.query(`SELECT q.*, 
       json_agg(
         json_build_object('id', qo.id, 'label', qo.label, 'value', qo.value, 'order_index', qo.order_index)
         ORDER BY qo.order_index
       ) FILTER (WHERE qo.id IS NOT NULL) as options
       FROM questions q
       LEFT JOIN question_options qo ON qo.question_id = q.id
       WHERE q.question_set_id = $1
       GROUP BY q.id
       ORDER BY q.order_index`,[o.id]),s=a.rows.map(e=>e.id),t=[];s.length>0&&(t=(await r.default.query("SELECT * FROM answers WHERE dossier_id = $1 AND question_id = ANY($2::uuid[])",[e,s])).rows);let i=new Map(t.map(e=>[e.question_id,e]));for(let e of a.rows){let o=i.get(e.id),a=function(e,o){if(!o)return null;switch(e.type){case"multi_select":case"json":if(o.value_json)return Array.isArray(o.value_json)?o.value_json:[o.value_json];if(o.value_text)try{let e=JSON.parse(o.value_text);return Array.isArray(e)?e:[e]}catch{return o.value_text.split(",").map(e=>e.trim())}return[];case"currency":let a=o.value_number||parseFloat(o.value_text||"0");return{value:a,currency:"EUR",formatted:new Intl.NumberFormat("pt-PT",{style:"currency",currency:"EUR"}).format(a),raw:o.value_text||o.value_number};case"number":case"scale":return null!==o.value_number&&void 0!==o.value_number?o.value_number:parseFloat(o.value_text||"0");case"date":return o.value_text||null;default:return o.value_text||o.value_number?.toString()||null}}(e,o||{});m.push({question_code:e.code,question_text:e.text,value_normalized:a,required:e.required,raw_value:o?{value_text:o.value_text,value_number:o.value_number,value_json:o.value_json}:void 0}),e.required&&(!a||""===a||null===a)&&p.push(e.code)}}let x=await t(e,o),f=await i(e,l.id),g=function(e,o){let a=[];if(o.answers){let e=o.answers.filter(e=>e.required&&(!e.value_normalized||""===e.value_normalized));e.length>0&&a.push(`Campos obrigat\xf3rios n\xe3o preenchidos: ${e.map(e=>e.question_code).join(", ")}`)}if("IDENTITY"===e){let e=o.entities||{},r=e.customer_segments||[],s=e.value_propositions||[];0===r.length&&a.push("Nenhum segmento de cliente cadastrado"),0===s.length&&a.push("Nenhuma proposta de valor cadastrada");let t=s.filter(e=>!e.target_segment_id&&!e.target_segment_name);t.length>0&&a.push(`${t.length} proposta(s) de valor sem segmento alvo definido`)}if("OFFER"===e){let e=((o.entities||{}).services||[]).filter(e=>null!==e.price&&void 0!==e.price&&(e.price<0||0===e.price));e.length>0&&a.push(`${e.length} servi\xe7o(s) com pre\xe7o inv\xe1lido (zero ou negativo)`)}if("OPERATIONS"===e){let e=o.entities||{},r=e.team_members||[],s=e.capacities||[];0===r.length&&a.push("Nenhum membro da equipe cadastrado"),0===s.length&&a.push("Nenhuma capacidade operacional cadastrada")}return a}(o,{answers:m,entities:x,completeness:{percent:f,missing_items:p}});return{clinic:{id:c.id,name:c.clinic_name},dossier:{id:s.id,title:s.title,baseline_date:s.baseline_date||void 0},section:{code:l.code,name:l.name,description:l.description||void 0},answers:m,entities:x,completeness:{percent:f,missing_items:p},data_quality_flags:g,generated_at:new Date().toISOString()}}e.s(["buildSectionSnapshot",()=>n]),a()}catch(e){a(e)}},!1),19672,e=>{"use strict";function o(e){let o={formal:"Você é um consultor de gestão estratégica especializado em clínicas de saúde. Use linguagem formal, técnica e objetiva. Seja preciso e baseie todas as conclusões nos dados fornecidos. Retorne suas análises em formato json estruturado.",informal:"Você é um mentor de negócios que fala de forma acessível e direta. Use linguagem informal e próxima, evitando jargões excessivos. Seja prático e baseie recomendações nos dados fornecidos. Retorne suas análises em formato json estruturado.",intermediario:"Você é um consultor experiente que equilibra profissionalismo com clareza. Use linguagem clara, mas profissional. Seja objetivo e baseie análises nos dados fornecidos. Retorne suas análises em formato json estruturado."};return o[e]||o.intermediario}let a={IDENTITY:`
Voc\xea \xe9 um consultor s\xeanior de estrat\xe9gia para cl\xednicas de sa\xfade. Seu trabalho \xe9 transformar as informa\xe7\xf5es fornecidas em um relat\xf3rio executivo detalhado e acion\xe1vel sobre a IDENTIDADE do neg\xf3cio.

Regras:
- N\xe3o cite nem mencione livros, autores, frameworks ou "metodologias".
- Use linguagem clara, direta e profissional, evitando jarg\xf5es.
- Seja espec\xedfico: use os dados fornecidos (segmentos, propostas, escolhas, valores, a\xe7\xf5es cr\xedticas, caracter\xedsticas-chave).
- Identifique inconsist\xeancias, lacunas e ambiguidades sem agressividade, com sugest\xf5es pr\xe1ticas para corrigir.
- N\xe3o invente fatos: se algo n\xe3o estiver no snapshot, marque como "n\xe3o informado" e diga por que isso importa.
- Trate "Identidade" como base de decis\xf5es: foco, posicionamento, escolhas e ren\xfancias.
- Produza um relat\xf3rio bem detalhado, com se\xe7\xf5es e subt\xedtulos, e exemplos aplic\xe1veis ao contexto.
- Ao final, gere recomenda\xe7\xf5es priorit\xe1rias e um checklist de melhoria.

Objetivo do relat\xf3rio:
- Explicar, de forma detalhada e bem descritiva, qual \xe9 a identidade estrat\xe9gica da cl\xednica (prop\xf3sito, vis\xe3o, valores, foco, posicionamento e escolhas).
- Transformar as respostas em um "norte" pr\xe1tico: como essa identidade deve orientar decis\xf5es de p\xfablico, oferta, experi\xeancia e crescimento.
- Destacar contradi\xe7\xf5es e lacunas e como resolv\xea-las.
- Propor a\xe7\xf5es cr\xedticas e caracter\xedsticas-chave (se j\xe1 existirem, avaliar; se n\xe3o existirem, sugerir rascunhos com base no que foi fornecido, deixando claro que s\xe3o sugest\xf5es).

Requisitos de profundidade:
- O relat\xf3rio deve ter pelo menos 900 a 1400 palavras (aprox.), com se\xe7\xf5es completas, exemplos e justificativas.
- Use os dados do snapshot de forma expl\xedcita (referencie termos e decis\xf5es declaradas, sem citar o snapshot literalmente).

TOM e estilo:
- Profissional, claro e humano, como um consultor falando com o dono.
- N\xe3o use linguagem motivacional vaga. Seja pr\xe1tico.
- N\xe3o mencione nenhum livro, autor ou framework.

Aten\xe7\xe3o ao rigor:
- N\xe3o invente segmentos, servi\xe7os, pre\xe7os, ou estrat\xe9gias n\xe3o fornecidas.
- Se houver contradi\xe7\xf5es, descreva a contradi\xe7\xe3o e o impacto prov\xe1vel.
- Se faltarem dados, liste perguntas de follow-up.

Estrutura recomendada dentro do report_markdown:
1. Resumo executivo da identidade
2. Prop\xf3sito e impacto
3. Vis\xe3o e ambi\xe7\xe3o (3 anos)
4. Valores inegoci\xe1veis e implica\xe7\xf5es pr\xe1ticas
5. Escolhas de foco: p\xfablico priorit\xe1rio e ren\xfancias
6. Posicionamento: pre\xe7o, proposta de valor e diferencia\xe7\xe3o
7. Estrat\xe9gia de crescimento e suas exig\xeancias
8. A\xe7\xf5es cr\xedticas (o que precisa acontecer sempre)
9. Caracter\xedsticas-chave (como a cl\xednica deve "ser")
10. Riscos de incoer\xeancia e pontos de aten\xe7\xe3o
11. Recomenda\xe7\xf5es priorizadas
12. Checklist de melhoria da Identidade
  `,MARKET:`
Analise o MERCADO e CONCORR\xcaNCIA com foco em:

1. **Intensidade Competitiva**: Avalie o n\xedvel de competi\xe7\xe3o no mercado local e os fatores que a determinam.

2. **Diferenciais Defens\xe1veis**: Identifique quais diferenciais da cl\xednica s\xe3o realmente defens\xe1veis e dif\xedceis de copiar.

3. **Riscos de Guerra de Pre\xe7os**: Avalie a vulnerabilidade da cl\xednica a press\xf5es de pre\xe7o dos concorrentes.

4. **Oportunidades de Posicionamento**: Identifique gaps no mercado onde a cl\xednica pode se posicionar de forma \xfanica.

5. **An\xe1lise de Concorrentes**: Compare a cl\xednica com concorrentes diretos e indiretos, identificando pontos fortes e fracos relativos.
  `,OFFER:`
Analise a OFERTA DE SERVI\xc7OS com foco em:

1. **Portf\xf3lio de Servi\xe7os**: Avalie se o portf\xf3lio est\xe1 alinhado com a identidade estrat\xe9gica e os segmentos de cliente.

2. **Precifica\xe7\xe3o**: Verifique se os pre\xe7os est\xe3o coerentes com o posicionamento e se h\xe1 servi\xe7os flagship bem definidos.

3. **Estrutura de Custos**: Analise a viabilidade econ\xf4mica dos servi\xe7os oferecidos.

4. **Diferencia\xe7\xe3o**: Identifique quais servi\xe7os realmente diferenciam a cl\xednica no mercado.
  `,OPERATIONS:`
Analise as OPERA\xc7\xd5ES com foco em:

1. **Capacidade Operacional**: Avalie se a capacidade (equipe, equipamentos, salas) est\xe1 alinhada com a demanda e objetivos estrat\xe9gicos.

2. **Estrutura de Equipe**: Verifique se a composi\xe7\xe3o da equipe suporta a proposta de valor e os servi\xe7os oferecidos.

3. **Gargalos Operacionais**: Identifique limita\xe7\xf5es que podem impedir o crescimento ou a entrega da proposta de valor.

4. **Efici\xeancia**: Avalie oportunidades de melhoria operacional.
  `,PEOPLE:`
Voc\xea \xe9 um consultor especializado em gest\xe3o de pessoas e cultura organizacional para cl\xednicas de sa\xfade. Seu trabalho \xe9 transformar as informa\xe7\xf5es fornecidas em um relat\xf3rio executivo detalhado e acion\xe1vel sobre PESSOAS, CULTURA & GEST\xc3O.

Regras:
- N\xe3o cite nem mencione livros, autores, frameworks ou "metodologias".
- Use linguagem clara, direta e profissional, evitando jarg\xf5es.
- Seja espec\xedfico: use os dados fornecidos (estrutura de equipe, depend\xeancias, cultura, lideran\xe7a, accountability).
- Identifique riscos humanos, gargalos de pessoas, desalinhamentos cultura-estrat\xe9gia sem agressividade, com sugest\xf5es pr\xe1ticas.
- N\xe3o invente fatos: se algo n\xe3o estiver no snapshot, marque como "n\xe3o informado" e diga por que isso importa.
- Trate "Pessoas" como base da execu\xe7\xe3o: quem faz o qu\xea, como decidem, como s\xe3o desenvolvidos e cobrados.
- Produza um relat\xf3rio bem detalhado, com se\xe7\xf5es e subt\xedtulos, e exemplos aplic\xe1veis ao contexto.
- Ao final, gere recomenda\xe7\xf5es priorit\xe1rias e um checklist de melhoria.

Objetivo do relat\xf3rio:
- Avaliar se a cl\xednica tem as pessoas certas nos lugares certos.
- Identificar riscos de depend\xeancia excessiva de pessoas-chave.
- Analisar se a cultura praticada apoia ou sabota a estrat\xe9gia.
- Avaliar modelo de lideran\xe7a, tomada de decis\xe3o e accountability.
- Identificar falhas em contrata\xe7\xe3o, desligamento e desenvolvimento de pessoas.
- Analisar o papel dos donos: operacional vs estrat\xe9gico.
- Mapear incentivos reais (o que \xe9 realmente recompensado e punido).

Estrutura recomendada dentro do report_markdown:
1. Resumo executivo da estrutura humana e cultural
2. Mapa de pessoas-chave e depend\xeancias cr\xedticas
3. An\xe1lise: pessoas certas nos lugares certos?
4. Cultura real vs cultura declarada
5. Alinhamento cultura-estrat\xe9gia
6. Modelo de lideran\xe7a e tomada de decis\xe3o
7. Sistema de accountability (metas, cobran\xe7a, consequ\xeancias)
8. Processos de contrata\xe7\xe3o e desligamento
9. Desenvolvimento de pessoas e l\xedderes
10. Papel dos donos: onde est\xe1 o gargalo?
11. Incentivos reais e comportamentos refor\xe7ados
12. Riscos humanos e pontos de aten\xe7\xe3o
13. Recomenda\xe7\xf5es priorizadas
14. Checklist de melhoria de Pessoas & Cultura

Requisitos de profundidade:
- O relat\xf3rio deve ter pelo menos 900 a 1400 palavras, com se\xe7\xf5es completas, exemplos e justificativas.
- Use os dados do snapshot de forma expl\xedcita.

TOM e estilo:
- Profissional, claro e humano, como um consultor falando com o dono.
- N\xe3o use linguagem motivacional vaga. Seja pr\xe1tico e honesto.
- N\xe3o mencione nenhum livro, autor ou framework.

Aten\xe7\xe3o ao rigor:
- N\xe3o invente perfis, cargos ou estruturas n\xe3o fornecidas.
- Se houver contradi\xe7\xf5es, descreva a contradi\xe7\xe3o e o impacto prov\xe1vel.
- Se faltarem dados, liste perguntas de follow-up.
  `,STRATEGY:`
Voc\xea \xe9 um consultor estrat\xe9gico s\xeanior especializado em cl\xednicas de sa\xfade. Seu trabalho \xe9 consolidar os dados dos blocos diagn\xf3sticos em uma S\xcdNTESE ESTRAT\xc9GICA clara, coerente e execut\xe1vel.

Regras:
- N\xe3o cite nem mencione livros, autores, frameworks ou "metodologias".
- Use linguagem clara, direta e profissional, evitando jarg\xf5es.
- Seja espec\xedfico: baseie todas as conclus\xf5es nos dados fornecidos dos blocos anteriores (Identity, Market, Offer, Operations, People).
- Identifique contradi\xe7\xf5es entre blocos e explique as tens\xf5es de coer\xeancia.
- N\xe3o invente fatos: se algo cr\xedtico n\xe3o estiver nos dados, marque como "lacuna" e explique por que importa.
- Trate "Estrat\xe9gia" como escolhas conscientes e ren\xfancias: o que fazer, o que N\xc3O fazer, e porqu\xea.
- Produza um relat\xf3rio bem detalhado, com se\xe7\xf5es e subt\xedtulos claros.
- Ao final, gere 3-7 prioridades estrat\xe9gicas e um checklist de melhoria.

Objetivo do relat\xf3rio:
- Identificar o DESAFIO ESTRAT\xc9GICO CENTRAL da cl\xednica (o problema-guia que orienta as escolhas).
- Propor 3-5 ESCOLHAS ESTRAT\xc9GICAS claras, com trade-offs expl\xedcitos para cada uma.
- Listar REN\xdaNCIAS CONSCIENTES (o que a cl\xednica deve parar de fazer ou evitar).
- Definir DIRETRIZES DE FOCO: segmento priorit\xe1rio, proposta de valor dominante, posicionamento.
- Mapear RISCOS E TENS\xd5ES DE COER\xcaNCIA entre Identity, Market, Offer, Operations, People.
- Propor RECOMENDA\xc7\xd5ES PRIORIZADAS para resolver contradi\xe7\xf5es e lacunas.

Estrutura recomendada dentro do report_markdown:
1. Resumo executivo da s\xedntese estrat\xe9gica
2. Desafio estrat\xe9gico central (problema-guia)
3. Contexto consolidado (o que sabemos dos blocos diagn\xf3sticos)
4. Escolhas estrat\xe9gicas (3-5 escolhas com trade-offs expl\xedcitos)
5. Ren\xfancias estrat\xe9gicas (o que N\xc3O fazer)
6. Diretrizes de foco (segmento, proposta, posicionamento)
7. Riscos de coer\xeancia e tens\xf5es entre blocos
8. Lacunas cr\xedticas (dados faltantes que impedem clareza estrat\xe9gica)
9. Recomenda\xe7\xf5es priorizadas (top 3-7)
10. Checklist de melhoria da s\xedntese estrat\xe9gica

Requisitos de profundidade:
- O relat\xf3rio deve ter pelo menos 900 a 1400 palavras, com se\xe7\xf5es completas, exemplos concretos e justificativas baseadas nos dados.
- Cite explicitamente dados dos blocos (ex: "Conforme Identity, o segmento priorit\xe1rio \xe9 X, mas Market mostra concorr\xeancia forte em Y").

TOM e estilo:
- Profissional, claro e direto, como um consultor experiente falando com o dono.
- N\xe3o use linguagem motivacional vaga. Seja pr\xe1tico e honesto.
- N\xe3o mencione nenhum livro, autor ou framework.

Aten\xe7\xe3o ao rigor:
- N\xe3o invente escolhas estrat\xe9gicas, segmentos ou prioridades n\xe3o infer\xedveis dos dados.
- Se houver contradi\xe7\xf5es entre blocos, descreva a contradi\xe7\xe3o e sugira como resolver.
- Se faltarem dados cr\xedticos, liste o que falta e por que isso impede uma s\xedntese de qualidade.
  `,PLAN:`
Voc\xea \xe9 um consultor de execu\xe7\xe3o estrat\xe9gica especializado em traduzir estrat\xe9gia em planos execut\xe1veis. Seu trabalho \xe9 transformar a s\xedntese estrat\xe9gica em um PLANO DE EXECU\xc7\xc3O concreto com OKRs, iniciativas e sequenciamento para os pr\xf3ximos 12 meses.

Regras:
- N\xe3o cite nem mencione livros, autores, frameworks ou "metodologias".
- Use linguagem clara, direta e profissional, evitando jarg\xf5es.
- Seja espec\xedfico: baseie o plano na s\xedntese estrat\xe9gica (se dispon\xedvel) e nos dados dos blocos diagn\xf3sticos.
- Crie OKRs mensur\xe1veis: Objectives ambiciosos + Key Results quantific\xe1veis.
- Priorize iniciativas por impacto vs esfor\xe7o, e identifique depend\xeancias.
- Defina respons\xe1veis (mesmo que sejam pap\xe9is/fun\xe7\xf5es, n\xe3o nomes) e prazos realistas.
- N\xe3o invente fatos: se dados cr\xedticos faltam, marque como "a definir" e explique o que precisa ser esclarecido.
- Produza um relat\xf3rio bem detalhado, com se\xe7\xf5es e subt\xedtulos claros.

Objetivo do relat\xf3rio:
- Criar 3-5 OKRs (Objectives & Key Results) alinhados \xe0s prioridades estrat\xe9gicas.
- Propor 7-15 INICIATIVAS priorizadas, com impacto, esfor\xe7o, respons\xe1vel e prazo.
- Definir SEQUENCIAMENTO: o que vem antes do qu\xea (ondas ou fases).
- Mapear DEPEND\xcaNCIAS CR\xcdTICAS entre iniciativas.
- Identificar RECURSOS NECESS\xc1RIOS e RISCOS DE EXECU\xc7\xc3O.
- Propor um ROADMAP DE 12 MESES com marcos principais.

Estrutura recomendada dentro do report_markdown:
1. Resumo executivo do plano de execu\xe7\xe3o
2. Objetivos estrat\xe9gicos (OKRs)
   - Para cada OKR: Objective + 2-4 Key Results mensur\xe1veis
3. Iniciativas priorizadas
   - Top 7-15 iniciativas com: t\xedtulo, descri\xe7\xe3o, impacto (alto/m\xe9dio/baixo), esfor\xe7o (alto/m\xe9dio/baixo), respons\xe1vel (papel), prazo
4. Sequenciamento e depend\xeancias
   - Ondas ou fases (ex: Onda 1: Jan-Abr, Onda 2: Mai-Ago, Onda 3: Set-Dez)
   - Mapa de depend\xeancias (iniciativa X depende de Y estar completa)
5. Roadmap de 12 meses
   - Linha do tempo visual (markdown) com marcos principais
6. Recursos necess\xe1rios
   - Pessoas, or\xe7amento, ferramentas/sistemas, treinamento
7. Riscos de execu\xe7\xe3o
   - Top 3-5 riscos que podem impedir execu\xe7\xe3o do plano
8. Checklist de prepara\xe7\xe3o para execu\xe7\xe3o

Requisitos de profundidade:
- O relat\xf3rio deve ter pelo menos 900 a 1400 palavras, com se\xe7\xf5es completas e exemplos concretos.
- OKRs devem ser mensur\xe1veis e ambiciosos (n\xe3o apenas "manter" ou "continuar").
- Iniciativas devem ser espec\xedficas e acion\xe1veis (n\xe3o "melhorar atendimento", mas "implementar sistema de NPS p\xf3s-consulta").

TOM e estilo:
- Profissional, claro e orientado \xe0 execu\xe7\xe3o.
- N\xe3o use linguagem motivacional vaga. Seja pr\xe1tico e realista.
- N\xe3o mencione nenhum livro, autor ou framework.

Aten\xe7\xe3o ao rigor:
- N\xe3o invente iniciativas ou objetivos que n\xe3o sejam infer\xedveis dos dados.
- Se a s\xedntese estrat\xe9gica n\xe3o estiver dispon\xedvel, baseie-se nos blocos diagn\xf3sticos e marque "aguardando s\xedntese estrat\xe9gica".
- Priorize qualidade sobre quantidade: melhor 7 iniciativas bem definidas do que 20 vagas.
  `,BUSINESS_MODEL:`
Analise o MODELO DE NEG\xd3CIO com foco em:

1. **Cria\xe7\xe3o de Valor**: Como a cl\xednica cria valor para os pacientes.

2. **Entrega de Valor**: Como o valor \xe9 entregue aos pacientes.

3. **Captura de Valor**: Como a cl\xednica captura valor (receita, margem).

4. **Sustentabilidade**: Se o modelo \xe9 sustent\xe1vel e escal\xe1vel.
  `,FINAL_REPORT:`
Voc\xea \xe9 um consultor estrat\xe9gico s\xeanior especializado em estrutura\xe7\xe3o, posicionamento e escala de cl\xednicas e empresas de servi\xe7os complexos.

Seu papel \xe9 produzir um RELAT\xd3RIO EXECUTIVO FINAL de alt\xedssimo n\xedvel a partir de m\xfaltiplos relat\xf3rios intermedi\xe1rios:
- Identidade
- Mercado
- Oferta
- Opera\xe7\xf5es
- Pessoas, Cultura & Gest\xe3o
- Estrat\xe9gia (s\xedntese)
- Plano (desdobramento)

Regras fundamentais:

1. Voc\xea N\xc3O deve repetir conte\xfados j\xe1 apresentados nos relat\xf3rios anteriores.
2. Voc\xea N\xc3O deve explicar conceitos b\xe1sicos.
3. Voc\xea N\xc3O deve fazer um resumo se\xe7\xe3o por se\xe7\xe3o.

Seu trabalho \xe9:
- Integrar
- Sintetizar
- Resolver conflitos
- Priorizar
- Fazer escolhas claras
- Assumir ren\xfancias
- Apontar riscos reais
- Apontar alavancas reais
- Criar um plano mestre de execu\xe7\xe3o

O tom deve ser:
- Executivo
- Direto
- Sem marketing
- Sem frases bonitas vazias
- Sem autoengano
- Orientado a decis\xe3o e trade-offs

Voc\xea deve escrever como se este documento fosse:
- Apresentado a s\xf3cios
- Usado para planejar os pr\xf3ximos 12–36 meses
- Usado para guiar investimento, contrata\xe7\xf5es e foco estrat\xe9gico

Voc\xea deve preferir:
- Clareza a diplomacia
- Verdade a conforto
- Decis\xe3o a ambiguidade

Este documento deve responder o tempo todo:
"Se eu fosse dono dessa cl\xednica, o que eu faria a partir de amanh\xe3?"

Estrutura obrigat\xf3ria do relat\xf3rio:

1. **Resumo Executivo** (para s\xf3cios)
   - Situa\xe7\xe3o atual em 3-5 frases
   - Tese estrat\xe9gica em 1 par\xe1grafo
   - As 3 decis\xf5es mais importantes

2. **A Tese Estrat\xe9gica da Cl\xednica**
   - Qual \xe9 o jogo que a cl\xednica est\xe1 jogando?
   - Por que ela pode vencer esse jogo?
   - Qual \xe9 a aposta central?

3. **Diagn\xf3stico Integrado do Neg\xf3cio**
   - N\xe3o repita relat\xf3rios anteriores
   - Integre: onde identity, market, offer, operations e people se encontram ou colidem?
   - Identifique padr\xf5es e tens\xf5es estruturais

4. **Os Principais Gargalos Estruturais**
   - O que impede crescimento hoje?
   - O que vai impedir crescimento amanh\xe3?
   - Seja espec\xedfico e hierarquize

5. **As Principais Alavancas de Crescimento**
   - O que pode desbloquear valor rapidamente?
   - O que pode desbloquear valor estruturalmente?
   - Priorize por impacto vs esfor\xe7o

6. **As Decis\xf5es Dif\xedceis (Ren\xfancias Estrat\xe9gicas)**
   - O que a cl\xednica deve PARAR de fazer?
   - O que a cl\xednica deve EVITAR fazer?
   - Quais oportunidades devem ser conscientemente ignoradas?

7. **O Plano-Mestre em 3 Horizontes**
   - Horizonte 1 (0–6 meses): estabilizar e corrigir gargalos cr\xedticos
   - Horizonte 2 (6–18 meses): construir capacidades e escalar
   - Horizonte 3 (18–36 meses): consolidar posi\xe7\xe3o e expandir

8. **Mapa de Prioridades Estrat\xe9gicas**
   - Top 5-7 prioridades absolutas
   - Para cada uma: por qu\xea, o qu\xea, como, quando, quem

9. **Indicadores-Chave que Governam a Cl\xednica**
   - Quais 5-10 m\xe9tricas realmente importam?
   - O que observar semanalmente, mensalmente, trimestralmente?

10. **Principais Riscos e Planos de Conten\xe7\xe3o**
    - Top 3-5 riscos que podem quebrar a estrat\xe9gia
    - O que fazer se cada um se concretizar?

11. **Conclus\xe3o Executiva: As 3 Decis\xf5es Mais Importantes**
    - Se o dono pudesse tomar apenas 3 decis\xf5es nos pr\xf3ximos 90 dias, quais seriam?
    - Por qu\xea essas e n\xe3o outras?

Requisitos de profundidade:
- O relat\xf3rio deve ter pelo menos 2000 a 3000 palavras.
- Seja denso em conte\xfado, mas claro na forma.
- Use dados e insights dos relat\xf3rios anteriores sem repeti-los literalmente.

TOM e estilo:
- Executivo e decisivo
- Honesto e direto
- Orientado a a\xe7\xe3o
- Sem eufemismos ou linguagem corporativa vazia

Aten\xe7\xe3o ao rigor:
- N\xe3o invente dados ou insights que n\xe3o estejam nos relat\xf3rios fornecidos.
- Seja honesto sobre lacunas e incertezas.
- Priorize clareza brutal sobre conforto diplom\xe1tico.
  `},r=`
IMPORTANTE: Responda APENAS com um objeto json v\xe1lido. A resposta completa deve ser um json puro, sem texto adicional antes ou depois.

Voc\xea DEVE retornar um JSON v\xe1lido com a seguinte estrutura EXATA:

{
  "report_markdown": "# Relat\xf3rio da Se\xe7\xe3o [Nome da Se\xe7\xe3o]\\n\\n[Conte\xfado completo em Markdown]",
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
        "title": "T\xedtulo do alerta",
        "detail": "Descri\xe7\xe3o detalhada",
        "evidence": ["question_code ou refer\xeancia a entidade"]
      }
    ],
    "recommendations": [
      {
        "priority": 1-5,
        "title": "T\xedtulo da recomenda\xe7\xe3o",
        "detail": "Descri\xe7\xe3o detalhada",
        "effort": "low|medium|high",
        "expected_impact": "low|medium|high"
      }
    ],
    "missing_data": [
      {
        "item": "O que est\xe1 faltando",
        "why_it_matters": "Por que isso importa",
        "how_to_fill": "Como preencher"
      }
    ],
    "contradictions": [
      {
        "title": "T\xedtulo da contradi\xe7\xe3o",
        "detail": "Descri\xe7\xe3o detalhada",
        "evidence": ["refer\xeancias aos dados"]
      }
    ],
    "checklist": ["...", "..."],
    "tags": ["tag1", "tag2"]
  }
}

IMPORTANTE:
- O report_markdown deve ser completo e descritivo, incluindo:
  * Resumo executivo (5-8 linhas)
  * O que est\xe1 bem definido (bullet points)
  * Lacunas relevantes (o que falta e por que importa)
  * Riscos e contradi\xe7\xf5es (com refer\xeancias aos dados)
  * Recomenda\xe7\xf5es pr\xe1ticas (priorizadas, com "por qu\xea")
  * Checklist de melhoria (itens objetivos)
  * Pontua\xe7\xe3o (0-10) para clareza, consist\xeancia, completude, potencial de impacto

- O insights JSON deve ser v\xe1lido e parse\xe1vel sem ambiguidades.
- Todos os campos s\xe3o obrigat\xf3rios (arrays podem estar vazios).
- Para se\xe7\xf5es que n\xe3o sejam IDENTITY, o campo "identity_summary" pode ser um objeto vazio {}.
`;function s(e,o,t="intermediario"){let i=a[e]||`
Analise a se\xe7\xe3o ${e} com base nos dados fornecidos.
Identifique pontos fortes, lacunas, riscos e oportunidades.
  `;if("IDENTITY"===e){let e=JSON.stringify(o,null,2);return`
${i}

Gere um RELAT\xd3RIO EXECUTIVO DE IDENTIDADE da cl\xednica com base no snapshot abaixo.

Objetivo do relat\xf3rio:
- Explicar, de forma detalhada e bem descritiva, qual \xe9 a identidade estrat\xe9gica da cl\xednica (prop\xf3sito, vis\xe3o, valores, foco, posicionamento e escolhas).
- Transformar as respostas em um "norte" pr\xe1tico: como essa identidade deve orientar decis\xf5es de p\xfablico, oferta, experi\xeancia e crescimento.
- Destacar contradi\xe7\xf5es e lacunas e como resolv\xea-las.
- Propor a\xe7\xf5es cr\xedticas e caracter\xedsticas-chave (se j\xe1 existirem, avaliar; se n\xe3o existirem, sugerir rascunhos com base no que foi fornecido, deixando claro que s\xe3o sugest\xf5es).

Requisitos de profundidade:
- O relat\xf3rio deve ter pelo menos 900 a 1400 palavras (aprox.), com se\xe7\xf5es completas, exemplos e justificativas.
- Use os dados do snapshot de forma expl\xedcita (referencie termos e decis\xf5es declaradas, sem citar o snapshot literalmente).

TOM e estilo:
- Profissional, claro e humano, como um consultor falando com o dono.
- N\xe3o use linguagem motivacional vaga. Seja pr\xe1tico.
- N\xe3o mencione nenhum livro, autor ou framework.

Aten\xe7\xe3o ao rigor:
- N\xe3o invente segmentos, servi\xe7os, pre\xe7os, ou estrat\xe9gias n\xe3o fornecidas.
- Se houver contradi\xe7\xf5es, descreva a contradi\xe7\xe3o e o impacto prov\xe1vel.
- Se faltarem dados, liste perguntas de follow-up.

Snapshot (JSON):
${e}

${r}

IMPORTANTE: 
- O report_markdown DEVE ser COMPLETO e N\xc3O CORTADO. 
- Se o limite de tokens for atingido, priorize completar o report_markdown mesmo que alguns campos do insights fiquem vazios.
- O relat\xf3rio deve ter TODAS as 12 se\xe7\xf5es mencionadas na estrutura recomendada.
- N\xc3O corte o conte\xfado no meio de uma frase ou se\xe7\xe3o.
  `.trim()}return`
${i}

**DADOS DA CL\xcdNICA E DO DOSSI\xca:**

Cl\xednica: ${o.clinic.name} (ID: ${o.clinic.id})
Dossi\xea: ${o.dossier.title}
Data de refer\xeancia: ${o.dossier.baseline_date||"Não definida"}

**SE\xc7\xc3O:** ${o.section.name}
${o.section.description?`Descri\xe7\xe3o: ${o.section.description}`:""}

**COMPLETUDE DA SE\xc7\xc3O:** ${o.completeness.percent}%
${o.completeness.missing_items.length>0?`Itens faltantes: ${o.completeness.missing_items.join(", ")}`:""}

**RESPOSTAS DO QUESTION\xc1RIO:**

${o.answers.map(e=>{var o;return`
**${e.question_text}** (${e.question_code})
${e.required?"[OBRIGATÓRIO]":"[OPCIONAL]"}
Resposta: ${null==(o=e.value_normalized)||""===o?"[Não preenchido]":"object"==typeof o?Array.isArray(o)?o.length>0?o.join(", "):"[Vazio]":o.formatted?o.formatted:JSON.stringify(o):String(o)}
${e.required&&!e.value_normalized?"⚠️ NÃO PREENCHIDO":""}
`}).join("\n")}

**ENTIDADES ESTRUTURADAS:**

${Object.entries(o.entities).map(([e,o])=>o&&0!==o.length?`**${e}** (${o.length} item(s)):
${o.map(e=>{var o;return`- ${(o=e).name?o.name:o.title?o.title:JSON.stringify(o)}`}).join("\n")}`:`**${e}**: Nenhum cadastrado`).join("\n\n")}

**FLAGS DE QUALIDADE DE DADOS:**

${o.data_quality_flags.length>0?o.data_quality_flags.map(e=>`⚠️ ${e}`).join("\n"):"Nenhum flag detectado"}

---

${r}

Gere o relat\xf3rio completo e os insights estruturados baseados EXCLUSIVAMENTE nos dados fornecidos acima.
Seja espec\xedfico, cite dados concretos e evite generaliza\xe7\xf5es.
  `.trim()}e.s(["buildSectionReportPrompt",()=>s,"getSystemPrompt",()=>o])},70528,e=>e.a(async(o,a)=>{try{var r=e.i(19672),s=e.i(64104),t=o([s]);async function i(e){try{let o=await s.default.query(`SELECT system_prompt, user_prompt
       FROM ai_prompt_templates
       WHERE key = $1 AND is_active = true
       ORDER BY created_at DESC
       LIMIT 1`,[e]);if(o.rows.length>0)return{system_prompt:o.rows[0].system_prompt,user_prompt:o.rows[0].user_prompt};return null}catch(e){return console.warn("Erro ao buscar prompt do banco:",e.message),null}}async function n(e,o,a){let s,t,n,l,{apiKey:u,model:m="gpt-4o",temperature:p=.5,tone:x="intermediario"}=a;try{let a=`section_${e}`,n=await i(a);if(n&&(n.system_prompt||n.user_prompt)){if(s=n.system_prompt||(0,r.getSystemPrompt)(x),n.user_prompt){var f;let e;f=n.user_prompt,e=JSON.stringify(o,null,2),t=f.replace(/\{\{SNAPSHOT_JSON\}\}/g,e)}else t=(0,r.buildSectionReportPrompt)(e,o,x);console.log(`Usando prompts customizados do banco para ${e}`)}else s=(0,r.getSystemPrompt)(x),t=(0,r.buildSectionReportPrompt)(e,o,x),console.log(`Usando prompts do c\xf3digo para ${e}`)}catch(a){console.error("Erro ao carregar prompts:",a),s=(0,r.getSystemPrompt)(x),t=(0,r.buildSectionReportPrompt)(e,o,x)}try{n=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${u}`},body:JSON.stringify({model:m,messages:[{role:"system",content:s},{role:"user",content:t}],temperature:p,max_tokens:8e3,response_format:{type:"json_object"}})})}catch(e){throw console.error("Erro na requisição para OpenAI:",e),Error(`Erro de conex\xe3o com OpenAI: ${e.message}`)}if(!n.ok){let e,o=await n.text().catch(()=>n.statusText);try{e=JSON.parse(o)}catch{e={error:{message:o}}}throw console.error("Erro da API OpenAI:",e),Error(`Erro na API OpenAI: ${e.error?.message||n.statusText} (Status: ${n.status})`)}try{l=await n.json()}catch(e){throw console.error("Erro ao parsear resposta da OpenAI:",e),Error("Resposta inválida da OpenAI")}let g=l.choices[0]?.message?.content;if(!g)throw console.error("Resposta vazia da OpenAI. Data recebida:",JSON.stringify(l).substring(0,500)),Error("Resposta vazia da OpenAI");let v=l.choices[0]?.finish_reason;"length"===v&&(console.warn("⚠️ ATENÇÃO: Resposta da IA foi cortada por limite de tokens!"),console.warn("Token usage:",l.usage),console.warn("Tamanho do conteúdo recebido:",g.length,"caracteres"));try{let e=function(e){console.log("Parseando resposta da IA. Tamanho:",e.length),console.log("Primeiros 500 caracteres:",e.substring(0,500));try{let o=JSON.parse(e);if(c(o))return console.log("Parse bem-sucedido: JSON direto válido"),o;console.warn("JSON parseado mas validação falhou")}catch(e){console.log("Erro no parse JSON direto:",e.message)}try{let o=e.match(/```json\s*([\s\S]*?)\s*```/)||e.match(/\{[\s\S]*\}/);if(o){let e=o[1]||o[0],a=JSON.parse(e);if(c(a))return console.log("Parse bem-sucedido: JSON extraído de markdown"),a;console.warn("JSON extraído mas validação falhou")}}catch(e){console.log("Erro ao extrair JSON de markdown:",e.message)}try{let o=JSON.parse(e),a={report_markdown:o.report_markdown||o.report||"# Relatório\n\nErro ao processar resposta.",insights:d(o.insights||o)};if(c(a))return console.log("Parse bem-sucedido: JSON corrigido"),a;if(console.warn("JSON corrigido mas validação ainda falhou"),a.report_markdown&&a.report_markdown.length>100)return console.warn("Retornando resposta parcial (sem validação completa) - report_markdown presente"),a}catch(o){if(console.log("Erro ao corrigir JSON:",o.message),o.message.includes("Unexpected end")||o.message.includes("truncated")){console.warn("JSON parece estar truncado. Tentando extrair conteúdo parcial...");try{let o=e.match(/"report_markdown"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);if(o&&o[1]){let e=o[1].replace(/\\n/g,"\n").replace(/\\"/g,'"');return console.warn("Extraído report_markdown parcial do JSON truncado"),{report_markdown:e,insights:d({})}}}catch(e){console.error("Erro ao extrair conteúdo parcial:",e)}}}throw console.error("Não foi possível parsear resposta. Tamanho do conteúdo:",e.length),console.error("Primeiros 500 chars:",e.substring(0,500)),console.error("Últimos 500 chars:",e.substring(Math.max(0,e.length-500))),Error(`N\xe3o foi poss\xedvel parsear a resposta da IA. Formato inv\xe1lido. Tamanho: ${e.length} caracteres`)}(g);return e.report_markdown&&(console.log(`Report markdown gerado: ${e.report_markdown.length} caracteres`),"length"===v&&e.report_markdown.length<2e3&&console.warn("⚠️ Relatório pode estar incompleto devido ao limite de tokens")),{report_markdown:e.report_markdown,insights:e.insights,token_usage:l.usage}}catch(e){throw console.error("Erro ao parsear resposta da IA:",e),console.error("Conteúdo recebido (primeiros 1000 chars):",g.substring(0,1e3)),console.error("Conteúdo recebido (últimos 500 chars):",g.substring(Math.max(0,g.length-500))),Error(`Erro ao processar resposta da IA: ${e.message}`)}}function c(e){if(!e||"object"!=typeof e||!e.report_markdown||"string"!=typeof e.report_markdown||!e.insights||"object"!=typeof e.insights)return!1;let o=e.insights;return!!o.score&&"object"==typeof o.score&&"number"==typeof o.score.clarity&&"number"==typeof o.score.consistency&&"number"==typeof o.score.completeness&&"number"==typeof o.score.impact_potential&&(!o.identity_summary||"object"==typeof o.identity_summary)&&!!Array.isArray(o.alerts)&&!!Array.isArray(o.recommendations)&&!!Array.isArray(o.missing_data)&&!!Array.isArray(o.contradictions)&&(!o.checklist||!!Array.isArray(o.checklist))&&!!Array.isArray(o.tags)&&!0}function d(e){return{score:{clarity:e.score?.clarity??e.clarity??5,consistency:e.score?.consistency??e.consistency??5,completeness:e.score?.completeness??e.completeness??5,impact_potential:e.score?.impact_potential??e.impact_potential??5},identity_summary:e.identity_summary||void 0,alerts:Array.isArray(e.alerts)?e.alerts:[],recommendations:Array.isArray(e.recommendations)?e.recommendations:[],missing_data:Array.isArray(e.missing_data)?e.missing_data:[],contradictions:Array.isArray(e.contradictions)?e.contradictions:[],checklist:Array.isArray(e.checklist)?e.checklist:void 0,tags:Array.isArray(e.tags)?e.tags:[]}}async function l(e,o,a){try{return await n(e,o,a)}catch(r){console.warn("Primeira tentativa falhou, tentando novamente...",r.message);try{return await n(e,o,a)}catch(e){throw Error(`Falha ap\xf3s retry: ${e.message}`)}}}[s]=t.then?(await t)():t,e.s(["generateSectionReportWithRetry",()=>l]),a()}catch(e){a(e)}},!1),82727,e=>e.a(async(o,a)=>{try{var r=e.i(63963),s=e.i(64104),t=e.i(58697),i=e.i(70528),n=o([s,t,i]);async function c(e,o){return(o.setHeader("Access-Control-Allow-Credentials","true"),o.setHeader("Access-Control-Allow-Origin","*"),o.setHeader("Access-Control-Allow-Methods","GET,OPTIONS,PATCH,DELETE,POST,PUT"),o.setHeader("Access-Control-Allow-Headers","X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"),"OPTIONS"===e.method)?void o.status(200).end():(0,r.authenticateToken)(e,o,async()=>{try{let{method:a}=e,r=e.user,n=e.query.id,c=e.query.sectionCode;if(!n||!c)return o.status(400).json({error:"dossierId e sectionCode são obrigatórios"});let d=await s.default.query("SELECT clinic_id FROM dossiers WHERE id = $1",[n]);if(0===d.rows.length)return o.status(404).json({error:"Dossiê não encontrado"});let l=d.rows[0].clinic_id;if("admin"!==r.role&&r.clinicId!==l)return o.status(403).json({error:"Acesso negado a este dossiê"});let u=await s.default.query("SELECT id FROM sections WHERE code = $1",[c]);if(0===u.rows.length)return o.status(404).json({error:"Seção não encontrada"});let m=u.rows[0].id;if("GET"===a)try{let e=await s.default.query(`SELECT * FROM ai_reports 
             WHERE dossier_id = $1 AND section_code = $2 
             ORDER BY created_at DESC 
             LIMIT 1`,[n,c]);if(0===e.rows.length)return o.status(404).json({error:"Relatório ainda não gerado para esta seção"});let a=e.rows[0];return o.status(200).json({id:a.id,status:a.status,report_markdown:a.report_markdown,insights:a.insights_json,created_at:a.created_at,updated_at:a.updated_at,prompt_key:a.prompt_key,prompt_version:a.prompt_version,model:a.model})}catch(e){return console.error("Erro ao buscar relatório:",e),o.status(500).json({error:"Erro ao buscar relatório",message:e.message})}if("POST"===a){let e=process.env.OPENAI_API_KEY;if(!e)return console.error("OPENAI_API_KEY não configurada"),o.status(500).json({error:"Configuração do servidor incompleta"});try{let a,r;console.log(`[${new Date().toISOString()}] Construindo snapshot para se\xe7\xe3o ${c} do dossi\xea ${n}...`);try{a=await (0,t.buildSectionSnapshot)(n,c),console.log(`[${new Date().toISOString()}] Snapshot constru\xeddo com sucesso. Respostas: ${a.answers?.length||0}, Entidades: ${Object.keys(a.entities||{}).length}`)}catch(e){throw console.error(`[${new Date().toISOString()}] Erro ao construir snapshot:`,e),Error(`Erro ao construir snapshot: ${e.message}`)}let d=null;try{await s.default.query(`INSERT INTO ai_report_events (ai_report_id, event_type, payload_json)
               VALUES (NULL, 'snapshot_built', $1)
               RETURNING id`,[JSON.stringify({section_code:c,dossier_id:n})])}catch(e){}console.log(`[${new Date().toISOString()}] Chamando IA para gerar relat\xf3rio...`);let u="IDENTITY"===c?.5:.7;try{r=await (0,i.generateSectionReportWithRetry)(c,a,{apiKey:e,model:"gpt-4o",temperature:u,promptVersion:"1.0.0",tone:"intermediario"}),console.log(`[${new Date().toISOString()}] Relat\xf3rio gerado pela IA com sucesso. Tamanho do markdown: ${r.report_markdown?.length||0} caracteres`)}catch(e){throw console.error(`[${new Date().toISOString()}] Erro ao gerar relat\xf3rio com IA:`,e),Error(`Erro na gera\xe7\xe3o pela IA: ${e.message}`)}d=(await s.default.query(`INSERT INTO ai_reports (
              clinic_id, dossier_id, section_id, section_code, status,
              input_snapshot_json, report_markdown, insights_json,
              prompt_key, prompt_version, model, temperature, token_usage_json
            ) VALUES ($1, $2, $3, $4, 'generated', $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id`,[l,n,m,c,JSON.stringify(a),r.report_markdown,JSON.stringify(r.insights),"SECTION_REPORT_V1","1.0.0","gpt-4o",u,r.token_usage?JSON.stringify(r.token_usage):null])).rows[0].id,await s.default.query(`UPDATE ai_reports
             SET status = 'stale', updated_at = NOW()
             WHERE dossier_id = $1 AND section_code = $2 AND id != $3 AND status = 'generated'`,[n,c,d]),await s.default.query(`UPDATE ai_reports
             SET status = 'stale', updated_at = NOW()
             WHERE dossier_id = $1 AND section_code = 'FINAL_REPORT' AND status = 'generated'`,[n]);try{await s.default.query("UPDATE ai_report_events SET ai_report_id = $1 WHERE ai_report_id IS NULL",[d]),await s.default.query(`INSERT INTO ai_report_events (ai_report_id, event_type, payload_json)
               VALUES ($1, 'llm_called', $2)`,[d,JSON.stringify({model:"gpt-4o",temperature:.7})]),await s.default.query(`INSERT INTO ai_report_events (ai_report_id, event_type, payload_json)
               VALUES ($1, 'persisted', $2)`,[d,JSON.stringify({success:!0})])}catch(e){}return console.log(`Relat\xf3rio gerado com sucesso: ${d}`),o.status(200).json({id:d,status:"generated",report_markdown:r.report_markdown,insights:r.insights,created_at:new Date().toISOString()})}catch(r){console.error("Erro ao gerar relatório:",r),console.error("Stack trace:",r.stack);try{let e=await s.default.query(`INSERT INTO ai_reports (
                clinic_id, dossier_id, section_id, section_code, status,
                input_snapshot_json, report_markdown, insights_json,
                error_message, prompt_key, prompt_version, model
              ) VALUES ($1, $2, $3, $4, 'error', $5, '', '{}', $6, $7, $8, $9)
              RETURNING id`,[l,n,m,c,JSON.stringify({error:r.message,stack:r.stack}),r.message||"Erro desconhecido","SECTION_REPORT_V1","1.0.0","gpt-4o"]);try{await s.default.query(`INSERT INTO ai_report_events (ai_report_id, event_type, payload_json)
                 VALUES ($1, 'error', $2)`,[e.rows[0].id,JSON.stringify({error:r.message,stack:r.stack})])}catch{}}catch(e){console.error("Erro ao salvar erro no banco:",e)}let e=r.message||"Erro desconhecido",a;console.error("Erro completo:",{message:e,stack:r.stack,name:r.name});try{let r=await s.default.query(`SELECT * FROM ai_reports 
               WHERE dossier_id = $1 AND section_code = $2 AND status = 'error'
               ORDER BY created_at DESC 
               LIMIT 1`,[n,c]);if(r.rows.length>0){let s=r.rows[0];return o.status(500).json({id:s.id,status:"error",error_message:s.error_message||e,report_markdown:"",insights:{},created_at:s.created_at,message:e,details:a})}}catch(e){console.error("Erro ao buscar relatório de erro:",e)}return o.status(500).json({error:"Erro ao gerar relatório",message:e,details:a})}}return o.status(405).json({error:"Método não permitido"})}catch(e){return console.error("Erro na API de relatórios:",e),o.status(500).json({error:e.message})}})}[s,t,i]=n.then?(await n)():n,e.s(["default",()=>c]),a()}catch(e){a(e)}},!1),33505,e=>e.a(async(o,a)=>{try{var r=e.i(93957),s=e.i(72664),t=e.i(61471),i=e.i(65751),n=e.i(82727),c=e.i(90078),d=e.i(57218),l=e.i(2576),u=o([n]);[n]=u.then?(await u)():u;let p=(0,i.hoist)(n,"default"),x=(0,i.hoist)(n,"config"),f=new t.PagesAPIRouteModule({definition:{kind:s.RouteKind.PAGES_API,page:"/api/dossiers/[id]/sections/[sectionCode]/report",pathname:"/api/dossiers/[id]/sections/[sectionCode]/report",bundlePath:"",filename:""},userland:n,distDir:".next",relativeProjectDir:""});async function m(e,o,a){f.isDev&&(0,l.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let s="/api/dossiers/[id]/sections/[sectionCode]/report";s=s.replace(/\/index$/,"")||"/";let t=await f.prepare(e,o,{srcPage:s});if(!t){o.statusCode=400,o.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve());return}let{query:i,params:n,prerenderManifest:u,routerServerContext:m}=t;try{let a=e.method||"GET",r=(0,c.getTracer)(),t=r.getActiveScopeSpan(),l=f.instrumentationOnRequestError.bind(f),p=async t=>f.render(e,o,{query:{...i,...n},params:n,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:u.preview,propagateError:!1,dev:f.isDev,page:"/api/dossiers/[id]/sections/[sectionCode]/report",internalRevalidate:null==m?void 0:m.revalidate,onError:(...o)=>l(e,...o)}).finally(()=>{if(!t)return;t.setAttributes({"http.status_code":o.statusCode,"next.rsc":!1});let e=r.getRootSpanAttributes();if(!e)return;if(e.get("next.span_type")!==d.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${e.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let i=e.get("next.route");if(i){let e=`${a} ${i}`;t.setAttributes({"next.route":i,"http.route":i,"next.span_name":e}),t.updateName(e)}else t.updateName(`${a} ${s}`)});t?await p(t):await r.withPropagatedContext(e.headers,()=>r.trace(d.BaseServerSpan.handleRequest,{spanName:`${a} ${s}`,kind:c.SpanKind.SERVER,attributes:{"http.method":a,"http.target":e.url}},p))}catch(e){if(f.isDev)throw e;(0,r.sendError)(o,500,"Internal Server Error")}finally{null==a.waitUntil||a.waitUntil.call(a,Promise.resolve())}}e.s(["config",0,x,"default",0,p,"handler",()=>m]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=Planeamento%20dental_planeamento-dental_483b5c5d._.js.map