"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Search, LayoutDashboard, Plus, Users, Settings } from "lucide-react"
import { PERMS } from "@/hooks/useAuthGuard"

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return

    const token = localStorage.getItem("auth_token")
    const rawUser = localStorage.getItem("auth_user")

    if (!token || !rawUser) {
      router.replace("/")
      return
    }

    try {
      const parsedUser = JSON.parse(rawUser)
      setUser(parsedUser)
    } catch {
      router.replace("/")
    } finally {
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600">Carregando...</p>
      </div>
    )
  }

  if (!user) return null

  const hasPermission = (perm: number) => {
    return (user.permissions & perm) === perm
  }

  const availablePages = [
    {
      title: "Dashboard",
      description: "Visualize métricas e indicadores do sistema",
      icon: LayoutDashboard,
      href: "/dashboard",
      permission: PERMS.AcessarDashboard,
      color: "bg-blue-500",
    },
    {
      title: "Demandas",
      description: "Consulte e gerencie suas demandas",
      icon: FileText,
      href: "/demandas",
      permission: PERMS.VisualizarDemandas,
      color: "bg-green-500",
    },
    {
      title: "Nova Demanda",
      description: "Registre uma nova solicitação",
      icon: Plus,
      href: "/demandas/nova",
      permission: PERMS.RegistrarDemandas,
      color: "bg-purple-500",
    },
    {
      title: "Consultar Protocolo",
      description: "Busque uma demanda pelo número de protocolo",
      icon: Search,
      href: "/consultar",
      permission: null, // Público
      color: "bg-orange-500",
    },
    {
      title: "Usuários",
      description: "Gerencie usuários e permissões do sistema",
      icon: Users,
      href: "/usuarios",
      permission: PERMS.GerenciarUsuarios,
      color: "bg-red-500",
    },
    {
      title: "Configurações",
      description: "Configure sistemas, módulos e áreas",
      icon: Settings,
      href: "/configuracoes",
      permission: PERMS.GerenciarUsuarios,
      color: "bg-gray-500",
    },
  ]

  const allowedPages = availablePages.filter(
    (page) => page.permission === null || hasPermission(page.permission)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Bem-vindo, {user.name}!
          </h1>
          <p className="text-slate-600 text-lg">
            Escolha uma opção abaixo para começar
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allowedPages.map((page) => {
            const Icon = page.icon
            return (
              <Card
                key={page.href}
                className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-sm"
                onClick={() => router.push(page.href)}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`${page.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{page.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600">
                    {page.description}
                  </CardDescription>
                  <Button
                    variant="ghost"
                    className="mt-4 w-full text-[#04A4A1] hover:bg-[#04A4A1]/10"
                  >
                    Acessar →
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Info Box */}
        {allowedPages.length === 0 && (
          <Card className="mt-8 border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Sem Permissões</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Você não tem permissão para acessar nenhuma página do sistema.
                Entre em contato com o administrador.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
