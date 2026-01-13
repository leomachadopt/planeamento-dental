import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRightCircle,
} from 'lucide-react'

export default function Execution() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Execução Operacional (Guia Conceitual)
          </h1>
          <p className="text-slate-500">
            Como levar o planejamento estratégico para a prática usando o ciclo PDCA,
            sem acompanhamento de métricas em tempo real.
          </p>
        </div>
      </div>

      {/* Exemplos conceituais de indicadores (não monitorados pelo sistema) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-red-50 border-red-100">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase">
                Desperdícios (Muda)
              </p>
              <h3 className="text-2xl font-bold text-red-900">12%</h3>
              <p className="text-xs text-red-700">
                Cancelamentos em cima da hora
              </p>
            </div>
            <AlertTriangle className="size-8 text-red-300" />
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase">
                Lead Time
              </p>
              <h3 className="text-2xl font-bold text-blue-900">48h</h3>
              <p className="text-xs text-blue-700">Média para 1º agendamento</p>
            </div>
            <Clock className="size-8 text-blue-300" />
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase">
                Eficiência
              </p>
              <h3 className="text-2xl font-bold text-green-900">92%</h3>
              <p className="text-xs text-green-700">
                Ocupação de agenda médica
              </p>
            </div>
            <CheckCircle2 className="size-8 text-green-300" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Como usar o PDCA com o Plano Tático</CardTitle>
          <CardDescription>
            Sugestão de fluxo para transformar OKRs e iniciativas em rotinas e
            responsabilidades claras. O registro e acompanhamento diário das
            tarefas deve ser feito no seu sistema operacional de gestão.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <ArrowRightCircle className="mt-1 size-4 text-slate-400" />
              <span>
                <strong>PLAN:</strong> A partir dos Relatórios 3 e 4, selecione
                de 3 a 7 iniciativas prioritárias e descreva-as no formato
                5W2H (o que, por quê, quem, quando, onde, como, quanto) em seu
                sistema de tarefas.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRightCircle className="mt-1 size-4 text-slate-400" />
              <span>
                <strong>DO:</strong> Converta cada iniciativa em tarefas
                operacionais, atribua responsáveis e prazos e acompanhe a
                execução diária fora deste aplicativo.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRightCircle className="mt-1 size-4 text-slate-400" />
              <span>
                <strong>CHECK:</strong> Em ciclos quinzenais ou mensais, revise
                resultados e aprendizados comparando os avanços com os OKRs
                definidos no Plano Tático.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRightCircle className="mt-1 size-4 text-slate-400" />
              <span>
                <strong>ACT:</strong> Ajuste rotinas, SOPs e calendários no
                Plano Operacional e, se necessário, atualize os relatórios
                estratégicos para refletir decisões permanentes.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
