(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,64703,e=>{"use strict";let o=void 0!==e.i(43137).default&&"/api"||"/api";function s(){try{let e=localStorage.getItem("auth-storage");if(e){let o=JSON.parse(e);return o.state?.token||null}}catch(e){console.error("Erro ao ler token:",e)}return null}async function a(t,r={}){let i=t.startsWith("/")?t:`/${t}`,n=`${o}${i}`,c=s(),d={"Content-Type":"application/json",...r.headers};c&&(d.Authorization=`Bearer ${c}`);let l=await fetch(n,{...r,headers:d});if(!l.ok){if(401===l.status||403===l.status){localStorage.removeItem("auth-storage");try{e.A(22499).then(({useAuthStore:e})=>{e.getState().logout()}).catch(()=>{})}catch(e){}throw"/login"!==window.location.pathname&&(window.location.href="/login"),Error("Sessão expirada. Faça login novamente.")}let o=`HTTP error! status: ${l.status}`;try{let e=l.headers.get("content-type");if(e&&e.includes("application/json")){let e=await l.json();o=e.error||e.message||o}else{let e=await l.text();e.includes("import")||e.includes("export")?o=`Erro de roteamento: a API retornou c\xf3digo ao inv\xe9s de JSON. Verifique se a rota ${t} existe.`:e.trim()&&(o=e.substring(0,200))}}catch(e){console.error("Erro ao parsear resposta de erro:",e)}throw Error(o)}let m=l.headers.get("content-type");if(m&&m.includes("application/json"))return l.json();{let e=await l.text();if(e.trim()){if(e.includes("import")||e.includes("export"))throw Error(`A API retornou c\xf3digo ao inv\xe9s de JSON para ${t}. Verifique a rota.`);try{return JSON.parse(e)}catch{throw Error(`Resposta inv\xe1lida da API: esperado JSON, recebido ${m||"texto"}`)}}return null}}e.s(["api",0,{login:(e,o)=>a("/auth/login",{method:"POST",body:JSON.stringify({email:e,password:o})}),register:(e,o,s,t)=>a("/auth/register",{method:"POST",body:JSON.stringify({email:e,password:o,name:s,clinicId:t})}),logout:()=>a("/auth/logout",{method:"POST"}),getMe:()=>a("/auth/me"),getAllUsers:()=>a("/users"),getUser:e=>a(`/users/${e}`),createUser:e=>a("/users",{method:"POST",body:JSON.stringify(e)}),updateUser:(e,o)=>a(`/users/${e}`,{method:"PUT",body:JSON.stringify(o)}),deleteUser:e=>a(`/users/${e}`,{method:"DELETE"}),getAllClinics:()=>a("/clinics"),getClinic:e=>a(`/clinic/${e}`),createClinic:e=>a("/clinics",{method:"POST",body:JSON.stringify({clinicName:e})}),saveClinicData:(e,o)=>a(`/clinic/${e}`,{method:"POST",body:JSON.stringify(o)}),deleteClinic:e=>a(`/clinic/${e}`,{method:"DELETE"}),generateReport:(e,o,s)=>a("/reports/generate",{method:"POST",body:JSON.stringify({clinicId:e,reportType:o,state:s})}),getAdminStats:()=>a("/admin/stats"),getAllReports:()=>a("/admin/reports"),getReport:e=>a(`/admin/reports/${e}`),reprocessReport:e=>a(`/admin/reports/${e}/reprocess`,{method:"POST"}),downloadReport:e=>a(`/admin/reports/${e}/download`),getPrompts:()=>a("/admin/prompts"),getPrompt:e=>a(`/admin/prompts/${e}`),savePrompt:(e,o,s)=>a(`/admin/prompts/${e}`,{method:"PUT",body:JSON.stringify({system_prompt:o,user_prompt:s})}),getSettings:()=>a("/admin/settings"),saveSettings:e=>a("/admin/settings",{method:"PUT",body:JSON.stringify(e)}),getLogs:e=>a(`/admin/logs${e?`?limit=${e}`:""}`),getSessions:()=>a("/admin/sessions"),revokeSession:e=>a(`/admin/sessions/${e}`,{method:"DELETE"}),resetUserPassword:e=>a(`/admin/users/${e}/reset-password`,{method:"POST"}),exportClinicData:e=>a(`/admin/clinics/${e}/export`),importClinicData:e=>a("/admin/clinics/import",{method:"POST",body:JSON.stringify(e)}),getDossiers:e=>a(`/dossiers?clinicId=${e}`),getDossier:e=>a(`/dossiers/${e}`),createDossier:e=>a("/dossiers",{method:"POST",body:JSON.stringify(e)}),updateDossier:(e,o)=>a(`/dossiers/${e}`,{method:"PUT",body:JSON.stringify(o)}),deleteDossier:e=>a(`/dossiers/${e}`,{method:"DELETE"}),getDossierSections:e=>a(`/dossiers/${e}/sections`),getDossierSection:(e,o)=>a(`/dossiers/${e}/sections?sectionCode=${o}`),getDossierAnswers:(e,o)=>a(`/dossiers/${e}/answers${o?`?sectionCode=${o}`:""}`),saveDossierAnswers:(e,o)=>a(`/dossiers/${e}/answers`,{method:"POST",body:JSON.stringify({answers:o})}),getCustomerSegments:(e,o)=>a(`/dossiers/${e}/entities/customer-segments${o?`?entityId=${o}`:""}`),createCustomerSegment:(e,o)=>a(`/dossiers/${e}/entities/customer-segments`,{method:"POST",body:JSON.stringify(o)}),updateCustomerSegment:(e,o,s)=>a(`/dossiers/${e}/entities/customer-segments?entityId=${o}`,{method:"PUT",body:JSON.stringify(s)}),deleteCustomerSegment:(e,o)=>a(`/dossiers/${e}/entities/customer-segments?entityId=${o}`,{method:"DELETE"}),getValuePropositions:(e,o)=>a(`/dossiers/${e}/entities/value-propositions${o?`?entityId=${o}`:""}`),createValueProposition:(e,o)=>a(`/dossiers/${e}/entities/value-propositions`,{method:"POST",body:JSON.stringify(o)}),updateValueProposition:(e,o,s)=>a(`/dossiers/${e}/entities/value-propositions?entityId=${o}`,{method:"PUT",body:JSON.stringify(s)}),deleteValueProposition:(e,o)=>a(`/dossiers/${e}/entities/value-propositions?entityId=${o}`,{method:"DELETE"}),getServices:(e,o)=>a(`/dossiers/${e}/entities/services${o?`?entityId=${o}`:""}`),createService:(e,o)=>a(`/dossiers/${e}/entities/services`,{method:"POST",body:JSON.stringify(o)}),updateService:(e,o,s)=>a(`/dossiers/${e}/entities/services?entityId=${o}`,{method:"PUT",body:JSON.stringify(s)}),deleteService:(e,o)=>a(`/dossiers/${e}/entities/services?entityId=${o}`,{method:"DELETE"}),getCompetitors:(e,o)=>a(`/dossiers/${e}/entities/competitors${o?`?entityId=${o}`:""}`),createCompetitor:(e,o)=>a(`/dossiers/${e}/entities/competitors`,{method:"POST",body:JSON.stringify(o)}),updateCompetitor:(e,o,s)=>a(`/dossiers/${e}/entities/competitors?entityId=${o}`,{method:"PUT",body:JSON.stringify(s)}),deleteCompetitor:(e,o)=>a(`/dossiers/${e}/entities/competitors?entityId=${o}`,{method:"DELETE"}),getTeamMembers:(e,o)=>a(`/dossiers/${e}/entities/team-members${o?`?entityId=${o}`:""}`),createTeamMember:(e,o)=>a(`/dossiers/${e}/entities/team-members`,{method:"POST",body:JSON.stringify(o)}),updateTeamMember:(e,o,s)=>a(`/dossiers/${e}/entities/team-members?entityId=${o}`,{method:"PUT",body:JSON.stringify(s)}),deleteTeamMember:(e,o)=>a(`/dossiers/${e}/entities/team-members?entityId=${o}`,{method:"DELETE"}),getCapacities:(e,o)=>a(`/dossiers/${e}/entities/capacities${o?`?entityId=${o}`:""}`),createCapacity:(e,o)=>a(`/dossiers/${e}/entities/capacities`,{method:"POST",body:JSON.stringify(o)}),updateCapacity:(e,o,s)=>a(`/dossiers/${e}/entities/capacities?entityId=${o}`,{method:"PUT",body:JSON.stringify(s)}),deleteCapacity:(e,o)=>a(`/dossiers/${e}/entities/capacities?entityId=${o}`,{method:"DELETE"}),getStrategicChoices:(e,o)=>a(`/dossiers/${e}/entities/strategic-choices${o?`?entityId=${o}`:""}`),createStrategicChoice:(e,o)=>a(`/dossiers/${e}/entities/strategic-choices`,{method:"POST",body:JSON.stringify(o)}),updateStrategicChoice:(e,o,s)=>a(`/dossiers/${e}/entities/strategic-choices?entityId=${o}`,{method:"PUT",body:JSON.stringify(s)}),deleteStrategicChoice:(e,o)=>a(`/dossiers/${e}/entities/strategic-choices?entityId=${o}`,{method:"DELETE"}),getInitiatives:(e,o)=>a(`/dossiers/${e}/entities/initiatives${o?`?entityId=${o}`:""}`),createInitiative:(e,o)=>a(`/dossiers/${e}/entities/initiatives`,{method:"POST",body:JSON.stringify(o)}),updateInitiative:(e,o,s)=>a(`/dossiers/${e}/entities/initiatives?entityId=${o}`,{method:"PUT",body:JSON.stringify(s)}),deleteInitiative:(e,o)=>a(`/dossiers/${e}/entities/initiatives?entityId=${o}`,{method:"DELETE"}),getServiceCategories:(e,o)=>a(`/dossiers/${e}/entities/service-categories${o?`?entityId=${o}`:""}`),createServiceCategory:(e,o)=>a(`/dossiers/${e}/entities/service-categories`,{method:"POST",body:JSON.stringify(o)}),updateServiceCategory:(e,o,s)=>a(`/dossiers/${e}/entities/service-categories?entityId=${o}`,{method:"PUT",body:JSON.stringify(s)}),deleteServiceCategory:(e,o)=>a(`/dossiers/${e}/entities/service-categories?entityId=${o}`,{method:"DELETE"}),getRoles:(e,o)=>a(`/clinics/${e}/roles${o?`?entityId=${o}`:""}`),createRole:(e,o)=>a(`/clinics/${e}/roles`,{method:"POST",body:JSON.stringify(o)}),updateRole:(e,o,s)=>a(`/clinics/${e}/roles?entityId=${o}`,{method:"PUT",body:JSON.stringify(s)}),deleteRole:(e,o)=>a(`/clinics/${e}/roles?entityId=${o}`,{method:"DELETE"}),generateSectionReport:(e,o)=>a(`/dossiers/${e}/sections/${o}/report`,{method:"POST"}),getSectionReport:(e,o)=>a(`/dossiers/${e}/sections/${o}/report`),getDossierReports:e=>a(`/dossiers/${e}/reports`),generateFinalReport:e=>a(`/dossiers/${e}/final-report:generate`,{method:"POST"}),getFinalReport:e=>a(`/dossiers/${e}/final-report`),exportFinalReport:async(e,a="pdf")=>{let t=s(),r={};t&&(r.Authorization=`Bearer ${t}`);let i=await fetch(`${o}/dossiers/${e}/final-report/export?format=${a}`,{method:"GET",headers:r});if(!i.ok)throw Error(`Erro ao exportar relat\xf3rio: ${i.status}`);return i.blob()}},"fetchAPI",()=>a])},76887,(e,o,s)=>{"use strict";s._=function(e){return e&&e.__esModule?e:{default:e}}},33141,(e,o,s)=>{"use strict";Object.defineProperty(s,"__esModule",{value:!0}),Object.defineProperty(s,"HeadManagerContext",{enumerable:!0,get:function(){return a}});let a=e.r(76887)._(e.r(68196)).default.createContext({})},5404,(e,o,s)=>{"use strict";Object.defineProperty(s,"__esModule",{value:!0}),Object.defineProperty(s,"warnOnce",{enumerable:!0,get:function(){return a}});let a=e=>{}},21067,(e,o,s)=>{"use strict";function a(e){if("function"!=typeof WeakMap)return null;var o=new WeakMap,s=new WeakMap;return(a=function(e){return e?s:o})(e)}s._=function(e,o){if(!o&&e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var s=a(o);if(s&&s.has(e))return s.get(e);var t={__proto__:null},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var i in e)if("default"!==i&&Object.prototype.hasOwnProperty.call(e,i)){var n=r?Object.getOwnPropertyDescriptor(e,i):null;n&&(n.get||n.set)?Object.defineProperty(t,i,n):t[i]=e[i]}return t.default=e,s&&s.set(e,t),t}},28556,(e,o,s)=>{"use strict";Object.defineProperty(s,"__esModule",{value:!0});var a={DecodeError:function(){return v},MiddlewareNotFoundError:function(){return S},MissingStaticPage:function(){return y},NormalizeError:function(){return h},PageNotFoundError:function(){return b},SP:function(){return f},ST:function(){return g},WEB_VITALS:function(){return r},execOnce:function(){return i},getDisplayName:function(){return m},getLocationOrigin:function(){return d},getURL:function(){return l},isAbsoluteUrl:function(){return c},isResSent:function(){return u},loadGetInitialProps:function(){return p},normalizeRepeatedSlashes:function(){return x},stringifyError:function(){return E}};for(var t in a)Object.defineProperty(s,t,{enumerable:!0,get:a[t]});let r=["CLS","FCP","FID","INP","LCP","TTFB"];function i(e){let o,s=!1;return(...a)=>(s||(s=!0,o=e(...a)),o)}let n=/^[a-zA-Z][a-zA-Z\d+\-.]*?:/,c=e=>n.test(e);function d(){let{protocol:e,hostname:o,port:s}=window.location;return`${e}//${o}${s?":"+s:""}`}function l(){let{href:e}=window.location,o=d();return e.substring(o.length)}function m(e){return"string"==typeof e?e:e.displayName||e.name||"Unknown"}function u(e){return e.finished||e.headersSent}function x(e){let o=e.split("?");return o[0].replace(/\\/g,"/").replace(/\/\/+/g,"/")+(o[1]?`?${o.slice(1).join("?")}`:"")}async function p(e,o){let s=o.res||o.ctx&&o.ctx.res;if(!e.getInitialProps)return o.ctx&&o.Component?{pageProps:await p(o.Component,o.ctx)}:{};let a=await e.getInitialProps(o);if(s&&u(s))return a;if(!a)throw Object.defineProperty(Error(`"${m(e)}.getInitialProps()" should resolve to an object. But found "${a}" instead.`),"__NEXT_ERROR_CODE",{value:"E394",enumerable:!1,configurable:!0});return a}let f="u">typeof performance,g=f&&["mark","measure","getEntriesByName"].every(e=>"function"==typeof performance[e]);class v extends Error{}class h extends Error{}class b extends Error{constructor(e){super(),this.code="ENOENT",this.name="PageNotFoundError",this.message=`Cannot find module for page: ${e}`}}class y extends Error{constructor(e,o){super(),this.message=`Failed to load static file for page: ${e} ${o}`}}class S extends Error{constructor(){super(),this.code="ENOENT",this.message="Cannot find the middleware module"}}function E(e){return JSON.stringify({message:e.message,stack:e.stack})}},47695,e=>{"use strict";var o=e.i(68196),s=e.i(88091),a=e.i(66582),t=e.i(80087),r=e.i(7980),i=e.i(20453),n=e.i(63624),c=e.i(32337),d=e.i(98189),l=e.i(90949),m=e.i(43935),u="rovingFocusGroup.onEntryFocus",x={bubbles:!1,cancelable:!0},p="RovingFocusGroup",[f,g,v]=(0,a.createCollection)(p),[h,b]=(0,r.createContextScope)(p,[v]),[y,S]=h(p),E=o.forwardRef((e,o)=>(0,m.jsx)(f.Provider,{scope:e.__scopeRovingFocusGroup,children:(0,m.jsx)(f.Slot,{scope:e.__scopeRovingFocusGroup,children:(0,m.jsx)(O,{...e,ref:o})})}));E.displayName=p;var O=o.forwardRef((e,a)=>{let{__scopeRovingFocusGroup:r,orientation:i,loop:f=!1,dir:v,currentTabStopId:h,defaultCurrentTabStopId:b,onCurrentTabStopIdChange:S,onEntryFocus:E,preventScrollOnEntryFocus:O=!1,...P}=e,N=o.useRef(null),T=(0,t.useComposedRefs)(a,N),C=(0,l.useDirection)(v),[R,I]=(0,d.useControllableState)({prop:h,defaultProp:b??null,onChange:S,caller:p}),[$,A]=o.useState(!1),w=(0,c.useCallbackRef)(E),D=g(r),q=o.useRef(!1),[k,M]=o.useState(0);return o.useEffect(()=>{let e=N.current;if(e)return e.addEventListener(u,w),()=>e.removeEventListener(u,w)},[w]),(0,m.jsx)(y,{scope:r,orientation:i,dir:C,loop:f,currentTabStopId:R,onItemFocus:o.useCallback(e=>I(e),[I]),onItemShiftTab:o.useCallback(()=>A(!0),[]),onFocusableItemAdd:o.useCallback(()=>M(e=>e+1),[]),onFocusableItemRemove:o.useCallback(()=>M(e=>e-1),[]),children:(0,m.jsx)(n.Primitive.div,{tabIndex:$||0===k?-1:0,"data-orientation":i,...P,ref:T,style:{outline:"none",...e.style},onMouseDown:(0,s.composeEventHandlers)(e.onMouseDown,()=>{q.current=!0}),onFocus:(0,s.composeEventHandlers)(e.onFocus,e=>{let o=!q.current;if(e.target===e.currentTarget&&o&&!$){let o=new CustomEvent(u,x);if(e.currentTarget.dispatchEvent(o),!o.defaultPrevented){let e=D().filter(e=>e.focusable);j([e.find(e=>e.active),e.find(e=>e.id===R),...e].filter(Boolean).map(e=>e.ref.current),O)}}q.current=!1}),onBlur:(0,s.composeEventHandlers)(e.onBlur,()=>A(!1))})})}),P="RovingFocusGroupItem",N=o.forwardRef((e,a)=>{let{__scopeRovingFocusGroup:t,focusable:r=!0,active:c=!1,tabStopId:d,children:l,...u}=e,x=(0,i.useId)(),p=d||x,v=S(P,t),h=v.currentTabStopId===p,b=g(t),{onFocusableItemAdd:y,onFocusableItemRemove:E,currentTabStopId:O}=v;return o.useEffect(()=>{if(r)return y(),()=>E()},[r,y,E]),(0,m.jsx)(f.ItemSlot,{scope:t,id:p,focusable:r,active:c,children:(0,m.jsx)(n.Primitive.span,{tabIndex:h?0:-1,"data-orientation":v.orientation,...u,ref:a,onMouseDown:(0,s.composeEventHandlers)(e.onMouseDown,e=>{r?v.onItemFocus(p):e.preventDefault()}),onFocus:(0,s.composeEventHandlers)(e.onFocus,()=>v.onItemFocus(p)),onKeyDown:(0,s.composeEventHandlers)(e.onKeyDown,e=>{if("Tab"===e.key&&e.shiftKey)return void v.onItemShiftTab();if(e.target!==e.currentTarget)return;let o=function(e,o,s){var a;let t=(a=e.key,"rtl"!==s?a:"ArrowLeft"===a?"ArrowRight":"ArrowRight"===a?"ArrowLeft":a);if(!("vertical"===o&&["ArrowLeft","ArrowRight"].includes(t))&&!("horizontal"===o&&["ArrowUp","ArrowDown"].includes(t)))return T[t]}(e,v.orientation,v.dir);if(void 0!==o){if(e.metaKey||e.ctrlKey||e.altKey||e.shiftKey)return;e.preventDefault();let t=b().filter(e=>e.focusable).map(e=>e.ref.current);if("last"===o)t.reverse();else if("prev"===o||"next"===o){var s,a;"prev"===o&&t.reverse();let r=t.indexOf(e.currentTarget);t=v.loop?(s=t,a=r+1,s.map((e,o)=>s[(a+o)%s.length])):t.slice(r+1)}setTimeout(()=>j(t))}}),children:"function"==typeof l?l({isCurrentTabStop:h,hasTabStop:null!=O}):l})})});N.displayName=P;var T={ArrowLeft:"prev",ArrowUp:"prev",ArrowRight:"next",ArrowDown:"next",PageUp:"first",Home:"first",PageDown:"last",End:"last"};function j(e,o=!1){let s=document.activeElement;for(let a of e)if(a===s||(a.focus({preventScroll:o}),document.activeElement!==s))return}e.s(["Item",()=>N,"Root",()=>E,"createRovingFocusGroupScope",()=>b])},84630,e=>{"use strict";let o=(0,e.i(40895).default)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);e.s(["Check",()=>o],84630)},69302,e=>{"use strict";let o=(0,e.i(40895).default)("eye",[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);e.s(["Eye",()=>o],69302)},85105,e=>{"use strict";let o=(0,e.i(40895).default)("save",[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]]);e.s(["Save",()=>o],85105)},18413,e=>{"use strict";var o=e.i(43935),s=e.i(68196),a=e.i(88091),t=e.i(7980),r=e.i(47695),i=e.i(82147),n=e.i(63624),c=e.i(90949),d=e.i(98189),l=e.i(20453),m="Tabs",[u,x]=(0,t.createContextScope)(m,[r.createRovingFocusGroupScope]),p=(0,r.createRovingFocusGroupScope)(),[f,g]=u(m),v=s.forwardRef((e,s)=>{let{__scopeTabs:a,value:t,onValueChange:r,defaultValue:i,orientation:u="horizontal",dir:x,activationMode:p="automatic",...g}=e,v=(0,c.useDirection)(x),[h,b]=(0,d.useControllableState)({prop:t,onChange:r,defaultProp:i??"",caller:m});return(0,o.jsx)(f,{scope:a,baseId:(0,l.useId)(),value:h,onValueChange:b,orientation:u,dir:v,activationMode:p,children:(0,o.jsx)(n.Primitive.div,{dir:v,"data-orientation":u,...g,ref:s})})});v.displayName=m;var h="TabsList",b=s.forwardRef((e,s)=>{let{__scopeTabs:a,loop:t=!0,...i}=e,c=g(h,a),d=p(a);return(0,o.jsx)(r.Root,{asChild:!0,...d,orientation:c.orientation,dir:c.dir,loop:t,children:(0,o.jsx)(n.Primitive.div,{role:"tablist","aria-orientation":c.orientation,...i,ref:s})})});b.displayName=h;var y="TabsTrigger",S=s.forwardRef((e,s)=>{let{__scopeTabs:t,value:i,disabled:c=!1,...d}=e,l=g(y,t),m=p(t),u=P(l.baseId,i),x=N(l.baseId,i),f=i===l.value;return(0,o.jsx)(r.Item,{asChild:!0,...m,focusable:!c,active:f,children:(0,o.jsx)(n.Primitive.button,{type:"button",role:"tab","aria-selected":f,"aria-controls":x,"data-state":f?"active":"inactive","data-disabled":c?"":void 0,disabled:c,id:u,...d,ref:s,onMouseDown:(0,a.composeEventHandlers)(e.onMouseDown,e=>{c||0!==e.button||!1!==e.ctrlKey?e.preventDefault():l.onValueChange(i)}),onKeyDown:(0,a.composeEventHandlers)(e.onKeyDown,e=>{[" ","Enter"].includes(e.key)&&l.onValueChange(i)}),onFocus:(0,a.composeEventHandlers)(e.onFocus,()=>{let e="manual"!==l.activationMode;f||c||!e||l.onValueChange(i)})})})});S.displayName=y;var E="TabsContent",O=s.forwardRef((e,a)=>{let{__scopeTabs:t,value:r,forceMount:c,children:d,...l}=e,m=g(E,t),u=P(m.baseId,r),x=N(m.baseId,r),p=r===m.value,f=s.useRef(p);return s.useEffect(()=>{let e=requestAnimationFrame(()=>f.current=!1);return()=>cancelAnimationFrame(e)},[]),(0,o.jsx)(i.Presence,{present:c||p,children:({present:s})=>(0,o.jsx)(n.Primitive.div,{"data-state":p?"active":"inactive","data-orientation":m.orientation,role:"tabpanel","aria-labelledby":u,hidden:!s,id:x,tabIndex:0,...l,ref:a,style:{...e.style,animationDuration:f.current?"0s":void 0},children:s&&d})})});function P(e,o){return`${e}-trigger-${o}`}function N(e,o){return`${e}-content-${o}`}O.displayName=E;var T=e.i(69751);let j=s.forwardRef(({className:e,...s},a)=>(0,o.jsx)(b,{ref:a,className:(0,T.cn)("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",e),...s}));j.displayName=b.displayName;let C=s.forwardRef(({className:e,...s},a)=>(0,o.jsx)(S,{ref:a,className:(0,T.cn)("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",e),...s}));C.displayName=S.displayName;let R=s.forwardRef(({className:e,...s},a)=>(0,o.jsx)(O,{ref:a,className:(0,T.cn)("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",e),...s}));R.displayName=O.displayName,e.s(["Tabs",()=>v,"TabsContent",()=>R,"TabsList",()=>j,"TabsTrigger",()=>C],18413)},63122,e=>{"use strict";let o=(0,e.i(40895).default)("code",[["path",{d:"m16 18 6-6-6-6",key:"eg8j8"}],["path",{d:"m8 6-6 6 6 6",key:"ppft3o"}]]);e.s(["Code",()=>o],63122)},89174,e=>{"use strict";var o=e.i(43935),s=e.i(68196),a=e.i(64703),t=e.i(38334),r=e.i(51814),i=e.i(65586),n=e.i(20826),c=e.i(9169),d=e.i(63122),l=e.i(85105);let m=(0,e.i(40895).default)("rotate-ccw",[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]]);var u=e.i(69302),x=e.i(93485),p=e.i(18413),f=e.i(97219);let g={IDENTITY:`
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
  `},v=[{value:"section_IDENTITY",label:"IDENTITY - Identidade",description:"Prompt para relatório de identidade estratégica",category:"sections"},{value:"section_BUSINESS_MODEL",label:"BUSINESS_MODEL - Modelo de Negócio",description:"Prompt para relatório de modelo de negócio",category:"sections"},{value:"section_MARKET",label:"MARKET - Mercado",description:"Prompt para relatório de mercado e concorrência",category:"sections"},{value:"section_OFFER",label:"OFFER - Oferta",description:"Prompt para relatório de oferta de serviços",category:"sections"},{value:"section_OPERATIONS",label:"OPERATIONS - Operações",description:"Prompt para relatório de operações",category:"sections"},{value:"section_PEOPLE",label:"PEOPLE - Pessoas, Cultura & Gestão",description:"Prompt para relatório de pessoas e cultura organizacional",category:"sections"},{value:"section_STRATEGY",label:"STRATEGY - Estratégia",description:"Prompt para síntese estratégica",category:"sections"},{value:"section_PLAN",label:"PLAN - Plano",description:"Prompt para plano de execução",category:"sections"},{value:"section_FINAL_REPORT",label:"FINAL_REPORT - Relatório Final",description:"Prompt para relatório final consolidado (integração executiva)",category:"sections"},{value:"diagnostic",label:"Diagnóstico",description:"Prompt para relatório de diagnóstico",category:"legacy"},{value:"strategic",label:"Estratégico",description:"Prompt para direcionamento estratégico",category:"legacy"},{value:"advanced",label:"Análise Avançada",description:"Prompt para análise estratégica avançada",category:"legacy"},{value:"tactical",label:"Tático",description:"Prompt para plano tático (OKRs)",category:"legacy"},{value:"operational",label:"Operacional",description:"Prompt para plano operacional",category:"legacy"},{value:"final",label:"Relatório Final",description:"Prompt para relatório final consolidado",category:"legacy"}],h=0,b=2,y=.1,S=1e3,E=16e3,O=100,P=["gpt-4","gpt-4-turbo","gpt-3.5-turbo"];e.s(["default",0,function(){let[e,N]=(0,s.useState)("section_IDENTITY"),[T,j]=(0,s.useState)(""),[C,R]=(0,s.useState)(""),[I,$]=(0,s.useState)(""),[A,w]=(0,s.useState)(""),[D,q]=(0,s.useState)({model:"gpt-4",temperature:.7,maxTokens:4e3}),[k,M]=(0,s.useState)(!1),[_,z]=(0,s.useState)(!1);(0,s.useEffect)(()=>{L(e)},[e]);let L=async e=>{z(!0);try{try{let o=await a.api.getPrompt(e);if(j(o.system_prompt||""),R(o.user_prompt||""),$(o.system_prompt||""),w(o.user_prompt||""),!o.system_prompt&&!o.user_prompt){let o=U(e);j(o.systemPrompt),R(o.userPrompt),$(o.systemPrompt),w(o.userPrompt)}}catch(s){let o=U(e);j(o.systemPrompt),R(o.userPrompt),$(o.systemPrompt),w(o.userPrompt)}}catch(e){c.toast.error("Erro ao carregar prompt")}finally{z(!1)}},U=e=>{if(e.startsWith("section_")){let o,s=e.replace("section_",""),a=g[s]||"";return{systemPrompt:(o={formal:"Você é um consultor de gestão estratégica especializado em clínicas de saúde. Use linguagem formal, técnica e objetiva. Seja preciso e baseie todas as conclusões nos dados fornecidos. Retorne suas análises em formato json estruturado.",informal:"Você é um mentor de negócios que fala de forma acessível e direta. Use linguagem informal e próxima, evitando jargões excessivos. Seja prático e baseie recomendações nos dados fornecidos. Retorne suas análises em formato json estruturado.",intermediario:"Você é um consultor experiente que equilibra profissionalismo com clareza. Use linguagem clara, mas profissional. Seja objetivo e baseie análises nos dados fornecidos. Retorne suas análises em formato json estruturado."}).intermediario||o.intermediario,userPrompt:a?`${a}

**DADOS DA CL\xcdNICA E DO DOSSI\xca:**

Snapshot:
{{SNAPSHOT_JSON}}

---

Gere o relat\xf3rio completo e os insights estruturados baseados EXCLUSIVAMENTE nos dados fornecidos acima.
Retorne um JSON v\xe1lido com a seguinte estrutura:

{
  "report_markdown": "# Relat\xf3rio da Se\xe7\xe3o ${s}\\n\\n[Conte\xfado completo em Markdown]",
  "insights": {
    "score": { "clarity": 0-10, "consistency": 0-10, "completeness": 0-10, "impact_potential": 0-10 },
    "alerts": [],
    "recommendations": [],
    "missing_data": [],
    "contradictions": [],
    "checklist": [],
    "tags": []
  }
}`:`Gere um relat\xf3rio executivo da se\xe7\xe3o ${s} com base no snapshot abaixo.

Snapshot:
{{SNAPSHOT_JSON}}

Retorne um JSON v\xe1lido com report_markdown e insights estruturados.`}}return{systemPrompt:`Voc\xea \xe9 um consultor especializado. Analise os dados fornecidos e gere um relat\xf3rio detalhado.`,userPrompt:`Gere um relat\xf3rio do tipo "${e}" com base nos dados fornecidos.

Retorne um JSON v\xe1lido com report_markdown e insights estruturados.`}},F=e=>{N(e),L(e)},J=async()=>{try{try{await a.api.savePrompt(e,T,C),c.toast.success("Prompt salvo com sucesso"),$(T),w(C)}catch(e){c.toast.error(`Erro ao salvar prompt: ${e.message}`)}}catch(e){c.toast.error("Erro ao salvar prompt")}},V=()=>{confirm("Deseja restaurar os prompts originais? As alterações serão perdidas.")&&(j(I),R(A),c.toast.info("Prompts restaurados"))},G=T!==I||C!==A;return(0,o.jsxs)("div",{className:"space-y-8",children:[(0,o.jsxs)("div",{className:"flex items-center justify-between",children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("h1",{className:"text-3xl font-bold",children:"Prompts & Modelos"}),(0,o.jsx)("p",{className:"text-slate-500 mt-1",children:"Gerencie os prompts do sistema e configurações dos modelos de IA"})]}),(0,o.jsxs)("div",{className:"flex gap-2",children:[(0,o.jsxs)(r.Button,{variant:"outline",onClick:()=>M(!0),children:[(0,o.jsx)(u.Eye,{className:"mr-2 h-4 w-4"}),"Preview"]}),(0,o.jsxs)(r.Button,{variant:"outline",onClick:V,disabled:!G,children:[(0,o.jsx)(m,{className:"mr-2 h-4 w-4"}),"Restaurar"]}),(0,o.jsxs)(r.Button,{onClick:J,disabled:!G||_,children:[(0,o.jsx)(l.Save,{className:"mr-2 h-4 w-4"}),"Salvar"]})]})]}),(0,o.jsxs)("div",{className:"grid gap-6 lg:grid-cols-3",children:[(0,o.jsxs)(t.Card,{className:"lg:col-span-1",children:[(0,o.jsxs)(t.CardHeader,{children:[(0,o.jsx)(t.CardTitle,{children:"Tipo de Prompt"}),(0,o.jsx)(t.CardDescription,{children:"Selecione o prompt que deseja editar"})]}),(0,o.jsx)(t.CardContent,{children:(0,o.jsxs)(p.Tabs,{defaultValue:"sections",className:"w-full",children:[(0,o.jsxs)(p.TabsList,{className:"grid w-full grid-cols-2",children:[(0,o.jsx)(p.TabsTrigger,{value:"sections",children:"Seções"}),(0,o.jsx)(p.TabsTrigger,{value:"legacy",children:"Legado"})]}),(0,o.jsx)(p.TabsContent,{value:"sections",className:"space-y-2 mt-4",children:v.filter(e=>"sections"===e.category).map(s=>(0,o.jsxs)(r.Button,{variant:e===s.value?"default":"outline",className:"w-full justify-start",onClick:()=>F(s.value),children:[(0,o.jsx)(d.Code,{className:"mr-2 h-4 w-4"}),s.label]},s.value))}),(0,o.jsx)(p.TabsContent,{value:"legacy",className:"space-y-2 mt-4",children:v.filter(e=>"legacy"===e.category).map(s=>(0,o.jsxs)(r.Button,{variant:e===s.value?"default":"outline",className:"w-full justify-start",onClick:()=>F(s.value),children:[(0,o.jsx)(d.Code,{className:"mr-2 h-4 w-4"}),s.label]},s.value))})]})})]}),(0,o.jsxs)(t.Card,{className:"lg:col-span-2",children:[(0,o.jsxs)(t.CardHeader,{children:[(0,o.jsx)(t.CardTitle,{children:v.find(o=>o.value===e)?.label}),(0,o.jsx)(t.CardDescription,{children:v.find(o=>o.value===e)?.description})]}),(0,o.jsx)(t.CardContent,{children:_?(0,o.jsx)("div",{className:"text-center py-8",children:"Carregando..."}):(0,o.jsxs)("div",{className:"space-y-6",children:[(0,o.jsxs)("div",{className:"space-y-2",children:[(0,o.jsxs)(n.Label,{htmlFor:"system-prompt",children:["SYSTEM PROMPT ",(0,o.jsx)("span",{className:"text-xs text-slate-500",children:"(role: system)"})]}),(0,o.jsx)(i.Textarea,{id:"system-prompt",value:T,onChange:e=>j(e.target.value),className:"min-h-[200px] font-mono text-sm",placeholder:"Digite o system prompt aqui..."}),(0,o.jsxs)("p",{className:"text-xs text-slate-500",children:[T.length," caracteres"]})]}),(0,o.jsxs)("div",{className:"space-y-2",children:[(0,o.jsxs)(n.Label,{htmlFor:"user-prompt",children:["USER PROMPT ",(0,o.jsx)("span",{className:"text-xs text-slate-500",children:"(role: user)"})]}),(0,o.jsx)(i.Textarea,{id:"user-prompt",value:C,onChange:e=>R(e.target.value),className:"min-h-[400px] font-mono text-sm",placeholder:"Digite o user prompt aqui... Use {{SNAPSHOT_JSON}} como placeholder para o snapshot."}),(0,o.jsxs)("p",{className:"text-xs text-slate-500",children:[C.length," caracteres"]}),(0,o.jsxs)("p",{className:"text-xs text-slate-400",children:["💡 Use ",(0,o.jsx)("code",{className:"bg-slate-100 px-1 rounded",children:"{{SNAPSHOT_JSON}}"})," como placeholder para o snapshot JSON"]})]})]})})]})]}),(0,o.jsxs)(t.Card,{children:[(0,o.jsxs)(t.CardHeader,{children:[(0,o.jsx)(t.CardTitle,{children:"Configurações do Modelo"}),(0,o.jsx)(t.CardDescription,{children:"Ajuste os parâmetros do modelo de IA para geração de relatórios"})]}),(0,o.jsxs)(t.CardContent,{children:[(0,o.jsxs)(p.Tabs,{defaultValue:"model",className:"w-full",children:[(0,o.jsxs)(p.TabsList,{children:[(0,o.jsx)(p.TabsTrigger,{value:"model",children:"Modelo"}),(0,o.jsx)(p.TabsTrigger,{value:"parameters",children:"Parâmetros"})]}),(0,o.jsx)(p.TabsContent,{value:"model",className:"space-y-4",children:(0,o.jsxs)("div",{className:"space-y-2",children:[(0,o.jsx)(n.Label,{children:"Modelo de IA"}),(0,o.jsxs)(x.Select,{value:D.model,onValueChange:e=>q({...D,model:e}),children:[(0,o.jsx)(x.SelectTrigger,{children:(0,o.jsx)(x.SelectValue,{})}),(0,o.jsx)(x.SelectContent,{children:P.map(e=>(0,o.jsx)(x.SelectItem,{value:e,children:e},e))})]})]})}),(0,o.jsx)(p.TabsContent,{value:"parameters",className:"space-y-4",children:(0,o.jsxs)("div",{className:"grid gap-4 md:grid-cols-2",children:[(0,o.jsxs)("div",{className:"space-y-2",children:[(0,o.jsxs)(n.Label,{children:["Temperatura (",D.temperature,")"]}),(0,o.jsx)("input",{type:"range",min:h,max:b,step:y,value:D.temperature,onChange:e=>q({...D,temperature:parseFloat(e.target.value)}),className:"w-full"}),(0,o.jsx)("p",{className:"text-xs text-slate-500",children:"Controla a criatividade (0 = determinístico, 2 = muito criativo)"})]}),(0,o.jsxs)("div",{className:"space-y-2",children:[(0,o.jsxs)(n.Label,{children:["Max Tokens (",D.maxTokens,")"]}),(0,o.jsx)("input",{type:"range",min:S,max:E,step:O,value:D.maxTokens,onChange:e=>q({...D,maxTokens:parseInt(e.target.value)}),className:"w-full"}),(0,o.jsx)("p",{className:"text-xs text-slate-500",children:"Tamanho máximo da resposta em tokens"})]})]})})]}),(0,o.jsxs)("div",{className:"flex justify-end gap-2 mt-4",children:[(0,o.jsx)(r.Button,{variant:"outline",onClick:V,children:"Restaurar Padrões"}),(0,o.jsx)(r.Button,{onClick:J,children:"Salvar Configurações"})]})]})]}),(0,o.jsx)(f.Dialog,{open:k,onOpenChange:M,children:(0,o.jsxs)(f.DialogContent,{className:"max-w-4xl max-h-[80vh] overflow-auto",children:[(0,o.jsxs)(f.DialogHeader,{children:[(0,o.jsx)(f.DialogTitle,{children:"Preview dos Prompts"}),(0,o.jsx)(f.DialogDescription,{children:"Visualização dos prompts que serão enviados para a IA"})]}),(0,o.jsxs)("div",{className:"space-y-4",children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("h4",{className:"font-semibold mb-2",children:"SYSTEM PROMPT:"}),(0,o.jsx)("div",{className:"p-4 bg-slate-50 rounded-lg border",children:(0,o.jsx)("pre",{className:"whitespace-pre-wrap text-sm font-mono",children:T||"(System prompt vazio)"})})]}),(0,o.jsxs)("div",{children:[(0,o.jsx)("h4",{className:"font-semibold mb-2",children:"USER PROMPT:"}),(0,o.jsx)("div",{className:"p-4 bg-slate-50 rounded-lg border",children:(0,o.jsx)("pre",{className:"whitespace-pre-wrap text-sm font-mono",children:C||"(User prompt vazio)"})})]}),(0,o.jsxs)("div",{className:"text-sm text-slate-500",children:[(0,o.jsxs)("p",{children:[(0,o.jsx)("strong",{children:"Modelo:"})," ",D.model]}),(0,o.jsxs)("p",{children:[(0,o.jsx)("strong",{children:"Temperatura:"})," ",D.temperature]}),(0,o.jsxs)("p",{children:[(0,o.jsx)("strong",{children:"Max Tokens:"})," ",D.maxTokens]})]})]})]})})]})}],89174)},7518,(e,o,s)=>{let a="/admin/prompts";(window.__NEXT_P=window.__NEXT_P||[]).push([a,()=>e.r(89174)]),o.hot&&o.hot.dispose(function(){window.__NEXT_P.push([a])})},64270,e=>{e.v(o=>Promise.all(["static/chunks/4ddff7bfb1602969.js"].map(o=>e.l(o))).then(()=>o(71742)))},69238,e=>{e.v(o=>Promise.all(["static/chunks/fd5ef8daa941afe5.js"].map(o=>e.l(o))).then(()=>o(38426)))},22499,e=>{e.v(o=>Promise.all(["static/chunks/2989a9ed90bfae9d.js"].map(o=>e.l(o))).then(()=>o(14847)))}]);