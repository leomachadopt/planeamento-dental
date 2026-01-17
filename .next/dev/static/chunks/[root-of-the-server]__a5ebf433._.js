(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[turbopack]/browser/dev/hmr-client/hmr-client.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/// <reference path="../../../shared/runtime-types.d.ts" />
/// <reference path="../../runtime/base/dev-globals.d.ts" />
/// <reference path="../../runtime/base/dev-protocol.d.ts" />
/// <reference path="../../runtime/base/dev-extensions.ts" />
__turbopack_context__.s([
    "connect",
    ()=>connect,
    "setHooks",
    ()=>setHooks,
    "subscribeToUpdate",
    ()=>subscribeToUpdate
]);
function connect({ addMessageListener, sendMessage, onUpdateError = console.error }) {
    addMessageListener((msg)=>{
        switch(msg.type){
            case 'turbopack-connected':
                handleSocketConnected(sendMessage);
                break;
            default:
                try {
                    if (Array.isArray(msg.data)) {
                        for(let i = 0; i < msg.data.length; i++){
                            handleSocketMessage(msg.data[i]);
                        }
                    } else {
                        handleSocketMessage(msg.data);
                    }
                    applyAggregatedUpdates();
                } catch (e) {
                    console.warn('[Fast Refresh] performing full reload\n\n' + "Fast Refresh will perform a full reload when you edit a file that's imported by modules outside of the React rendering tree.\n" + 'You might have a file which exports a React component but also exports a value that is imported by a non-React component file.\n' + 'Consider migrating the non-React component export to a separate file and importing it into both files.\n\n' + 'It is also possible the parent component of the component you edited is a class component, which disables Fast Refresh.\n' + 'Fast Refresh requires at least one parent function component in your React tree.');
                    onUpdateError(e);
                    location.reload();
                }
                break;
        }
    });
    const queued = globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS;
    if (queued != null && !Array.isArray(queued)) {
        throw new Error('A separate HMR handler was already registered');
    }
    globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS = {
        push: ([chunkPath, callback])=>{
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    };
    if (Array.isArray(queued)) {
        for (const [chunkPath, callback] of queued){
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    }
}
const updateCallbackSets = new Map();
function sendJSON(sendMessage, message) {
    sendMessage(JSON.stringify(message));
}
function resourceKey(resource) {
    return JSON.stringify({
        path: resource.path,
        headers: resource.headers || null
    });
}
function subscribeToUpdates(sendMessage, resource) {
    sendJSON(sendMessage, {
        type: 'turbopack-subscribe',
        ...resource
    });
    return ()=>{
        sendJSON(sendMessage, {
            type: 'turbopack-unsubscribe',
            ...resource
        });
    };
}
function handleSocketConnected(sendMessage) {
    for (const key of updateCallbackSets.keys()){
        subscribeToUpdates(sendMessage, JSON.parse(key));
    }
}
// we aggregate all pending updates until the issues are resolved
const chunkListsWithPendingUpdates = new Map();
function aggregateUpdates(msg) {
    const key = resourceKey(msg.resource);
    let aggregated = chunkListsWithPendingUpdates.get(key);
    if (aggregated) {
        aggregated.instruction = mergeChunkListUpdates(aggregated.instruction, msg.instruction);
    } else {
        chunkListsWithPendingUpdates.set(key, msg);
    }
}
function applyAggregatedUpdates() {
    if (chunkListsWithPendingUpdates.size === 0) return;
    hooks.beforeRefresh();
    for (const msg of chunkListsWithPendingUpdates.values()){
        triggerUpdate(msg);
    }
    chunkListsWithPendingUpdates.clear();
    finalizeUpdate();
}
function mergeChunkListUpdates(updateA, updateB) {
    let chunks;
    if (updateA.chunks != null) {
        if (updateB.chunks == null) {
            chunks = updateA.chunks;
        } else {
            chunks = mergeChunkListChunks(updateA.chunks, updateB.chunks);
        }
    } else if (updateB.chunks != null) {
        chunks = updateB.chunks;
    }
    let merged;
    if (updateA.merged != null) {
        if (updateB.merged == null) {
            merged = updateA.merged;
        } else {
            // Since `merged` is an array of updates, we need to merge them all into
            // one, consistent update.
            // Since there can only be `EcmascriptMergeUpdates` in the array, there is
            // no need to key on the `type` field.
            let update = updateA.merged[0];
            for(let i = 1; i < updateA.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateA.merged[i]);
            }
            for(let i = 0; i < updateB.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateB.merged[i]);
            }
            merged = [
                update
            ];
        }
    } else if (updateB.merged != null) {
        merged = updateB.merged;
    }
    return {
        type: 'ChunkListUpdate',
        chunks,
        merged
    };
}
function mergeChunkListChunks(chunksA, chunksB) {
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    return chunks;
}
function mergeChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted' || updateA.type === 'deleted' && updateB.type === 'added') {
        return undefined;
    }
    if (updateA.type === 'partial') {
        invariant(updateA.instruction, 'Partial updates are unsupported');
    }
    if (updateB.type === 'partial') {
        invariant(updateB.instruction, 'Partial updates are unsupported');
    }
    return undefined;
}
function mergeChunkListEcmascriptMergedUpdates(mergedA, mergedB) {
    const entries = mergeEcmascriptChunkEntries(mergedA.entries, mergedB.entries);
    const chunks = mergeEcmascriptChunksUpdates(mergedA.chunks, mergedB.chunks);
    return {
        type: 'EcmascriptMergedUpdate',
        entries,
        chunks
    };
}
function mergeEcmascriptChunkEntries(entriesA, entriesB) {
    return {
        ...entriesA,
        ...entriesB
    };
}
function mergeEcmascriptChunksUpdates(chunksA, chunksB) {
    if (chunksA == null) {
        return chunksB;
    }
    if (chunksB == null) {
        return chunksA;
    }
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeEcmascriptChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    if (Object.keys(chunks).length === 0) {
        return undefined;
    }
    return chunks;
}
function mergeEcmascriptChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted') {
        // These two completely cancel each other out.
        return undefined;
    }
    if (updateA.type === 'deleted' && updateB.type === 'added') {
        const added = [];
        const deleted = [];
        const deletedModules = new Set(updateA.modules ?? []);
        const addedModules = new Set(updateB.modules ?? []);
        for (const moduleId of addedModules){
            if (!deletedModules.has(moduleId)) {
                added.push(moduleId);
            }
        }
        for (const moduleId of deletedModules){
            if (!addedModules.has(moduleId)) {
                deleted.push(moduleId);
            }
        }
        if (added.length === 0 && deleted.length === 0) {
            return undefined;
        }
        return {
            type: 'partial',
            added,
            deleted
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'partial') {
        const added = new Set([
            ...updateA.added ?? [],
            ...updateB.added ?? []
        ]);
        const deleted = new Set([
            ...updateA.deleted ?? [],
            ...updateB.deleted ?? []
        ]);
        if (updateB.added != null) {
            for (const moduleId of updateB.added){
                deleted.delete(moduleId);
            }
        }
        if (updateB.deleted != null) {
            for (const moduleId of updateB.deleted){
                added.delete(moduleId);
            }
        }
        return {
            type: 'partial',
            added: [
                ...added
            ],
            deleted: [
                ...deleted
            ]
        };
    }
    if (updateA.type === 'added' && updateB.type === 'partial') {
        const modules = new Set([
            ...updateA.modules ?? [],
            ...updateB.added ?? []
        ]);
        for (const moduleId of updateB.deleted ?? []){
            modules.delete(moduleId);
        }
        return {
            type: 'added',
            modules: [
                ...modules
            ]
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'deleted') {
        // We could eagerly return `updateB` here, but this would potentially be
        // incorrect if `updateA` has added modules.
        const modules = new Set(updateB.modules ?? []);
        if (updateA.added != null) {
            for (const moduleId of updateA.added){
                modules.delete(moduleId);
            }
        }
        return {
            type: 'deleted',
            modules: [
                ...modules
            ]
        };
    }
    // Any other update combination is invalid.
    return undefined;
}
function invariant(_, message) {
    throw new Error(`Invariant: ${message}`);
}
const CRITICAL = [
    'bug',
    'error',
    'fatal'
];
function compareByList(list, a, b) {
    const aI = list.indexOf(a) + 1 || list.length;
    const bI = list.indexOf(b) + 1 || list.length;
    return aI - bI;
}
const chunksWithIssues = new Map();
function emitIssues() {
    const issues = [];
    const deduplicationSet = new Set();
    for (const [_, chunkIssues] of chunksWithIssues){
        for (const chunkIssue of chunkIssues){
            if (deduplicationSet.has(chunkIssue.formatted)) continue;
            issues.push(chunkIssue);
            deduplicationSet.add(chunkIssue.formatted);
        }
    }
    sortIssues(issues);
    hooks.issues(issues);
}
function handleIssues(msg) {
    const key = resourceKey(msg.resource);
    let hasCriticalIssues = false;
    for (const issue of msg.issues){
        if (CRITICAL.includes(issue.severity)) {
            hasCriticalIssues = true;
        }
    }
    if (msg.issues.length > 0) {
        chunksWithIssues.set(key, msg.issues);
    } else if (chunksWithIssues.has(key)) {
        chunksWithIssues.delete(key);
    }
    emitIssues();
    return hasCriticalIssues;
}
const SEVERITY_ORDER = [
    'bug',
    'fatal',
    'error',
    'warning',
    'info',
    'log'
];
const CATEGORY_ORDER = [
    'parse',
    'resolve',
    'code generation',
    'rendering',
    'typescript',
    'other'
];
function sortIssues(issues) {
    issues.sort((a, b)=>{
        const first = compareByList(SEVERITY_ORDER, a.severity, b.severity);
        if (first !== 0) return first;
        return compareByList(CATEGORY_ORDER, a.category, b.category);
    });
}
const hooks = {
    beforeRefresh: ()=>{},
    refresh: ()=>{},
    buildOk: ()=>{},
    issues: (_issues)=>{}
};
function setHooks(newHooks) {
    Object.assign(hooks, newHooks);
}
function handleSocketMessage(msg) {
    sortIssues(msg.issues);
    handleIssues(msg);
    switch(msg.type){
        case 'issues':
            break;
        case 'partial':
            // aggregate updates
            aggregateUpdates(msg);
            break;
        default:
            // run single update
            const runHooks = chunkListsWithPendingUpdates.size === 0;
            if (runHooks) hooks.beforeRefresh();
            triggerUpdate(msg);
            if (runHooks) finalizeUpdate();
            break;
    }
}
function finalizeUpdate() {
    hooks.refresh();
    hooks.buildOk();
    // This is used by the Next.js integration test suite to notify it when HMR
    // updates have been completed.
    // TODO: Only run this in test environments (gate by `process.env.__NEXT_TEST_MODE`)
    if (globalThis.__NEXT_HMR_CB) {
        globalThis.__NEXT_HMR_CB();
        globalThis.__NEXT_HMR_CB = null;
    }
}
function subscribeToChunkUpdate(chunkListPath, sendMessage, callback) {
    return subscribeToUpdate({
        path: chunkListPath
    }, sendMessage, callback);
}
function subscribeToUpdate(resource, sendMessage, callback) {
    const key = resourceKey(resource);
    let callbackSet;
    const existingCallbackSet = updateCallbackSets.get(key);
    if (!existingCallbackSet) {
        callbackSet = {
            callbacks: new Set([
                callback
            ]),
            unsubscribe: subscribeToUpdates(sendMessage, resource)
        };
        updateCallbackSets.set(key, callbackSet);
    } else {
        existingCallbackSet.callbacks.add(callback);
        callbackSet = existingCallbackSet;
    }
    return ()=>{
        callbackSet.callbacks.delete(callback);
        if (callbackSet.callbacks.size === 0) {
            callbackSet.unsubscribe();
            updateCallbackSets.delete(key);
        }
    };
}
function triggerUpdate(msg) {
    const key = resourceKey(msg.resource);
    const callbackSet = updateCallbackSets.get(key);
    if (!callbackSet) {
        return;
    }
    for (const callback of callbackSet.callbacks){
        callback(msg);
    }
    if (msg.type === 'notFound') {
        // This indicates that the resource which we subscribed to either does not exist or
        // has been deleted. In either case, we should clear all update callbacks, so if a
        // new subscription is created for the same resource, it will send a new "subscribe"
        // message to the server.
        // No need to send an "unsubscribe" message to the server, it will have already
        // dropped the update stream before sending the "notFound" message.
        updateCallbackSets.delete(key);
    }
}
}),
"[project]/Planeamento dental/planeamento-dental/src/lib/api.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "api",
    ()=>api,
    "fetchAPI",
    ()=>fetchAPI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
// Cliente API para comunicação com o backend
// No Next.js, variáveis de ambiente do cliente devem começar com NEXT_PUBLIC_
// Como as rotas de API são servidas diretamente pelo Next.js, usamos '/api' como padrão
const API_BASE_URL = typeof __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"] !== 'undefined' && __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env?.NEXT_PUBLIC_API_URL || '/api';
// Função para obter token do store
function getAuthToken() {
    // Verificar se estamos no browser (não no SSR)
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
            const parsed = JSON.parse(authStorage);
            return parsed.state?.token || null;
        }
    } catch (error) {
        console.error('Erro ao ler token:', error);
    }
    return null;
}
async function fetchAPI(endpoint, options = {}) {
    // Garantir que endpoint começa com /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${normalizedEndpoint}`;
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(url, {
        ...options,
        headers
    });
    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            // Token inválido ou expirado, limpar autenticação
            if ("TURBOPACK compile-time truthy", 1) {
                localStorage.removeItem('auth-storage');
                // Limpar o estado do store também
                try {
                    // Importar dinamicamente para evitar dependência circular
                    __turbopack_context__.A("[project]/Planeamento dental/planeamento-dental/src/stores/useAuthStore.ts [client] (ecmascript, async loader)").then(({ useAuthStore })=>{
                        useAuthStore.getState().logout();
                    }).catch(()=>{
                    // Ignorar erro se o store não estiver disponível
                    });
                } catch (error) {
                // Ignorar erro
                }
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
            throw new Error('Sessão expirada. Faça login novamente.');
        }
        // Tentar parsear como JSON, mas tratar erros de parsing
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const error = await response.json();
                errorMessage = error.error || error.message || errorMessage;
            } else {
                // Se não for JSON, tentar ler como texto
                const text = await response.text();
                // Se o texto parece ser código (contém "import" ou "export"), é um erro de roteamento
                if (text.includes('import') || text.includes('export')) {
                    errorMessage = `Erro de roteamento: a API retornou código ao invés de JSON. Verifique se a rota ${endpoint} existe.`;
                } else if (text.trim()) {
                    errorMessage = text.substring(0, 200); // Limitar tamanho
                }
            }
        } catch (parseError) {
            // Se falhar ao parsear, usar mensagem padrão
            console.error('Erro ao parsear resposta de erro:', parseError);
        }
        throw new Error(errorMessage);
    }
    // Verificar se a resposta é JSON antes de fazer parse
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    } else {
        // Se não for JSON, tentar parsear mesmo assim (pode ser texto vazio)
        const text = await response.text();
        if (text.trim()) {
            // Se parece ser código, é um erro
            if (text.includes('import') || text.includes('export')) {
                throw new Error(`A API retornou código ao invés de JSON para ${endpoint}. Verifique a rota.`);
            }
            try {
                return JSON.parse(text);
            } catch  {
                throw new Error(`Resposta inválida da API: esperado JSON, recebido ${contentType || 'texto'}`);
            }
        }
        return null;
    }
}
const api = {
    // Autenticação
    login: (email, password)=>fetchAPI('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email,
                password
            })
        }),
    register: (email, password, name, clinicId)=>fetchAPI('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                email,
                password,
                name,
                clinicId
            })
        }),
    logout: ()=>fetchAPI('/auth/logout', {
            method: 'POST'
        }),
    getMe: ()=>fetchAPI('/auth/me'),
    // Usuários (admin)
    getAllUsers: ()=>fetchAPI('/users'),
    getUser: (id)=>fetchAPI(`/users/${id}`),
    createUser: (userData)=>fetchAPI('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        }),
    updateUser: (id, userData)=>fetchAPI(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        }),
    deleteUser: (id)=>fetchAPI(`/users/${id}`, {
            method: 'DELETE'
        }),
    // Clínicas
    getAllClinics: ()=>fetchAPI('/clinics'),
    getClinic: (id)=>fetchAPI(`/clinic/${id}`),
    createClinic: (clinicName)=>fetchAPI('/clinics', {
            method: 'POST',
            body: JSON.stringify({
                clinicName
            })
        }),
    saveClinicData: (id, data)=>fetchAPI(`/clinic/${id}`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    deleteClinic: (id)=>fetchAPI(`/clinic/${id}`, {
            method: 'DELETE'
        }),
    // Relatórios
    generateReport: (clinicId, reportType, state)=>fetchAPI('/reports/generate', {
            method: 'POST',
            body: JSON.stringify({
                clinicId,
                reportType,
                state
            })
        }),
    // Admin - Estatísticas
    getAdminStats: ()=>fetchAPI('/admin/stats'),
    // Admin - Relatórios
    getAllReports: ()=>fetchAPI('/admin/reports'),
    getReport: (id)=>fetchAPI(`/admin/reports/${id}`),
    reprocessReport: (id)=>fetchAPI(`/admin/reports/${id}/reprocess`, {
            method: 'POST'
        }),
    downloadReport: (id)=>fetchAPI(`/admin/reports/${id}/download`),
    // Admin - Prompts
    getPrompts: ()=>fetchAPI('/admin/prompts'),
    getPrompt: (type)=>fetchAPI(`/admin/prompts/${type}`),
    savePrompt: (type, systemPrompt, userPrompt)=>fetchAPI(`/admin/prompts/${type}`, {
            method: 'PUT',
            body: JSON.stringify({
                system_prompt: systemPrompt,
                user_prompt: userPrompt
            })
        }),
    // Admin - Configurações
    getSettings: ()=>fetchAPI('/admin/settings'),
    saveSettings: (settings)=>fetchAPI('/admin/settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        }),
    // Admin - Logs e Sessões
    getLogs: (limit)=>fetchAPI(`/admin/logs${limit ? `?limit=${limit}` : ''}`),
    getSessions: ()=>fetchAPI('/admin/sessions'),
    revokeSession: (sessionId)=>fetchAPI(`/admin/sessions/${sessionId}`, {
            method: 'DELETE'
        }),
    // Admin - Reset de Senha
    resetUserPassword: (userId)=>fetchAPI(`/admin/users/${userId}/reset-password`, {
            method: 'POST'
        }),
    // Admin - Export/Import
    exportClinicData: (clinicId)=>fetchAPI(`/admin/clinics/${clinicId}/export`),
    importClinicData: (data)=>fetchAPI('/admin/clinics/import', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    // Dossiês
    getDossiers: (clinicId)=>fetchAPI(`/dossiers?clinicId=${clinicId}`),
    getDossier: (id)=>fetchAPI(`/dossiers/${id}`),
    createDossier: (data)=>fetchAPI('/dossiers', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    updateDossier: (id, data)=>fetchAPI(`/dossiers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    deleteDossier: (id)=>fetchAPI(`/dossiers/${id}`, {
            method: 'DELETE'
        }),
    // Seções do Dossiê
    getDossierSections: (dossierId)=>fetchAPI(`/dossiers/${dossierId}/sections`),
    getDossierSection: (dossierId, sectionCode)=>fetchAPI(`/dossiers/${dossierId}/sections?sectionCode=${sectionCode}`),
    // Respostas
    getDossierAnswers: (dossierId, sectionCode)=>fetchAPI(`/dossiers/${dossierId}/answers${sectionCode ? `?sectionCode=${sectionCode}` : ''}`),
    saveDossierAnswers: (dossierId, answers)=>fetchAPI(`/dossiers/${dossierId}/answers`, {
            method: 'POST',
            body: JSON.stringify({
                answers
            })
        }),
    // Entidades
    getCustomerSegments: (dossierId, entityId)=>fetchAPI(`/dossiers/${dossierId}/entities/customer-segments${entityId ? `?entityId=${entityId}` : ''}`),
    createCustomerSegment: (dossierId, data)=>fetchAPI(`/dossiers/${dossierId}/entities/customer-segments`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    updateCustomerSegment: (dossierId, entityId, data)=>fetchAPI(`/dossiers/${dossierId}/entities/customer-segments?entityId=${entityId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    deleteCustomerSegment: (dossierId, entityId)=>fetchAPI(`/dossiers/${dossierId}/entities/customer-segments?entityId=${entityId}`, {
            method: 'DELETE'
        }),
    getValuePropositions: (dossierId, entityId)=>fetchAPI(`/dossiers/${dossierId}/entities/value-propositions${entityId ? `?entityId=${entityId}` : ''}`),
    createValueProposition: (dossierId, data)=>fetchAPI(`/dossiers/${dossierId}/entities/value-propositions`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    updateValueProposition: (dossierId, entityId, data)=>fetchAPI(`/dossiers/${dossierId}/entities/value-propositions?entityId=${entityId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    deleteValueProposition: (dossierId, entityId)=>fetchAPI(`/dossiers/${dossierId}/entities/value-propositions?entityId=${entityId}`, {
            method: 'DELETE'
        }),
    getServices: (dossierId, entityId)=>fetchAPI(`/dossiers/${dossierId}/entities/services${entityId ? `?entityId=${entityId}` : ''}`),
    createService: (dossierId, data)=>fetchAPI(`/dossiers/${dossierId}/entities/services`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    updateService: (dossierId, entityId, data)=>fetchAPI(`/dossiers/${dossierId}/entities/services?entityId=${entityId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    deleteService: (dossierId, entityId)=>fetchAPI(`/dossiers/${dossierId}/entities/services?entityId=${entityId}`, {
            method: 'DELETE'
        }),
    getCompetitors: (dossierId, entityId)=>fetchAPI(`/dossiers/${dossierId}/entities/competitors${entityId ? `?entityId=${entityId}` : ''}`),
    createCompetitor: (dossierId, data)=>fetchAPI(`/dossiers/${dossierId}/entities/competitors`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    updateCompetitor: (dossierId, entityId, data)=>fetchAPI(`/dossiers/${dossierId}/entities/competitors?entityId=${entityId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    deleteCompetitor: (dossierId, entityId)=>fetchAPI(`/dossiers/${dossierId}/entities/competitors?entityId=${entityId}`, {
            method: 'DELETE'
        }),
    getTeamMembers: (dossierId, entityId)=>fetchAPI(`/dossiers/${dossierId}/entities/team-members${entityId ? `?entityId=${entityId}` : ''}`),
    createTeamMember: (dossierId, data)=>fetchAPI(`/dossiers/${dossierId}/entities/team-members`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    updateTeamMember: (dossierId, entityId, data)=>fetchAPI(`/dossiers/${dossierId}/entities/team-members?entityId=${entityId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    deleteTeamMember: (dossierId, entityId)=>fetchAPI(`/dossiers/${dossierId}/entities/team-members?entityId=${entityId}`, {
            method: 'DELETE'
        }),
    getCapacities: (dossierId, entityId)=>fetchAPI(`/dossiers/${dossierId}/entities/capacities${entityId ? `?entityId=${entityId}` : ''}`),
    createCapacity: (dossierId, data)=>fetchAPI(`/dossiers/${dossierId}/entities/capacities`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    updateCapacity: (dossierId, entityId, data)=>fetchAPI(`/dossiers/${dossierId}/entities/capacities?entityId=${entityId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    deleteCapacity: (dossierId, entityId)=>fetchAPI(`/dossiers/${dossierId}/entities/capacities?entityId=${entityId}`, {
            method: 'DELETE'
        }),
    getStrategicChoices: (dossierId, entityId)=>fetchAPI(`/dossiers/${dossierId}/entities/strategic-choices${entityId ? `?entityId=${entityId}` : ''}`),
    createStrategicChoice: (dossierId, data)=>fetchAPI(`/dossiers/${dossierId}/entities/strategic-choices`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    updateStrategicChoice: (dossierId, entityId, data)=>fetchAPI(`/dossiers/${dossierId}/entities/strategic-choices?entityId=${entityId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    deleteStrategicChoice: (dossierId, entityId)=>fetchAPI(`/dossiers/${dossierId}/entities/strategic-choices?entityId=${entityId}`, {
            method: 'DELETE'
        }),
    getInitiatives: (dossierId, entityId)=>fetchAPI(`/dossiers/${dossierId}/entities/initiatives${entityId ? `?entityId=${entityId}` : ''}`),
    createInitiative: (dossierId, data)=>fetchAPI(`/dossiers/${dossierId}/entities/initiatives`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    updateInitiative: (dossierId, entityId, data)=>fetchAPI(`/dossiers/${dossierId}/entities/initiatives?entityId=${entityId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    deleteInitiative: (dossierId, entityId)=>fetchAPI(`/dossiers/${dossierId}/entities/initiatives?entityId=${entityId}`, {
            method: 'DELETE'
        }),
    // Service Categories
    getServiceCategories: (dossierId, entityId)=>fetchAPI(`/dossiers/${dossierId}/entities/service-categories${entityId ? `?entityId=${entityId}` : ''}`),
    createServiceCategory: (dossierId, data)=>fetchAPI(`/dossiers/${dossierId}/entities/service-categories`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    updateServiceCategory: (dossierId, entityId, data)=>fetchAPI(`/dossiers/${dossierId}/entities/service-categories?entityId=${entityId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    deleteServiceCategory: (dossierId, entityId)=>fetchAPI(`/dossiers/${dossierId}/entities/service-categories?entityId=${entityId}`, {
            method: 'DELETE'
        }),
    // Roles (clinic-level)
    getRoles: (clinicId, entityId)=>fetchAPI(`/clinics/${clinicId}/roles${entityId ? `?entityId=${entityId}` : ''}`),
    createRole: (clinicId, data)=>fetchAPI(`/clinics/${clinicId}/roles`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    updateRole: (clinicId, entityId, data)=>fetchAPI(`/clinics/${clinicId}/roles?entityId=${entityId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    deleteRole: (clinicId, entityId)=>fetchAPI(`/clinics/${clinicId}/roles?entityId=${entityId}`, {
            method: 'DELETE'
        }),
    // Relatórios por IA
    generateSectionReport: (dossierId, sectionCode)=>fetchAPI(`/dossiers/${dossierId}/sections/${sectionCode}/report`, {
            method: 'POST'
        }),
    getSectionReport: (dossierId, sectionCode)=>fetchAPI(`/dossiers/${dossierId}/sections/${sectionCode}/report`),
    getDossierReports: (dossierId)=>fetchAPI(`/dossiers/${dossierId}/reports`),
    // Relatório Final
    generateFinalReport: (dossierId)=>fetchAPI(`/dossiers/${dossierId}/final-report:generate`, {
            method: 'POST'
        }),
    getFinalReport: (dossierId)=>fetchAPI(`/dossiers/${dossierId}/final-report`),
    exportFinalReport: async (dossierId, format = 'pdf')=>{
        const token = getAuthToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_BASE_URL}/dossiers/${dossierId}/final-report/export?format=${format}`, {
            method: 'GET',
            headers
        });
        if (!response.ok) {
            throw new Error(`Erro ao exportar relatório: ${response.status}`);
        }
        return response.blob();
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/services/dossierService.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateSectionCompletion",
    ()=>calculateSectionCompletion,
    "createDossier",
    ()=>createDossier,
    "deleteDossier",
    ()=>deleteDossier,
    "getAnswers",
    ()=>getAnswers,
    "getDossier",
    ()=>getDossier,
    "getDossierSections",
    ()=>getDossierSections,
    "getDossiers",
    ()=>getDossiers,
    "getSectionData",
    ()=>getSectionData,
    "saveAnswers",
    ()=>saveAnswers,
    "updateDossier",
    ()=>updateDossier
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/api.ts [client] (ecmascript)");
;
async function getDossiers(clinicId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].getDossiers(clinicId);
}
async function getDossier(dossierId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].getDossier(dossierId);
}
async function createDossier(clinicId, title, baselineDate) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].createDossier({
        clinicId,
        title,
        baselineDate
    });
}
async function updateDossier(dossierId, data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].updateDossier(dossierId, data);
}
async function deleteDossier(dossierId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].deleteDossier(dossierId);
}
async function getDossierSections(dossierId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].getDossierSections(dossierId);
}
async function getSectionData(dossierId, sectionCode) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].getDossierSection(dossierId, sectionCode);
}
async function getAnswers(dossierId, sectionCode) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].getDossierAnswers(dossierId, sectionCode);
}
async function saveAnswers(dossierId, answers) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].saveDossierAnswers(dossierId, answers);
}
async function calculateSectionCompletion(dossierId, sectionCode) {
    try {
        const sectionData = await getSectionData(dossierId, sectionCode);
        // Coletar todas as perguntas required
        const requiredQuestions = [];
        sectionData.questionSets.forEach((qs)=>{
            qs.questions.forEach((q)=>{
                if (q.required) {
                    requiredQuestions.push(q);
                }
            });
        });
        if (requiredQuestions.length === 0) {
            return 100 // Se não há perguntas required, considera completo
            ;
        }
        // Contar quantas têm respostas
        let answeredCount = 0;
        requiredQuestions.forEach((q)=>{
            if (q.answer) {
                const hasValue = q.answer.value_text !== null && q.answer.value_text !== undefined && q.answer.value_text !== '' || q.answer.value_number !== null && q.answer.value_number !== undefined || q.answer.value_json !== null && q.answer.value_json !== undefined;
                if (hasValue) {
                    answeredCount++;
                }
            }
        });
        // Calcular % baseado em perguntas respondidas
        let completionPercent = Math.round(answeredCount / requiredQuestions.length * 100);
        // Bônus: se seção é IDENTITY, verificar se há pelo menos 1 entidade de cada tipo
        if (sectionCode === 'IDENTITY') {
            const hasSegments = sectionData.entities?.customerSegments && sectionData.entities.customerSegments.length > 0;
            const hasPropositions = sectionData.entities?.valuePropositions && sectionData.entities.valuePropositions.length > 0;
            // Se tem pelo menos 1 segmento e 1 proposta, adiciona 10% de bônus (máximo 100%)
            if (hasSegments && hasPropositions) {
                completionPercent = Math.min(100, completionPercent + 10);
            } else if (hasSegments || hasPropositions) {
                completionPercent = Math.min(100, completionPercent + 5);
            }
        }
        // Atualizar status da seção (isso seria feito no backend, mas por enquanto retornamos o valor)
        return completionPercent;
    } catch (error) {
        console.error('Erro ao calcular completude:', error);
        return 0;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/hooks/useSectionData.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSectionData",
    ()=>useSectionData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$dossierService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/services/dossierService.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/sonner/dist/index.mjs [client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
function useSectionData(dossierId, sectionCode) {
    _s();
    const [sectionData, setSectionData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [completionPercent, setCompletionPercent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const refetch = async ()=>{
        if (!dossierId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$dossierService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["getSectionData"])(dossierId, sectionCode);
            setSectionData(data);
            // Calcular completude
            const percent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$dossierService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["calculateSectionCompletion"])(dossierId, sectionCode);
            setCompletionPercent(percent);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Erro ao carregar dados da seção');
            setError(error);
            console.error('Erro ao carregar dados da seção:', err);
            __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].error('Erro ao carregar dados da seção');
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useSectionData.useEffect": ()=>{
            if (dossierId) {
                refetch();
            } else {
                setLoading(false);
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["useSectionData.useEffect"], [
        dossierId,
        sectionCode
    ]);
    return {
        sectionData,
        loading,
        error,
        completionPercent,
        refetch
    };
}
_s(useSectionData, "iRWt7hbzoHuxZ6mPvx16lgjj31Q=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/hooks/useSectionReport.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSectionReport",
    ()=>useSectionReport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/api.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/sonner/dist/index.mjs [client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
function useSectionReport(dossierId, sectionCode) {
    _s();
    const [report, setReport] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loadingReport, setLoadingReport] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [generatingReport, setGeneratingReport] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const hasFetchedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const refetchReport = async ()=>{
        if (!dossierId) return;
        setLoadingReport(true);
        try {
            const reportData = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].getSectionReport(dossierId, sectionCode);
            setReport(reportData);
            hasFetchedRef.current = true;
        } catch (error) {
            // Tratar tanto 404 quanto 500 como "relatório não encontrado"
            if (error.message?.includes('404') || error.message?.includes('500') || error.message?.includes('não gerado') || error.message?.includes('não encontrado') || error.message?.includes('Internal Server Error')) {
                setReport(null);
                hasFetchedRef.current = true;
            } else {
                console.error('Erro ao carregar relatório:', error);
            }
        } finally{
            setLoadingReport(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useSectionReport.useEffect": ()=>{
            // Resetar flag quando dossierId ou sectionCode mudarem
            hasFetchedRef.current = false;
            if (dossierId) {
                refetchReport();
            }
        }
    }["useSectionReport.useEffect"], [
        dossierId,
        sectionCode
    ]);
    const handleGenerateReport = async ()=>{
        if (!dossierId) return;
        setGeneratingReport(true);
        try {
            const newReport = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].generateSectionReport(dossierId, sectionCode);
            setReport(newReport);
            hasFetchedRef.current = true;
            __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].success('Relatório gerado com sucesso!');
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            // Extrair mensagem de erro mais detalhada
            let errorMessage = 'Erro ao gerar relatório';
            if (error.message) {
                errorMessage = error.message;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            // Se o relatório foi salvo com status 'error', carregar para exibir
            try {
                const errorReport = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].getSectionReport(dossierId, sectionCode);
                if (errorReport?.status === 'error') {
                    setReport(errorReport);
                }
            } catch  {
            // Ignorar erro ao buscar relatório de erro
            }
            __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].error(errorMessage);
        } finally{
            setGeneratingReport(false);
        }
    };
    return {
        report,
        loadingReport,
        generatingReport,
        handleGenerateReport,
        refetchReport
    };
}
_s(useSectionReport, "JJfNw23vZDWE2I7vpeqS91a42V4=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/lib/utils.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
/* General utility functions (exposes cn) */ var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/clsx/dist/clsx.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/tailwind-merge/dist/bundle-mjs.mjs [client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
} // Add any other utility functions here
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/components/ui/button.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
/* Button Component primitives - A component that displays a button - from shadcn/ui (exposes Button, buttonVariants) */ var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/@radix-ui/react-slot/dist/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/class-variance-authority/dist/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/utils.ts [client] (ecmascript)");
;
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["cva"])('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0', {
    variants: {
        variant: {
            default: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md active:scale-[0.98]',
            destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md active:scale-[0.98]',
            outline: 'border border-input bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/30',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-sm',
            ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground',
            link: 'text-foreground underline-offset-4 hover:underline'
        },
        size: {
            default: 'h-10 px-4 py-2',
            sm: 'h-9 rounded-md px-3',
            lg: 'h-11 rounded-md px-8',
            icon: 'h-10 w-10'
        }
    },
    defaultVariants: {
        variant: 'default',
        size: 'default'
    }
});
const Button = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, variant, size, asChild = false, ...props }, ref)=>{
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Slot"] : 'button';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/button.tsx",
        lineNumber: 48,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Button;
Button.displayName = 'Button';
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Button$React.forwardRef");
__turbopack_context__.k.register(_c1, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/components/ui/card.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card,
    "CardContent",
    ()=>CardContent,
    "CardDescription",
    ()=>CardDescription,
    "CardFooter",
    ()=>CardFooter,
    "CardHeader",
    ()=>CardHeader,
    "CardTitle",
    ()=>CardTitle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
/* Card Component primitives - A component that displays a card - from shadcn/ui (exposes Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent) */ var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/utils.ts [client] (ecmascript)");
;
;
;
const Card = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-250', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/card.tsx",
        lineNumber: 10,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = Card;
Card.displayName = 'Card';
const CardHeader = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c2 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('flex flex-col space-y-1.5 p-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/card.tsx",
        lineNumber: 25,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c3 = CardHeader;
CardHeader.displayName = 'CardHeader';
const CardTitle = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c4 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('text-2xl font-semibold leading-none tracking-tight', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/card.tsx",
        lineNumber: 37,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c5 = CardTitle;
CardTitle.displayName = 'CardTitle';
const CardDescription = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c6 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('text-sm text-muted-foreground', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/card.tsx",
        lineNumber: 52,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c7 = CardDescription;
CardDescription.displayName = 'CardDescription';
const CardContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c8 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('p-6 pt-0', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/card.tsx",
        lineNumber: 64,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c9 = CardContent;
CardContent.displayName = 'CardContent';
const CardFooter = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c10 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center p-6 pt-0', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/card.tsx",
        lineNumber: 72,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c11 = CardFooter;
CardFooter.displayName = 'CardFooter';
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10, _c11;
__turbopack_context__.k.register(_c, "Card$React.forwardRef");
__turbopack_context__.k.register(_c1, "Card");
__turbopack_context__.k.register(_c2, "CardHeader$React.forwardRef");
__turbopack_context__.k.register(_c3, "CardHeader");
__turbopack_context__.k.register(_c4, "CardTitle$React.forwardRef");
__turbopack_context__.k.register(_c5, "CardTitle");
__turbopack_context__.k.register(_c6, "CardDescription$React.forwardRef");
__turbopack_context__.k.register(_c7, "CardDescription");
__turbopack_context__.k.register(_c8, "CardContent$React.forwardRef");
__turbopack_context__.k.register(_c9, "CardContent");
__turbopack_context__.k.register(_c10, "CardFooter$React.forwardRef");
__turbopack_context__.k.register(_c11, "CardFooter");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/components/ui/progress.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Progress",
    ()=>Progress
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
/* Progress Component - A component that displays a progress bar - from shadcn/ui (exposes Progress) */ var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$progress$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/@radix-ui/react-progress/dist/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/utils.ts [client] (ecmascript)");
;
;
;
;
const Progress = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, value, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$progress$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('relative h-4 w-full overflow-hidden rounded-full bg-secondary', className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$progress$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Indicator"], {
            className: "h-full w-full flex-1 bg-primary transition-all",
            style: {
                transform: `translateX(-${100 - (value || 0)}%)`
            }
        }, void 0, false, {
            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/progress.tsx",
            lineNumber: 19,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/progress.tsx",
        lineNumber: 11,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = Progress;
Progress.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$progress$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Root"].displayName;
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Progress$React.forwardRef");
__turbopack_context__.k.register(_c1, "Progress");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/components/ui/badge.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* Badge Component primitives - A component that displays a badge - from shadcn/ui (exposes Badge, badgeVariants) */ __turbopack_context__.s([
    "Badge",
    ()=>Badge,
    "badgeVariants",
    ()=>badgeVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/class-variance-authority/dist/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/utils.ts [client] (ecmascript)");
;
;
;
const badgeVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["cva"])('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-250 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2', {
    variants: {
        variant: {
            default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80 hover:shadow-sm',
            secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
            destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 hover:shadow-sm',
            outline: 'text-foreground hover:bg-accent/50'
        }
    },
    defaultVariants: {
        variant: 'default'
    }
});
function Badge({ className, variant, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])(badgeVariants({
            variant
        }), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/badge.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
_c = Badge;
;
var _c;
__turbopack_context__.k.register(_c, "Badge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/components/ui/separator.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Separator",
    ()=>Separator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
/* Separator Component - A component that displays a separator - from shadcn/ui (exposes Separator) */ var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$separator$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/@radix-ui/react-separator/dist/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/utils.ts [client] (ecmascript)");
;
;
;
;
const Separator = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, orientation = 'horizontal', decorative = true, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$separator$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        decorative: decorative,
        orientation: orientation,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('shrink-0 bg-border', orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/separator.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = Separator;
Separator.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$separator$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Root"].displayName;
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Separator$React.forwardRef");
__turbopack_context__.k.register(_c1, "Separator");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/components/ui/accordion.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Accordion",
    ()=>Accordion,
    "AccordionContent",
    ()=>AccordionContent,
    "AccordionItem",
    ()=>AccordionItem,
    "AccordionTrigger",
    ()=>AccordionTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
/* Accordion Component primitives - A component that displays a list of items in an accordion - from shadcn/ui (exposes Accordion, AccordionItem, AccordionTrigger, AccordionContent) */ var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$accordion$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/@radix-ui/react-accordion/dist/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/chevron-down.js [client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/utils.ts [client] (ecmascript)");
;
;
;
;
;
const Accordion = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$accordion$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Root"];
const AccordionItem = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$accordion$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Item"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('border-b', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/accordion.tsx",
        lineNumber: 14,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = AccordionItem;
AccordionItem.displayName = 'AccordionItem';
const AccordionTrigger = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c2 = ({ className, children, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$accordion$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Header"], {
        className: "flex",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$accordion$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Trigger"], {
            ref: ref,
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180', className),
            ...props,
            children: [
                children,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                    className: "h-4 w-4 shrink-0 transition-transform duration-200"
                }, void 0, false, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/accordion.tsx",
                    lineNumber: 36,
                    columnNumber: 7
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/accordion.tsx",
            lineNumber: 27,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/accordion.tsx",
        lineNumber: 26,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c3 = AccordionTrigger;
AccordionTrigger.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$accordion$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Trigger"].displayName;
const AccordionContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c4 = ({ className, children, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$accordion$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Content"], {
        ref: ref,
        className: "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('pb-4 pt-0', className),
            children: children
        }, void 0, false, {
            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/accordion.tsx",
            lineNumber: 51,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/accordion.tsx",
        lineNumber: 46,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c5 = AccordionContent;
AccordionContent.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$accordion$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Content"].displayName;
;
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "AccordionItem$React.forwardRef");
__turbopack_context__.k.register(_c1, "AccordionItem");
__turbopack_context__.k.register(_c2, "AccordionTrigger$React.forwardRef");
__turbopack_context__.k.register(_c3, "AccordionTrigger");
__turbopack_context__.k.register(_c4, "AccordionContent$React.forwardRef");
__turbopack_context__.k.register(_c5, "AccordionContent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/components/ui/input.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Input",
    ()=>Input
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
/* Input Component - A component that displays an input - from shadcn/ui (exposes Input) */ var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/utils.ts [client] (ecmascript)");
;
;
;
const Input = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, type, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background transition-all duration-250 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', className),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/input.tsx",
        lineNumber: 9,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Input;
Input.displayName = 'Input';
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Input$React.forwardRef");
__turbopack_context__.k.register(_c1, "Input");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/components/ui/textarea.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Textarea",
    ()=>Textarea
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
/* Textarea Component - A component that displays a textarea - from shadcn/ui (exposes Textarea) */ var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/utils.ts [client] (ecmascript)");
;
;
;
const Textarea = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', className),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/textarea.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Textarea;
Textarea.displayName = 'Textarea';
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Textarea$React.forwardRef");
__turbopack_context__.k.register(_c1, "Textarea");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/components/ui/label.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Label",
    ()=>Label
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
/* Label Component - A component that displays a label - from shadcn/ui (exposes Label) */ var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/@radix-ui/react-label/dist/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/class-variance-authority/dist/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/utils.ts [client] (ecmascript)");
;
;
;
;
;
const labelVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["cva"])('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70');
const Label = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])(labelVariants(), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/label.tsx",
        lineNumber: 17,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = Label;
Label.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Root"].displayName;
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Label$React.forwardRef");
__turbopack_context__.k.register(_c1, "Label");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/components/ui/radio-group.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RadioGroup",
    ()=>RadioGroup,
    "RadioGroupItem",
    ()=>RadioGroupItem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
/* Radio Group Component primitives - A component that displays a radio group - from shadcn/ui (exposes RadioGroup, RadioGroupItem) */ var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$radio$2d$group$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/@radix-ui/react-radio-group/dist/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/circle.js [client] (ecmascript) <export default as Circle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/utils.ts [client] (ecmascript)");
;
;
;
;
;
const RadioGroup = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$radio$2d$group$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Root"], {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('grid gap-2', className),
        ...props,
        ref: ref
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/radio-group.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = RadioGroup;
RadioGroup.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$radio$2d$group$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Root"].displayName;
const RadioGroupItem = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c2 = ({ className, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$radio$2d$group$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Item"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$radio$2d$group$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Indicator"], {
            className: "flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__["Circle"], {
                className: "h-2.5 w-2.5 fill-current text-current"
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/radio-group.tsx",
                lineNumber: 36,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/radio-group.tsx",
            lineNumber: 35,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/radio-group.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
});
_c3 = RadioGroupItem;
RadioGroupItem.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$radio$2d$group$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Item"].displayName;
;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "RadioGroup$React.forwardRef");
__turbopack_context__.k.register(_c1, "RadioGroup");
__turbopack_context__.k.register(_c2, "RadioGroupItem$React.forwardRef");
__turbopack_context__.k.register(_c3, "RadioGroupItem");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionRenderer.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>QuestionRenderer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/input.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/textarea.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/label.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$radio$2d$group$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/radio-group.tsx [client] (ecmascript)");
;
;
;
;
;
function QuestionRenderer({ question, answer, onChange }) {
    switch(question.type){
        case 'textarea':
            // Placeholder customizado para perguntas específicas
            let placeholder = question.help_text || '';
            if (question.code === 'IDENTITY_REASON') {
                placeholder = 'Escreva aqui, com suas próprias palavras, por que sua clínica existe e que transformação real ela gera na vida dos pacientes…';
            } else if (question.code === 'IDENTITY_RECOGNITION_GOAL') {
                placeholder = 'Escreva aqui, com suas próprias palavras, como você quer que sua clínica seja conhecida e lembrada daqui a 3 anos…';
            }
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Textarea"], {
                value: answer.valueText || '',
                onChange: (e)=>onChange({
                        ...answer,
                        valueText: e.target.value
                    }),
                placeholder: placeholder,
                className: "min-h-[100px]"
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionRenderer.tsx",
                lineNumber: 33,
                columnNumber: 9
            }, this);
        case 'single_select':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$radio$2d$group$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["RadioGroup"], {
                value: answer.valueText || '',
                onValueChange: (value)=>onChange({
                        ...answer,
                        valueText: value
                    }),
                children: question.options?.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center space-x-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$radio$2d$group$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["RadioGroupItem"], {
                                value: option.value,
                                id: option.id
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionRenderer.tsx",
                                lineNumber: 59,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Label"], {
                                htmlFor: option.id,
                                className: "cursor-pointer",
                                children: option.label
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionRenderer.tsx",
                                lineNumber: 60,
                                columnNumber: 15
                            }, this)
                        ]
                    }, option.id, true, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionRenderer.tsx",
                        lineNumber: 58,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionRenderer.tsx",
                lineNumber: 48,
                columnNumber: 9
            }, this);
        default:
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Input"], {
                value: answer.valueText || '',
                onChange: (e)=>onChange({
                        ...answer,
                        valueText: e.target.value
                    }),
                placeholder: question.help_text
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionRenderer.tsx",
                lineNumber: 70,
                columnNumber: 9
            }, this);
    }
}
_c = QuestionRenderer;
var _c;
__turbopack_context__.k.register(_c, "QuestionRenderer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/lib/identity-questions-context.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Contexto completo das perguntas da seção Identidade
// Serve como guia para o usuário responder cada pergunta
__turbopack_context__.s([
    "identityQuestionsContext",
    ()=>identityQuestionsContext
]);
const identityQuestionsContext = {
    IDENTITY_REASON: {
        why: 'Essa é a bússola moral e estratégica da clínica. Uma clínica sem propósito claro tende a: aceitar qualquer tipo de paciente, fazer qualquer tipo de procedimento, tomar decisões só por dinheiro (não por direção), e perder identidade, foco e diferenciação ao longo do tempo. O propósito serve como critério de decisão, define quem você ajuda de verdade, define o que você aceita e o que você recusa fazer, e dá coerência para toda a estratégia.',
        consequences: [
            'Aceitar qualquer tipo de paciente',
            'Fazer qualquer tipo de procedimento',
            'Tomar decisões só por dinheiro, não por direção',
            'Perder identidade, foco e diferenciação ao longo do tempo'
        ],
        howToAnswer: 'Pense: ❌ Não no procedimento ✅ No resultado na vida do paciente. Complete mentalmente a frase: "Depois de passar pela nossa clínica, a vida do paciente é diferente porque…" Boas respostas geralmente: falam de transformação humana, falam de impacto real, não falam de tecnologia/tecnicas/especialidades, não parecem texto de marketing.',
        goodExamples: [
            'Existimos para devolver às pessoas a confiança em sorrir, comer e viver bem, ajudando pacientes que já perderam a esperança a recuperar não só a função mastigatória, mas também a autoestima, a segurança e a vontade de se relacionar, através de tratamentos éticos, humanos e duradouros.',
            'Nossa clínica existe para transformar histórias de frustração com a própria saúde bucal em histórias de reconquista de qualidade de vida, segurança pessoal e bem-estar, cuidando de cada paciente como um projeto único, e não como um procedimento isolado.'
        ],
        badExamples: [
            'Oferecer odontologia de qualidade com excelência e tecnologia.',
            'Atender nossos pacientes da melhor forma possível.',
            'Ser referência em tratamentos odontológicos.',
            'Cuidar do sorriso das pessoas.'
        ]
    },
    IDENTITY_RECOGNITION_GOAL: {
        why: 'Essa pergunta define para onde você está levando o negócio. Sem uma visão clara: a clínica cresce "para qualquer lado", aceita qualquer tipo de projeto/parceria/paciente, compra equipamentos e contrata pessoas sem critério estratégico, e confunde crescimento com progresso. A visão serve como filtro de decisão, define o que você vai construir (e o que não vai), dá direção para investimentos/marketing/estrutura, e cria coerência entre o hoje e o futuro desejado.',
        consequences: [
            'A clínica cresce "para qualquer lado"',
            'Aceita qualquer tipo de projeto, parceria ou paciente',
            'Compra equipamentos e contrata pessoas sem critério estratégico',
            'Confunde crescimento com progresso'
        ],
        howToAnswer: 'Pense menos em: ❌ Tamanho ❌ Faturamento ❌ Quantidade de unidades. E mais em: ✅ Reputação ✅ Tipo de problema que você resolve ✅ Como as pessoas descrevem você para outras. Complete mentalmente: "Essa é aquela clínica que…" Boas respostas: falam de posição no mercado (não de vaidade), falam de tipo de caso resolvido (não de tecnologia), falam de confiança e reconhecimento (não de números), soam como algo que um paciente ou outro médico diria.',
        goodExamples: [
            'Essa é aquela clínica que resolve casos que ninguém mais resolve.',
            'Essa é a clínica mais confiável para reabilitação de coluna da cidade.',
            'Essa é a clínica onde todo mundo indica de olhos fechados.'
        ],
        badExamples: [
            'Ser a maior rede de clínicas da região.',
            'Ter faturamento de X milhões.',
            'Ter 10 unidades em 3 anos.',
            'Ser referência em tecnologia de ponta.'
        ]
    },
    IDENTITY_VALUES: {
        why: 'Valores não são frases bonitas na parede. Eles são critérios de decisão difíceis.',
        howToAnswer: 'Pense em situações reais: O que você não aceitaria de um profissional? Que tipo de paciente você prefere perder do que atender mal?',
        goodExamples: [
            'Nunca prometer resultado que não sabemos entregar.',
            'Nunca tratar paciente com pressa ou descaso.',
            'Nunca sacrificar qualidade técnica por volume.'
        ]
    },
    IDENTITY_PRIORITY_AUDIENCE: {
        why: 'Toda estratégia é uma escolha e uma renúncia. Se você não escolhe: sua agenda escolhe, o mercado escolhe, o acaso escolhe.',
        howToAnswer: 'Escolha um foco principal. Diga também qual tipo de paciente vai virar secundário.',
        goodExamples: [
            'Vamos priorizar mulheres 40+ com dor crônica de coluna. Vamos deixar de focar em atendimentos rápidos e genéricos de convênio.'
        ]
    },
    IDENTITY_PRICE_POSITIONING: {
        why: 'Preço é posicionamento estratégico, não só número.'
    },
    IDENTITY_PRICE_POSITIONING_JUSTIFICATION: {
        why: 'A justificativa do posicionamento de preço demonstra o valor real oferecido pela clínica.'
    },
    IDENTITY_STRATEGY_FOCUS: {
        why: 'Essas duas estratégias (volume vs. valor) exigem clínicas completamente diferentes.'
    },
    IDENTITY_STRATEGY_FOCUS_SECONDARY: {
        why: 'O motor secundário complementa a estratégia principal e ajuda a balancear o crescimento.'
    },
    IDENTITY_STRATEGY_FOCUS_COMPLEMENT: {
        why: 'Estratégia sem mudança é fantasia.',
        howToAnswer: 'Divida em: Pessoas, Processos, Oferta/Serviços'
    },
    IDENTITY_CRITICAL_ACTIONS: {
        why: 'Isso define o que realmente importa na operação.',
        goodExamples: [
            'Garantir que todo paciente saia com plano claro de tratamento.',
            'Reduzir faltas e abandono de tratamento.',
            'Manter padrão técnico alto em todas as sessões.'
        ]
    },
    IDENTITY_KEY_CHARACTERISTICS: {
        why: 'Isso define o jeito de ser da clínica, não só o que ela faz.',
        goodExamples: [
            'Acolhedora, mas extremamente técnica.',
            'Pontual e organizada.',
            'Exigente com resultado.'
        ]
    },
    IDENTITY_WHAT_NOT_TO_BE: {
        why: 'Toda boa estratégia tem uma lista do que não fazer.'
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>QuestionWizard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/chevron-left.js [client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/chevron-right.js [client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/info.js [client] (ecmascript) <export default as Info>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/circle-check.js [client] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/circle-x.js [client] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/arrow-left.js [client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/button.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/card.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$progress$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/progress.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/badge.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$separator$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/separator.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/accordion.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$QuestionRenderer$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionRenderer.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$identity$2d$questions$2d$context$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/identity-questions-context.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/api.ts [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
;
;
;
;
function QuestionWizard({ questionSets, answersMap, savingAnswers, onAnswerChange, sectionCode }) {
    _s();
    // Estado para controlar navegação hierárquica
    const [selectedQuestionSetId, setSelectedQuestionSetId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(0);
    // Ordenar questionSets por ordem (se houver)
    const sortedQuestionSets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "QuestionWizard.useMemo[sortedQuestionSets]": ()=>{
            return [
                ...questionSets
            ].sort({
                "QuestionWizard.useMemo[sortedQuestionSets]": (a, b)=>{
                    // Se houver ordem nas perguntas, usar a primeira pergunta como referência
                    const aFirstOrder = a.questions[0]?.order_index || 0;
                    const bFirstOrder = b.questions[0]?.order_index || 0;
                    return aFirstOrder - bFirstOrder;
                }
            }["QuestionWizard.useMemo[sortedQuestionSets]"]);
        }
    }["QuestionWizard.useMemo[sortedQuestionSets]"], [
        questionSets
    ]);
    // QuestionSet atual selecionado
    const currentQuestionSet = selectedQuestionSetId ? sortedQuestionSets.find((qs)=>qs.id === selectedQuestionSetId) : null;
    // Perguntas do questionSet atual, ordenadas
    const currentQuestions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "QuestionWizard.useMemo[currentQuestions]": ()=>{
            if (!currentQuestionSet) return [];
            return [
                ...currentQuestionSet.questions
            ].sort({
                "QuestionWizard.useMemo[currentQuestions]": (a, b)=>a.order_index - b.order_index
            }["QuestionWizard.useMemo[currentQuestions]"]);
        }
    }["QuestionWizard.useMemo[currentQuestions]"], [
        currentQuestionSet
    ]);
    // Pergunta atual
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const currentAnswer = currentQuestion ? answersMap[currentQuestion.id] || {} : {};
    const isSaving = currentQuestion ? savingAnswers.has(currentQuestion.id) : false;
    // Estado para contexto da pergunta (buscar do banco)
    const [questionContext, setQuestionContext] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(undefined);
    const [loadingContext, setLoadingContext] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Buscar contexto do banco de dados
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "QuestionWizard.useEffect": ()=>{
            if (currentQuestion?.id) {
                console.log('🔍 Carregando contexto para pergunta:', currentQuestion.code, currentQuestion.id);
                setLoadingContext(true);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["fetchAPI"])(`/questions/${currentQuestion.id}/context`).then({
                    "QuestionWizard.useEffect": (data)=>{
                        console.log('📦 Dados do contexto recebidos:', data);
                        if (data && Object.keys(data).length > 1) {
                            // Converter formato do banco para formato esperado
                            const context = {
                                why: data.why,
                                consequences: data.consequences,
                                howToAnswer: data.howToAnswer,
                                goodExamples: data.goodExamples,
                                badExamples: data.badExamples
                            };
                            console.log('✅ Contexto processado e definido:', context);
                            setQuestionContext(context);
                        } else {
                            console.log('⚠️ Contexto vazio do banco, usando fallback');
                            // Fallback para contexto hardcoded se não houver no banco
                            if (sectionCode === 'IDENTITY' && currentQuestion?.code) {
                                const hardcodedContext = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$identity$2d$questions$2d$context$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["identityQuestionsContext"][currentQuestion.code];
                                console.log('📚 Usando contexto hardcoded:', hardcodedContext ? 'encontrado' : 'não encontrado');
                                setQuestionContext(hardcodedContext);
                            } else {
                                setQuestionContext(undefined);
                            }
                        }
                    }
                }["QuestionWizard.useEffect"]).catch({
                    "QuestionWizard.useEffect": (error)=>{
                        console.error('❌ Erro ao buscar contexto:', error);
                        // Em caso de erro, usar fallback hardcoded
                        if (sectionCode === 'IDENTITY' && currentQuestion?.code) {
                            const hardcodedContext = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$identity$2d$questions$2d$context$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["identityQuestionsContext"][currentQuestion.code];
                            console.log('📚 Erro no fetch, usando contexto hardcoded:', hardcodedContext ? 'encontrado' : 'não encontrado');
                            setQuestionContext(hardcodedContext);
                        } else {
                            setQuestionContext(undefined);
                        }
                    }
                }["QuestionWizard.useEffect"]).finally({
                    "QuestionWizard.useEffect": ()=>{
                        console.log('🏁 Carregamento de contexto finalizado');
                        setLoadingContext(false);
                    }
                }["QuestionWizard.useEffect"]);
            } else {
                setQuestionContext(undefined);
            }
        }
    }["QuestionWizard.useEffect"], [
        currentQuestion?.id,
        currentQuestion?.code,
        sectionCode
    ]);
    // Progresso dentro do questionSet atual
    const questionProgress = currentQuestions.length > 0 ? (currentQuestionIndex + 1) / currentQuestions.length * 100 : 0;
    // Progresso geral (todas as perguntas de todos os questionSets)
    const totalQuestions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "QuestionWizard.useMemo[totalQuestions]": ()=>{
            return questionSets.reduce({
                "QuestionWizard.useMemo[totalQuestions]": (sum, qs)=>sum + qs.questions.length
            }["QuestionWizard.useMemo[totalQuestions]"], 0);
        }
    }["QuestionWizard.useMemo[totalQuestions]"], [
        questionSets
    ]);
    const answeredQuestions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "QuestionWizard.useMemo[answeredQuestions]": ()=>{
            return Object.keys(answersMap).filter({
                "QuestionWizard.useMemo[answeredQuestions]": (qId)=>{
                    const answer = answersMap[qId];
                    return answer?.valueText || answer?.valueNumber !== undefined || answer?.valueJson && Object.keys(answer.valueJson).length > 0;
                }
            }["QuestionWizard.useMemo[answeredQuestions]"]).length;
        }
    }["QuestionWizard.useMemo[answeredQuestions]"], [
        answersMap
    ]);
    const overallProgress = totalQuestions > 0 ? answeredQuestions / totalQuestions * 100 : 0;
    // Selecionar primeiro questionSet automaticamente se nenhum estiver selecionado
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "QuestionWizard.useEffect": ()=>{
            if (!selectedQuestionSetId && sortedQuestionSets.length > 0) {
                setSelectedQuestionSetId(sortedQuestionSets[0].id);
                setCurrentQuestionIndex(0);
            }
        }
    }["QuestionWizard.useEffect"], [
        selectedQuestionSetId,
        sortedQuestionSets
    ]);
    // Resetar índice da pergunta quando mudar de questionSet
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "QuestionWizard.useEffect": ()=>{
            setCurrentQuestionIndex(0);
        }
    }["QuestionWizard.useEffect"], [
        selectedQuestionSetId
    ]);
    const goToQuestionSet = (questionSetId)=>{
        setSelectedQuestionSetId(questionSetId);
        setCurrentQuestionIndex(0);
        // Scroll apenas quando mudar de questionSet (seção)
        if ("TURBOPACK compile-time truthy", 1) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };
    const goBackToQuestionSets = ()=>{
        setSelectedQuestionSetId(null);
        setCurrentQuestionIndex(0);
        // Scroll apenas quando voltar para seleção de questionSets
        if ("TURBOPACK compile-time truthy", 1) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };
    const goToPreviousQuestion = ()=>{
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        // Não fazer scroll ao navegar entre perguntas
        } else {
            // Se estiver na primeira pergunta, voltar para seleção de questionSets
            goBackToQuestionSets();
        }
    };
    const goToNextQuestion = ()=>{
        if (currentQuestionIndex < currentQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        // Não fazer scroll ao navegar entre perguntas
        }
    };
    const goToPreviousQuestionSet = ()=>{
        if (!currentQuestionSet) return;
        const currentIdx = sortedQuestionSets.findIndex((qs)=>qs.id === currentQuestionSet.id);
        if (currentIdx > 0) {
            goToQuestionSet(sortedQuestionSets[currentIdx - 1].id);
        }
    };
    const goToNextQuestionSet = ()=>{
        if (!currentQuestionSet) return;
        const currentIdx = sortedQuestionSets.findIndex((qs)=>qs.id === currentQuestionSet.id);
        if (currentIdx < sortedQuestionSets.length - 1) {
            goToQuestionSet(sortedQuestionSets[currentIdx + 1].id);
        }
    };
    // Tela de seleção de QuestionSets
    if (!selectedQuestionSetId || !currentQuestionSet) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Card"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                        children: "Selecione uma seção para começar"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                        lineNumber: 220,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        variant: "outline",
                                        className: "text-sm",
                                        children: [
                                            answeredQuestions,
                                            " de ",
                                            totalQuestions,
                                            " respondidas"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                        lineNumber: 221,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                lineNumber: 219,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$progress$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Progress"], {
                                    value: overallProgress,
                                    className: "h-2"
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                    lineNumber: 226,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                lineNumber: 225,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                        lineNumber: 218,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                    lineNumber: 217,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid gap-4 md:grid-cols-2",
                    children: sortedQuestionSets.map((questionSet)=>{
                        const questionsInSet = questionSet.questions.length;
                        const answeredInSet = questionSet.questions.filter((q)=>{
                            const answer = answersMap[q.id];
                            return answer?.valueText || answer?.valueNumber !== undefined || answer?.valueJson && Object.keys(answer.valueJson).length > 0;
                        }).length;
                        const setProgress = questionsInSet > 0 ? answeredInSet / questionsInSet * 100 : 0;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Card"], {
                            className: "cursor-pointer hover:border-teal-400 transition-colors",
                            onClick: ()=>goToQuestionSet(questionSet.id),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-start justify-between",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                                            className: "text-lg",
                                                            children: questionSet.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                            lineNumber: 256,
                                                            columnNumber: 23
                                                        }, this),
                                                        questionSet.subsection_name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardDescription"], {
                                                            className: "mt-1",
                                                            children: questionSet.subsection_name
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                            lineNumber: 258,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                    lineNumber: 255,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    variant: "outline",
                                                    className: "text-sm",
                                                    children: [
                                                        answeredInSet,
                                                        "/",
                                                        questionsInSet
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                    lineNumber: 263,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                            lineNumber: 254,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$progress$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Progress"], {
                                                value: setProgress,
                                                className: "h-2"
                                            }, void 0, false, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                lineNumber: 268,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                            lineNumber: 267,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                    lineNumber: 253,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-slate-600 dark:text-slate-400",
                                        children: [
                                            questionsInSet,
                                            " pergunta",
                                            questionsInSet !== 1 ? 's' : ''
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                        lineNumber: 272,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                    lineNumber: 271,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, questionSet.id, true, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                            lineNumber: 248,
                            columnNumber: 15
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                    lineNumber: 232,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
            lineNumber: 215,
            columnNumber: 7
        }, this);
    }
    if (!currentQuestion) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Card"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardContent"], {
                className: "pt-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center text-slate-500",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "Nenhuma pergunta encontrada nesta seção"
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                            lineNumber: 289,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "outline",
                            onClick: goBackToQuestionSets,
                            className: "mt-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                    className: "mr-2 size-4"
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                    lineNumber: 295,
                                    columnNumber: 15
                                }, this),
                                "Voltar para seções"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                            lineNumber: 290,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                    lineNumber: 288,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                lineNumber: 287,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
            lineNumber: 286,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Card"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2 mb-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    variant: "ghost",
                                                    size: "sm",
                                                    onClick: goBackToQuestionSets,
                                                    className: "h-8 w-8 p-0",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                                        className: "size-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                        lineNumber: 318,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                    lineNumber: 312,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                                    className: "text-lg",
                                                    children: currentQuestionSet.name
                                                }, void 0, false, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                    lineNumber: 320,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                            lineNumber: 311,
                                            columnNumber: 15
                                        }, this),
                                        currentQuestionSet.subsection_name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardDescription"], {
                                            className: "mt-1",
                                            children: currentQuestionSet.subsection_name
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                            lineNumber: 325,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                    lineNumber: 310,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Badge"], {
                                    variant: "outline",
                                    className: "text-sm",
                                    children: [
                                        "Pergunta ",
                                        currentQuestionIndex + 1,
                                        " de ",
                                        currentQuestions.length
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                    lineNumber: 330,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                            lineNumber: 309,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$progress$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Progress"], {
                                value: questionProgress,
                                className: "h-2"
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                lineNumber: 335,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                            lineNumber: 334,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                    lineNumber: 308,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                lineNumber: 307,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Card"], {
                className: "border-2 border-teal-200 dark:border-teal-800",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                            className: "text-2xl mb-2",
                                            children: [
                                                currentQuestion.text,
                                                currentQuestion.required && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-red-500 ml-2",
                                                    children: "*"
                                                }, void 0, false, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                    lineNumber: 348,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                            lineNumber: 345,
                                            columnNumber: 15
                                        }, this),
                                        currentQuestion.help_text && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardDescription"], {
                                            className: "text-base mt-2",
                                            children: currentQuestion.help_text
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                            lineNumber: 352,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                    lineNumber: 344,
                                    columnNumber: 13
                                }, this),
                                isSaving && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "ml-4",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                        lineNumber: 359,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                    lineNumber: 358,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                            lineNumber: 343,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                        lineNumber: 342,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardContent"], {
                        className: "space-y-6",
                        children: [
                            loadingContext && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center text-slate-500 text-sm py-4",
                                children: "Carregando contexto..."
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                lineNumber: 368,
                                columnNumber: 13
                            }, this),
                            !loadingContext && questionContext && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-start gap-2 mb-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
                                                className: "size-5 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0"
                                            }, void 0, false, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                lineNumber: 373,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "font-semibold text-lg text-slate-900 dark:text-slate-100",
                                                children: "Contexto e Orientações"
                                            }, void 0, false, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                lineNumber: 374,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                        lineNumber: 372,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Accordion"], {
                                        type: "multiple",
                                        className: "w-full",
                                        defaultValue: [
                                            'why'
                                        ],
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["AccordionItem"], {
                                                value: "why",
                                                className: "border-b border-slate-200 dark:border-slate-700",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["AccordionTrigger"], {
                                                        className: "text-left hover:no-underline",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
                                                                    className: "size-4 text-teal-600 dark:text-teal-400"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                                    lineNumber: 384,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-semibold text-slate-900 dark:text-slate-100",
                                                                    children: "Por que estamos perguntando isso?"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                                    lineNumber: 385,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                            lineNumber: 383,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                        lineNumber: 382,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["AccordionContent"], {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-2",
                                                            children: questionContext.why
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                            lineNumber: 391,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                        lineNumber: 390,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                lineNumber: 381,
                                                columnNumber: 17
                                            }, this),
                                            questionContext.consequences && questionContext.consequences.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["AccordionItem"], {
                                                value: "consequences",
                                                className: "border-b border-slate-200 dark:border-slate-700",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["AccordionTrigger"], {
                                                        className: "text-left hover:no-underline",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                                                    className: "size-4 text-amber-600"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                                    lineNumber: 402,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-semibold text-slate-900 dark:text-slate-100",
                                                                    children: "O que acontece sem isso?"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                                    lineNumber: 403,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                            lineNumber: 401,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                        lineNumber: 400,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["AccordionContent"], {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                            className: "list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300 pt-2",
                                                            children: questionContext.consequences.map((consequence, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                    children: consequence
                                                                }, idx, false, {
                                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                                    lineNumber: 411,
                                                                    columnNumber: 27
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                            lineNumber: 409,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                        lineNumber: 408,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                lineNumber: 399,
                                                columnNumber: 19
                                            }, this),
                                            questionContext.howToAnswer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["AccordionItem"], {
                                                value: "howToAnswer",
                                                className: "border-b border-slate-200 dark:border-slate-700",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["AccordionTrigger"], {
                                                        className: "text-left hover:no-underline",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-semibold text-slate-900 dark:text-slate-100",
                                                            children: "Como responder bem?"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                            lineNumber: 422,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                        lineNumber: 421,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["AccordionContent"], {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line pt-2",
                                                            children: questionContext.howToAnswer
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                            lineNumber: 427,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                        lineNumber: 426,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                lineNumber: 420,
                                                columnNumber: 19
                                            }, this),
                                            questionContext.goodExamples && questionContext.goodExamples.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["AccordionItem"], {
                                                value: "goodExamples",
                                                className: "border-b border-slate-200 dark:border-slate-700",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["AccordionTrigger"], {
                                                        className: "text-left hover:no-underline",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                                                    className: "size-4 text-green-600"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                                    lineNumber: 439,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-semibold text-slate-900 dark:text-slate-100",
                                                                    children: "Exemplos de boas respostas"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                                    lineNumber: 440,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                            lineNumber: 438,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                        lineNumber: 437,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["AccordionContent"], {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "space-y-2 pt-2",
                                                            children: questionContext.goodExamples.map((example, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3 text-sm text-green-900 dark:text-green-200",
                                                                    children: [
                                                                        '"',
                                                                        example,
                                                                        '"'
                                                                    ]
                                                                }, idx, true, {
                                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                                    lineNumber: 448,
                                                                    columnNumber: 27
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                            lineNumber: 446,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                        lineNumber: 445,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                lineNumber: 436,
                                                columnNumber: 19
                                            }, this),
                                            questionContext.badExamples && questionContext.badExamples.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["AccordionItem"], {
                                                value: "badExamples",
                                                className: "border-b-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["AccordionTrigger"], {
                                                        className: "text-left hover:no-underline",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                                                    className: "size-4 text-red-600"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                                    lineNumber: 465,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-semibold text-slate-900 dark:text-slate-100",
                                                                    children: "Exemplos de respostas ruins"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                                    lineNumber: 466,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                            lineNumber: 464,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                        lineNumber: 463,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["AccordionContent"], {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "space-y-2 pt-2",
                                                            children: questionContext.badExamples.map((example, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 text-sm text-red-900 dark:text-red-200",
                                                                    children: [
                                                                        '"',
                                                                        example,
                                                                        '"'
                                                                    ]
                                                                }, idx, true, {
                                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                                    lineNumber: 474,
                                                                    columnNumber: 27
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                            lineNumber: 472,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                        lineNumber: 471,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                lineNumber: 462,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                        lineNumber: 379,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                lineNumber: 371,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$QuestionRenderer$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                    question: currentQuestion,
                                    answer: currentAnswer,
                                    onChange: (value)=>onAnswerChange(currentQuestion, value)
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                    lineNumber: 491,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                lineNumber: 490,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                        lineNumber: 365,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                lineNumber: 341,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Card"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardContent"], {
                    className: "pt-6",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "outline",
                                        onClick: goToPreviousQuestion,
                                        disabled: currentQuestionIndex === 0,
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                                className: "size-4"
                                            }, void 0, false, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                lineNumber: 512,
                                                columnNumber: 17
                                            }, this),
                                            currentQuestionIndex === 0 ? 'Voltar para seções' : 'Pergunta anterior'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                        lineNumber: 506,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-slate-600 dark:text-slate-400",
                                        children: [
                                            currentQuestionIndex + 1,
                                            " de ",
                                            currentQuestions.length
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                        lineNumber: 516,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                        onClick: goToNextQuestion,
                                        disabled: currentQuestionIndex === currentQuestions.length - 1,
                                        className: "flex items-center gap-2",
                                        children: [
                                            currentQuestionIndex === currentQuestions.length - 1 ? 'Próxima seção' : 'Próxima pergunta',
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                className: "size-4"
                                            }, void 0, false, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                lineNumber: 528,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                        lineNumber: 520,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                lineNumber: 505,
                                columnNumber: 13
                            }, this),
                            sortedQuestionSets.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$separator$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Separator"], {}, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                        lineNumber: 535,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between text-sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "ghost",
                                                size: "sm",
                                                onClick: goToPreviousQuestionSet,
                                                disabled: sortedQuestionSets.findIndex((qs)=>qs.id === currentQuestionSet.id) === 0,
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                                        className: "size-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                        lineNumber: 546,
                                                        columnNumber: 21
                                                    }, this),
                                                    "Seção anterior"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                lineNumber: 537,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-slate-500 dark:text-slate-400",
                                                children: [
                                                    "Seção",
                                                    ' ',
                                                    sortedQuestionSets.findIndex((qs)=>qs.id === currentQuestionSet.id) + 1,
                                                    " de",
                                                    ' ',
                                                    sortedQuestionSets.length
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                lineNumber: 550,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "ghost",
                                                size: "sm",
                                                onClick: goToNextQuestionSet,
                                                disabled: sortedQuestionSets.findIndex((qs)=>qs.id === currentQuestionSet.id) === sortedQuestionSets.length - 1,
                                                className: "flex items-center gap-2",
                                                children: [
                                                    "Próxima seção",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                        className: "size-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                        lineNumber: 567,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                lineNumber: 556,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                        lineNumber: 536,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                        lineNumber: 503,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                    lineNumber: 502,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                lineNumber: 501,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
        lineNumber: 305,
        columnNumber: 5
    }, this);
}
_s(QuestionWizard, "lPW1RQ6fVf0K1xBctsHJHktbKt0=");
_c = QuestionWizard;
var _c;
__turbopack_context__.k.register(_c, "QuestionWizard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MarkdownRenderer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2d$markdown$2f$lib$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__Markdown__as__default$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react-markdown/lib/index.js [client] (ecmascript) <export Markdown as default>");
;
;
function MarkdownRenderer({ content, className = '' }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `prose prose-slate dark:prose-invert max-w-none ${className}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2d$markdown$2f$lib$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__Markdown__as__default$3e$__["default"], {
            components: {
                h1: ({ node, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-3xl font-bold mt-6 mb-4 text-slate-900 dark:text-slate-100",
                        ...props
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
                        lineNumber: 15,
                        columnNumber: 13
                    }, void 0),
                h2: ({ node, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-semibold mt-5 mb-3 text-slate-800 dark:text-slate-200",
                        ...props
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
                        lineNumber: 18,
                        columnNumber: 13
                    }, void 0),
                h3: ({ node, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-xl font-semibold mt-4 mb-2 text-slate-700 dark:text-slate-300",
                        ...props
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
                        lineNumber: 21,
                        columnNumber: 13
                    }, void 0),
                p: ({ node, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-4 text-slate-700 dark:text-slate-300 leading-relaxed",
                        ...props
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
                        lineNumber: 24,
                        columnNumber: 13
                    }, void 0),
                ul: ({ node, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                        className: "list-disc list-inside mb-4 space-y-2 text-slate-700 dark:text-slate-300",
                        ...props
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
                        lineNumber: 27,
                        columnNumber: 13
                    }, void 0),
                ol: ({ node, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                        className: "list-decimal list-inside mb-4 space-y-2 text-slate-700 dark:text-slate-300",
                        ...props
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
                        lineNumber: 30,
                        columnNumber: 13
                    }, void 0),
                li: ({ node, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        className: "ml-4 text-slate-700 dark:text-slate-300",
                        ...props
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
                        lineNumber: 33,
                        columnNumber: 13
                    }, void 0),
                blockquote: ({ node, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("blockquote", {
                        className: "border-l-4 border-teal-500 pl-4 italic my-4 text-slate-600 dark:text-slate-400",
                        ...props
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
                        lineNumber: 36,
                        columnNumber: 13
                    }, void 0),
                code: ({ node, inline, ...props })=>inline ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                        className: "bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono text-slate-900 dark:text-slate-100",
                        ...props
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
                        lineNumber: 43,
                        columnNumber: 15
                    }, void 0) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                        className: "block bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto text-sm font-mono text-slate-900 dark:text-slate-100",
                        ...props
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
                        lineNumber: 48,
                        columnNumber: 15
                    }, void 0),
                strong: ({ node, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        className: "font-bold text-slate-900 dark:text-slate-100",
                        ...props
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
                        lineNumber: 54,
                        columnNumber: 13
                    }, void 0),
                em: ({ node, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                        className: "italic text-slate-800 dark:text-slate-200",
                        ...props
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
                        lineNumber: 57,
                        columnNumber: 13
                    }, void 0),
                a: ({ node, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        className: "text-teal-600 dark:text-teal-400 hover:underline",
                        target: "_blank",
                        rel: "noopener noreferrer",
                        ...props
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
                        lineNumber: 60,
                        columnNumber: 13
                    }, void 0)
            },
            children: content
        }, void 0, false, {
            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
            lineNumber: 12,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
_c = MarkdownRenderer;
var _c;
__turbopack_context__.k.register(_c, "MarkdownRenderer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SectionReportCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/card.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/button.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/badge.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/file-text.js [client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/loader-circle.js [client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/circle-alert.js [client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$MarkdownRenderer$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx [client] (ecmascript)");
;
;
;
;
;
;
function SectionReportCard({ report, loading, generating, onGenerate, sectionCode, sectionTitle }) {
    const displayTitle = sectionTitle || 'Relatório desta Seção';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Card"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-between items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                            className: "size-5"
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                            lineNumber: 38,
                                            columnNumber: 15
                                        }, this),
                                        displayTitle
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                    lineNumber: 37,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardDescription"], {
                                    children: "Relatório gerado por IA com análise e insights sobre esta seção"
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                    lineNumber: 41,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                            lineNumber: 36,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: onGenerate,
                            disabled: generating,
                            variant: report ? 'outline' : 'default',
                            children: generating ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                        className: "mr-2 size-4 animate-spin"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                        lineNumber: 52,
                                        columnNumber: 17
                                    }, this),
                                    "Gerando..."
                                ]
                            }, void 0, true) : report ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                        className: "mr-2 size-4"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                        lineNumber: 57,
                                        columnNumber: 17
                                    }, this),
                                    "Regenerar"
                                ]
                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                        className: "mr-2 size-4"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                        lineNumber: 62,
                                        columnNumber: 17
                                    }, this),
                                    "Gerar Relatório"
                                ]
                            }, void 0, true)
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                            lineNumber: 45,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                    lineNumber: 35,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardContent"], {
                children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-center py-8",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                        className: "size-6 animate-spin text-teal-600"
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                        lineNumber: 72,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                    lineNumber: 71,
                    columnNumber: 11
                }, this) : report ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-6",
                    children: [
                        report.status === 'error' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                    className: "size-5 text-red-600 dark:text-red-400"
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                    lineNumber: 78,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-medium text-red-800 dark:text-red-200",
                                            children: "Erro ao gerar relatório"
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                            lineNumber: 80,
                                            columnNumber: 19
                                        }, this),
                                        report.error_message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-red-600 dark:text-red-400 mt-1",
                                            children: report.error_message
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                            lineNumber: 84,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-red-600 dark:text-red-400 mt-1",
                                            children: "Tente regenerar o relatório."
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                            lineNumber: 88,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                    lineNumber: 79,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                            lineNumber: 77,
                            columnNumber: 15
                        }, this),
                        report.status === 'stale' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                    className: "size-5 text-amber-600 dark:text-amber-400"
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                    lineNumber: 97,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-amber-800 dark:text-amber-200",
                                    children: "Este relatório está desatualizado. Os dados da seção foram alterados desde a última geração."
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                    lineNumber: 98,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                            lineNumber: 96,
                            columnNumber: 15
                        }, this),
                        report.report_markdown && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "prose prose-slate dark:prose-invert max-w-none",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$MarkdownRenderer$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                content: report.report_markdown
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                lineNumber: 107,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                            lineNumber: 106,
                            columnNumber: 15
                        }, this),
                        report.insights && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6",
                            children: [
                                report.insights.identity_summary && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold text-slate-900 dark:text-slate-100",
                                            children: "Resumo da Identidade"
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                            lineNumber: 118,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid gap-4 md:grid-cols-2",
                                            children: [
                                                report.insights.identity_summary.purpose && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1",
                                                            children: "Propósito"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                            lineNumber: 122,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm text-slate-700 dark:text-slate-300",
                                                            children: report.insights.identity_summary.purpose
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                            lineNumber: 123,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                    lineNumber: 121,
                                                    columnNumber: 25
                                                }, this),
                                                report.insights.identity_summary.vision && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1",
                                                            children: "Visão"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                            lineNumber: 128,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm text-slate-700 dark:text-slate-300",
                                                            children: report.insights.identity_summary.vision
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                            lineNumber: 129,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                    lineNumber: 127,
                                                    columnNumber: 25
                                                }, this),
                                                report.insights.identity_summary.priority_audience && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs font-semibold text-green-600 dark:text-green-400 mb-1",
                                                            children: "Público Prioritário"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                            lineNumber: 134,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm text-slate-700 dark:text-slate-300",
                                                            children: report.insights.identity_summary.priority_audience
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                            lineNumber: 135,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                    lineNumber: 133,
                                                    columnNumber: 25
                                                }, this),
                                                report.insights.identity_summary.positioning && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1",
                                                            children: "Posicionamento"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                            lineNumber: 140,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm text-slate-700 dark:text-slate-300",
                                                            children: report.insights.identity_summary.positioning
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                            lineNumber: 141,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                    lineNumber: 139,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                            lineNumber: 119,
                                            columnNumber: 21
                                        }, this),
                                        report.insights.identity_summary.values && report.insights.identity_summary.values.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2",
                                                    children: "Valores"
                                                }, void 0, false, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                    lineNumber: 147,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-wrap gap-2",
                                                    children: report.insights.identity_summary.values.map((value, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                            variant: "outline",
                                                            className: "bg-white dark:bg-slate-800",
                                                            children: value
                                                        }, idx, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                            lineNumber: 150,
                                                            columnNumber: 29
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                    lineNumber: 148,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                            lineNumber: 146,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                    lineNumber: 117,
                                    columnNumber: 19
                                }, this),
                                report.insights.alerts && report.insights.alerts.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold text-slate-900 dark:text-slate-100",
                                            children: "Alertas"
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                            lineNumber: 163,
                                            columnNumber: 21
                                        }, this),
                                        report.insights.alerts.map((alert, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `p-3 rounded-lg border ${alert.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : alert.severity === 'medium' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "font-medium text-sm",
                                                        children: alert.title
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                        lineNumber: 175,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-slate-600 dark:text-slate-400 mt-1",
                                                        children: alert.detail
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                        lineNumber: 176,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, idx, true, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                lineNumber: 165,
                                                columnNumber: 23
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                    lineNumber: 162,
                                    columnNumber: 19
                                }, this),
                                report.insights.recommendations && report.insights.recommendations.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold text-slate-900 dark:text-slate-100",
                                            children: "Recomendações"
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                            lineNumber: 185,
                                            columnNumber: 21
                                        }, this),
                                        report.insights.recommendations.sort((a, b)=>(b.priority || 0) - (a.priority || 0)).map((rec, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex justify-between items-start mb-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "font-medium text-sm",
                                                                children: rec.title
                                                            }, void 0, false, {
                                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                                lineNumber: 194,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                variant: "outline",
                                                                className: "text-xs",
                                                                children: [
                                                                    "Prioridade ",
                                                                    rec.priority || 0
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                                lineNumber: 195,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                        lineNumber: 193,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-slate-600 dark:text-slate-400",
                                                        children: rec.detail
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                        lineNumber: 199,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, idx, true, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                lineNumber: 189,
                                                columnNumber: 25
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                    lineNumber: 184,
                                    columnNumber: 19
                                }, this),
                                report.insights.checklist && report.insights.checklist.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold text-slate-900 dark:text-slate-100",
                                            children: "Checklist de Melhoria"
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                            lineNumber: 208,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-2",
                                            children: report.insights.checklist.map((item, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "checkbox",
                                                            className: "mt-1"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                            lineNumber: 215,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm text-slate-700 dark:text-slate-300 flex-1",
                                                            children: item
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                            lineNumber: 216,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, idx, true, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                    lineNumber: 211,
                                                    columnNumber: 25
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                            lineNumber: 209,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                    lineNumber: 207,
                                    columnNumber: 19
                                }, this),
                                report.insights.missing_data && report.insights.missing_data.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold text-slate-900 dark:text-slate-100",
                                            children: "Dados Faltantes"
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                            lineNumber: 226,
                                            columnNumber: 21
                                        }, this),
                                        report.insights.missing_data.map((item, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "font-medium text-sm",
                                                        children: item.item
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                        lineNumber: 232,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-slate-600 dark:text-slate-400 mt-1",
                                                        children: item.why_it_matters
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                        lineNumber: 233,
                                                        columnNumber: 25
                                                    }, this),
                                                    item.how_to_fill && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-slate-500 dark:text-slate-400 mt-1 italic",
                                                        children: [
                                                            "Como preencher: ",
                                                            item.how_to_fill
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                        lineNumber: 235,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, idx, true, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                lineNumber: 228,
                                                columnNumber: 23
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                    lineNumber: 225,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                            lineNumber: 113,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                    lineNumber: 75,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center py-8 text-slate-500",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                            className: "size-12 mx-auto mb-3 opacity-50"
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                            lineNumber: 248,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "Nenhum relatório gerado ainda."
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                            lineNumber: 249,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm mt-1",
                            children: 'Clique em "Gerar Relatório" para criar um relatório com análise e insights.'
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                            lineNumber: 250,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                    lineNumber: 247,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_c = SectionReportCard;
var _c;
__turbopack_context__.k.register(_c, "SectionReportCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DossierSectionPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/next/router.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$hooks$2f$useSectionData$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/hooks/useSectionData.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$hooks$2f$useSectionReport$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/hooks/useSectionReport.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$dossierService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/services/dossierService.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$QuestionWizard$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$SectionReportCard$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/card.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$progress$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/progress.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/loader-circle.js [client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/sonner/dist/index.mjs [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
;
;
;
;
function DossierSectionPage({ sectionCode, entityBlocks }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const dossierId = typeof router.query.dossierId === 'string' ? router.query.dossierId : undefined;
    const { sectionData, loading, error, completionPercent, refetch } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$hooks$2f$useSectionData$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useSectionData"])(dossierId, sectionCode);
    const { report, loadingReport, generatingReport, handleGenerateReport } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$hooks$2f$useSectionReport$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useSectionReport"])(dossierId, sectionCode);
    const [savingAnswers, setSavingAnswers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [answersMap, setAnswersMap] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])({});
    const saveTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])({});
    // Inicializar answersMap quando sectionData mudar
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DossierSectionPage.useEffect": ()=>{
            if (sectionData?.questionSets) {
                console.log('📥 Carregando dados da seção:', {
                    sectionCode,
                    questionSetsCount: sectionData.questionSets.length
                });
                const initialAnswers = {};
                let answersCount = 0;
                sectionData.questionSets.forEach({
                    "DossierSectionPage.useEffect": (qs)=>{
                        qs.questions.forEach({
                            "DossierSectionPage.useEffect": (q)=>{
                                if (q.answer && Object.keys(q.answer).length > 0) {
                                    answersCount++;
                                    console.log('📝 Resposta encontrada:', {
                                        questionId: q.id,
                                        questionCode: q.code,
                                        answerKeys: Object.keys(q.answer),
                                        valueText: q.answer.value_text?.substring(0, 50),
                                        valueNumber: q.answer.value_number,
                                        valueJson: q.answer.value_json
                                    });
                                }
                                // Converter snake_case do banco para camelCase esperado pelo frontend
                                if (q.answer) {
                                    const converted = {
                                        id: q.answer.id,
                                        valueText: q.answer.value_text,
                                        valueNumber: q.answer.value_number,
                                        valueJson: q.answer.value_json,
                                        source: q.answer.source
                                    };
                                    initialAnswers[q.id] = converted;
                                    if (converted.valueText || converted.valueNumber || converted.valueJson) {
                                        console.log('🔄 Convertido snake_case → camelCase:', {
                                            questionCode: q.code,
                                            antes: {
                                                value_text: q.answer.value_text,
                                                value_number: q.answer.value_number
                                            },
                                            depois: {
                                                valueText: converted.valueText,
                                                valueNumber: converted.valueNumber
                                            }
                                        });
                                    }
                                } else {
                                    initialAnswers[q.id] = {};
                                }
                            }
                        }["DossierSectionPage.useEffect"]);
                    }
                }["DossierSectionPage.useEffect"]);
                console.log(`✅ Total de ${answersCount} respostas carregadas`);
                setAnswersMap(initialAnswers);
            }
        }
    }["DossierSectionPage.useEffect"], [
        sectionData,
        sectionCode
    ]);
    // Cleanup timeouts on unmount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DossierSectionPage.useEffect": ()=>{
            return ({
                "DossierSectionPage.useEffect": ()=>{
                    Object.values(saveTimeoutRef.current).forEach(clearTimeout);
                }
            })["DossierSectionPage.useEffect"];
        }
    }["DossierSectionPage.useEffect"], []);
    if (!dossierId) {
        return null;
    }
    const handleAnswerChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DossierSectionPage.useCallback[handleAnswerChange]": (question, value)=>{
            if (!question.id) return;
            // Atualizar estado local imediatamente para feedback visual
            setAnswersMap({
                "DossierSectionPage.useCallback[handleAnswerChange]": (prev)=>({
                        ...prev,
                        [question.id]: value
                    })
            }["DossierSectionPage.useCallback[handleAnswerChange]"]);
            // Limpar timeout anterior se existir
            if (saveTimeoutRef.current[question.id]) {
                clearTimeout(saveTimeoutRef.current[question.id]);
            }
            // Marcar como salvando após um pequeno delay (para evitar piscar o ícone)
            const savingTimeout = setTimeout({
                "DossierSectionPage.useCallback[handleAnswerChange].savingTimeout": ()=>{
                    setSavingAnswers({
                        "DossierSectionPage.useCallback[handleAnswerChange].savingTimeout": (prev)=>new Set(prev).add(question.id)
                    }["DossierSectionPage.useCallback[handleAnswerChange].savingTimeout"]);
                }
            }["DossierSectionPage.useCallback[handleAnswerChange].savingTimeout"], 300);
            // Debounce: salvar após 1 segundo de inatividade
            saveTimeoutRef.current[question.id] = setTimeout({
                "DossierSectionPage.useCallback[handleAnswerChange]": async ()=>{
                    try {
                        console.log('💾 Salvando resposta:', {
                            dossierId,
                            questionId: question.id,
                            questionCode: question.code,
                            valueText: value.valueText?.substring(0, 50),
                            valueNumber: value.valueNumber,
                            valueJson: value.valueJson
                        });
                        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$dossierService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["saveAnswers"])(dossierId, [
                            {
                                questionId: question.id,
                                valueText: value.valueText,
                                valueNumber: value.valueNumber,
                                valueJson: value.valueJson,
                                source: 'user'
                            }
                        ]);
                        console.log('✅ Resposta salva com sucesso:', result);
                    // Não fazer refetch aqui - o estado local já está atualizado
                    // Isso evita o refresh da tela enquanto o usuário está digitando
                    } catch (err) {
                        console.error('❌ Erro ao salvar resposta:', err);
                        __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].error('Erro ao salvar resposta');
                        // Reverter mudança em caso de erro
                        setAnswersMap({
                            "DossierSectionPage.useCallback[handleAnswerChange]": (prev)=>({
                                    ...prev,
                                    [question.id]: sectionData?.questionSets.flatMap({
                                        "DossierSectionPage.useCallback[handleAnswerChange]": (qs)=>qs.questions
                                    }["DossierSectionPage.useCallback[handleAnswerChange]"]).find({
                                        "DossierSectionPage.useCallback[handleAnswerChange]": (q)=>q.id === question.id
                                    }["DossierSectionPage.useCallback[handleAnswerChange]"])?.answer || {}
                                })
                        }["DossierSectionPage.useCallback[handleAnswerChange]"]);
                    } finally{
                        clearTimeout(savingTimeout);
                        setSavingAnswers({
                            "DossierSectionPage.useCallback[handleAnswerChange]": (prev)=>{
                                const next = new Set(prev);
                                next.delete(question.id);
                                return next;
                            }
                        }["DossierSectionPage.useCallback[handleAnswerChange]"]);
                        delete saveTimeoutRef.current[question.id];
                    }
                }
            }["DossierSectionPage.useCallback[handleAnswerChange]"], 1000); // 1 segundo de debounce
        }
    }["DossierSectionPage.useCallback[handleAnswerChange]"], [
        dossierId,
        sectionData
    ]);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center min-h-[400px]",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                className: "size-8 animate-spin text-teal-600"
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                lineNumber: 190,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
            lineNumber: 189,
            columnNumber: 7
        }, this);
    }
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Card"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardContent"], {
                className: "pt-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center text-red-600",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "Erro ao carregar dados da seção"
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                            lineNumber: 200,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm mt-2",
                            children: error.message
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                            lineNumber: 201,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                    lineNumber: 199,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                lineNumber: 198,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
            lineNumber: 197,
            columnNumber: 7
        }, this);
    }
    if (!sectionData) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Card"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardContent"], {
                className: "pt-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center text-slate-500",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Nenhum dado encontrado para esta seção"
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                        lineNumber: 213,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                    lineNumber: 212,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                lineNumber: 211,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
            lineNumber: 210,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Card"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-between items-start",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                            children: sectionData.section.name
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                                            lineNumber: 227,
                                            columnNumber: 15
                                        }, this),
                                        sectionData.section.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardDescription"], {
                                            className: "mt-2",
                                            children: sectionData.section.description
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                                            lineNumber: 229,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                                    lineNumber: 226,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-right",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-sm text-slate-600 dark:text-slate-400 mb-1",
                                            children: "Completude"
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                                            lineNumber: 235,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-2xl font-bold",
                                            children: [
                                                completionPercent,
                                                "%"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                                            lineNumber: 238,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                                    lineNumber: 234,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                            lineNumber: 225,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$progress$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Progress"], {
                                value: completionPercent,
                                className: "h-2"
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                                lineNumber: 242,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                            lineNumber: 241,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                    lineNumber: 224,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                lineNumber: 223,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$QuestionWizard$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                questionSets: sectionData.questionSets,
                answersMap: answersMap,
                savingAnswers: savingAnswers,
                onAnswerChange: handleAnswerChange,
                sectionCode: sectionCode
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                lineNumber: 248,
                columnNumber: 7
            }, this),
            entityBlocks && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-4",
                children: entityBlocks
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                lineNumber: 258,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$SectionReportCard$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                report: report,
                loading: loadingReport,
                generating: generatingReport,
                onGenerate: handleGenerateReport,
                sectionCode: sectionCode,
                sectionTitle: `Relatório - ${sectionData.section.name}`
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                lineNumber: 264,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
        lineNumber: 221,
        columnNumber: 5
    }, this);
}
_s(DossierSectionPage, "Pj9QH6gJO6S8tw0ompwbVsBtjHE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$hooks$2f$useSectionData$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useSectionData"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$hooks$2f$useSectionReport$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useSectionReport"]
    ];
});
_c = DossierSectionPage;
var _c;
__turbopack_context__.k.register(_c, "DossierSectionPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/components/ui/table.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Table",
    ()=>Table,
    "TableBody",
    ()=>TableBody,
    "TableCaption",
    ()=>TableCaption,
    "TableCell",
    ()=>TableCell,
    "TableFooter",
    ()=>TableFooter,
    "TableHead",
    ()=>TableHead,
    "TableHeader",
    ()=>TableHeader,
    "TableRow",
    ()=>TableRow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
/* Table Component primitives - A component that displays a table - from shadcn/ui (exposes Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption) */ var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/utils.ts [client] (ecmascript)");
;
;
;
const Table = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative w-full overflow-auto",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            ref: ref,
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('w-full caption-bottom text-sm', className),
            ...props
        }, void 0, false, {
            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/table.tsx",
            lineNumber: 11,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/table.tsx",
        lineNumber: 10,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = Table;
Table.displayName = 'Table';
const TableHeader = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c2 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('[&_tr]:border-b', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/table.tsx",
        lineNumber: 24,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c3 = TableHeader;
TableHeader.displayName = 'TableHeader';
const TableBody = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c4 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('[&_tr:last-child]:border-0', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/table.tsx",
        lineNumber: 32,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c5 = TableBody;
TableBody.displayName = 'TableBody';
const TableFooter = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c6 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tfoot", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/table.tsx",
        lineNumber: 44,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c7 = TableFooter;
TableFooter.displayName = 'TableFooter';
const TableRow = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c8 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/table.tsx",
        lineNumber: 59,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c9 = TableRow;
TableRow.displayName = 'TableRow';
const TableHead = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c10 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/table.tsx",
        lineNumber: 74,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c11 = TableHead;
TableHead.displayName = 'TableHead';
const TableCell = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c12 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('p-4 align-middle [&:has([role=checkbox])]:pr-0', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/table.tsx",
        lineNumber: 89,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c13 = TableCell;
TableCell.displayName = 'TableCell';
const TableCaption = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c14 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("caption", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('mt-4 text-sm text-muted-foreground', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/table.tsx",
        lineNumber: 101,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c15 = TableCaption;
TableCaption.displayName = 'TableCaption';
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10, _c11, _c12, _c13, _c14, _c15;
__turbopack_context__.k.register(_c, "Table$React.forwardRef");
__turbopack_context__.k.register(_c1, "Table");
__turbopack_context__.k.register(_c2, "TableHeader$React.forwardRef");
__turbopack_context__.k.register(_c3, "TableHeader");
__turbopack_context__.k.register(_c4, "TableBody$React.forwardRef");
__turbopack_context__.k.register(_c5, "TableBody");
__turbopack_context__.k.register(_c6, "TableFooter$React.forwardRef");
__turbopack_context__.k.register(_c7, "TableFooter");
__turbopack_context__.k.register(_c8, "TableRow$React.forwardRef");
__turbopack_context__.k.register(_c9, "TableRow");
__turbopack_context__.k.register(_c10, "TableHead$React.forwardRef");
__turbopack_context__.k.register(_c11, "TableHead");
__turbopack_context__.k.register(_c12, "TableCell$React.forwardRef");
__turbopack_context__.k.register(_c13, "TableCell");
__turbopack_context__.k.register(_c14, "TableCaption$React.forwardRef");
__turbopack_context__.k.register(_c15, "TableCaption");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/components/ui/dialog.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Dialog",
    ()=>Dialog,
    "DialogClose",
    ()=>DialogClose,
    "DialogContent",
    ()=>DialogContent,
    "DialogDescription",
    ()=>DialogDescription,
    "DialogFooter",
    ()=>DialogFooter,
    "DialogHeader",
    ()=>DialogHeader,
    "DialogOverlay",
    ()=>DialogOverlay,
    "DialogPortal",
    ()=>DialogPortal,
    "DialogTitle",
    ()=>DialogTitle,
    "DialogTrigger",
    ()=>DialogTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
/* Dialog Component primitives - A component that displays a dialog (a modal that appears in the center of the screen) - from shadcn/ui (exposes Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose, DialogOverlay, DialogPortal) */ var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/@radix-ui/react-dialog/dist/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/x.js [client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/utils.ts [client] (ecmascript)");
;
;
;
;
;
const Dialog = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Root"];
const DialogTrigger = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Trigger"];
const DialogPortal = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Portal"];
const DialogClose = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Close"];
const DialogOverlay = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Overlay"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/dialog.tsx",
        lineNumber: 20,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c = DialogOverlay;
DialogOverlay.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Overlay"].displayName;
const DialogContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c1 = ({ className, children, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DialogPortal, {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DialogOverlay, {}, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/dialog.tsx",
                lineNumber: 36,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Content"], {
                ref: ref,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg overflow-y-auto max-h-screen', className),
                ...props,
                children: [
                    children,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Close"], {
                        className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/dialog.tsx",
                                lineNumber: 47,
                                columnNumber: 9
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "sr-only",
                                children: "Close"
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/dialog.tsx",
                                lineNumber: 48,
                                columnNumber: 9
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/dialog.tsx",
                        lineNumber: 46,
                        columnNumber: 7
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/dialog.tsx",
                lineNumber: 37,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/dialog.tsx",
        lineNumber: 35,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c2 = DialogContent;
DialogContent.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Content"].displayName;
const DialogHeader = ({ className, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('flex flex-col space-y-1.5 text-center sm:text-left', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/dialog.tsx",
        lineNumber: 59,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c3 = DialogHeader;
DialogHeader.displayName = 'DialogHeader';
const DialogFooter = ({ className, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/dialog.tsx",
        lineNumber: 73,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c4 = DialogFooter;
DialogFooter.displayName = 'DialogFooter';
const DialogTitle = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c5 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Title"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('text-lg font-semibold leading-none tracking-tight', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/dialog.tsx",
        lineNumber: 87,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c6 = DialogTitle;
DialogTitle.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Title"].displayName;
const DialogDescription = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c7 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Description"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('text-sm text-muted-foreground', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/dialog.tsx",
        lineNumber: 102,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c8 = DialogDescription;
DialogDescription.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Description"].displayName;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8;
__turbopack_context__.k.register(_c, "DialogOverlay");
__turbopack_context__.k.register(_c1, "DialogContent$React.forwardRef");
__turbopack_context__.k.register(_c2, "DialogContent");
__turbopack_context__.k.register(_c3, "DialogHeader");
__turbopack_context__.k.register(_c4, "DialogFooter");
__turbopack_context__.k.register(_c5, "DialogTitle$React.forwardRef");
__turbopack_context__.k.register(_c6, "DialogTitle");
__turbopack_context__.k.register(_c7, "DialogDescription$React.forwardRef");
__turbopack_context__.k.register(_c8, "DialogDescription");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/services/entityService.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createCapacity",
    ()=>createCapacity,
    "createCompetitor",
    ()=>createCompetitor,
    "createCustomerSegment",
    ()=>createCustomerSegment,
    "createRole",
    ()=>createRole,
    "createService",
    ()=>createService,
    "createServiceCategory",
    ()=>createServiceCategory,
    "createTeamMember",
    ()=>createTeamMember,
    "createValueProposition",
    ()=>createValueProposition,
    "deleteCapacity",
    ()=>deleteCapacity,
    "deleteCompetitor",
    ()=>deleteCompetitor,
    "deleteCustomerSegment",
    ()=>deleteCustomerSegment,
    "deleteRole",
    ()=>deleteRole,
    "deleteService",
    ()=>deleteService,
    "deleteServiceCategory",
    ()=>deleteServiceCategory,
    "deleteTeamMember",
    ()=>deleteTeamMember,
    "deleteValueProposition",
    ()=>deleteValueProposition,
    "getCapacities",
    ()=>getCapacities,
    "getCompetitors",
    ()=>getCompetitors,
    "getCustomerSegments",
    ()=>getCustomerSegments,
    "getRoles",
    ()=>getRoles,
    "getServiceCategories",
    ()=>getServiceCategories,
    "getServices",
    ()=>getServices,
    "getTeamMembers",
    ()=>getTeamMembers,
    "getValuePropositions",
    ()=>getValuePropositions,
    "updateCapacity",
    ()=>updateCapacity,
    "updateCompetitor",
    ()=>updateCompetitor,
    "updateCustomerSegment",
    ()=>updateCustomerSegment,
    "updateRole",
    ()=>updateRole,
    "updateService",
    ()=>updateService,
    "updateServiceCategory",
    ()=>updateServiceCategory,
    "updateTeamMember",
    ()=>updateTeamMember,
    "updateValueProposition",
    ()=>updateValueProposition
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/api.ts [client] (ecmascript)");
;
async function getCustomerSegments(dossierId, entityId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].getCustomerSegments(dossierId, entityId);
}
async function createCustomerSegment(dossierId, data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].createCustomerSegment(dossierId, data);
}
async function updateCustomerSegment(dossierId, entityId, data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].updateCustomerSegment(dossierId, entityId, data);
}
async function deleteCustomerSegment(dossierId, entityId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].deleteCustomerSegment(dossierId, entityId);
}
async function getValuePropositions(dossierId, entityId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].getValuePropositions(dossierId, entityId);
}
async function createValueProposition(dossierId, data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].createValueProposition(dossierId, data);
}
async function updateValueProposition(dossierId, entityId, data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].updateValueProposition(dossierId, entityId, data);
}
async function deleteValueProposition(dossierId, entityId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].deleteValueProposition(dossierId, entityId);
}
async function getServices(dossierId, entityId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].getServices(dossierId, entityId);
}
async function createService(dossierId, data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].createService(dossierId, data);
}
async function updateService(dossierId, entityId, data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].updateService(dossierId, entityId, data);
}
async function deleteService(dossierId, entityId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].deleteService(dossierId, entityId);
}
async function getCompetitors(dossierId, entityId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].getCompetitors(dossierId, entityId);
}
async function createCompetitor(dossierId, data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].createCompetitor(dossierId, data);
}
async function updateCompetitor(dossierId, entityId, data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].updateCompetitor(dossierId, entityId, data);
}
async function deleteCompetitor(dossierId, entityId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].deleteCompetitor(dossierId, entityId);
}
async function getTeamMembers(dossierId, entityId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].getTeamMembers(dossierId, entityId);
}
async function createTeamMember(dossierId, data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].createTeamMember(dossierId, data);
}
async function updateTeamMember(dossierId, entityId, data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].updateTeamMember(dossierId, entityId, data);
}
async function deleteTeamMember(dossierId, entityId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].deleteTeamMember(dossierId, entityId);
}
async function getCapacities(dossierId, entityId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].getCapacities(dossierId, entityId);
}
async function createCapacity(dossierId, data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].createCapacity(dossierId, data);
}
async function updateCapacity(dossierId, entityId, data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].updateCapacity(dossierId, entityId, data);
}
async function deleteCapacity(dossierId, entityId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].deleteCapacity(dossierId, entityId);
}
async function getServiceCategories(dossierId, entityId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].getServiceCategories(dossierId, entityId);
}
async function createServiceCategory(dossierId, data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].createServiceCategory(dossierId, data);
}
async function updateServiceCategory(dossierId, entityId, data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].updateServiceCategory(dossierId, entityId, data);
}
async function deleteServiceCategory(dossierId, entityId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].deleteServiceCategory(dossierId, entityId);
}
async function getRoles(clinicId, entityId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].getRoles(clinicId, entityId);
}
async function createRole(clinicId, data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].createRole(clinicId, data);
}
async function updateRole(clinicId, entityId, data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].updateRole(clinicId, entityId, data);
}
async function deleteRole(clinicId, entityId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].deleteRole(clinicId, entityId);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/stores/useAuthStore.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAuthStore",
    ()=>useAuthStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$zustand$2f$esm$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/zustand/esm/index.mjs [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/zustand/esm/middleware.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/api.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/sonner/dist/index.mjs [client] (ecmascript)");
;
;
;
;
const useAuthStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$zustand$2f$esm$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        login: async (email, password)=>{
            set({
                isLoading: true
            });
            try {
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].login(email, password);
                set({
                    user: response.user,
                    token: response.token,
                    isAuthenticated: true,
                    isLoading: false
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].success(`Bem-vindo, ${response.user.name}!`);
            } catch (error) {
                set({
                    isLoading: false
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].error(error.message || 'Erro ao fazer login');
                throw error;
            }
        },
        register: async (email, password, name, clinicId)=>{
            set({
                isLoading: true
            });
            try {
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].register(email, password, name, clinicId);
                set({
                    user: response.user,
                    token: response.token,
                    isAuthenticated: true,
                    isLoading: false
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].success(`Conta criada com sucesso, ${response.user.name}!`);
            } catch (error) {
                set({
                    isLoading: false
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].error(error.message || 'Erro ao criar conta');
                throw error;
            }
        },
        logout: ()=>{
            set({
                user: null,
                token: null,
                isAuthenticated: false
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].success('Logout realizado com sucesso');
        },
        checkAuth: async ()=>{
            const { token } = get();
            if (!token) {
                set({
                    isAuthenticated: false,
                    user: null
                });
                return;
            }
            set({
                isLoading: true
            });
            try {
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].getMe();
                set({
                    user: response.user,
                    isAuthenticated: true,
                    isLoading: false
                });
            } catch (error) {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false
                });
            }
        },
        updateUser: (userData)=>{
            const { user } = get();
            if (user) {
                set({
                    user: {
                        ...user,
                        ...userData
                    }
                });
            }
        }
    }), {
    name: 'auth-storage',
    partialize: (state)=>({
            token: state.token,
            user: state.user,
            isAuthenticated: state.isAuthenticated
        })
}));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RolesManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/card.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/button.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/table.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/dialog.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/input.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/textarea.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/label.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/plus.js [client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/square-pen.js [client] (ecmascript) <export default as Edit>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/trash-2.js [client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/briefcase.js [client] (ecmascript) <export default as Briefcase>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$entityService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/services/entityService.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$stores$2f$useAuthStore$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/stores/useAuthStore.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/sonner/dist/index.mjs [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
;
;
;
;
;
function RolesManager({ onUpdateCompletion }) {
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$stores$2f$useAuthStore$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useAuthStore"])();
    const clinicId = user?.clinicId;
    const [roles, setRoles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [editingRole, setEditingRole] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [dialogOpen, setDialogOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RolesManager.useEffect": ()=>{
            if (clinicId) {
                loadRoles();
            }
        }
    }["RolesManager.useEffect"], [
        clinicId
    ]);
    const loadRoles = async ()=>{
        if (!clinicId) return;
        try {
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$entityService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["getRoles"])(clinicId);
            setRoles(data);
        } catch (error) {
            console.error('Erro ao carregar cargos:', error);
        }
    };
    const handleSave = async (data)=>{
        if (!clinicId) return;
        try {
            if (editingRole) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$entityService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["updateRole"])(clinicId, editingRole.id, data);
                __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].success('Cargo atualizado!');
            } else {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$entityService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["createRole"])(clinicId, data);
                __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].success('Cargo criado!');
            }
            setDialogOpen(false);
            setEditingRole(null);
            await loadRoles();
            if (onUpdateCompletion) {
                onUpdateCompletion();
            }
        } catch (error) {
            __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].error(error.message || 'Erro ao salvar cargo');
        }
    };
    const handleDelete = async (id)=>{
        if (!clinicId) return;
        if (!confirm('Tem certeza que deseja excluir este cargo?')) return;
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$entityService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["deleteRole"])(clinicId, id);
            __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].success('Cargo excluído!');
            await loadRoles();
            if (onUpdateCompletion) {
                onUpdateCompletion();
            }
        } catch (error) {
            __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].error(error.message || 'Erro ao excluir cargo');
        }
    };
    if (!clinicId) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Card"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-between items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__["Briefcase"], {
                                            className: "size-5"
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                                            lineNumber: 116,
                                            columnNumber: 15
                                        }, this),
                                        "Cargos e Funções"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                                    lineNumber: 115,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardDescription"], {
                                    children: "Defina os cargos e funções da equipe (compartilhado entre todos os dossiês da clínica)"
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                                    lineNumber: 119,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                            lineNumber: 114,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Dialog"], {
                            open: dialogOpen,
                            onOpenChange: (open)=>{
                                setDialogOpen(open);
                                if (!open) setEditingRole(null);
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DialogTrigger"], {
                                    asChild: true,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                        size: "sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                className: "mr-2 size-4"
                                            }, void 0, false, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                                                lineNumber: 132,
                                                columnNumber: 17
                                            }, this),
                                            "Adicionar"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                                        lineNumber: 131,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                                    lineNumber: 130,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DialogContent"], {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RoleForm, {
                                        role: editingRole,
                                        onSave: handleSave,
                                        onCancel: ()=>{
                                            setDialogOpen(false);
                                            setEditingRole(null);
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                                        lineNumber: 137,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                                    lineNumber: 136,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                            lineNumber: 123,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                    lineNumber: 113,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                lineNumber: 112,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardContent"], {
                children: roles.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-slate-500 text-center py-4",
                    children: 'Nenhum cargo cadastrado. Clique em "Adicionar" para criar o primeiro.'
                }, void 0, false, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                    lineNumber: 151,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Table"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableHeader"], {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableRow"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                        children: "Nome"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                                        lineNumber: 158,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                        children: "Descrição"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                                        lineNumber: 159,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                        className: "text-right",
                                        children: "Ações"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                                        lineNumber: 160,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                                lineNumber: 157,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                            lineNumber: 156,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableBody"], {
                            children: roles.map((role)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableRow"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                            className: "font-medium",
                                            children: role.name
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                                            lineNumber: 166,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                            children: role.description || '-'
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                                            lineNumber: 167,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                            className: "text-right",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-end gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        variant: "ghost",
                                                        size: "sm",
                                                        onClick: ()=>{
                                                            setEditingRole(role);
                                                            setDialogOpen(true);
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__["Edit"], {
                                                            className: "size-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                                                            lineNumber: 178,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                                                        lineNumber: 170,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        variant: "ghost",
                                                        size: "sm",
                                                        onClick: ()=>handleDelete(role.id),
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                            className: "size-4 text-red-500"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                                                            lineNumber: 185,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                                                        lineNumber: 180,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                                                lineNumber: 169,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                                            lineNumber: 168,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, role.id, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                                    lineNumber: 165,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                            lineNumber: 163,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                    lineNumber: 155,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                lineNumber: 149,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
        lineNumber: 111,
        columnNumber: 5
    }, this);
}
_s(RolesManager, "ztoa/Qky1ZXcNvVr/YN52Y+q/Bw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$stores$2f$useAuthStore$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useAuthStore"]
    ];
});
_c = RolesManager;
function RoleForm({ role, onSave, onCancel }) {
    _s1();
    const [name, setName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(role?.name || '');
    const [description, setDescription] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(role?.description || '');
    const handleSubmit = (e)=>{
        e.preventDefault();
        if (!name.trim()) {
            __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].error('Nome é obrigatório');
            return;
        }
        onSave({
            name: name.trim(),
            description: description.trim() || undefined
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        onSubmit: handleSubmit,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DialogHeader"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DialogTitle"], {
                        children: role ? 'Editar Cargo' : 'Novo Cargo'
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                        lineNumber: 226,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DialogDescription"], {
                        children: "Defina as informações do cargo ou função"
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                        lineNumber: 229,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                lineNumber: 225,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-4 py-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Label"], {
                                htmlFor: "role-name",
                                children: "Nome *"
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                                lineNumber: 235,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Input"], {
                                id: "role-name",
                                value: name,
                                onChange: (e)=>setName(e.target.value),
                                placeholder: "Ex: Dentista Clínico Geral",
                                required: true
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                                lineNumber: 236,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                        lineNumber: 234,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Label"], {
                                htmlFor: "role-description",
                                children: "Descrição"
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                                lineNumber: 245,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Textarea"], {
                                id: "role-description",
                                value: description,
                                onChange: (e)=>setDescription(e.target.value),
                                placeholder: "Descreva as responsabilidades deste cargo",
                                className: "min-h-[80px]"
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                                lineNumber: 246,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                        lineNumber: 244,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                lineNumber: 233,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DialogFooter"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                        type: "button",
                        variant: "outline",
                        onClick: onCancel,
                        children: "Cancelar"
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                        lineNumber: 256,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                        type: "submit",
                        children: "Salvar"
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                        lineNumber: 259,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
                lineNumber: 255,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx",
        lineNumber: 224,
        columnNumber: 5
    }, this);
}
_s1(RoleForm, "Wkt2GZ6Jj+LXxNxnb4A9FYJSwNI=");
_c1 = RoleForm;
var _c, _c1;
__turbopack_context__.k.register(_c, "RolesManager");
__turbopack_context__.k.register(_c1, "RoleForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TeamMembersManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/card.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/button.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/table.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/dialog.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/input.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/textarea.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/label.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/plus.js [client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/square-pen.js [client] (ecmascript) <export default as Edit>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/trash-2.js [client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/users.js [client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$entityService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/services/entityService.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$stores$2f$useAuthStore$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/stores/useAuthStore.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$dossierService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/services/dossierService.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/sonner/dist/index.mjs [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
;
;
;
;
;
;
function TeamMembersManager({ dossierId, onUpdateCompletion }) {
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$stores$2f$useAuthStore$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useAuthStore"])();
    const clinicId = user?.clinicId;
    const [members, setMembers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [roles, setRoles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [editingMember, setEditingMember] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [dialogOpen, setDialogOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TeamMembersManager.useEffect": ()=>{
            if (dossierId) {
                loadData();
            }
        }
    }["TeamMembersManager.useEffect"], [
        dossierId,
        clinicId
    ]);
    const loadData = async ()=>{
        if (!dossierId || !clinicId) return;
        try {
            const [membersData, rolesData] = await Promise.all([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$entityService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["getTeamMembers"])(dossierId),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$entityService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["getRoles"])(clinicId)
            ]);
            setMembers(membersData);
            setRoles(rolesData);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    };
    const handleSave = async (data)=>{
        try {
            if (editingMember) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$entityService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["updateTeamMember"])(dossierId, editingMember.id, data);
                __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].success('Membro atualizado!');
            } else {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$entityService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["createTeamMember"])(dossierId, data);
                __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].success('Membro criado!');
            }
            setDialogOpen(false);
            setEditingMember(null);
            await loadData();
            if (onUpdateCompletion) {
                onUpdateCompletion();
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$dossierService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["calculateSectionCompletion"])(dossierId, 'OPERATIONS');
        } catch (error) {
            __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].error(error.message || 'Erro ao salvar membro');
        }
    };
    const handleDelete = async (id)=>{
        if (!confirm('Tem certeza que deseja excluir este membro?')) return;
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$entityService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["deleteTeamMember"])(dossierId, id);
            __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].success('Membro excluído!');
            await loadData();
            if (onUpdateCompletion) {
                onUpdateCompletion();
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$dossierService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["calculateSectionCompletion"])(dossierId, 'OPERATIONS');
        } catch (error) {
            __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].error(error.message || 'Erro ao excluir membro');
        }
    };
    const getEmploymentTypeLabel = (type)=>{
        const labels = {
            employee: 'Funcionário',
            contractor: 'Contratado',
            partner: 'Parceiro'
        };
        return labels[type] || type;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Card"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-between items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                            className: "size-5"
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                            lineNumber: 130,
                                            columnNumber: 15
                                        }, this),
                                        "Membros da Equipe"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                    lineNumber: 129,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardDescription"], {
                                    children: "Gerencie os membros da equipe e suas atribuições"
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                    lineNumber: 133,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                            lineNumber: 128,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Dialog"], {
                            open: dialogOpen,
                            onOpenChange: (open)=>{
                                setDialogOpen(open);
                                if (!open) setEditingMember(null);
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DialogTrigger"], {
                                    asChild: true,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                        size: "sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                className: "mr-2 size-4"
                                            }, void 0, false, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                                lineNumber: 146,
                                                columnNumber: 17
                                            }, this),
                                            "Adicionar"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                        lineNumber: 145,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                    lineNumber: 144,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DialogContent"], {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TeamMemberForm, {
                                        member: editingMember,
                                        roles: roles,
                                        onSave: handleSave,
                                        onCancel: ()=>{
                                            setDialogOpen(false);
                                            setEditingMember(null);
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                        lineNumber: 151,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                    lineNumber: 150,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                            lineNumber: 137,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                    lineNumber: 127,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                lineNumber: 126,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardContent"], {
                children: members.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-slate-500 text-center py-4",
                    children: 'Nenhum membro cadastrado. Clique em "Adicionar" para criar o primeiro.'
                }, void 0, false, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                    lineNumber: 166,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Table"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableHeader"], {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableRow"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                        children: "Nome"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                        lineNumber: 173,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                        children: "Cargo"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                        lineNumber: 174,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                        children: "Tipo"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                        lineNumber: 175,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                        children: "Horas/Semana"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                        lineNumber: 176,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                        className: "text-right",
                                        children: "Ações"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                        lineNumber: 177,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                lineNumber: 172,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                            lineNumber: 171,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableBody"], {
                            children: members.map((member)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableRow"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                            className: "font-medium",
                                            children: member.name
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                            lineNumber: 183,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                            children: member.role_name || '-'
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                            lineNumber: 184,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                            children: getEmploymentTypeLabel(member.employment_type)
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                            lineNumber: 185,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                            children: member.hours_per_week ? `${member.hours_per_week}h` : '-'
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                            lineNumber: 186,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                            className: "text-right",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-end gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        variant: "ghost",
                                                        size: "sm",
                                                        onClick: ()=>{
                                                            setEditingMember(member);
                                                            setDialogOpen(true);
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__["Edit"], {
                                                            className: "size-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                                            lineNumber: 199,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                                        lineNumber: 191,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        variant: "ghost",
                                                        size: "sm",
                                                        onClick: ()=>handleDelete(member.id),
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                            className: "size-4 text-red-500"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                                            lineNumber: 206,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                                        lineNumber: 201,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                                lineNumber: 190,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                            lineNumber: 189,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, member.id, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                    lineNumber: 182,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                            lineNumber: 180,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                    lineNumber: 170,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                lineNumber: 164,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
        lineNumber: 125,
        columnNumber: 5
    }, this);
}
_s(TeamMembersManager, "E4K8n9G3VCk5atfmpbSwrr4OwbQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$stores$2f$useAuthStore$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useAuthStore"]
    ];
});
_c = TeamMembersManager;
function TeamMemberForm({ member, roles, onSave, onCancel }) {
    _s1();
    const [name, setName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(member?.name || '');
    const [roleId, setRoleId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(member?.role_id || '');
    const [employmentType, setEmploymentType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(member?.employment_type || 'employee');
    const [hoursPerWeek, setHoursPerWeek] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(member?.hours_per_week || '');
    const [notes, setNotes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(member?.notes || '');
    const handleSubmit = (e)=>{
        e.preventDefault();
        if (!name.trim()) {
            __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].error('Nome é obrigatório');
            return;
        }
        onSave({
            name: name.trim(),
            roleId: roleId || undefined,
            employmentType,
            hoursPerWeek: hoursPerWeek ? parseInt(hoursPerWeek) : undefined,
            notes: notes.trim() || undefined
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        onSubmit: handleSubmit,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DialogHeader"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DialogTitle"], {
                        children: member ? 'Editar Membro' : 'Novo Membro da Equipe'
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                        lineNumber: 255,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DialogDescription"], {
                        children: "Defina as informações do membro da equipe"
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                        lineNumber: 258,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                lineNumber: 254,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-4 py-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Label"], {
                                htmlFor: "member-name",
                                children: "Nome *"
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                lineNumber: 264,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Input"], {
                                id: "member-name",
                                value: name,
                                onChange: (e)=>setName(e.target.value),
                                placeholder: "Ex: Dr. João Silva",
                                required: true
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                lineNumber: 265,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                        lineNumber: 263,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Label"], {
                                htmlFor: "member-role",
                                children: "Cargo"
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                lineNumber: 274,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                id: "member-role",
                                value: roleId,
                                onChange: (e)=>setRoleId(e.target.value),
                                className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: "Nenhum"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                        lineNumber: 281,
                                        columnNumber: 13
                                    }, this),
                                    roles.map((role)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: role.id,
                                            children: role.name
                                        }, role.id, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                            lineNumber: 283,
                                            columnNumber: 15
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                lineNumber: 275,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                        lineNumber: 273,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Label"], {
                                htmlFor: "member-type",
                                children: "Tipo de Vínculo *"
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                lineNumber: 290,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                id: "member-type",
                                value: employmentType,
                                onChange: (e)=>setEmploymentType(e.target.value),
                                className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "employee",
                                        children: "Funcionário"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                        lineNumber: 297,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "contractor",
                                        children: "Contratado"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                        lineNumber: 298,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "partner",
                                        children: "Parceiro"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                        lineNumber: 299,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                lineNumber: 291,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                        lineNumber: 289,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Label"], {
                                htmlFor: "member-hours",
                                children: "Horas por Semana"
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                lineNumber: 303,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Input"], {
                                id: "member-hours",
                                type: "number",
                                min: "1",
                                max: "168",
                                value: hoursPerWeek,
                                onChange: (e)=>setHoursPerWeek(e.target.value),
                                placeholder: "Ex: 40"
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                lineNumber: 304,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                        lineNumber: 302,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Label"], {
                                htmlFor: "member-notes",
                                children: "Notas"
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                lineNumber: 315,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Textarea"], {
                                id: "member-notes",
                                value: notes,
                                onChange: (e)=>setNotes(e.target.value),
                                placeholder: "Observações adicionais",
                                className: "min-h-[80px]"
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                                lineNumber: 316,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                        lineNumber: 314,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                lineNumber: 262,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DialogFooter"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                        type: "button",
                        variant: "outline",
                        onClick: onCancel,
                        children: "Cancelar"
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                        lineNumber: 326,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                        type: "submit",
                        children: "Salvar"
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                        lineNumber: 329,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
                lineNumber: 325,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx",
        lineNumber: 253,
        columnNumber: 5
    }, this);
}
_s1(TeamMemberForm, "0NCfpPVK9J11tp0IaKwgpSrTt2Q=");
_c1 = TeamMemberForm;
var _c, _c1;
__turbopack_context__.k.register(_c, "TeamMembersManager");
__turbopack_context__.k.register(_c1, "TeamMemberForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CapacitiesManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/card.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/button.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/table.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/dialog.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/input.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/textarea.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/label.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/plus.js [client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/square-pen.js [client] (ecmascript) <export default as Edit>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/trash-2.js [client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cpu$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Cpu$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/lucide-react/dist/esm/icons/cpu.js [client] (ecmascript) <export default as Cpu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$entityService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/services/entityService.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$dossierService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/services/dossierService.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/sonner/dist/index.mjs [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
;
;
;
;
;
function CapacitiesManager({ dossierId, onUpdateCompletion }) {
    _s();
    const [capacities, setCapacities] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [editingCapacity, setEditingCapacity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [dialogOpen, setDialogOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CapacitiesManager.useEffect": ()=>{
            loadCapacities();
        }
    }["CapacitiesManager.useEffect"], [
        dossierId
    ]);
    const loadCapacities = async ()=>{
        try {
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$entityService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["getCapacities"])(dossierId);
            setCapacities(data);
        } catch (error) {
            console.error('Erro ao carregar capacidades:', error);
        }
    };
    const handleSave = async (data)=>{
        try {
            if (editingCapacity) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$entityService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["updateCapacity"])(dossierId, editingCapacity.id, data);
                __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].success('Capacidade atualizada!');
            } else {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$entityService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["createCapacity"])(dossierId, data);
                __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].success('Capacidade criada!');
            }
            setDialogOpen(false);
            setEditingCapacity(null);
            await loadCapacities();
            if (onUpdateCompletion) {
                onUpdateCompletion();
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$dossierService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["calculateSectionCompletion"])(dossierId, 'OPERATIONS');
        } catch (error) {
            __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].error(error.message || 'Erro ao salvar capacidade');
        }
    };
    const handleDelete = async (id)=>{
        if (!confirm('Tem certeza que deseja excluir esta capacidade?')) return;
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$entityService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["deleteCapacity"])(dossierId, id);
            __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].success('Capacidade excluída!');
            await loadCapacities();
            if (onUpdateCompletion) {
                onUpdateCompletion();
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$dossierService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["calculateSectionCompletion"])(dossierId, 'OPERATIONS');
        } catch (error) {
            __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].error(error.message || 'Erro ao excluir capacidade');
        }
    };
    const getResourceTypeLabel = (type)=>{
        const labels = {
            room: 'Consultório',
            equipment: 'Equipamento',
            staff_time: 'Tempo de Equipe',
            other: 'Outro'
        };
        return labels[type] || type;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Card"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-between items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cpu$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Cpu$3e$__["Cpu"], {
                                            className: "size-5"
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                            lineNumber: 119,
                                            columnNumber: 15
                                        }, this),
                                        "Capacidades Operacionais"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                    lineNumber: 118,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardDescription"], {
                                    children: "Gerencie os recursos e capacidades operacionais da clínica"
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                    lineNumber: 122,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                            lineNumber: 117,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Dialog"], {
                            open: dialogOpen,
                            onOpenChange: (open)=>{
                                setDialogOpen(open);
                                if (!open) setEditingCapacity(null);
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DialogTrigger"], {
                                    asChild: true,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                        size: "sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                className: "mr-2 size-4"
                                            }, void 0, false, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                                lineNumber: 135,
                                                columnNumber: 17
                                            }, this),
                                            "Adicionar"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                        lineNumber: 134,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                    lineNumber: 133,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DialogContent"], {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CapacityForm, {
                                        capacity: editingCapacity,
                                        onSave: handleSave,
                                        onCancel: ()=>{
                                            setDialogOpen(false);
                                            setEditingCapacity(null);
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                        lineNumber: 140,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                    lineNumber: 139,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                            lineNumber: 126,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                    lineNumber: 116,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                lineNumber: 115,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardContent"], {
                children: capacities.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-slate-500 text-center py-4",
                    children: 'Nenhuma capacidade cadastrada. Clique em "Adicionar" para criar a primeira.'
                }, void 0, false, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                    lineNumber: 154,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Table"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableHeader"], {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableRow"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                        children: "Tipo"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                        lineNumber: 161,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                        children: "Nome"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                        lineNumber: 162,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                        children: "Quantidade"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                        lineNumber: 163,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                        children: "Unidade"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                        lineNumber: 164,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                        className: "text-right",
                                        children: "Ações"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                        lineNumber: 165,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                lineNumber: 160,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                            lineNumber: 159,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableBody"], {
                            children: capacities.map((capacity)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableRow"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "px-2 py-1 rounded text-xs bg-slate-100 dark:bg-slate-800",
                                                children: getResourceTypeLabel(capacity.resource_type)
                                            }, void 0, false, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                                lineNumber: 172,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                            lineNumber: 171,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                            className: "font-medium",
                                            children: capacity.name
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                            lineNumber: 176,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                            children: capacity.quantity
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                            lineNumber: 177,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                            children: capacity.unit || '-'
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                            lineNumber: 178,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                            className: "text-right",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-end gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        variant: "ghost",
                                                        size: "sm",
                                                        onClick: ()=>{
                                                            setEditingCapacity(capacity);
                                                            setDialogOpen(true);
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__["Edit"], {
                                                            className: "size-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                                            lineNumber: 189,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                                        lineNumber: 181,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        variant: "ghost",
                                                        size: "sm",
                                                        onClick: ()=>handleDelete(capacity.id),
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                            className: "size-4 text-red-500"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                                            lineNumber: 196,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                                        lineNumber: 191,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                                lineNumber: 180,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                            lineNumber: 179,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, capacity.id, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                    lineNumber: 170,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                            lineNumber: 168,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                    lineNumber: 158,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                lineNumber: 152,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
        lineNumber: 114,
        columnNumber: 5
    }, this);
}
_s(CapacitiesManager, "8HJLZTFLAiu7CZ0NJKNjTew+3GU=");
_c = CapacitiesManager;
function CapacityForm({ capacity, onSave, onCancel }) {
    _s1();
    const [resourceType, setResourceType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(capacity?.resource_type || 'room');
    const [name, setName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(capacity?.name || '');
    const [quantity, setQuantity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(capacity?.quantity || '');
    const [unit, setUnit] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(capacity?.unit || '');
    const [constraints, setConstraints] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(capacity?.constraints || '');
    const [notes, setNotes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(capacity?.notes || '');
    const handleSubmit = (e)=>{
        e.preventDefault();
        if (!name.trim()) {
            __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].error('Nome é obrigatório');
            return;
        }
        if (!quantity) {
            __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].error('Quantidade é obrigatória');
            return;
        }
        onSave({
            resourceType,
            name: name.trim(),
            quantity: parseInt(quantity),
            unit: unit.trim() || undefined,
            constraints: constraints.trim() || undefined,
            notes: notes.trim() || undefined
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        onSubmit: handleSubmit,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DialogHeader"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DialogTitle"], {
                        children: capacity ? 'Editar Capacidade' : 'Nova Capacidade Operacional'
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                        lineNumber: 249,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DialogDescription"], {
                        children: "Defina as informações da capacidade operacional"
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                        lineNumber: 252,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                lineNumber: 248,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-4 py-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Label"], {
                                htmlFor: "capacity-type",
                                children: "Tipo de Recurso *"
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                lineNumber: 258,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                id: "capacity-type",
                                value: resourceType,
                                onChange: (e)=>setResourceType(e.target.value),
                                className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "room",
                                        children: "Consultório"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                        lineNumber: 265,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "equipment",
                                        children: "Equipamento"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                        lineNumber: 266,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "staff_time",
                                        children: "Tempo de Equipe"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                        lineNumber: 267,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "other",
                                        children: "Outro"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                        lineNumber: 268,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                lineNumber: 259,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                        lineNumber: 257,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Label"], {
                                htmlFor: "capacity-name",
                                children: "Nome *"
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                lineNumber: 272,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Input"], {
                                id: "capacity-name",
                                value: name,
                                onChange: (e)=>setName(e.target.value),
                                placeholder: "Ex: Consultório 1",
                                required: true
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                lineNumber: 273,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                        lineNumber: 271,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Label"], {
                                        htmlFor: "capacity-quantity",
                                        children: "Quantidade *"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                        lineNumber: 283,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Input"], {
                                        id: "capacity-quantity",
                                        type: "number",
                                        min: "1",
                                        value: quantity,
                                        onChange: (e)=>setQuantity(e.target.value),
                                        placeholder: "Ex: 2",
                                        required: true
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                        lineNumber: 284,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                lineNumber: 282,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Label"], {
                                        htmlFor: "capacity-unit",
                                        children: "Unidade"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                        lineNumber: 295,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Input"], {
                                        id: "capacity-unit",
                                        value: unit,
                                        onChange: (e)=>setUnit(e.target.value),
                                        placeholder: "Ex: unidades, horas"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                        lineNumber: 296,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                lineNumber: 294,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                        lineNumber: 281,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Label"], {
                                htmlFor: "capacity-constraints",
                                children: "Restrições"
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                lineNumber: 305,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Textarea"], {
                                id: "capacity-constraints",
                                value: constraints,
                                onChange: (e)=>setConstraints(e.target.value),
                                placeholder: "Descreva restrições ou limitações",
                                className: "min-h-[80px]"
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                lineNumber: 306,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                        lineNumber: 304,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Label"], {
                                htmlFor: "capacity-notes",
                                children: "Notas"
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                lineNumber: 315,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Textarea"], {
                                id: "capacity-notes",
                                value: notes,
                                onChange: (e)=>setNotes(e.target.value),
                                placeholder: "Observações adicionais",
                                className: "min-h-[80px]"
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                                lineNumber: 316,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                        lineNumber: 314,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                lineNumber: 256,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DialogFooter"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                        type: "button",
                        variant: "outline",
                        onClick: onCancel,
                        children: "Cancelar"
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                        lineNumber: 326,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                        type: "submit",
                        children: "Salvar"
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                        lineNumber: 329,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
                lineNumber: 325,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx",
        lineNumber: 247,
        columnNumber: 5
    }, this);
}
_s1(CapacityForm, "LTipJMOrNOHfYgPEqyBTNTtTA2k=");
_c1 = CapacityForm;
var _c, _c1;
__turbopack_context__.k.register(_c, "CapacitiesManager");
__turbopack_context__.k.register(_c1, "CapacityForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Planeamento dental/planeamento-dental/pages/dossie/[dossierId]/operations.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DossierOperations
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/next/router.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$DossierSectionPage$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$entities$2f$RolesManager$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/RolesManager.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$entities$2f$TeamMembersManager$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/TeamMembersManager.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$entities$2f$CapacitiesManager$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/dossier/entities/CapacitiesManager.tsx [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
function DossierOperations() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { dossierId } = router.query;
    if (!dossierId || typeof dossierId !== 'string') {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$DossierSectionPage$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
        sectionCode: "OPERATIONS",
        entityBlocks: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$entities$2f$RolesManager$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/pages/dossie/[dossierId]/operations.tsx",
                    lineNumber: 20,
                    columnNumber: 11
                }, void 0),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$entities$2f$TeamMembersManager$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                    dossierId: dossierId
                }, void 0, false, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/pages/dossie/[dossierId]/operations.tsx",
                    lineNumber: 21,
                    columnNumber: 11
                }, void 0),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$entities$2f$CapacitiesManager$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                    dossierId: dossierId
                }, void 0, false, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/pages/dossie/[dossierId]/operations.tsx",
                    lineNumber: 22,
                    columnNumber: 11
                }, void 0)
            ]
        }, void 0, true)
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/pages/dossie/[dossierId]/operations.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
_s(DossierOperations, "fN7XvhJ+p5oE6+Xlo0NJmXpxjC8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = DossierOperations;
var _c;
__turbopack_context__.k.register(_c, "DossierOperations");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/Planeamento dental/planeamento-dental/pages/dossie/[dossierId]/operations.tsx [client] (ecmascript)\" } [client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const PAGE_PATH = "/dossie/[dossierId]/operations";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/Planeamento dental/planeamento-dental/pages/dossie/[dossierId]/operations.tsx [client] (ecmascript)");
    }
]);
// @ts-expect-error module.hot exists
if (module.hot) {
    // @ts-expect-error module.hot exists
    module.hot.dispose(function() {
        window.__NEXT_P.push([
            PAGE_PATH
        ]);
    });
}
}),
"[hmr-entry]/hmr-entry.js { ENTRY => \"[project]/Planeamento dental/planeamento-dental/pages/dossie/[dossierId]/operations.tsx\" }", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/Planeamento dental/planeamento-dental/pages/dossie/[dossierId]/operations.tsx [client] (ecmascript)\" } [client] (ecmascript)");
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__a5ebf433._.js.map