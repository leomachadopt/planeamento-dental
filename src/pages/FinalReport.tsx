/**
 * @deprecated Este componente foi substituído pelo sistema de Relatório Final
 * baseado em dossiês. Use /dossie/:dossierId/final-report
 * 
 * Este arquivo é mantido apenas para referência histórica.
 * Será removido em versão futura.
 * 
 * O novo sistema oferece:
 * - Consolidação automática de todas as seções do dossiê
 * - Geração via IA com narrativa executiva única
 * - Priorização de alavancas estratégicas
 * - Exportação PDF
 * - Versionamento e stale tracking
 */

import { useState } from 'react'
import { useStrategyStore } from '@/stores/useStrategyStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  FileText,
  Printer,
  RefreshCw,
  BookOpen,
  CheckCircle2,
  Calendar,
  Target,
  Shield,
  Lightbulb,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function FinalReport() {
  const state = useStrategyStore()
  const { relatorio_final, isGeneratingReport, generateFinalReport } = state

  const handleGenerate = async () => {
    await generateFinalReport()
  }

  if (!relatorio_final) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-fade-in text-center p-4">
        <div className="bg-slate-100 p-6 rounded-full">
          <FileText className="size-12 text-slate-500" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">
            Relatório Estratégico Final
          </h2>
          <p className="text-slate-500">
            Consolide todos os dados gerados (Diagnóstico, Estratégia, Tática e
            Operação) em um documento único e profissional para 2026.
          </p>
        </div>
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={isGeneratingReportReport}
          className="bg-slate-900 text-white hover:bg-slate-800"
        >
          {isGeneratingReport ? (
            <>
              <RefreshCw className="mr-2 size-4 animate-spin" />
              Compilando Dados...
            </>
          ) : (
            <>
              <BookOpen className="mr-2 size-4" />
              Gerar Documento Oficial
            </>
          )}
        </Button>
      </div>
    )
  }

  const {
    cover,
    introduction,
    part1_diagnosis,
    part2_strategy,
    part3_advanced,
    part4_tactical,
    part5_operational,
    conclusion,
  } = relatorio_final

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-100 print:hidden sticky top-20 z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Relatório Integrado 2026
          </h1>
          <p className="text-sm text-slate-500">
            Gerado em {new Date(relatorio_final.generatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerate}>
            <RefreshCw className="mr-2 size-4" /> Atualizar
          </Button>
          <Button onClick={() => {
            if (typeof window !== 'undefined') {
              window.print()
            }
          }}>
            <Printer className="mr-2 size-4" /> Imprimir / PDF
          </Button>
        </div>
      </div>

      {/* Report Document Container */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none print:w-full">
        {/* COVER PAGE */}
        <div className="min-h-[297mm] p-16 flex flex-col justify-between border-b-2 border-slate-100 print:break-after-page">
          <div className="space-y-4">
            <div className="size-16 bg-slate-900 rounded-lg mb-8" />
            <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {cover.title}
            </h1>
            <h2 className="text-2xl text-slate-500 font-light">
              {cover.subtitle}
            </h2>
          </div>

          <div className="space-y-2 border-l-4 border-slate-900 pl-6">
            <p className="text-lg font-bold text-slate-900">
              {cover.clinicName}
            </p>
            <p className="text-slate-500">Ciclo Estratégico {cover.year}</p>
          </div>
        </div>

        {/* INTRODUCTION & SUMMARY */}
        <div className="p-12 md:p-16 space-y-12 print:break-after-page">
          <section>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 border-b pb-2">
              1. Introdução
            </h3>
            <div className="space-y-4 text-justify text-slate-700 leading-relaxed">
              <p>{introduction.context}</p>
              <p className="font-medium bg-slate-50 p-4 rounded-lg border-l-4 border-slate-400">
                {introduction.objectives}
              </p>
              <p className="text-sm text-slate-500 italic">
                {introduction.methodology}
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 border-b pb-2">
              2. Diagnóstico Situacional
            </h3>
            <p className="text-slate-700 mb-6">{part1_diagnosis.summary}</p>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-green-50 p-4 rounded text-sm">
                <strong className="text-green-800 block mb-2">FORÇAS</strong>
                <ul className="list-disc pl-4 space-y-1">
                  {part1_diagnosis.swot.strengths.slice(0, 3).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-50 p-4 rounded text-sm">
                <strong className="text-red-800 block mb-2">FRAQUEZAS</strong>
                <ul className="list-disc pl-4 space-y-1">
                  {part1_diagnosis.swot.weaknesses.slice(0, 3).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="col-span-2 bg-slate-50 p-4 border border-slate-200 rounded text-center">
                <strong className="block text-slate-500 text-xs uppercase mb-1">
                  O Grande Desafio (Rumelt)
                </strong>
                <span className="text-slate-900 font-medium">
                  "{part1_diagnosis.mainProblem}"
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* STRATEGIC DIRECTION */}
        <div className="p-12 md:p-16 space-y-12 bg-slate-50 print:break-after-page print:bg-white">
          <section>
            <h3 className="text-2xl font-bold text-slate-900 mb-6 border-b pb-2">
              3. Identidade e Estratégia
            </h3>
            <div className="grid md:grid-cols-3 gap-8 text-center mb-8">
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <Shield className="size-8 mx-auto text-slate-400 mb-3" />
                <h4 className="font-bold text-sm uppercase text-slate-500 mb-2">
                  Missão
                </h4>
                <p className="text-slate-800 text-sm leading-relaxed">
                  {part2_strategy.mission}
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <Target className="size-8 mx-auto text-slate-400 mb-3" />
                <h4 className="font-bold text-sm uppercase text-slate-500 mb-2">
                  Visão 2026
                </h4>
                <p className="text-slate-800 text-sm leading-relaxed">
                  {part2_strategy.vision}
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <Lightbulb className="size-8 mx-auto text-slate-400 mb-3" />
                <h4 className="font-bold text-sm uppercase text-slate-500 mb-2">
                  Valores
                </h4>
                <p className="text-slate-800 text-sm leading-relaxed">
                  {part2_strategy.values.join(' • ')}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="font-bold text-slate-800 mb-2">
                Lógica do Mapa Estratégico
              </h4>
              <p className="text-slate-600 italic">
                {part2_strategy.mapSummary}
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-slate-900 mb-6 border-b pb-2">
              4. Diretrizes Avançadas
            </h3>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-bold text-blue-900 mb-2">
                  Movimento de Oceano Azul
                </h4>
                <p className="text-slate-700">
                  {part3_advanced.blueOceanSummary}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <h4 className="font-bold text-slate-800 mb-3">
                  Políticas Orientadoras (Guiding Policies)
                </h4>
                <ul className="list-decimal pl-5 space-y-2 text-sm text-slate-700">
                  {part3_advanced.policies.slice(0, 5).map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* TACTICAL PLAN */}
        <div className="p-12 md:p-16 space-y-12 print:break-after-page">
          <section>
            <h3 className="text-2xl font-bold text-slate-900 mb-6 border-b pb-2">
              5. Plano Tático (OKRs)
            </h3>
            <div className="space-y-6">
              {part4_tactical.okrs.map((okr, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-sm">
                      {okr.objective}
                    </span>
                    <Badge variant="outline">{okr.area}</Badge>
                  </div>
                  <div className="p-4">
                    <ul className="text-sm text-slate-600 space-y-1">
                      {okr.krs.map((kr, kIdx) => (
                        <li key={kIdx} className="flex items-center gap-2">
                          <div className="size-1.5 bg-slate-300 rounded-full" />
                          {kr}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-slate-900 mb-6 border-b pb-2">
              Iniciativas Prioritárias (Roadmap)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => {
                const items = part4_tactical.initiatives.filter(
                  (i) => i.quarter === q,
                )
                if (items.length === 0) return null
                return (
                  <div
                    key={q}
                    className="border border-slate-200 rounded p-4 break-inside-avoid"
                  >
                    <h4 className="font-bold text-slate-900 mb-3 border-b pb-1">
                      {q} 2026
                    </h4>
                    <ul className="space-y-2">
                      {items.map((item, i) => (
                        <li key={i} className="text-sm flex justify-between">
                          <span className="text-slate-700">{item.title}</span>
                          <span className="text-xs font-bold text-slate-400">
                            {item.priority}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        {/* OPERATIONAL PLAN & CONCLUSION */}
        <div className="p-12 md:p-16 space-y-12">
          <section>
            <h3 className="text-2xl font-bold text-slate-900 mb-6 border-b pb-2">
              6. Plano Operacional
            </h3>
            <div className="space-y-6">
              <h4 className="font-bold text-slate-700">Rotinas Essenciais</h4>
              <div className="grid md:grid-cols-2 gap-6">
                {part5_operational.routines.map((area, idx) => (
                  <div
                    key={idx}
                    className="text-sm border border-slate-100 p-4 rounded bg-slate-50 break-inside-avoid"
                  >
                    <strong className="block mb-2 text-slate-900">
                      {area.area}
                    </strong>
                    <ul className="list-disc pl-4 text-slate-600 space-y-1">
                      {area.routines[0].tasks.slice(0, 3).map((task, tIdx) => (
                        <li key={tIdx}>{task}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h4 className="font-bold text-slate-700 mb-4">
                  Calendário de Ações
                </h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {part5_operational.calendar.map((m, i) => (
                    <div
                      key={i}
                      className="border p-2 rounded text-center break-inside-avoid"
                    >
                      <strong className="block text-slate-800">
                        {m.month.substring(0, 3)}
                      </strong>
                      <span className="text-slate-500 truncate block">
                        {m.theme}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-900 text-white p-8 rounded-lg mt-12 print:bg-white print:text-black print:border-2 print:border-black">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="size-6" /> Conclusão & Próximos Passos
            </h3>
            <p className="mb-6 leading-relaxed opacity-90">
              {conclusion.closing}
            </p>
            <div className="space-y-2">
              {conclusion.nextSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="size-6 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold print:bg-black/10">
                    {idx + 1}
                  </div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-white/20 text-center text-sm opacity-50 print:border-black/20">
              Planejamento gerado via Clinique AI - Confidencial
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
