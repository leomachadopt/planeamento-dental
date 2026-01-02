import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'

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

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
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
          <Route path="/relatorio-final" element={<FinalReport />} />
          <Route path="/execucao" element={<Execution />} />
          <Route path="/configuracao" element={<SetupWizard />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
