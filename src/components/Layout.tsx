import { Outlet, useLocation, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Stethoscope,
  Lightbulb,
  Map as MapIcon,
  Activity,
  Search,
  Bell,
  ChevronDown,
  Settings,
  ClipboardList,
  Globe,
  Eye,
  Fingerprint,
  BrainCircuit,
  ListTodo,
  FileText,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const menuItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Operação (2A)', url: '/operacao', icon: ClipboardList },
  { title: 'Mercado (2B)', url: '/mercado', icon: Globe },
  { title: 'Visão (2C)', url: '/visao-gestor', icon: Eye },
  { title: 'Diagnóstico', url: '/diagnostico', icon: Stethoscope },
  { title: 'Identidade (3A)', url: '/identidade', icon: Fingerprint },
  { title: 'Estratégia (3B)', url: '/estrategia', icon: Lightbulb },
  { title: 'Análise Avançada', url: '/analise-avancada', icon: BrainCircuit },
  { title: 'Mapa Estratégico', url: '/mapa-estrategico', icon: MapIcon },
  { title: 'Plano Tático (4)', url: '/plano-tatico', icon: ListTodo },
  { title: 'Plano Operacional (5)', url: '/plano-operacional', icon: FileText },
  { title: 'Execução (PDCA)', url: '/execucao', icon: Activity },
  { title: 'Configuração', url: '/configuracao', icon: Settings },
]

export default function Layout() {
  const location = useLocation()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-900">
        <Sidebar
          collapsible="icon"
          className="border-r border-slate-200 dark:border-slate-800"
        >
          <SidebarHeader className="h-16 flex items-center justify-center border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white">
            <div className="flex items-center gap-2 px-2 w-full">
              <div className="bg-teal-500 p-1.5 rounded-lg shrink-0">
                <Stethoscope className="size-5 text-white" />
              </div>
              <div className="font-bold truncate group-data-[collapsible=icon]:hidden">
                Clinique AI
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="bg-slate-900 text-slate-300">
            <SidebarMenu className="pt-4 px-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    className="hover:bg-slate-800 hover:text-white data-[active=true]:bg-teal-600 data-[active=true]:text-white transition-colors"
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="bg-slate-900 p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
              <Avatar className="size-8">
                <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=male" />
                <AvatarFallback>DR</AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium text-white truncate">
                  Dr. Roberto
                </span>
                <span className="text-xs text-slate-400 truncate">
                  Diretor Clínico
                </span>
              </div>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <main className="flex-1 flex flex-col min-h-screen overflow-hidden transition-all duration-300 ease-in-out">
          <header className="h-16 border-b border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2" />
              <Separator orientation="vertical" className="h-6" />
              <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer hover:text-teal-600 transition-colors">
                <span>Unidade Matriz - São Paulo</span>
                <ChevronDown className="size-4" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block w-64">
                <Search className="absolute left-2.5 top-2.5 size-4 text-slate-400" />
                <Input
                  placeholder="Buscar metas ou ações..."
                  className="pl-9 h-9 bg-slate-100 border-none focus-visible:ring-teal-500"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-500 hover:text-teal-600 hover:bg-teal-50"
              >
                <Bell className="size-5" />
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white" />
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-6 md:p-8">
            <Outlet />
          </div>

          <footer className="h-8 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 text-xs text-slate-500">
            <span>Última sincronização: Hoje, 09:42</span>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium text-teal-700">
                Modo Consultor AI: Ativo
              </span>
            </div>
          </footer>
        </main>
      </div>
    </SidebarProvider>
  )
}
