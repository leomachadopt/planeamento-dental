import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import { useAutoLoadClinic } from '@/hooks/useAutoLoadClinic'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

// Pages
import Index from './pages/Index'
import Diagnostic from './pages/Diagnostic'
import Strategy from './pages/Strategy'
import StrategicMap from './pages/StrategicMap'
import TacticalPlan from './pages/TacticalPlan'
import OperationalPlan from './pages/OperationalPlan'
import Execution from './pages/Execution'
import SetupWizard from './pages/SetupWizard'
import OperationalAssessment from './pages/OperationalAssessment'
import MarketAssessment from './pages/MarketAssessment'
import ManagerVision from './pages/ManagerVision'
import Identity from './pages/Identity'
import AdvancedAnalysis from './pages/AdvancedAnalysis'
import FinalReport from './pages/FinalReport'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Register from './pages/Register'
import DossierIdentity from './pages/DossierIdentity'
import DossierReports from './pages/DossierReports'
import DossierFinalReport from './pages/DossierFinalReport'

// Admin Pages
import DashboardAdmin from './pages/admin/DashboardAdmin'
import UsuariosAdmin from './pages/admin/UsuariosAdmin'
import ClinicasAdmin from './pages/admin/ClinicasAdmin'
import RelatoriosAdmin from './pages/admin/RelatoriosAdmin'
import PromptsAdmin from './pages/admin/PromptsAdmin'
import ObservabilidadeAdmin from './pages/admin/ObservabilidadeAdmin'
import ConfiguracoesAdmin from './pages/admin/ConfiguracoesAdmin'

const App = () => {
  // Auto-load last selected clinic on app start
  useAutoLoadClinic()

  return (
    <BrowserRouter
      future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas protegidas - Usuário Final */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Index />} />
            {/* Novas rotas de Dossiê */}
            <Route path="/dossie" element={<Navigate to="/" replace />} />
            <Route path="/dossie/:dossierId/identity" element={<DossierIdentity />} />
            <Route path="/dossie/:dossierId/relatorios" element={<DossierReports />} />
            <Route path="/dossie/:dossierId/final-report" element={<DossierFinalReport />} />
            <Route path="/dossie/:dossierId/:sectionCode" element={<DossierIdentity />} />
            {/* Rotas antigas mantidas para compatibilidade */}
            <Route path="/diagnostico" element={<Diagnostic />} />
            <Route path="/operacao" element={<OperationalAssessment />} />
            <Route path="/mercado" element={<MarketAssessment />} />
            <Route path="/visao-gestor" element={<ManagerVision />} />
            <Route path="/identidade" element={<Identity />} />
            <Route path="/estrategia" element={<Strategy />} />
            <Route path="/analise-avancada" element={<AdvancedAnalysis />} />
            <Route path="/mapa-estrategico" element={<StrategicMap />} />
            <Route path="/plano-tatico" element={<TacticalPlan />} />
            <Route path="/plano-operacional" element={<OperationalPlan />} />
            {/* Rota antiga de relatório final - desativada em favor do sistema de dossiês */}
            {/* <Route path="/relatorio-final" element={<FinalReport />} /> */}
            <Route path="/execucao" element={<Execution />} />
            <Route path="/configuracao" element={<SetupWizard />} />
          </Route>

          {/* Rotas protegidas - Administração */}
          <Route
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<DashboardAdmin />} />
            <Route path="/admin/usuarios" element={<UsuariosAdmin />} />
            <Route path="/admin/clinicas" element={<ClinicasAdmin />} />
            <Route path="/admin/relatorios" element={<RelatoriosAdmin />} />
            <Route path="/admin/prompts" element={<PromptsAdmin />} />
            <Route path="/admin/observabilidade" element={<ObservabilidadeAdmin />} />
            <Route path="/admin/auditoria" element={<ObservabilidadeAdmin />} />
            <Route path="/admin/configuracoes" element={<ConfiguracoesAdmin />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  )
}

export default App
