import { RegisterForm } from '@/components/auth/RegisterForm'
import { Stethoscope } from 'lucide-react'

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-slate-100 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-teal-500 p-2 rounded-lg">
              <Stethoscope className="size-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Clinique AI</h1>
          </div>
          <p className="text-slate-600">Sistema de Planejamento Estratégico</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}

