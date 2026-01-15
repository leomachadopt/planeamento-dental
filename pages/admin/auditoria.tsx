import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye } from 'lucide-react'

export default function AuditoriaAdmin() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Auditoria
        </h1>
        <p className="text-slate-500 mt-1">
          Registro de atividades e eventos do sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Sistema de Auditoria
          </CardTitle>
          <CardDescription>
            Esta funcionalidade está em desenvolvimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            O sistema de auditoria permitirá visualizar e rastrear todas as ações realizadas no sistema,
            incluindo logins, alterações de dados, geração de relatórios e outras operações importantes.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

