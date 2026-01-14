import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Code,
  Activity,
  Settings,
  Shield,
  LogOut,
  User,
  BarChart3,
  Database,
  Eye,
  Key,
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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/useAuthStore'

const adminMenuItems = [
  {
    group: 'Visão Geral',
    items: [
      { title: 'Dashboard Admin', url: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Gestão',
    items: [
      { title: 'Usuários', url: '/admin/usuarios', icon: Users },
      { title: 'Clínicas', url: '/admin/clinicas', icon: Building2 },
    ],
  },
  {
    group: 'Conteúdo & IA',
    items: [
      { title: 'Relatórios', url: '/admin/relatorios', icon: FileText },
      { title: 'Prompts & Modelos', url: '/admin/prompts', icon: Code },
    ],
  },
  {
    group: 'Operações',
    items: [
      { title: 'Observabilidade', url: '/admin/observabilidade', icon: Activity },
      { title: 'Auditoria', url: '/admin/auditoria', icon: Eye },
    ],
  },
  {
    group: 'Sistema',
    items: [
      { title: 'Configurações', url: '/admin/configuracoes', icon: Settings },
    ],
  },
]

export default function AdminLayout() {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-900">
        <Sidebar
          collapsible="icon"
          className="border-r border-slate-200 dark:border-slate-800"
        >
          <SidebarHeader className="h-16 flex items-center justify-center border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white">
            <div className="flex items-center gap-2 px-2 w-full">
              <div className="bg-purple-500 p-1.5 rounded-lg shrink-0">
                <Shield className="size-5 text-white" />
              </div>
              <div className="font-bold truncate group-data-[collapsible=icon]:hidden">
                Admin Panel
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="bg-slate-900 text-slate-300">
            {adminMenuItems.map((group) => (
              <SidebarGroup key={group.group} className="pt-4 px-2">
                <SidebarGroupLabel className="text-xs text-slate-400 uppercase tracking-wider">
                  {group.group}
                </SidebarGroupLabel>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        tooltip={item.title}
                        className="hover:bg-slate-800 hover:text-white data-[active=true]:bg-purple-600 data-[active=true]:text-white transition-colors"
                      >
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            ))}
            <SidebarSeparator className="my-4" />
            <SidebarMenu className="px-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Voltar ao Sistema"
                  className="hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Link to="/">
                    <BarChart3 />
                    <span>Voltar ao Sistema</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="bg-slate-900 p-4 border-t border-slate-800">
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full">
                <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center cursor-pointer hover:bg-slate-800 rounded-lg p-2 transition-colors">
                  <Avatar className="size-8">
                    <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=male" />
                    <AvatarFallback>
                      {user?.name?.substring(0, 2).toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium text-white truncate">
                      {user?.name || 'Administrador'}
                    </span>
                    <span className="text-xs text-slate-400 truncate">
                      Administrador
                    </span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <main className="flex-1 flex flex-col min-h-screen overflow-hidden transition-all duration-300 ease-in-out">
          <header className="h-16 border-b border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm print:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2" />
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Shield className="size-5 text-purple-600" />
                <span className="font-semibold text-slate-700">Área Administrativa</span>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-6 md:p-8">
            <Outlet />
          </div>

          <footer className="h-8 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 text-xs text-slate-500 print:hidden">
            <span>Painel Administrativo - Clinique AI</span>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="font-medium text-purple-700">Modo Admin: Ativo</span>
            </div>
          </footer>
        </main>
      </div>
    </SidebarProvider>
  )
}



