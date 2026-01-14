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
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Register from './pages/Register'
import DossierIdentity from './pages/DossierIdentity'
import DossierBusinessModel from './pages/DossierBusinessModel'
import DossierMarket from './pages/DossierMarket'
import DossierOffer from './pages/DossierOffer'
import DossierOperations from './pages/DossierOperations'
import DossierStrategy from './pages/DossierStrategy'
import DossierPlan from './pages/DossierPlan'
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
            {/* Rotas de Dossiê */}
            <Route path="/dossie" element={<Navigate to="/" replace />} />
            <Route path="/dossie/:dossierId/identity" element={<DossierIdentity />} />
            <Route path="/dossie/:dossierId/business-model" element={<DossierBusinessModel />} />
            <Route path="/dossie/:dossierId/market" element={<DossierMarket />} />
            <Route path="/dossie/:dossierId/offer" element={<DossierOffer />} />
            <Route path="/dossie/:dossierId/operations" element={<DossierOperations />} />
            <Route path="/dossie/:dossierId/strategy" element={<DossierStrategy />} />
            <Route path="/dossie/:dossierId/plan" element={<DossierPlan />} />
            <Route path="/dossie/:dossierId/relatorios" element={<DossierReports />} />
            <Route path="/dossie/:dossierId/final-report" element={<DossierFinalReport />} />
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
