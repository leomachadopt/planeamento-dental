module.exports = [
"[project]/Planeamento dental/planeamento-dental/src/hooks/useSectionData.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "useSectionData",
    ()=>useSectionData
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$dossierService$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/services/dossierService.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$sonner__$5b$external$5d$__$28$sonner$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$29$__ = __turbopack_context__.i("[externals]/sonner [external] (sonner, esm_import, [project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/sonner@2.0.7_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/sonner)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$sonner__$5b$external$5d$__$28$sonner$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$sonner__$5b$external$5d$__$28$sonner$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
function useSectionData(dossierId, sectionCode) {
    const [sectionData, setSectionData] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [completionPercent, setCompletionPercent] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(0);
    const refetch = async ()=>{
        if (!dossierId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$dossierService$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["getSectionData"])(dossierId, sectionCode);
            setSectionData(data);
            // Calcular completude
            const percent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$dossierService$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["calculateSectionCompletion"])(dossierId, sectionCode);
            setCompletionPercent(percent);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Erro ao carregar dados da seção');
            setError(error);
            console.error('Erro ao carregar dados da seção:', err);
            __TURBOPACK__imported__module__$5b$externals$5d2f$sonner__$5b$external$5d$__$28$sonner$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$29$__["toast"].error('Erro ao carregar dados da seção');
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (dossierId) {
            refetch();
        } else {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
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
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/Planeamento dental/planeamento-dental/src/hooks/useSectionReport.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "useSectionReport",
    ()=>useSectionReport
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/api.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$sonner__$5b$external$5d$__$28$sonner$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$29$__ = __turbopack_context__.i("[externals]/sonner [external] (sonner, esm_import, [project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/sonner@2.0.7_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/sonner)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$sonner__$5b$external$5d$__$28$sonner$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$sonner__$5b$external$5d$__$28$sonner$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
function useSectionReport(dossierId, sectionCode) {
    const [report, setReport] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [loadingReport, setLoadingReport] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [generatingReport, setGeneratingReport] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const hasFetchedRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(false);
    const refetchReport = async ()=>{
        if (!dossierId) return;
        setLoadingReport(true);
        try {
            const reportData = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["api"].getSectionReport(dossierId, sectionCode);
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
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        // Resetar flag quando dossierId ou sectionCode mudarem
        hasFetchedRef.current = false;
        if (dossierId) {
            refetchReport();
        }
    }, [
        dossierId,
        sectionCode
    ]);
    const handleGenerateReport = async ()=>{
        if (!dossierId) return;
        setGeneratingReport(true);
        try {
            const newReport = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["api"].generateSectionReport(dossierId, sectionCode);
            setReport(newReport);
            hasFetchedRef.current = true;
            __TURBOPACK__imported__module__$5b$externals$5d2f$sonner__$5b$external$5d$__$28$sonner$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$29$__["toast"].success('Relatório gerado com sucesso!');
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
                const errorReport = await __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["api"].getSectionReport(dossierId, sectionCode);
                if (errorReport?.status === 'error') {
                    setReport(errorReport);
                }
            } catch  {
            // Ignorar erro ao buscar relatório de erro
            }
            __TURBOPACK__imported__module__$5b$externals$5d2f$sonner__$5b$external$5d$__$28$sonner$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$29$__["toast"].error(errorMessage);
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
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/Planeamento dental/planeamento-dental/src/components/ui/card.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

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
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
/* Card Component primitives - A component that displays a card - from shadcn/ui (exposes Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent) */ var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/utils.ts [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const Card = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["cn"])('rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-250', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/card.tsx",
        lineNumber: 10,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
Card.displayName = 'Card';
const CardHeader = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["cn"])('flex flex-col space-y-1.5 p-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/card.tsx",
        lineNumber: 25,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
CardHeader.displayName = 'CardHeader';
const CardTitle = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["cn"])('text-2xl font-semibold leading-none tracking-tight', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/card.tsx",
        lineNumber: 37,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
CardTitle.displayName = 'CardTitle';
const CardDescription = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["cn"])('text-sm text-muted-foreground', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/card.tsx",
        lineNumber: 52,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
CardDescription.displayName = 'CardDescription';
const CardContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["cn"])('p-6 pt-0', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/card.tsx",
        lineNumber: 64,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
CardContent.displayName = 'CardContent';
const CardFooter = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["cn"])('flex items-center p-6 pt-0', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/card.tsx",
        lineNumber: 72,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
CardFooter.displayName = 'CardFooter';
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/Planeamento dental/planeamento-dental/src/components/ui/accordion.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

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
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
/* Accordion Component primitives - A component that displays a list of items in an accordion - from shadcn/ui (exposes Accordion, AccordionItem, AccordionTrigger, AccordionContent) */ var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$radix$2d$ui$2f$react$2d$accordion__$5b$external$5d$__$2840$radix$2d$ui$2f$react$2d$accordion$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$accordion$40$1$2e$2$2e$12_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19_dgnbb5c7m3j3qyaqghekauiple$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$accordion$29$__ = __turbopack_context__.i("[externals]/@radix-ui/react-accordion [external] (@radix-ui/react-accordion, esm_import, [project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/@radix-ui+react-accordion@1.2.12_@types+react-dom@19.2.3_@types+react@19.2.7__@types+react@19_dgnbb5c7m3j3qyaqghekauiple/node_modules/@radix-ui/react-accordion)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/chevron-down.js [ssr] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/utils.ts [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$radix$2d$ui$2f$react$2d$accordion__$5b$external$5d$__$2840$radix$2d$ui$2f$react$2d$accordion$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$accordion$40$1$2e$2$2e$12_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19_dgnbb5c7m3j3qyaqghekauiple$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$accordion$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$radix$2d$ui$2f$react$2d$accordion__$5b$external$5d$__$2840$radix$2d$ui$2f$react$2d$accordion$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$accordion$40$1$2e$2$2e$12_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19_dgnbb5c7m3j3qyaqghekauiple$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$accordion$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
const Accordion = __TURBOPACK__imported__module__$5b$externals$5d2f40$radix$2d$ui$2f$react$2d$accordion__$5b$external$5d$__$2840$radix$2d$ui$2f$react$2d$accordion$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$accordion$40$1$2e$2$2e$12_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19_dgnbb5c7m3j3qyaqghekauiple$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$accordion$29$__["Root"];
const AccordionItem = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f40$radix$2d$ui$2f$react$2d$accordion__$5b$external$5d$__$2840$radix$2d$ui$2f$react$2d$accordion$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$accordion$40$1$2e$2$2e$12_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19_dgnbb5c7m3j3qyaqghekauiple$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$accordion$29$__["Item"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["cn"])('border-b', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/accordion.tsx",
        lineNumber: 14,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
AccordionItem.displayName = 'AccordionItem';
const AccordionTrigger = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["forwardRef"](({ className, children, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f40$radix$2d$ui$2f$react$2d$accordion__$5b$external$5d$__$2840$radix$2d$ui$2f$react$2d$accordion$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$accordion$40$1$2e$2$2e$12_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19_dgnbb5c7m3j3qyaqghekauiple$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$accordion$29$__["Header"], {
        className: "flex",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f40$radix$2d$ui$2f$react$2d$accordion__$5b$external$5d$__$2840$radix$2d$ui$2f$react$2d$accordion$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$accordion$40$1$2e$2$2e$12_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19_dgnbb5c7m3j3qyaqghekauiple$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$accordion$29$__["Trigger"], {
            ref: ref,
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["cn"])('flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180', className),
            ...props,
            children: [
                children,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
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
AccordionTrigger.displayName = __TURBOPACK__imported__module__$5b$externals$5d2f40$radix$2d$ui$2f$react$2d$accordion__$5b$external$5d$__$2840$radix$2d$ui$2f$react$2d$accordion$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$accordion$40$1$2e$2$2e$12_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19_dgnbb5c7m3j3qyaqghekauiple$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$accordion$29$__["Trigger"].displayName;
const AccordionContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["forwardRef"](({ className, children, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f40$radix$2d$ui$2f$react$2d$accordion__$5b$external$5d$__$2840$radix$2d$ui$2f$react$2d$accordion$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$accordion$40$1$2e$2$2e$12_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19_dgnbb5c7m3j3qyaqghekauiple$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$accordion$29$__["Content"], {
        ref: ref,
        className: "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["cn"])('pb-4 pt-0', className),
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
AccordionContent.displayName = __TURBOPACK__imported__module__$5b$externals$5d2f40$radix$2d$ui$2f$react$2d$accordion__$5b$external$5d$__$2840$radix$2d$ui$2f$react$2d$accordion$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$accordion$40$1$2e$2$2e$12_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$19_dgnbb5c7m3j3qyaqghekauiple$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$accordion$29$__["Content"].displayName;
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/Planeamento dental/planeamento-dental/src/components/ui/textarea.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "Textarea",
    ()=>Textarea
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
/* Textarea Component - A component that displays a textarea - from shadcn/ui (exposes Textarea) */ var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/utils.ts [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const Textarea = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["forwardRef"](({ className, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("textarea", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["cn"])('flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', className),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/textarea.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
});
Textarea.displayName = 'Textarea';
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/Planeamento dental/planeamento-dental/src/components/ui/radio-group.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "RadioGroup",
    ()=>RadioGroup,
    "RadioGroupItem",
    ()=>RadioGroupItem
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
/* Radio Group Component primitives - A component that displays a radio group - from shadcn/ui (exposes RadioGroup, RadioGroupItem) */ var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$radix$2d$ui$2f$react$2d$radio$2d$group__$5b$external$5d$__$2840$radix$2d$ui$2f$react$2d$radio$2d$group$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$radio$2d$group$40$1$2e$3$2e$8_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$1_cjtgf3xmcqtfujhoownb73bnbi$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$radio$2d$group$29$__ = __turbopack_context__.i("[externals]/@radix-ui/react-radio-group [external] (@radix-ui/react-radio-group, esm_import, [project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/@radix-ui+react-radio-group@1.3.8_@types+react-dom@19.2.3_@types+react@19.2.7__@types+react@1_cjtgf3xmcqtfujhoownb73bnbi/node_modules/@radix-ui/react-radio-group)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/circle.js [ssr] (ecmascript) <export default as Circle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/utils.ts [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$radix$2d$ui$2f$react$2d$radio$2d$group__$5b$external$5d$__$2840$radix$2d$ui$2f$react$2d$radio$2d$group$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$radio$2d$group$40$1$2e$3$2e$8_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$1_cjtgf3xmcqtfujhoownb73bnbi$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$radio$2d$group$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$radix$2d$ui$2f$react$2d$radio$2d$group__$5b$external$5d$__$2840$radix$2d$ui$2f$react$2d$radio$2d$group$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$radio$2d$group$40$1$2e$3$2e$8_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$1_cjtgf3xmcqtfujhoownb73bnbi$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$radio$2d$group$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
const RadioGroup = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["forwardRef"](({ className, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f40$radix$2d$ui$2f$react$2d$radio$2d$group__$5b$external$5d$__$2840$radix$2d$ui$2f$react$2d$radio$2d$group$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$radio$2d$group$40$1$2e$3$2e$8_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$1_cjtgf3xmcqtfujhoownb73bnbi$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$radio$2d$group$29$__["Root"], {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["cn"])('grid gap-2', className),
        ...props,
        ref: ref
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/ui/radio-group.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
});
RadioGroup.displayName = __TURBOPACK__imported__module__$5b$externals$5d2f40$radix$2d$ui$2f$react$2d$radio$2d$group__$5b$external$5d$__$2840$radix$2d$ui$2f$react$2d$radio$2d$group$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$radio$2d$group$40$1$2e$3$2e$8_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$1_cjtgf3xmcqtfujhoownb73bnbi$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$radio$2d$group$29$__["Root"].displayName;
const RadioGroupItem = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["forwardRef"](({ className, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f40$radix$2d$ui$2f$react$2d$radio$2d$group__$5b$external$5d$__$2840$radix$2d$ui$2f$react$2d$radio$2d$group$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$radio$2d$group$40$1$2e$3$2e$8_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$1_cjtgf3xmcqtfujhoownb73bnbi$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$radio$2d$group$29$__["Item"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$utils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["cn"])('aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f40$radix$2d$ui$2f$react$2d$radio$2d$group__$5b$external$5d$__$2840$radix$2d$ui$2f$react$2d$radio$2d$group$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$radio$2d$group$40$1$2e$3$2e$8_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$1_cjtgf3xmcqtfujhoownb73bnbi$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$radio$2d$group$29$__["Indicator"], {
            className: "flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__["Circle"], {
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
RadioGroupItem.displayName = __TURBOPACK__imported__module__$5b$externals$5d2f40$radix$2d$ui$2f$react$2d$radio$2d$group__$5b$external$5d$__$2840$radix$2d$ui$2f$react$2d$radio$2d$group$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$radio$2d$group$40$1$2e$3$2e$8_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$7_$5f40$types$2b$react$40$1_cjtgf3xmcqtfujhoownb73bnbi$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$radio$2d$group$29$__["Item"].displayName;
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionRenderer.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>QuestionRenderer
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/input.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/textarea.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/label.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$radio$2d$group$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/radio-group.tsx [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$radio$2d$group$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$radio$2d$group$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Textarea"], {
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
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$radio$2d$group$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["RadioGroup"], {
                value: answer.valueText || '',
                onValueChange: (value)=>onChange({
                        ...answer,
                        valueText: value
                    }),
                children: question.options?.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "flex items-center space-x-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$radio$2d$group$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["RadioGroupItem"], {
                                value: option.value,
                                id: option.id
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionRenderer.tsx",
                                lineNumber: 59,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Label"], {
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
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Input"], {
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
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/Planeamento dental/planeamento-dental/src/lib/identity-questions-context.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>QuestionWizard
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/chevron-left.js [ssr] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/chevron-right.js [ssr] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/info.js [ssr] (ecmascript) <export default as Info>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/circle-check.js [ssr] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/circle-x.js [ssr] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [ssr] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/arrow-left.js [ssr] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/button.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/card.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$progress$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/progress.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/badge.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$separator$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/separator.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/accordion.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$QuestionRenderer$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionRenderer.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$identity$2d$questions$2d$context$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/identity-questions-context.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/lib/api.ts [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$progress$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$separator$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$QuestionRenderer$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$progress$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$separator$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$QuestionRenderer$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
function QuestionWizard({ questionSets, answersMap, savingAnswers, onAnswerChange, sectionCode }) {
    // Estado para controlar navegação hierárquica
    const [selectedQuestionSetId, setSelectedQuestionSetId] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(0);
    // Ordenar questionSets por ordem (se houver)
    const sortedQuestionSets = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useMemo"])(()=>{
        return [
            ...questionSets
        ].sort((a, b)=>{
            // Se houver ordem nas perguntas, usar a primeira pergunta como referência
            const aFirstOrder = a.questions[0]?.order_index || 0;
            const bFirstOrder = b.questions[0]?.order_index || 0;
            return aFirstOrder - bFirstOrder;
        });
    }, [
        questionSets
    ]);
    // QuestionSet atual selecionado
    const currentQuestionSet = selectedQuestionSetId ? sortedQuestionSets.find((qs)=>qs.id === selectedQuestionSetId) : null;
    // Perguntas do questionSet atual, ordenadas
    const currentQuestions = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useMemo"])(()=>{
        if (!currentQuestionSet) return [];
        return [
            ...currentQuestionSet.questions
        ].sort((a, b)=>a.order_index - b.order_index);
    }, [
        currentQuestionSet
    ]);
    // Pergunta atual
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const currentAnswer = currentQuestion ? answersMap[currentQuestion.id] || {} : {};
    const isSaving = currentQuestion ? savingAnswers.has(currentQuestion.id) : false;
    // Estado para contexto da pergunta (buscar do banco)
    const [questionContext, setQuestionContext] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(undefined);
    const [loadingContext, setLoadingContext] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    // Buscar contexto do banco de dados
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (currentQuestion?.id) {
            console.log('🔍 Carregando contexto para pergunta:', currentQuestion.code, currentQuestion.id);
            setLoadingContext(true);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$api$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["fetchAPI"])(`/questions/${currentQuestion.id}/context`).then((data)=>{
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
                        const hardcodedContext = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$identity$2d$questions$2d$context$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["identityQuestionsContext"][currentQuestion.code];
                        console.log('📚 Usando contexto hardcoded:', hardcodedContext ? 'encontrado' : 'não encontrado');
                        setQuestionContext(hardcodedContext);
                    } else {
                        setQuestionContext(undefined);
                    }
                }
            }).catch((error)=>{
                console.error('❌ Erro ao buscar contexto:', error);
                // Em caso de erro, usar fallback hardcoded
                if (sectionCode === 'IDENTITY' && currentQuestion?.code) {
                    const hardcodedContext = __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$lib$2f$identity$2d$questions$2d$context$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["identityQuestionsContext"][currentQuestion.code];
                    console.log('📚 Erro no fetch, usando contexto hardcoded:', hardcodedContext ? 'encontrado' : 'não encontrado');
                    setQuestionContext(hardcodedContext);
                } else {
                    setQuestionContext(undefined);
                }
            }).finally(()=>{
                console.log('🏁 Carregamento de contexto finalizado');
                setLoadingContext(false);
            });
        } else {
            setQuestionContext(undefined);
        }
    }, [
        currentQuestion?.id,
        currentQuestion?.code,
        sectionCode
    ]);
    // Progresso dentro do questionSet atual
    const questionProgress = currentQuestions.length > 0 ? (currentQuestionIndex + 1) / currentQuestions.length * 100 : 0;
    // Progresso geral (todas as perguntas de todos os questionSets)
    const totalQuestions = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useMemo"])(()=>{
        return questionSets.reduce((sum, qs)=>sum + qs.questions.length, 0);
    }, [
        questionSets
    ]);
    const answeredQuestions = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useMemo"])(()=>{
        return Object.keys(answersMap).filter((qId)=>{
            const answer = answersMap[qId];
            return answer?.valueText || answer?.valueNumber !== undefined || answer?.valueJson && Object.keys(answer.valueJson).length > 0;
        }).length;
    }, [
        answersMap
    ]);
    const overallProgress = totalQuestions > 0 ? answeredQuestions / totalQuestions * 100 : 0;
    // Selecionar primeiro questionSet automaticamente se nenhum estiver selecionado
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (!selectedQuestionSetId && sortedQuestionSets.length > 0) {
            setSelectedQuestionSetId(sortedQuestionSets[0].id);
            setCurrentQuestionIndex(0);
        }
    }, [
        selectedQuestionSetId,
        sortedQuestionSets
    ]);
    // Resetar índice da pergunta quando mudar de questionSet
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        setCurrentQuestionIndex(0);
    }, [
        selectedQuestionSetId
    ]);
    const goToQuestionSet = (questionSetId)=>{
        setSelectedQuestionSetId(questionSetId);
        setCurrentQuestionIndex(0);
        // Scroll apenas quando mudar de questionSet (seção)
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    };
    const goBackToQuestionSets = ()=>{
        setSelectedQuestionSetId(null);
        setCurrentQuestionIndex(0);
        // Scroll apenas quando voltar para seleção de questionSets
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
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
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "space-y-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Card"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                                        children: "Selecione uma seção para começar"
                                    }, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                        lineNumber: 220,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Badge"], {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "mt-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$progress$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Progress"], {
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
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "grid gap-4 md:grid-cols-2",
                    children: sortedQuestionSets.map((questionSet)=>{
                        const questionsInSet = questionSet.questions.length;
                        const answeredInSet = questionSet.questions.filter((q)=>{
                            const answer = answersMap[q.id];
                            return answer?.valueText || answer?.valueNumber !== undefined || answer?.valueJson && Object.keys(answer.valueJson).length > 0;
                        }).length;
                        const setProgress = questionsInSet > 0 ? answeredInSet / questionsInSet * 100 : 0;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Card"], {
                            className: "cursor-pointer hover:border-teal-400 transition-colors",
                            onClick: ()=>goToQuestionSet(questionSet.id),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "flex items-start justify-between",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: "flex-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                                                            className: "text-lg",
                                                            children: questionSet.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                            lineNumber: 256,
                                                            columnNumber: 23
                                                        }, this),
                                                        questionSet.subsection_name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CardDescription"], {
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
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Badge"], {
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
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "mt-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$progress$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Progress"], {
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
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
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
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Card"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                className: "pt-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "text-center text-slate-500",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            children: "Nenhuma pergunta encontrada nesta seção"
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                            lineNumber: 289,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "outline",
                            onClick: goBackToQuestionSets,
                            className: "mt-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Card"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2 mb-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                    variant: "ghost",
                                                    size: "sm",
                                                    onClick: goBackToQuestionSets,
                                                    className: "h-8 w-8 p-0",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
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
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
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
                                        currentQuestionSet.subsection_name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CardDescription"], {
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
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Badge"], {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "mt-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$progress$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Progress"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Card"], {
                className: "border-2 border-teal-200 dark:border-teal-800",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "flex items-start justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                                            className: "text-2xl mb-2",
                                            children: [
                                                currentQuestion.text,
                                                currentQuestion.required && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
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
                                        currentQuestion.help_text && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CardDescription"], {
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
                                isSaving && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "ml-4",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                        className: "space-y-6",
                        children: [
                            loadingContext && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "text-center text-slate-500 text-sm py-4",
                                children: "Carregando contexto..."
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                lineNumber: 368,
                                columnNumber: 13
                            }, this),
                            !loadingContext && questionContext && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "flex items-start gap-2 mb-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
                                                className: "size-5 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0"
                                            }, void 0, false, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                lineNumber: 373,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Accordion"], {
                                        type: "multiple",
                                        className: "w-full",
                                        defaultValue: [
                                            'why'
                                        ],
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["AccordionItem"], {
                                                value: "why",
                                                className: "border-b border-slate-200 dark:border-slate-700",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["AccordionTrigger"], {
                                                        className: "text-left hover:no-underline",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
                                                                    className: "size-4 text-teal-600 dark:text-teal-400"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                                    lineNumber: 384,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
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
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["AccordionContent"], {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
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
                                            questionContext.consequences && questionContext.consequences.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["AccordionItem"], {
                                                value: "consequences",
                                                className: "border-b border-slate-200 dark:border-slate-700",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["AccordionTrigger"], {
                                                        className: "text-left hover:no-underline",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                                                    className: "size-4 text-amber-600"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                                    lineNumber: 402,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
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
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["AccordionContent"], {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("ul", {
                                                            className: "list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300 pt-2",
                                                            children: questionContext.consequences.map((consequence, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
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
                                            questionContext.howToAnswer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["AccordionItem"], {
                                                value: "howToAnswer",
                                                className: "border-b border-slate-200 dark:border-slate-700",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["AccordionTrigger"], {
                                                        className: "text-left hover:no-underline",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
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
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["AccordionContent"], {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
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
                                            questionContext.goodExamples && questionContext.goodExamples.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["AccordionItem"], {
                                                value: "goodExamples",
                                                className: "border-b border-slate-200 dark:border-slate-700",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["AccordionTrigger"], {
                                                        className: "text-left hover:no-underline",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                                                    className: "size-4 text-green-600"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                                    lineNumber: 439,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
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
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["AccordionContent"], {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            className: "space-y-2 pt-2",
                                                            children: questionContext.goodExamples.map((example, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
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
                                            questionContext.badExamples && questionContext.badExamples.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["AccordionItem"], {
                                                value: "badExamples",
                                                className: "border-b-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["AccordionTrigger"], {
                                                        className: "text-left hover:no-underline",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                                                    className: "size-4 text-red-600"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                                    lineNumber: 465,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
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
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["AccordionContent"], {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            className: "space-y-2 pt-2",
                                                            children: questionContext.badExamples.map((example, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$QuestionRenderer$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Card"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                    className: "pt-6",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "outline",
                                        onClick: goToPreviousQuestion,
                                        disabled: currentQuestionIndex === 0,
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                        onClick: ()=>{
                                            if (currentQuestionIndex === currentQuestions.length - 1) {
                                                // Última pergunta: rolar para o relatório
                                                const reportSection = document.getElementById('section-report');
                                                if (reportSection) {
                                                    reportSection.scrollIntoView({
                                                        behavior: 'smooth',
                                                        block: 'start'
                                                    });
                                                }
                                            } else {
                                                // Não é última pergunta: ir para próxima
                                                goToNextQuestion();
                                            }
                                        },
                                        className: "flex items-center gap-2",
                                        children: [
                                            currentQuestionIndex === currentQuestions.length - 1 ? 'Concluir Seção' : 'Próxima pergunta',
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                className: "size-4"
                                            }, void 0, false, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                lineNumber: 538,
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
                            sortedQuestionSets.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$separator$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Separator"], {}, void 0, false, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                        lineNumber: 545,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between text-sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "ghost",
                                                size: "sm",
                                                onClick: goToPreviousQuestionSet,
                                                disabled: sortedQuestionSets.findIndex((qs)=>qs.id === currentQuestionSet.id) === 0,
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                                        className: "size-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                        lineNumber: 556,
                                                        columnNumber: 21
                                                    }, this),
                                                    "Seção anterior"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                lineNumber: 547,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
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
                                                lineNumber: 560,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "ghost",
                                                size: "sm",
                                                onClick: goToNextQuestionSet,
                                                disabled: sortedQuestionSets.findIndex((qs)=>qs.id === currentQuestionSet.id) === sortedQuestionSets.length - 1,
                                                className: "flex items-center gap-2",
                                                children: [
                                                    "Próxima seção",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                        className: "size-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                        lineNumber: 577,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                                lineNumber: 566,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx",
                                        lineNumber: 546,
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
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>MarkdownRenderer
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2d$markdown__$5b$external$5d$__$28$react$2d$markdown$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$2d$markdown$40$10$2e$1$2e$0_$40$types$2b$react$40$19$2e$2$2e$7_react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2d$markdown$29$__ = __turbopack_context__.i("[externals]/react-markdown [external] (react-markdown, esm_import, [project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/react-markdown@10.1.0_@types+react@19.2.7_react@19.2.3/node_modules/react-markdown)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$react$2d$markdown__$5b$external$5d$__$28$react$2d$markdown$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$2d$markdown$40$10$2e$1$2e$0_$40$types$2b$react$40$19$2e$2$2e$7_react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2d$markdown$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$react$2d$markdown__$5b$external$5d$__$28$react$2d$markdown$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$2d$markdown$40$10$2e$1$2e$0_$40$types$2b$react$40$19$2e$2$2e$7_react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2d$markdown$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function MarkdownRenderer({ content, className = '' }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: `prose prose-slate dark:prose-invert max-w-none ${className}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2d$markdown__$5b$external$5d$__$28$react$2d$markdown$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$react$2d$markdown$40$10$2e$1$2e$0_$40$types$2b$react$40$19$2e$2$2e$7_react$40$19$2e$2$2e$3$2f$node_modules$2f$react$2d$markdown$29$__["default"], {
            components: {
                h1: ({ node, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                        className: "text-3xl font-bold mt-6 mb-4 text-slate-900 dark:text-slate-100",
                        ...props
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
                        lineNumber: 15,
                        columnNumber: 13
                    }, void 0),
                h2: ({ node, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-semibold mt-5 mb-3 text-slate-800 dark:text-slate-200",
                        ...props
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
                        lineNumber: 18,
                        columnNumber: 13
                    }, void 0),
                h3: ({ node, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                        className: "text-xl font-semibold mt-4 mb-2 text-slate-700 dark:text-slate-300",
                        ...props
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
                        lineNumber: 21,
                        columnNumber: 13
                    }, void 0),
                p: ({ node, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        className: "mb-4 text-slate-700 dark:text-slate-300 leading-relaxed",
                        ...props
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
                        lineNumber: 24,
                        columnNumber: 13
                    }, void 0),
                ul: ({ node, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("ul", {
                        className: "list-disc list-inside mb-4 space-y-2 text-slate-700 dark:text-slate-300",
                        ...props
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
                        lineNumber: 27,
                        columnNumber: 13
                    }, void 0),
                ol: ({ node, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("ol", {
                        className: "list-decimal list-inside mb-4 space-y-2 text-slate-700 dark:text-slate-300",
                        ...props
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
                        lineNumber: 30,
                        columnNumber: 13
                    }, void 0),
                li: ({ node, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
                        className: "ml-4 text-slate-700 dark:text-slate-300",
                        ...props
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
                        lineNumber: 33,
                        columnNumber: 13
                    }, void 0),
                blockquote: ({ node, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("blockquote", {
                        className: "border-l-4 border-teal-500 pl-4 italic my-4 text-slate-600 dark:text-slate-400",
                        ...props
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
                        lineNumber: 36,
                        columnNumber: 13
                    }, void 0),
                code: ({ node, inline, ...props })=>inline ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("code", {
                        className: "bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono text-slate-900 dark:text-slate-100",
                        ...props
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
                        lineNumber: 43,
                        columnNumber: 15
                    }, void 0) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("code", {
                        className: "block bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto text-sm font-mono text-slate-900 dark:text-slate-100",
                        ...props
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
                        lineNumber: 48,
                        columnNumber: 15
                    }, void 0),
                strong: ({ node, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                        className: "font-bold text-slate-900 dark:text-slate-100",
                        ...props
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
                        lineNumber: 54,
                        columnNumber: 13
                    }, void 0),
                em: ({ node, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("em", {
                        className: "italic text-slate-800 dark:text-slate-200",
                        ...props
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx",
                        lineNumber: 57,
                        columnNumber: 13
                    }, void 0),
                a: ({ node, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
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
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>SectionReportCard
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/card.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/button.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/badge.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/file-text.js [ssr] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [ssr] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/loader-circle.js [ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/circle-alert.js [ssr] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/download.js [ssr] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$MarkdownRenderer$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/MarkdownRenderer.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$jspdf__$5b$external$5d$__$28$jspdf$2c$__cjs$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$jspdf$40$4$2e$0$2e$0$2f$node_modules$2f$jspdf$29$__ = __turbopack_context__.i("[externals]/jspdf [external] (jspdf, cjs, [project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/jspdf@4.0.0/node_modules/jspdf)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$html2canvas__$5b$external$5d$__$28$html2canvas$2c$__cjs$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$html2canvas$40$1$2e$4$2e$1$2f$node_modules$2f$html2canvas$29$__ = __turbopack_context__.i("[externals]/html2canvas [external] (html2canvas, cjs, [project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/html2canvas@1.4.1/node_modules/html2canvas)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$sonner__$5b$external$5d$__$28$sonner$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$29$__ = __turbopack_context__.i("[externals]/sonner [external] (sonner, esm_import, [project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/sonner@2.0.7_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/sonner)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$MarkdownRenderer$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$sonner__$5b$external$5d$__$28$sonner$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$MarkdownRenderer$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$sonner__$5b$external$5d$__$28$sonner$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
function SectionReportCard({ report, loading, generating, onGenerate, sectionCode, sectionTitle }) {
    const displayTitle = sectionTitle || 'Relatório desta Seção';
    const [exporting, setExporting] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const handleExportPDF = async ()=>{
        if (!report || !report.report_markdown) {
            __TURBOPACK__imported__module__$5b$externals$5d2f$sonner__$5b$external$5d$__$28$sonner$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$29$__["toast"].error('Nenhum relatório para exportar');
            return;
        }
        setExporting(true);
        __TURBOPACK__imported__module__$5b$externals$5d2f$sonner__$5b$external$5d$__$28$sonner$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$29$__["toast"].info('Preparando PDF...');
        try {
            // Capturar o conteúdo do relatório
            const reportElement = document.getElementById(`report-content-${sectionCode}`);
            if (!reportElement) {
                throw new Error('Conteúdo do relatório não encontrado');
            }
            // Adicionar classe para estilos de exportação (remove bordas coloridas)
            reportElement.classList.add('pdf-export-mode');
            // Converter para canvas com otimizações para tamanho menor
            const canvas = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$html2canvas__$5b$external$5d$__$28$html2canvas$2c$__cjs$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$html2canvas$40$1$2e$4$2e$1$2f$node_modules$2f$html2canvas$29$__["default"])(reportElement, {
                scale: 1.5,
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            // Remover classe de exportação
            reportElement.classList.remove('pdf-export-mode');
            // Criar PDF
            // Usar JPEG com compressão em vez de PNG (reduz tamanho significativamente)
            const imgData = canvas.toDataURL('image/jpeg', 0.85);
            const pdf = new __TURBOPACK__imported__module__$5b$externals$5d2f$jspdf__$5b$external$5d$__$28$jspdf$2c$__cjs$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$jspdf$40$4$2e$0$2e$0$2f$node_modules$2f$jspdf$29$__["default"]({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });
            const imgWidth = 210 // A4 width in mm
            ;
            const pageHeight = 297 // A4 height in mm
            ;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;
            // Adicionar primeira página com compressão
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
            heightLeft -= pageHeight;
            // Adicionar páginas adicionais se necessário
            while(heightLeft > 0){
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
                heightLeft -= pageHeight;
            }
            // Salvar PDF
            const fileName = `relatorio-${sectionCode.toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);
            __TURBOPACK__imported__module__$5b$externals$5d2f$sonner__$5b$external$5d$__$28$sonner$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$29$__["toast"].success('PDF exportado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            __TURBOPACK__imported__module__$5b$externals$5d2f$sonner__$5b$external$5d$__$28$sonner$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$29$__["toast"].error('Erro ao exportar PDF');
            // Garantir que a classe é removida mesmo em caso de erro
            const reportElement = document.getElementById(`report-content-${sectionCode}`);
            if (reportElement) {
                reportElement.classList.remove('pdf-export-mode');
            }
        } finally{
            setExporting(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Card"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "flex justify-between items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                            className: "size-5"
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                            lineNumber: 119,
                                            columnNumber: 15
                                        }, this),
                                        displayTitle
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                    lineNumber: 118,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CardDescription"], {
                                    children: "Relatório gerado por IA com análise e insights sobre esta seção"
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                    lineNumber: 122,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                            lineNumber: 117,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "flex gap-2",
                            children: [
                                report && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: handleExportPDF,
                                    disabled: exporting,
                                    variant: "outline",
                                    size: "default",
                                    children: exporting ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                className: "mr-2 size-4 animate-spin"
                                            }, void 0, false, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                lineNumber: 136,
                                                columnNumber: 21
                                            }, this),
                                            "Exportando..."
                                        ]
                                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                                className: "mr-2 size-4"
                                            }, void 0, false, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                lineNumber: 141,
                                                columnNumber: 21
                                            }, this),
                                            "Exportar PDF"
                                        ]
                                    }, void 0, true)
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                    lineNumber: 128,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: onGenerate,
                                    disabled: generating,
                                    variant: report ? 'outline' : 'default',
                                    children: generating ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                className: "mr-2 size-4 animate-spin"
                                            }, void 0, false, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                lineNumber: 154,
                                                columnNumber: 19
                                            }, this),
                                            "Gerando..."
                                        ]
                                    }, void 0, true) : report ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                className: "mr-2 size-4"
                                            }, void 0, false, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                lineNumber: 159,
                                                columnNumber: 19
                                            }, this),
                                            "Regenerar"
                                        ]
                                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                                className: "mr-2 size-4"
                                            }, void 0, false, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                lineNumber: 164,
                                                columnNumber: 19
                                            }, this),
                                            "Gerar Relatório"
                                        ]
                                    }, void 0, true)
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                    lineNumber: 147,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                            lineNumber: 126,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                    lineNumber: 116,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                lineNumber: 115,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-center py-8",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                        className: "size-6 animate-spin text-teal-600"
                    }, void 0, false, {
                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                        lineNumber: 175,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                    lineNumber: 174,
                    columnNumber: 11
                }, this) : report ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    id: `report-content-${sectionCode}`,
                    className: "space-y-6",
                    children: [
                        report.status === 'error' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                    className: "size-5 text-red-600 dark:text-red-400"
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                    lineNumber: 181,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-medium text-red-800 dark:text-red-200",
                                            children: "Erro ao gerar relatório"
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                            lineNumber: 183,
                                            columnNumber: 19
                                        }, this),
                                        report.error_message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-red-600 dark:text-red-400 mt-1",
                                            children: report.error_message
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                            lineNumber: 187,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-red-600 dark:text-red-400 mt-1",
                                            children: "Tente regenerar o relatório."
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                            lineNumber: 191,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                    lineNumber: 182,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                            lineNumber: 180,
                            columnNumber: 15
                        }, this),
                        report.status === 'stale' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                    className: "size-5 text-amber-600 dark:text-amber-400"
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                    lineNumber: 200,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-amber-800 dark:text-amber-200",
                                    children: "Este relatório está desatualizado. Os dados da seção foram alterados desde a última geração."
                                }, void 0, false, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                    lineNumber: 201,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                            lineNumber: 199,
                            columnNumber: 15
                        }, this),
                        report.report_markdown && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "prose prose-slate dark:prose-invert max-w-none",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$MarkdownRenderer$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                content: report.report_markdown
                            }, void 0, false, {
                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                lineNumber: 210,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                            lineNumber: 209,
                            columnNumber: 15
                        }, this),
                        report.insights && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6",
                            children: [
                                report.insights.identity_summary && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "space-y-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold text-slate-900 dark:text-slate-100",
                                            children: "Resumo da Identidade"
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                            lineNumber: 221,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "grid gap-4 md:grid-cols-2",
                                            children: [
                                                report.insights.identity_summary.purpose && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: "p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                            className: "text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1",
                                                            children: "Propósito"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                            lineNumber: 225,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                            className: "text-sm text-slate-700 dark:text-slate-300",
                                                            children: report.insights.identity_summary.purpose
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                            lineNumber: 226,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                    lineNumber: 224,
                                                    columnNumber: 25
                                                }, this),
                                                report.insights.identity_summary.vision && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: "p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                            className: "text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1",
                                                            children: "Visão"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                            lineNumber: 231,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                            className: "text-sm text-slate-700 dark:text-slate-300",
                                                            children: report.insights.identity_summary.vision
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                            lineNumber: 232,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                    lineNumber: 230,
                                                    columnNumber: 25
                                                }, this),
                                                report.insights.identity_summary.priority_audience && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: "p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                            className: "text-xs font-semibold text-green-600 dark:text-green-400 mb-1",
                                                            children: "Público Prioritário"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                            lineNumber: 237,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                            className: "text-sm text-slate-700 dark:text-slate-300",
                                                            children: report.insights.identity_summary.priority_audience
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                            lineNumber: 238,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                    lineNumber: 236,
                                                    columnNumber: 25
                                                }, this),
                                                report.insights.identity_summary.positioning && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: "p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                            className: "text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1",
                                                            children: "Posicionamento"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                            lineNumber: 243,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                            className: "text-sm text-slate-700 dark:text-slate-300",
                                                            children: report.insights.identity_summary.positioning
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                            lineNumber: 244,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                    lineNumber: 242,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                            lineNumber: 222,
                                            columnNumber: 21
                                        }, this),
                                        report.insights.identity_summary.values && report.insights.identity_summary.values.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2",
                                                    children: "Valores"
                                                }, void 0, false, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                    lineNumber: 250,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-wrap gap-2",
                                                    children: report.insights.identity_summary.values.map((value, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Badge"], {
                                                            variant: "outline",
                                                            className: "bg-white dark:bg-slate-800",
                                                            children: value
                                                        }, idx, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                            lineNumber: 253,
                                                            columnNumber: 29
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                    lineNumber: 251,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                            lineNumber: 249,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                    lineNumber: 220,
                                    columnNumber: 19
                                }, this),
                                report.insights.alerts && report.insights.alerts.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold text-slate-900 dark:text-slate-100",
                                            children: "Alertas"
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                            lineNumber: 266,
                                            columnNumber: 21
                                        }, this),
                                        report.insights.alerts.map((alert, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: `p-3 rounded-lg border ${alert.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : alert.severity === 'medium' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        className: "font-medium text-sm",
                                                        children: alert.title
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                        lineNumber: 278,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-slate-600 dark:text-slate-400 mt-1",
                                                        children: alert.detail
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                        lineNumber: 279,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, idx, true, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                lineNumber: 268,
                                                columnNumber: 23
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                    lineNumber: 265,
                                    columnNumber: 19
                                }, this),
                                report.insights.recommendations && report.insights.recommendations.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold text-slate-900 dark:text-slate-100",
                                            children: "Recomendações"
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                            lineNumber: 288,
                                            columnNumber: 21
                                        }, this),
                                        report.insights.recommendations.sort((a, b)=>(b.priority || 0) - (a.priority || 0)).map((rec, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: "flex justify-between items-start mb-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                className: "font-medium text-sm",
                                                                children: rec.title
                                                            }, void 0, false, {
                                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                                lineNumber: 297,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Badge"], {
                                                                variant: "outline",
                                                                className: "text-xs",
                                                                children: [
                                                                    "Prioridade ",
                                                                    rec.priority || 0
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                                lineNumber: 298,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                        lineNumber: 296,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-slate-600 dark:text-slate-400",
                                                        children: rec.detail
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                        lineNumber: 302,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, idx, true, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                lineNumber: 292,
                                                columnNumber: 25
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                    lineNumber: 287,
                                    columnNumber: 19
                                }, this),
                                report.insights.checklist && report.insights.checklist.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold text-slate-900 dark:text-slate-100",
                                            children: "Checklist de Melhoria"
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                            lineNumber: 311,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "space-y-2",
                                            children: report.insights.checklist.map((item, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: "flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                            type: "checkbox",
                                                            className: "mt-1"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                            lineNumber: 318,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                            className: "text-sm text-slate-700 dark:text-slate-300 flex-1",
                                                            children: item
                                                        }, void 0, false, {
                                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                            lineNumber: 319,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, idx, true, {
                                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                    lineNumber: 314,
                                                    columnNumber: 25
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                            lineNumber: 312,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                    lineNumber: 310,
                                    columnNumber: 19
                                }, this),
                                report.insights.missing_data && report.insights.missing_data.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold text-slate-900 dark:text-slate-100",
                                            children: "Dados Faltantes"
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                            lineNumber: 329,
                                            columnNumber: 21
                                        }, this),
                                        report.insights.missing_data.map((item, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        className: "font-medium text-sm",
                                                        children: item.item
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                        lineNumber: 335,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-slate-600 dark:text-slate-400 mt-1",
                                                        children: item.why_it_matters
                                                    }, void 0, false, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                        lineNumber: 336,
                                                        columnNumber: 25
                                                    }, this),
                                                    item.how_to_fill && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-slate-500 dark:text-slate-400 mt-1 italic",
                                                        children: [
                                                            "Como preencher: ",
                                                            item.how_to_fill
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                        lineNumber: 338,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, idx, true, {
                                                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                                lineNumber: 331,
                                                columnNumber: 23
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                                    lineNumber: 328,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                            lineNumber: 216,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                    lineNumber: 178,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "text-center py-8 text-slate-500",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                            className: "size-12 mx-auto mb-3 opacity-50"
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                            lineNumber: 351,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            children: "Nenhum relatório gerado ainda."
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                            lineNumber: 352,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            className: "text-sm mt-1",
                            children: 'Clique em "Gerar Relatório" para criar um relatório com análise e insights.'
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                            lineNumber: 353,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                    lineNumber: 350,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
                lineNumber: 172,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx",
        lineNumber: 114,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>DossierSectionPage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/next@16.1.1_@babel+core@7.28.5_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/router.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$hooks$2f$useSectionData$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/hooks/useSectionData.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$hooks$2f$useSectionReport$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/hooks/useSectionReport.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$dossierService$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/services/dossierService.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$QuestionWizard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/dossier/QuestionWizard.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$SectionReportCard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/dossier/SectionReportCard.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/card.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$progress$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/ui/progress.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/loader-circle.js [ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$externals$5d2f$sonner__$5b$external$5d$__$28$sonner$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$29$__ = __turbopack_context__.i("[externals]/sonner [external] (sonner, esm_import, [project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/sonner@2.0.7_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/sonner)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$hooks$2f$useSectionData$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$hooks$2f$useSectionReport$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$QuestionWizard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$SectionReportCard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$progress$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$sonner__$5b$external$5d$__$28$sonner$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$hooks$2f$useSectionData$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$hooks$2f$useSectionReport$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$QuestionWizard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$SectionReportCard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$progress$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$sonner__$5b$external$5d$__$28$sonner$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
function DossierSectionPage({ sectionCode, entityBlocks }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const dossierId = typeof router.query.dossierId === 'string' ? router.query.dossierId : undefined;
    const { sectionData, loading, error, completionPercent, refetch } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$hooks$2f$useSectionData$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["useSectionData"])(dossierId, sectionCode);
    const { report, loadingReport, generatingReport, handleGenerateReport } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$hooks$2f$useSectionReport$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["useSectionReport"])(dossierId, sectionCode);
    const [savingAnswers, setSavingAnswers] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(new Set());
    const [answersMap, setAnswersMap] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])({});
    const saveTimeoutRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])({});
    // Inicializar answersMap quando sectionData mudar
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (sectionData?.questionSets) {
            console.log('📥 Carregando dados da seção:', {
                sectionCode,
                questionSetsCount: sectionData.questionSets.length
            });
            const initialAnswers = {};
            let answersCount = 0;
            sectionData.questionSets.forEach((qs)=>{
                qs.questions.forEach((q)=>{
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
                });
            });
            console.log(`✅ Total de ${answersCount} respostas carregadas`);
            setAnswersMap(initialAnswers);
        }
    }, [
        sectionData,
        sectionCode
    ]);
    // Cleanup timeouts on unmount
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        return ()=>{
            Object.values(saveTimeoutRef.current).forEach(clearTimeout);
        };
    }, []);
    if (!dossierId) {
        return null;
    }
    const handleAnswerChange = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])((question, value)=>{
        if (!question.id) return;
        // Atualizar estado local imediatamente para feedback visual
        setAnswersMap((prev)=>({
                ...prev,
                [question.id]: value
            }));
        // Limpar timeout anterior se existir
        if (saveTimeoutRef.current[question.id]) {
            clearTimeout(saveTimeoutRef.current[question.id]);
        }
        // Marcar como salvando após um pequeno delay (para evitar piscar o ícone)
        const savingTimeout = setTimeout(()=>{
            setSavingAnswers((prev)=>new Set(prev).add(question.id));
        }, 300);
        // Debounce: salvar após 1 segundo de inatividade
        saveTimeoutRef.current[question.id] = setTimeout(async ()=>{
            try {
                console.log('💾 Salvando resposta:', {
                    dossierId,
                    questionId: question.id,
                    questionCode: question.code,
                    valueText: value.valueText?.substring(0, 50),
                    valueNumber: value.valueNumber,
                    valueJson: value.valueJson
                });
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$services$2f$dossierService$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["saveAnswers"])(dossierId, [
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
                __TURBOPACK__imported__module__$5b$externals$5d2f$sonner__$5b$external$5d$__$28$sonner$2c$__esm_import$2c$__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$sonner$29$__["toast"].error('Erro ao salvar resposta');
                // Reverter mudança em caso de erro
                setAnswersMap((prev)=>({
                        ...prev,
                        [question.id]: sectionData?.questionSets.flatMap((qs)=>qs.questions).find((q)=>q.id === question.id)?.answer || {}
                    }));
            } finally{
                clearTimeout(savingTimeout);
                setSavingAnswers((prev)=>{
                    const next = new Set(prev);
                    next.delete(question.id);
                    return next;
                });
                delete saveTimeoutRef.current[question.id];
            }
        }, 1000); // 1 segundo de debounce
    }, [
        dossierId,
        sectionData
    ]);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center min-h-[400px]",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
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
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Card"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                className: "pt-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "text-center text-red-600",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            children: "Erro ao carregar dados da seção"
                        }, void 0, false, {
                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                            lineNumber: 200,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
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
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Card"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                className: "pt-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "text-center text-slate-500",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Card"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "flex justify-between items-start",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                                            children: sectionData.section.name
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                                            lineNumber: 227,
                                            columnNumber: 15
                                        }, this),
                                        sectionData.section.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CardDescription"], {
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
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "text-right",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "text-sm text-slate-600 dark:text-slate-400 mb-1",
                                            children: "Completude"
                                        }, void 0, false, {
                                            fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                                            lineNumber: 235,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "mt-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$ui$2f$progress$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Progress"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$QuestionWizard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
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
            entityBlocks && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "space-y-4",
                children: entityBlocks
            }, void 0, false, {
                fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                lineNumber: 258,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                id: "section-report",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$SectionReportCard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                    report: report,
                    loading: loadingReport,
                    generating: generatingReport,
                    onGenerate: handleGenerateReport,
                    sectionCode: sectionCode,
                    sectionTitle: `Relatório - ${sectionData.section.name}`
                }, void 0, false, {
                    fileName: "[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx",
                    lineNumber: 265,
                    columnNumber: 9
                }, this)
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
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/Planeamento dental/planeamento-dental/pages/dossie/[dossierId]/identity.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>DossierIdentity
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/node_modules/.pnpm/next@16.1.1_@babel+core@7.28.5_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/router.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$DossierSectionPage$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Planeamento dental/planeamento-dental/src/components/dossier/DossierSectionPage.tsx [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$DossierSectionPage$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$DossierSectionPage$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
function DossierIdentity() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const { dossierId } = router.query;
    if (!dossierId || typeof dossierId !== 'string') {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Planeamento__dental$2f$planeamento$2d$dental$2f$src$2f$components$2f$dossier$2f$DossierSectionPage$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
        sectionCode: "IDENTITY"
    }, void 0, false, {
        fileName: "[project]/Planeamento dental/planeamento-dental/pages/dossie/[dossierId]/identity.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__dcd1905f._.js.map