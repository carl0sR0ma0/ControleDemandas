"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Shield, User, Users, Settings, Eye, Edit } from "lucide-react"

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface UserPermissions {
  userId: string
  userName: string
  role: string
  permissions: string[]
}

export function PermissionsManager() {
  const [selectedUser, setSelectedUser] = useState<string>("")

  // Mock permissions data
  const permissions: Permission[] = [
    // Dashboard
    {
      id: "dashboard.view",
      name: "Visualizar Dashboard",
      description: "Acesso ao painel principal",
      category: "Dashboard",
    },
    {
      id: "dashboard.export",
      name: "Exportar Dados",
      description: "Exportar relatórios do dashboard",
      category: "Dashboard",
    },

    // Demandas
    {
      id: "demands.view",
      name: "Visualizar Demandas",
      description: "Ver lista e detalhes das demandas",
      category: "Demandas",
    },
    { id: "demands.create", name: "Criar Demandas", description: "Registrar novas demandas", category: "Demandas" },
    { id: "demands.edit", name: "Editar Demandas", description: "Modificar demandas existentes", category: "Demandas" },
    {
      id: "demands.delete",
      name: "Excluir Demandas",
      description: "Remover demandas do sistema",
      category: "Demandas",
    },
    {
      id: "demands.approve",
      name: "Aprovar Demandas",
      description: "Aprovar demandas para execução",
      category: "Demandas",
    },
    {
      id: "demands.assign",
      name: "Atribuir Responsáveis",
      description: "Definir responsáveis pelas demandas",
      category: "Demandas",
    },

    // Usuários
    { id: "users.view", name: "Visualizar Usuários", description: "Ver lista de usuários", category: "Usuários" },
    { id: "users.create", name: "Criar Usuários", description: "Cadastrar novos usuários", category: "Usuários" },
    { id: "users.edit", name: "Editar Usuários", description: "Modificar dados de usuários", category: "Usuários" },
    { id: "users.delete", name: "Excluir Usuários", description: "Remover usuários do sistema", category: "Usuários" },
    {
      id: "users.permissions",
      name: "Gerenciar Permissões",
      description: "Definir permissões de usuários",
      category: "Usuários",
    },

    // Sistema
    {
      id: "system.settings",
      name: "Configurações",
      description: "Acesso às configurações do sistema",
      category: "Sistema",
    },
    { id: "system.logs", name: "Logs do Sistema", description: "Visualizar logs de auditoria", category: "Sistema" },
    { id: "system.backup", name: "Backup", description: "Realizar backup dos dados", category: "Sistema" },
  ]

  // Mock users with permissions
  const usersPermissions: UserPermissions[] = [
    {
      userId: "1",
      userName: "João Silva",
      role: "Admin",
      permissions: permissions.map((p) => p.id), // Admin has all permissions
    },
    {
      userId: "2",
      userName: "Maria Santos",
      role: "Gestor",
      permissions: [
        "dashboard.view",
        "dashboard.export",
        "demands.view",
        "demands.create",
        "demands.edit",
        "demands.approve",
        "demands.assign",
        "users.view",
        "system.settings",
      ],
    },
    {
      userId: "3",
      userName: "Pedro Costa",
      role: "Colaborador",
      permissions: ["dashboard.view", "demands.view", "demands.create"],
    },
  ]

  const selectedUserData = usersPermissions.find((u) => u.userId === selectedUser)

  const togglePermission = (userId: string, permissionId: string) => {
    // In real app, this would make an API call
    console.log(`Toggling permission ${permissionId} for user ${userId}`)
  }

  const getRoleColor = (role: string) => {
    const colors = {
      Admin: "bg-red-100 text-red-800",
      Gestor: "bg-blue-100 text-blue-800",
      Colaborador: "bg-green-100 text-green-800",
    }
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getRoleIcon = (role: string) => {
    const icons = {
      Admin: Shield,
      Gestor: Users,
      Colaborador: User,
    }
    const Icon = icons[role as keyof typeof icons] || User
    return <Icon className="h-4 w-4" />
  }

  const groupedPermissions = permissions.reduce(
    (acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = []
      }
      acc[permission.category].push(permission)
      return acc
    },
    {} as Record<string, Permission[]>,
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Gerenciamento de Permissões</h1>
        <p className="text-slate-600 mt-1">Configure as permissões de acesso dos usuários</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários
            </CardTitle>
            <CardDescription>Selecione um usuário para gerenciar permissões</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {usersPermissions.map((user) => (
              <div
                key={user.userId}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedUser === user.userId
                    ? "border-[#04A4A1] bg-[#04A4A1]/5"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => setSelectedUser(user.userId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#04A4A1] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{user.userName.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{user.userName}</p>
                      <Badge variant="secondary" className={getRoleColor(user.role)}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1">{user.role}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-500">{user.permissions.length} permissões ativas</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Permissions Management */}
        <div className="lg:col-span-2">
          {selectedUserData ? (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Permissões - {selectedUserData.userName}
                </CardTitle>
                <CardDescription>Configure as permissões específicas para este usuário</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                  <div key={category}>
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      {category === "Dashboard" && <Eye className="h-4 w-4" />}
                      {category === "Demandas" && <Edit className="h-4 w-4" />}
                      {category === "Usuários" && <Users className="h-4 w-4" />}
                      {category === "Sistema" && <Settings className="h-4 w-4" />}
                      {category}
                    </h3>
                    <div className="space-y-3">
                      {categoryPermissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-slate-800">{permission.name}</p>
                            <p className="text-sm text-slate-600">{permission.description}</p>
                          </div>
                          <Switch
                            checked={selectedUserData.permissions.includes(permission.id)}
                            onCheckedChange={() => togglePermission(selectedUserData.userId, permission.id)}
                          />
                        </div>
                      ))}
                    </div>
                    {category !== "Sistema" && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">Selecione um usuário para gerenciar suas permissões</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
