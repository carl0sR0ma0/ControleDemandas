"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { NewUserForm } from "@/components/new-user-form"
import { EditUserForm } from "@/components/edit-user-form"
import { Plus, Search, Edit, RotateCcw, UserCheck, UserX } from "lucide-react"

export function UsersTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewUserOpen, setIsNewUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  // Mock data - in real app, fetch from API
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "João Silva",
      email: "joao.silva@exemplo.com",
      role: "Admin",
      status: "Ativo",
      lastLogin: "2025-01-15 14:30",
      permissions: ["acessarDashboard", "visualizarDemandas", "registrarDemandas", "editarStatus", "gerenciarUsuarios"],
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria.santos@exemplo.com",
      role: "Gestor",
      status: "Ativo",
      lastLogin: "2025-01-15 09:15",
      permissions: ["acessarDashboard", "visualizarDemandas", "registrarDemandas", "editarStatus"],
    },
    {
      id: 3,
      name: "Pedro Costa",
      email: "pedro.costa@exemplo.com",
      role: "Colaborador",
      status: "Ativo",
      lastLogin: "2025-01-14 16:45",
      permissions: ["acessarDashboard", "visualizarDemandas", "registrarDemandas"],
    },
    {
      id: 4,
      name: "Ana Oliveira",
      email: "ana.oliveira@exemplo.com",
      role: "Visualizador",
      status: "Inativo",
      lastLogin: "2025-01-10 11:20",
      permissions: ["acessarDashboard", "visualizarDemandas"],
    },
  ])

  const getRoleColor = (role: string) => {
    const colors = {
      Admin: "bg-red-100 text-red-800",
      Gestor: "bg-blue-100 text-blue-800",
      Colaborador: "bg-green-100 text-green-800",
      Visualizador: "bg-gray-100 text-gray-800",
    }
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getStatusColor = (status: string) => {
    return status === "Ativo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleToggleStatus = (userId: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: user.status === "Ativo" ? "Inativo" : "Ativo" } : user,
      ),
    )
  }

  const handleResetPassword = (userId: number) => {
    // In real app, call API to reset password
    alert("E-mail de redefinição de senha enviado!")
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-lg font-semibold text-slate-800">Usuários do Sistema</CardTitle>
          <Dialog open={isNewUserOpen} onOpenChange={setIsNewUserOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#04A4A1] hover:bg-[#038a87] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>Preencha as informações do usuário e configure suas permissões</DialogDescription>
              </DialogHeader>
              <NewUserForm
                onClose={() => setIsNewUserOpen(false)}
                onUserCreated={(user) => setUsers((prev) => [...prev, user])}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome, e-mail ou perfil..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Nome</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">E-mail</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Perfil</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Status</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Último Login</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-4">
                    <div className="font-medium text-slate-800">{user.name}</div>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-600">{user.email}</td>
                  <td className="py-4 px-4">
                    <Badge variant="secondary" className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="secondary" className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-600">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString("pt-BR") : "Nunca"}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setEditingUser(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Editar Usuário</DialogTitle>
                            <DialogDescription>Altere as informações e permissões do usuário</DialogDescription>
                          </DialogHeader>
                          {editingUser && (
                            <EditUserForm
                              user={editingUser}
                              onClose={() => setEditingUser(null)}
                              onUserUpdated={(updatedUser) => {
                                setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
                                setEditingUser(null)
                              }}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResetPassword(user.id)}
                        title="Resetar Senha"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(user.id)}
                        title={user.status === "Ativo" ? "Desativar" : "Ativar"}
                      >
                        {user.status === "Ativo" ? (
                          <UserX className="h-4 w-4 text-red-600" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-green-600" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">Nenhum usuário encontrado com os filtros aplicados.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
