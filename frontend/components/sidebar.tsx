"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  FileText,
  Plus,
  Search,
  Users,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";

// (opcional) bits iguais aos do backend
const PERMS = {
  AcessarDashboard: 1,
  VisualizarDemandas: 2,
  RegistrarDemandas: 4,
  EditarStatus: 8,
  EditarDemanda: 16,
  NotificarEmail: 32,
  GerenciarUsuarios: 64,
  GerenciarPerfis: 128,
  Configuracoes: 256,
};

export function Sidebar() {
  const [user, setUser] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("auth_token");
    const raw = localStorage.getItem("auth_user"); // ✅ chave correta
    if (!token || !raw) {
      router.replace("/"); // sem sessão -> login
      return;
    }
    try {
      setUser(JSON.parse(raw));
    } catch {
      router.replace("/");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token"); // ✅ limpa token
    localStorage.removeItem("auth_user"); // ✅ limpa user
    router.replace("/");
  };

  if (!user) return null;

  const hasPermission = (perm: number) => {
    return (user.permissions & perm) === perm;
  };

  const menuItems = [
    ...(hasPermission(PERMS.AcessarDashboard) ? [{ icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" }] : []),
    ...(hasPermission(PERMS.VisualizarDemandas) ? [{ icon: FileText, label: "Demandas", href: "/demandas" }] : []),
    ...(hasPermission(PERMS.RegistrarDemandas) ? [{ icon: Plus, label: "Nova Demanda", href: "/demandas/nova" }] : []),
    { icon: Search, label: "Consultar Protocolo", href: "/consultar" },
    ...(hasPermission(PERMS.GerenciarUsuarios) ? [{ icon: Users, label: "Usuários", href: "/usuarios" }] : []),
    ...(hasPermission(PERMS.GerenciarPerfis) ? [{ icon: Shield, label: "Perfis", href: "/perfis" }] : []),
    ...(hasPermission(PERMS.Configuracoes) ? [{ icon: Settings, label: "Configurações", href: "/configuracoes" }] : []),
  ];

  return (
    <div
      className={`bg-white border-r border-slate-200 shadow-sm transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } flex flex-col h-screen`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#04A4A1] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CD</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-800">
                  Controle
                </h1>
                <p className="text-xs text-slate-500">de Demandas</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full ${
                  collapsed ? "justify-center px-0" : "justify-start px-3"
                } ${
                  isActive
                    ? "bg-[#04A4A1] text-white hover:bg-[#038a87]"
                    : "text-slate-600 hover:text-[#04A4A1] hover:bg-slate-50"
                }`}
              >
                <Icon className={`h-4 w-4 ${collapsed ? "" : "mr-3"}`} />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Info Footer */}
      <div className="p-4 border-t border-slate-200">
        {!collapsed ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start p-2 h-auto"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#04A4A1] text-white text-sm">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <p className="text-sm font-medium text-slate-800">
                      {user.name}
                    </p>
                    <p className="text-xs text-[#04A4A1]">{user.role}</p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user.name}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/perfil">
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full p-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#04A4A1] text-white text-sm">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user.name}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                  <p className="text-xs text-[#04A4A1]">{user.role}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/perfil">
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
