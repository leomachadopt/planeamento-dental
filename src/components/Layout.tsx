import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom'
import {
  Search,
  Bell,
  FileText,
  BookOpenCheck,
  LogOut,
  User,
  Shield,
  Stethoscope,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/useAuthStore'
import ClinicSelector from './ClinicSelector'
import DossierSelector from './DossierSelector'
import DossierSidebar from './DossierSidebar'
import { useState } from 'react'

const menuItems = [
  { title: 'Centro de Documentação', url: '/', icon: FileText },
  { title: 'Dossiê da Clínica', url: '/dossie', icon: BookOpenCheck },
]

export default function Layout() {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [currentDossierId, setCurrentDossierId] = useState<string | null>(null)

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
              <div className="bg-teal-500 p-1.5 rounded-lg shrink-0">
                <Stethoscope className="size-5 text-white" />
              </div>
              <div className="font-bold truncate group-data-[collapsible=icon]:hidden">
                Clinique AI
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="bg-slate-900 text-slate-300">
            {currentDossierId ? (
              <DossierSidebar dossierId={currentDossierId} />
            ) : (
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
            )}
          </SidebarContent>
          <SidebarFooter className="bg-slate-900 p-4 border-t border-slate-800">
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full">
                <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center cursor-pointer hover:bg-slate-800 rounded-lg p-2 transition-colors">
                  <Avatar className="size-8">
                    <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=male" />
                    <AvatarFallback>
                      {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium text-white truncate">
                      {user?.name || 'Usuário'}
                    </span>
                    <span className="text-xs text-slate-400 truncate">
                      {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
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
                {user?.role === 'admin' && (
                  <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Administração</span>
                  </DropdownMenuItem>
                )}
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
              <ClinicSelector />
              <Separator orientation="vertical" className="h-6" />
              <DossierSelector onDossierChange={setCurrentDossierId} />
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block w-64">
                <Search className="absolute left-2.5 top-2.5 size-4 text-slate-400" />
                <Input
                  placeholder="Buscar documentos..."
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

          <footer className="h-8 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 text-xs text-slate-500 print:hidden">
            <span>Sistema de Documentação Estratégica</span>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-green-500" />
              <span className="font-medium text-teal-700">
                Sistema Ativo
              </span>
            </div>
          </footer>
        </main>
      </div>
    </SidebarProvider>
  )
}
