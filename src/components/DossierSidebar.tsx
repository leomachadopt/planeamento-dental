import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getDossierSections, type Section } from '@/services/dossierService'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Fingerprint,
  Building2,
  Globe,
  Package,
  Settings,
  Target,
  FileText,
  BookOpenCheck,
  Loader2,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DossierSidebarProps {
  dossierId: string | null
}

const sectionIcons: Record<string, any> = {
  IDENTITY: Fingerprint,
  BUSINESS_MODEL: Building2,
  MARKET: Globe,
  OFFER: Package,
  OPERATIONS: Settings,
  STRATEGY: Target,
  PLAN: FileText,
  FINAL_REPORT: BookOpenCheck,
}

export default function DossierSidebar({ dossierId }: DossierSidebarProps) {
  const location = useLocation()
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (dossierId) {
      loadSections()
    } else {
      setSections([])
    }
  }, [dossierId])

  const loadSections = async () => {
    if (!dossierId) return

    setLoading(true)
    try {
      const allSections = await getDossierSections(dossierId)
      setSections(allSections)
    } catch (error) {
      console.error('Erro ao carregar seções:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!dossierId) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="size-5 animate-spin text-slate-400" />
      </div>
    )
  }

  const getStatusBadge = (status?: string, completionPercent?: number) => {
    if (status === 'complete') {
      return <Badge className="bg-green-600 hover:bg-green-700 text-white text-xs">Completo</Badge>
    }
    if (status === 'in_progress') {
      return <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-xs">Progresso</Badge>
    }
    return <Badge className="bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600 text-xs">Pendente</Badge>
  }

  return (
    <SidebarMenu className="pt-4 px-2">
      {sections.map((section) => {
        const Icon = sectionIcons[section.code] || FileText
        
        // Mapear sectionCode para rotas
        const routeMap: Record<string, string> = {
          IDENTITY: 'identity',
          BUSINESS_MODEL: 'business-model',
          MARKET: 'market',
          OFFER: 'offer',
          OPERATIONS: 'operations',
          STRATEGY: 'strategy',
          PLAN: 'plan',
        }
        
        // FINAL_REPORT tem rota especial
        const sectionPath = section.code === 'FINAL_REPORT'
          ? `/dossie/${dossierId}/final-report`
          : `/dossie/${dossierId}/${routeMap[section.code] || section.code.toLowerCase()}`
        const isActive = section.code === 'FINAL_REPORT'
          ? location.pathname === sectionPath
          : location.pathname.includes(`/${routeMap[section.code] || section.code.toLowerCase()}`)

        return (
          <SidebarMenuItem key={section.id}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={section.name}
              className="hover:bg-slate-800 hover:text-white data-[active=true]:bg-teal-600 data-[active=true]:text-white transition-colors h-auto py-2"
            >
              <Link to={sectionPath} className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2 w-full">
                  <Icon className="size-4 shrink-0" />
                  <span className="text-sm font-medium flex-1">{section.name}</span>
                </div>
                <div className="flex items-center justify-between gap-2 w-full pl-6">
                  {section.completion_percent !== undefined && (
                    <div className="flex-1 min-w-[60px]">
                      <Progress value={section.completion_percent} className="h-1.5" />
                    </div>
                  )}
                  {getStatusBadge(section.status, section.completion_percent)}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
      
      {/* Link para página de relatórios */}
      <SidebarMenuItem className="mt-4 pt-4 border-t border-slate-700">
        <SidebarMenuButton
          asChild
          isActive={location.pathname.includes('/relatorios')}
          tooltip="Relatórios do Dossiê"
          className="hover:bg-slate-800 hover:text-white data-[active=true]:bg-teal-600 data-[active=true]:text-white transition-colors"
        >
          <Link to={`/dossie/${dossierId}/relatorios`} className="flex items-center gap-2">
            <BarChart3 className="size-4" />
            <span>Relatórios</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

