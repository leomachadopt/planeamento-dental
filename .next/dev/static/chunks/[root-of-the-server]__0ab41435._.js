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
"[project]/Planeamento dental/planeamento-dental/src/lib/utils.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
/* General utility functions (exposes cn) */ var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$tailwind$2d$merge$40$2$2e$6$2e$0$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/tailwind-merge@2.6.0/node_modules/tailwind-merge/dist/bundle-mjs.mjs [client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$tailwind$2d$merge$40$2$2e$6$2e$0$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
} // Add any other utility functions here
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
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/react@19.2.3/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
/* Card Component primitives - A component that displays a card - from shadcn/ui (exposes Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent) */ var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/react@19.2.3/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/utils.ts [client] (ecmascript)");
;
;
;
const Card = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
const CardHeader = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c2 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
const CardTitle = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c4 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
const CardDescription = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c6 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
const CardContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c8 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
const CardFooter = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c10 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
"[project]/Planeamento dental/planeamento-dental/src/components/ui/button.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/react@19.2.3/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
/* Button Component primitives - A component that displays a button - from shadcn/ui (exposes Button, buttonVariants) */ var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/react@19.2.3/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$slot$40$1$2e$2$2e$4_$40$types$2b$react$40$19$2e$2$2e$7_react$40$19$2e$2$2e$3$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/@radix-ui+react-slot@1.2.4_@types+react@19.2.7_react@19.2.3/node_modules/@radix-ui/react-slot/dist/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$class$2d$variance$2d$authority$40$0$2e$7$2e$1$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/class-variance-authority@0.7.1/node_modules/class-variance-authority/dist/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/utils.ts [client] (ecmascript)");
;
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$class$2d$variance$2d$authority$40$0$2e$7$2e$1$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["cva"])('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0', {
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
const Button = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, variant, size, asChild = false, ...props }, ref)=>{
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$slot$40$1$2e$2$2e$4_$40$types$2b$react$40$19$2e$2$2e$7_react$40$19$2e$2$2e$3$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Slot"] : 'button';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
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
"[project]/Planeamento dental/planeamento-dental/src/components/ui/badge.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* Badge Component primitives - A component that displays a badge - from shadcn/ui (exposes Badge, badgeVariants) */ __turbopack_context__.s([
    "Badge",
    ()=>Badge,
    "badgeVariants",
    ()=>badgeVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/react@19.2.3/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$class$2d$variance$2d$authority$40$0$2e$7$2e$1$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/class-variance-authority@0.7.1/node_modules/class-variance-authority/dist/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/utils.ts [client] (ecmascript)");
;
;
;
const badgeVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$class$2d$variance$2d$authority$40$0$2e$7$2e$1$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["cva"])('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-250 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2', {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/react@19.2.3/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
/* Dialog Component primitives - A component that displays a dialog (a modal that appears in the center of the screen) - from shadcn/ui (exposes Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose, DialogOverlay, DialogPortal) */ var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/react@19.2.3/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19$2e$2$2e$_juzpojomeklpv65yloxq5q56pi$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/@radix-ui+react-dialog@1.1.15_@types+react-dom@19.2.3_@types+react@19.2.7__@types+react@19.2._juzpojomeklpv65yloxq5q56pi/node_modules/@radix-ui/react-dialog/dist/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/x.js [client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/utils.ts [client] (ecmascript)");
;
;
;
;
;
const Dialog = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19$2e$2$2e$_juzpojomeklpv65yloxq5q56pi$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Root"];
const DialogTrigger = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19$2e$2$2e$_juzpojomeklpv65yloxq5q56pi$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Trigger"];
const DialogPortal = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19$2e$2$2e$_juzpojomeklpv65yloxq5q56pi$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Portal"];
const DialogClose = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19$2e$2$2e$_juzpojomeklpv65yloxq5q56pi$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Close"];
const DialogOverlay = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19$2e$2$2e$_juzpojomeklpv65yloxq5q56pi$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Overlay"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/dialog.tsx",
        lineNumber: 20,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c = DialogOverlay;
DialogOverlay.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19$2e$2$2e$_juzpojomeklpv65yloxq5q56pi$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Overlay"].displayName;
const DialogContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c1 = ({ className, children, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DialogPortal, {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DialogOverlay, {}, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/dialog.tsx",
                lineNumber: 36,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19$2e$2$2e$_juzpojomeklpv65yloxq5q56pi$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Content"], {
                ref: ref,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg overflow-y-auto max-h-screen', className),
                ...props,
                children: [
                    children,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19$2e$2$2e$_juzpojomeklpv65yloxq5q56pi$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Close"], {
                        className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/dialog.tsx",
                                lineNumber: 47,
                                columnNumber: 9
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
DialogContent.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19$2e$2$2e$_juzpojomeklpv65yloxq5q56pi$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Content"].displayName;
const DialogHeader = ({ className, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('flex flex-col space-y-1.5 text-center sm:text-left', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/dialog.tsx",
        lineNumber: 59,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c3 = DialogHeader;
DialogHeader.displayName = 'DialogHeader';
const DialogFooter = ({ className, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/dialog.tsx",
        lineNumber: 73,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c4 = DialogFooter;
DialogFooter.displayName = 'DialogFooter';
const DialogTitle = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c5 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19$2e$2$2e$_juzpojomeklpv65yloxq5q56pi$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Title"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('text-lg font-semibold leading-none tracking-tight', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/dialog.tsx",
        lineNumber: 87,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c6 = DialogTitle;
DialogTitle.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19$2e$2$2e$_juzpojomeklpv65yloxq5q56pi$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Title"].displayName;
const DialogDescription = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c7 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19$2e$2$2e$_juzpojomeklpv65yloxq5q56pi$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Description"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])('text-sm text-muted-foreground', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/dialog.tsx",
        lineNumber: 102,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c8 = DialogDescription;
DialogDescription.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19$2e$2$2e$_juzpojomeklpv65yloxq5q56pi$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Description"].displayName;
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
"[project]/Planeamento dental/planeamento-dental/src/components/ui/input.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Input",
    ()=>Input
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/react@19.2.3/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
/* Input Component - A component that displays an input - from shadcn/ui (exposes Input) */ var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/react@19.2.3/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/utils.ts [client] (ecmascript)");
;
;
;
const Input = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, type, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
"[project]/Planeamento dental/planeamento-dental/src/components/ui/label.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Label",
    ()=>Label
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/react@19.2.3/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
/* Label Component - A component that displays a label - from shadcn/ui (exposes Label) */ var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/react@19.2.3/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$label$40$2$2e$1$2e$8_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19$2e$2$2e$7_$5f$ggc7d2jno3gcorzflrswkya7gm$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/@radix-ui+react-label@2.1.8_@types+react-dom@19.2.3_@types+react@19.2.7__@types+react@19.2.7__ggc7d2jno3gcorzflrswkya7gm/node_modules/@radix-ui/react-label/dist/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$class$2d$variance$2d$authority$40$0$2e$7$2e$1$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/class-variance-authority@0.7.1/node_modules/class-variance-authority/dist/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/utils.ts [client] (ecmascript)");
;
;
;
;
;
const labelVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$class$2d$variance$2d$authority$40$0$2e$7$2e$1$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["cva"])('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70');
const Label = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$label$40$2$2e$1$2e$8_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19$2e$2$2e$7_$5f$ggc7d2jno3gcorzflrswkya7gm$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])(labelVariants(), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/label.tsx",
        lineNumber: 17,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = Label;
Label.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$label$40$2$2e$1$2e$8_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19$2e$2$2e$7_$5f$ggc7d2jno3gcorzflrswkya7gm$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Root"].displayName;
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Label$React.forwardRef");
__turbopack_context__.k.register(_c1, "Label");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
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
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/next@16.1.1_@babel+core@7.28.5_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
// Cliente API para comunicação com o backend
// No Next.js, variáveis de ambiente do cliente devem começar com NEXT_PUBLIC_
// Como as rotas de API são servidas diretamente pelo Next.js, usamos '/api' como padrão
const API_BASE_URL = typeof __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"] !== 'undefined' && ("TURBOPACK compile-time value", "/api") || '/api';
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
"[project]/Planeamento dental/planeamento-dental/src/stores/useAuthStore.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAuthStore",
    ()=>useAuthStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$zustand$40$4$2e$5$2e$7_$40$types$2b$react$40$19$2e$2$2e$7_react$40$19$2e$2$2e$3$2f$node_modules$2f$zustand$2f$esm$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/zustand@4.5.7_@types+react@19.2.7_react@19.2.3/node_modules/zustand/esm/index.mjs [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$zustand$40$4$2e$5$2e$7_$40$types$2b$react$40$19$2e$2$2e$7_react$40$19$2e$2$2e$3$2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/zustand@4.5.7_@types+react@19.2.7_react@19.2.3/node_modules/zustand/esm/middleware.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/api.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/sonner@2.0.7_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/sonner/dist/index.mjs [client] (ecmascript)");
;
;
;
;
const useAuthStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$zustand$40$4$2e$5$2e$7_$40$types$2b$react$40$19$2e$2$2e$7_react$40$19$2e$2$2e$3$2f$node_modules$2f$zustand$2f$esm$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$zustand$40$4$2e$5$2e$7_$40$types$2b$react$40$19$2e$2$2e$7_react$40$19$2e$2$2e$3$2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
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
                __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].success(`Bem-vindo, ${response.user.name}!`);
            } catch (error) {
                set({
                    isLoading: false
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].error(error.message || 'Erro ao fazer login');
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
                __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].success(`Conta criada com sucesso, ${response.user.name}!`);
            } catch (error) {
                set({
                    isLoading: false
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].error(error.message || 'Erro ao criar conta');
                throw error;
            }
        },
        logout: ()=>{
            set({
                user: null,
                token: null,
                isAuthenticated: false
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].success('Logout realizado com sucesso');
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
"[project]/Planeamento dental/planeamento-dental/pages/index.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Index
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/react@19.2.3/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/react@19.2.3/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/next@16.1.1_@babel+core@7.28.5_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/router.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/next@16.1.1_@babel+core@7.28.5_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/link.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/card.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/button.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/badge.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/dialog.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/input.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/label.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/file-text.js [client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2d$check$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpenCheck$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/book-open-check.js [client] (ecmascript) <export default as BookOpenCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/plus.js [client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/arrow-right.js [client] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/circle-check.js [client] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/clock.js [client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/circle-alert.js [client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/loader-circle.js [client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/api.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$stores$2f$useAuthStore$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/stores/useAuthStore.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$dossierService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/services/dossierService.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/sonner@2.0.7_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/sonner/dist/index.mjs [client] (ecmascript)");
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
;
;
;
function Index() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$stores$2f$useAuthStore$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useAuthStore"])();
    const [dossiers, setDossiers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [dossierReports, setDossierReports] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [isCreateDialogOpen, setIsCreateDialogOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [newDossierTitle, setNewDossierTitle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [creatingDossier, setCreatingDossier] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Index.useEffect": ()=>{
            loadDossiers();
        }
    }["Index.useEffect"], [
        user?.clinicId
    ]);
    const loadDossiers = async ()=>{
        if (!user?.clinicId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].getDossiers(user.clinicId);
            setDossiers(data);
            for (const dossier of data){
                try {
                    const reportsResponse = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["api"].getDossierReports(dossier.id);
                    setDossierReports((prev)=>({
                            ...prev,
                            [dossier.id]: reportsResponse
                        }));
                } catch (error) {
                // Ignorar erros de relatórios
                }
            }
        } catch (error) {
            console.error('Erro ao carregar dossiês:', error);
        } finally{
            setLoading(false);
        }
    };
    const getStatusBadge = (status)=>{
        switch(status){
            case 'finalized':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Badge"], {
                    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                            className: "size-3 mr-1"
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                            lineNumber: 105,
                            columnNumber: 13
                        }, this),
                        "Finalizado"
                    ]
                }, void 0, true, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                    lineNumber: 104,
                    columnNumber: 11
                }, this);
            case 'archived':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Badge"], {
                    variant: "outline",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                            className: "size-3 mr-1"
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                            lineNumber: 112,
                            columnNumber: 13
                        }, this),
                        "Arquivado"
                    ]
                }, void 0, true, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                    lineNumber: 111,
                    columnNumber: 11
                }, this);
            default:
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Badge"], {
                    variant: "outline",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                            className: "size-3 mr-1"
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                            lineNumber: 119,
                            columnNumber: 13
                        }, this),
                        "Em Edição"
                    ]
                }, void 0, true, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                    lineNumber: 118,
                    columnNumber: 11
                }, this);
        }
    };
    const getReportStatusBadge = (reportStatus)=>{
        if (!reportStatus) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Badge"], {
                variant: "outline",
                className: "text-xs",
                children: "Não gerado"
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                lineNumber: 129,
                columnNumber: 9
            }, this);
        }
        switch(reportStatus){
            case 'generated':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Badge"], {
                    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs",
                    children: "Gerado"
                }, void 0, false, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                    lineNumber: 138,
                    columnNumber: 11
                }, this);
            case 'stale':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Badge"], {
                    className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-xs",
                    children: "Desatualizado"
                }, void 0, false, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                    lineNumber: 144,
                    columnNumber: 11
                }, this);
            case 'error':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Badge"], {
                    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs",
                    children: "Erro"
                }, void 0, false, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                    lineNumber: 150,
                    columnNumber: 11
                }, this);
            default:
                return null;
        }
    };
    const handleCreateDossier = async ()=>{
        if (!newDossierTitle.trim()) {
            __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].error('Digite o título do dossiê');
            return;
        }
        if (!user?.clinicId) {
            __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].error('Selecione uma clínica primeiro');
            return;
        }
        setCreatingDossier(true);
        try {
            const newDossier = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$dossierService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["createDossier"])(user.clinicId, newDossierTitle.trim());
            setNewDossierTitle('');
            setIsCreateDialogOpen(false);
            __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].success('Dossiê criado com sucesso!');
            router.push(`/dossie/${newDossier.id}/identity`);
            await loadDossiers();
        } catch (error) {
            console.error('Erro ao criar dossiê:', error);
            __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].error(error.message || 'Erro ao criar dossiê');
        } finally{
            setCreatingDossier(false);
        }
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center min-h-[400px]",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                className: "size-8 animate-spin text-teal-600"
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                lineNumber: 189,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
            lineNumber: 188,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-8 animate-fade-in",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col md:flex-row md:items-center justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-3xl font-bold tracking-tight text-slate-900 dark:text-white",
                                children: "Centro de Documentação Estratégica"
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                lineNumber: 198,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-slate-500 mt-1 max-w-2xl",
                                children: "Gerencie seus dossiês estratégicos e visualize os relatórios gerados por IA para cada seção. Documente o negócio da sua clínica de forma estruturada e gere documentos formais."
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                lineNumber: 201,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                        lineNumber: 197,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Dialog"], {
                            open: isCreateDialogOpen,
                            onOpenChange: setIsCreateDialogOpen,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DialogTrigger"], {
                                    asChild: true,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                        className: "bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-200/50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                className: "mr-2 size-4"
                                            }, void 0, false, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                lineNumber: 212,
                                                columnNumber: 17
                                            }, this),
                                            "Novo Dossiê"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                        lineNumber: 209,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                    lineNumber: 208,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DialogContent"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DialogHeader"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DialogTitle"], {
                                                    children: "Criar Novo Dossiê"
                                                }, void 0, false, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                    lineNumber: 218,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DialogDescription"], {
                                                    children: "Crie um novo dossiê para documentar a estratégia da clínica. Cada dossiê representa um snapshot no tempo."
                                                }, void 0, false, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                    lineNumber: 219,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                            lineNumber: 217,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-4 py-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Label"], {
                                                        htmlFor: "dossier-title",
                                                        children: "Título do Dossiê"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                        lineNumber: 225,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        id: "dossier-title",
                                                        value: newDossierTitle,
                                                        onChange: (e)=>setNewDossierTitle(e.target.value),
                                                        placeholder: "Ex: Dossiê 2026 - Q1",
                                                        onKeyDown: (e)=>{
                                                            if (e.key === 'Enter') {
                                                                handleCreateDossier();
                                                            }
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                        lineNumber: 226,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                lineNumber: 224,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                            lineNumber: 223,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DialogFooter"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    variant: "outline",
                                                    onClick: ()=>setIsCreateDialogOpen(false),
                                                    children: "Cancelar"
                                                }, void 0, false, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                    lineNumber: 240,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    onClick: handleCreateDossier,
                                                    disabled: creatingDossier,
                                                    children: creatingDossier ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                                className: "mr-2 size-4 animate-spin"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                                lineNumber: 246,
                                                                columnNumber: 23
                                                            }, this),
                                                            "Criando..."
                                                        ]
                                                    }, void 0, true) : 'Criar Dossiê'
                                                }, void 0, false, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                    lineNumber: 243,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                            lineNumber: 239,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                    lineNumber: 216,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                            lineNumber: 207,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                        lineNumber: 206,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                lineNumber: 196,
                columnNumber: 7
            }, this),
            dossiers.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Card"], {
                className: "border-dashed",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardContent"], {
                    className: "text-center py-12",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2d$check$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpenCheck$3e$__["BookOpenCheck"], {
                            className: "size-16 mx-auto mb-4 text-slate-400"
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                            lineNumber: 262,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-xl font-semibold mb-2",
                            children: "Nenhum dossiê criado"
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                            lineNumber: 263,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-slate-500 mb-6",
                            children: "Comece criando um novo dossiê para documentar o negócio da sua clínica."
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                            lineNumber: 264,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: ()=>setIsCreateDialogOpen(true),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                    className: "mr-2 size-4"
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                    lineNumber: 268,
                                    columnNumber: 15
                                }, this),
                                "Criar Primeiro Dossiê"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                            lineNumber: 267,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                    lineNumber: 261,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                lineNumber: 260,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3",
                children: dossiers.map((dossier)=>{
                    const reports = dossierReports[dossier.id] || [];
                    const hasReports = reports.some((r)=>r.has_report);
                    const staleReports = reports.filter((r)=>r.report_status === 'stale').length;
                    const generatedReports = reports.filter((r)=>r.report_status === 'generated').length;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Card"], {
                        className: "shadow-sm hover:shadow-md transition-shadow",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-start justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2d$check$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpenCheck$3e$__["BookOpenCheck"], {
                                                            className: "size-5 text-teal-600"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                            lineNumber: 287,
                                                            columnNumber: 25
                                                        }, this),
                                                        dossier.title
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                    lineNumber: 286,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardDescription"], {
                                                    className: "mt-1",
                                                    children: [
                                                        "Criado em ",
                                                        new Date(dossier.created_at).toLocaleDateString('pt-PT')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                    lineNumber: 290,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                            lineNumber: 285,
                                            columnNumber: 21
                                        }, this),
                                        getStatusBadge(dossier.status)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                    lineNumber: 284,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                lineNumber: 283,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between text-sm",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-slate-600",
                                                        children: "Relatórios gerados:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                        lineNumber: 300,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-semibold",
                                                        children: [
                                                            generatedReports,
                                                            " de ",
                                                            reports.length
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                        lineNumber: 301,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                lineNumber: 299,
                                                columnNumber: 21
                                            }, this),
                                            staleReports > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 text-xs text-amber-600",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                                        className: "size-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                        lineNumber: 307,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: [
                                                            staleReports,
                                                            " relatório(s) desatualizado(s)"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                        lineNumber: 308,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                lineNumber: 306,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                        lineNumber: 298,
                                        columnNumber: 19
                                    }, this),
                                    reports.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-1 pt-2 border-t",
                                        children: [
                                            reports.slice(0, 3).map((report)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-between text-xs",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-slate-600 truncate",
                                                            children: report.section_name
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                            lineNumber: 317,
                                                            columnNumber: 27
                                                        }, this),
                                                        getReportStatusBadge(report.report_status)
                                                    ]
                                                }, report.section_code, true, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                    lineNumber: 316,
                                                    columnNumber: 25
                                                }, this)),
                                            reports.length > 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs text-slate-500 pt-1",
                                                children: [
                                                    "+",
                                                    reports.length - 3,
                                                    " mais seções"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                lineNumber: 322,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                        lineNumber: 314,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2 pt-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                                asChild: true,
                                                variant: "outline",
                                                className: "flex-1",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                                    href: `/dossie/${dossier.id}/identity`,
                                                    children: [
                                                        "Abrir Dossiê",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                            className: "ml-2 size-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                            lineNumber: 337,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                    lineNumber: 335,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                lineNumber: 330,
                                                columnNumber: 21
                                            }, this),
                                            hasReports && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                                asChild: true,
                                                variant: "ghost",
                                                size: "sm",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                                    href: `/dossie/${dossier.id}/relatorios`,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                                        className: "size-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                        lineNumber: 347,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                    lineNumber: 346,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                                lineNumber: 341,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                        lineNumber: 329,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                lineNumber: 297,
                                columnNumber: 17
                            }, this)
                        ]
                    }, dossier.id, true, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                        lineNumber: 282,
                        columnNumber: 15
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                lineNumber: 274,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Card"], {
                className: "mt-6 border-teal-100 bg-teal-50/50",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                            className: "flex items-center gap-2 text-teal-900",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                    className: "size-5"
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                    lineNumber: 362,
                                    columnNumber: 13
                                }, this),
                                "Sobre o Sistema de Documentação"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                            lineNumber: 361,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                        lineNumber: 360,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardContent"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-slate-700 leading-relaxed",
                            children: [
                                "Este sistema permite ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: "documentar e estruturar"
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                                    lineNumber: 368,
                                    columnNumber: 34
                                }, this),
                                " o pensamento estratégico da sua clínica. Cada dossiê contém seções para Identidade, Mercado, Oferta, Operações, Estratégia e Plano. Você pode preencher questionários, cadastrar entidades estruturadas e gerar relatórios descritivos via IA. O sistema gera documentos formais que podem ser exportados em PDF."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                            lineNumber: 367,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                        lineNumber: 366,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
                lineNumber: 359,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Planeamento dental/planeamento-dental/pages/index.tsx",
        lineNumber: 195,
        columnNumber: 5
    }, this);
}
_s(Index, "2VRLZ+z6OeSNB1nSW0sRSPnZHaE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$stores$2f$useAuthStore$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useAuthStore"]
    ];
});
_c = Index;
var _c;
__turbopack_context__.k.register(_c, "Index");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/Planeamento dental/planeamento-dental/pages/index.tsx [client] (ecmascript)\" } [client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const PAGE_PATH = "/";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/Planeamento dental/planeamento-dental/pages/index.tsx [client] (ecmascript)");
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
"[hmr-entry]/hmr-entry.js { ENTRY => \"[project]/Planeamento dental/planeamento-dental/pages/index\" }", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/Planeamento dental/planeamento-dental/pages/index.tsx [client] (ecmascript)\" } [client] (ecmascript)");
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__0ab41435._.js.map