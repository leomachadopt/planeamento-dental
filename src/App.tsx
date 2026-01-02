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
import Execution from './pages/Execution'
import SetupWizard from './pages/SetupWizard'
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
          <Route path="/estrategia" element={<Strategy />} />
          <Route path="/mapa-estrategico" element={<StrategicMap />} />
          <Route path="/execucao" element={<Execution />} />
          <Route path="/configuracao" element={<SetupWizard />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
